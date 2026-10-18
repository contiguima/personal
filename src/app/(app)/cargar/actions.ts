'use server';

import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { requireUser } from '@/lib/session';
import { getTargets } from '@/lib/data';
import { ingest } from '@/lib/ingest';
import { mealIdByChatId, previewIngest, type Preview } from '@/lib/preview';
import { savePhoto, validatePhoto } from '@/lib/photos';

export type PreviewState = { preview?: Preview; payloadJson?: string; error?: string };
export type ConfirmState = { saved?: { days: string[]; inserted: number; updated: number; photos: number; skipped: string[] }; preview?: Preview; error?: string };

function explain(e: unknown): string {
  if (e instanceof SyntaxError) return 'No es un JSON válido. Copiá el bloque completo, desde la primera { hasta la última }.';
  if (e instanceof ZodError) return 'Hay datos con un formato raro: ' + e.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ');
  return e instanceof Error ? e.message : 'Algo salió mal.';
}

/** Acepta { days, timeUse } o el bloque "días" directo ({ "2026-10-18": {...} }). */
function parsePayload(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const obj = JSON.parse(cleaned);
  if (obj && typeof obj === 'object' && !('days' in obj) && !('timeUse' in obj) && Object.keys(obj).every((k) => /^\d{4}-\d{2}-\d{2}$/.test(k))) {
    return { days: obj };
  }
  return obj;
}

export async function previewAction(_: PreviewState, form: FormData): Promise<PreviewState> {
  await requireUser();
  try {
    const raw = parsePayload(String(form.get('payload') ?? ''));
    const preview = await previewIngest(getDb(), raw, await getTargets());
    return { preview, payloadJson: JSON.stringify(preview.payload) };
  } catch (e) {
    return { error: explain(e) };
  }
}

export async function confirmAction(_: ConfirmState, form: FormData): Promise<ConfirmState> {
  await requireUser();
  try {
    const db = getDb();
    const raw = JSON.parse(String(form.get('payload') ?? ''));
    const force = form.get('force') === 'on';
    const photos = form.getAll('fotos').filter((f): f is File => f instanceof File && f.size > 0);
    for (const f of photos) {
      const err = validatePhoto(f);
      if (err) return { error: err };
    }

    const res = await ingest(db, raw, { force });

    let saved = 0;
    const target = String(form.get('photoChatId') ?? '');
    if (photos.length && target && !res.skippedClosed.length) {
      const mealId = await mealIdByChatId(db, target);
      if (!mealId) return { error: 'No encontré la comida para asociar la foto.' };
      for (const f of photos) {
        await db.insert(s.mealPhotos).values({ mealId, url: await savePhoto(f, target) });
        saved++;
      }
    }
    const preview = await previewIngest(db, raw, await getTargets());
    return { saved: { days: res.days, inserted: res.mealsInserted, updated: res.mealsUpdated, photos: saved, skipped: res.skippedClosed }, preview };
  } catch (e) {
    return { error: explain(e) };
  }
}

export async function deleteMealAction(chatId: string) {
  await requireUser();
  await getDb().delete(s.meals).where(eq(s.meals.chatId, chatId));
}
