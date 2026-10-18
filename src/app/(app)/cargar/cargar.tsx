'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useActionState, useState, useTransition } from 'react';
import { CONFIDENCE, MEAL_CATEGORIES } from '@/lib/constants';
import type { Preview } from '@/lib/preview';
import { confirmAction, deleteMealAction, previewAction, type ConfirmState, type PreviewState } from './actions';
import { PreviewView } from './preview-view';

export type MealOption = {
  chatId: string; category: string; desc: string; confidence: string | null;
  kcal: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null;
  puntaje: number | null; ultraprocesado: string | null; beneficios: string | null;
};
type Meas = { date: string; weight: number | null; waist: number | null; hip: number | null };

type Props = {
  date: string; today: string; dateLabel: string; closed: boolean; trainingDay: boolean | null;
  meals: MealOption[]; editChatId: string | null; initialTab: string;
  isMonday: boolean; hasMeasurement: boolean; prevMeasurement: Meas | null;
};

const TABS = [
  { key: 'chat', label: 'Del chat' },
  { key: 'comida', label: 'Comida' },
  { key: 'sueno', label: 'Sueño' },
  { key: 'entreno', label: 'Entreno' },
  { key: 'actividad', label: 'Actividad' },
  { key: 'medidas', label: 'Medidas' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const input = 'w-full rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-base outline-none focus:border-palta md:text-sm';
const label = 'mb-1 block text-xs font-bold text-ink-2';
const num = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? '').trim().replace(',', '.');
  return v === '' ? null : Number(v);
};
const str = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? '').trim();
  return v === '' ? null : v;
};

export function Cargar(p: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>((TABS.some((t) => t.key === p.initialTab) ? p.initialTab : 'chat') as Tab);
  const [previewState, preview, previewing] = useActionState<PreviewState, FormData>(previewAction, {});
  const [confirmState, confirm, confirming] = useActionState<ConfirmState, FormData>(confirmAction, {});
  const [step, setStep] = useState<'form' | 'preview' | 'done'>('form');
  const [, startNav] = useTransition();

  // Cada formulario arma el mismo JSON de carga y lo manda a la vista previa.
  function submitPayload(payload: unknown) {
    const fd = new FormData();
    fd.set('payload', JSON.stringify(payload));
    setStep('preview');
    startTransition(() => preview(fd));
  }
  const dayPayload = (block: Record<string, unknown>, form: FormData) => {
    const td = form.get('tipoDia');
    const extra = td === 'entreno' ? { trainingDay: true } : td === 'descanso' ? { trainingDay: false } : {};
    return { days: { [p.date]: { ...extra, ...block } } };
  };

  const shownPreview: Preview | undefined = step === 'done' ? confirmState.preview : previewState.preview;

  if (step === 'done' && confirmState.saved && !confirming) {
    const s = confirmState.saved;
    return (
      <div className="space-y-4">
        <div className="aparecer rounded-3xl border border-line bg-palta-soft p-4">
          <p className="font-extrabold">{s.skipped.length ? 'No se guardó: el día está cerrado.' : '¡Guardado! 🥑'}</p>
          {!s.skipped.length && (
            <p className="text-sm text-ink-2">
              {[s.inserted && `${s.inserted} comida${s.inserted > 1 ? 's' : ''} nueva${s.inserted > 1 ? 's' : ''}`, s.updated && `${s.updated} corregida${s.updated > 1 ? 's' : ''}`, s.photos && `${s.photos} foto${s.photos > 1 ? 's' : ''}`].filter(Boolean).join(' · ') || 'Datos del día actualizados'}
            </p>
          )}
        </div>
        {shownPreview && <PreviewView preview={shownPreview} after />}
        <div className="flex flex-wrap gap-2">
          <Link href={s.days[0] && s.days[0] !== p.today ? `/?fecha=${s.days[0]}` : '/'} className="rounded-full bg-palta px-5 py-2.5 text-sm font-bold text-white dark:text-bg">Ver el día</Link>
          <button onClick={() => { setStep('form'); router.refresh(); }} className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-bold">Cargar otra cosa</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fecha y tipo de día */}
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-line bg-card p-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="text-ink-2">Día</span>
          <input
            type="date" value={p.date} max={p.today}
            onChange={(e) => e.target.value && startNav(() => router.replace(`/cargar?fecha=${e.target.value}&tab=${tab}`))}
            className="rounded-full border border-line bg-bg px-3 py-1.5"
          />
        </label>
        <span className="text-sm text-ink-2 first-letter:uppercase">{p.dateLabel}</span>
        {p.closed && <span className="rounded-full bg-mostaza-soft px-2.5 py-0.5 text-xs font-bold text-mostaza">día cerrado</span>}
      </div>

      {p.isMonday && !p.hasMeasurement && tab !== 'medidas' && (
        <button onClick={() => setTab('medidas')} className="w-full rounded-3xl bg-agua-soft p-3 text-left text-sm">
          <b>Es lunes 📏</b> Toca la medición semanal: peso, cintura y cadera. Tocá acá para cargarla.
        </button>
      )}

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist">
        <div className="flex w-max gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key} role="tab" aria-selected={tab === t.key}
              onClick={() => { setTab(t.key); setStep('form'); }}
              className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${tab === t.key ? 'bg-palta text-white dark:text-bg' : 'border border-line bg-card text-ink-2'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {step === 'form' && (
        <div className="aparecer rounded-3xl border border-line bg-card p-4">
          {tab === 'chat' && <ChatForm onSubmit={(text) => { const fd = new FormData(); fd.set('payload', text); setStep('preview'); startTransition(() => preview(fd)); }} />}
          {tab === 'comida' && <MealForm {...p} onSubmit={(f, meal) => submitPayload(dayPayload({ meals: [meal] }, f))} onDeleted={() => router.refresh()} />}
          {tab === 'sueno' && <SleepForm trainingDay={p.trainingDay} onSubmit={(f, sleep) => submitPayload(dayPayload({ sleep }, f))} />}
          {tab === 'entreno' && <TrainingForm onSubmit={(f, training) => submitPayload(dayPayload({ training, trainingDay: true }, f))} />}
          {tab === 'actividad' && <ActivityForm trainingDay={p.trainingDay} onSubmit={(f, activity) => submitPayload(dayPayload({ activity }, f))} />}
          {tab === 'medidas' && <MeasureForm prev={p.prevMeasurement} trainingDay={p.trainingDay} onSubmit={(f, measurements) => submitPayload(dayPayload({ measurements }, f))} />}
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-3">
          {previewing && <p className="text-sm text-ink-2">Armando la vista previa…</p>}
          {previewState.error && !previewing && (
            <div className="rounded-3xl bg-coral-soft p-4 text-sm">
              <p className="font-bold text-coral">No pude leer la carga</p>
              <p className="mt-1">{previewState.error}</p>
              <button onClick={() => setStep('form')} className="mt-2 font-bold underline">Volver</button>
            </div>
          )}
          {previewState.preview && !previewing && (
            <form action={(fd) => { setStep('done'); confirm(fd); }} className="space-y-3">
              <PreviewView preview={previewState.preview} />
              <input type="hidden" name="payload" value={previewState.payloadJson} />
              <PhotoPicker preview={previewState.preview} />
              {previewState.preview.days.some((d) => d.closed) && (
                <label className="flex items-start gap-2 rounded-2xl bg-mostaza-soft p-3 text-sm">
                  <input type="checkbox" name="force" className="mt-1 accent-[var(--palta)]" />
                  <span><b>El día está cerrado.</b> Las importaciones no lo pisan. Tildá si es una corrección tuya y querés guardarla igual.</span>
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Confirmar y guardar</button>
                <button type="button" onClick={() => setStep('form')} className="rounded-full border border-line bg-card px-5 py-3 text-sm font-bold">Corregir</button>
              </div>
            </form>
          )}
        </div>
      )}

      {step === 'done' && (confirming || confirmState.error) && (
        <div className={`rounded-3xl p-4 text-sm ${confirmState.error && !confirming ? 'bg-coral-soft' : 'bg-card'}`}>
          {confirming ? 'Guardando…' : (
            <>
              <p className="font-bold text-coral">No se pudo guardar</p>
              <p className="mt-1">{confirmState.error}</p>
              <button onClick={() => setStep('preview')} className="mt-2 font-bold underline">Volver a la vista previa</button>
            </>
          )}
        </div>
      )}

      {tab === 'comida' && step === 'form' && p.meals.length > 0 && (
        <DayMeals meals={p.meals} date={p.date} onDeleted={() => router.refresh()} />
      )}
    </div>
  );
}

function TipoDia({ trainingDay }: { trainingDay: boolean | null }) {
  return (
    <div>
      <span className={label}>Tipo de día</span>
      <select name="tipoDia" defaultValue="" className={input}>
        <option value="">{trainingDay === true ? 'Entreno (sin cambiar)' : trainingDay === false ? 'Descanso (sin cambiar)' : 'Sin definir'}</option>
        <option value="entreno">Día de entreno</option>
        <option value="descanso">Día de descanso</option>
      </select>
    </div>
  );
}

function ChatForm({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text); }} className="space-y-3">
      <p className="text-sm text-ink-2">
        Mandale a Claude la foto y lo que comiste. Te devuelve un bloque de carga: copialo entero y pegalo acá. Vas a ver la tabla antes de guardar.
      </p>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={9} spellCheck={false}
        placeholder={'{ "days": { "2026-10-18": { "meals": [ … ] } } }'}
        className={`${input} font-mono text-xs`}
      />
      <div className="flex gap-2">
        <button disabled={!text.trim()} className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white disabled:opacity-40 dark:text-bg">Ver vista previa</button>
        <button
          type="button" className="rounded-full border border-line bg-card px-5 py-3 text-sm font-bold"
          onClick={async () => { try { setText(await navigator.clipboard.readText()); } catch { /* el navegador no dejó leer el portapapeles */ } }}
        >
          Pegar
        </button>
      </div>
    </form>
  );
}

function MealForm(p: Props & { onSubmit: (f: FormData, meal: Record<string, unknown>) => void; onDeleted: () => void }) {
  const editing = p.meals.find((m) => m.chatId === p.editChatId) ?? null;
  const [target, setTarget] = useState(editing?.chatId ?? '');
  const base = p.meals.find((m) => m.chatId === target) ?? null;
  const v = (x: number | null | undefined) => (x == null ? '' : String(x));

  return (
    <form
      key={target}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const puntaje = num(f, 'puntaje');
        const ultra = str(f, 'ultraprocesado');
        const benef = str(f, 'beneficios');
        p.onSubmit(f, {
          ...(target ? { chatId: target } : {}),
          category: f.get('category'), desc: String(f.get('desc') ?? '').trim(), confidence: str(f, 'confidence'),
          kcal: num(f, 'kcal'), protein: num(f, 'protein'), carbs: num(f, 'carbs'), fat: num(f, 'fat'), fiber: num(f, 'fiber'),
          ...(puntaje != null || ultra || benef ? { calidad: { puntaje, ultraprocesado: ultra, beneficios: benef } } : {}),
        });
      }}
      className="space-y-3"
    >
      {p.meals.length > 0 && (
        <div>
          <span className={label}>¿Nueva o corrección?</span>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={input}>
            <option value="">Comida nueva</option>
            {p.meals.map((m) => <option key={m.chatId} value={m.chatId}>Corregir: {m.category} — {m.desc.slice(0, 40)}</option>)}
          </select>
          {target && <p className="mt-1 text-xs text-ink-2">Se actualiza la misma entrada ({target}), no se duplica.</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className={label}>Categoría</span>
          <select name="category" defaultValue={base?.category ?? 'Almuerzo'} className={input} required>
            {MEAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span className={label}>Confianza</span>
          <select name="confidence" defaultValue={base?.confidence ?? 'media'} className={input}>
            {CONFIDENCE.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <span className={label}>Qué comiste</span>
        <textarea name="desc" required rows={3} defaultValue={base?.desc ?? ''} placeholder="Pechuga al horno con papa y brócoli, una cucharada de mostaza" className={input} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {([['kcal', 'Kcal'], ['protein', 'Prot'], ['carbs', 'Carbos'], ['fat', 'Grasa'], ['fiber', 'Fibra']] as const).map(([k, l]) => (
          <div key={k}>
            <span className={label}>{l}</span>
            <input name={k} inputMode="decimal" defaultValue={v(base?.[k])} className={`${input} px-2 text-center`} />
          </div>
        ))}
      </div>
      <details className="rounded-2xl bg-card-2 p-3" open={!!base?.puntaje}>
        <summary className="cursor-pointer text-sm font-bold text-ink-2">Calidad (opcional)</summary>
        <div className="mt-3 space-y-3">
          <div className="w-28">
            <span className={label}>Puntaje 1–10</span>
            <input name="puntaje" type="number" min={1} max={10} defaultValue={v(base?.puntaje)} className={input} />
          </div>
          <div><span className={label}>Ultraprocesado</span><input name="ultraprocesado" defaultValue={base?.ultraprocesado ?? ''} className={input} /></div>
          <div><span className={label}>Beneficios</span><input name="beneficios" defaultValue={base?.beneficios ?? ''} className={input} /></div>
        </div>
      </details>
      <TipoDia trainingDay={p.trainingDay} />
      <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Ver vista previa</button>
      <p className="text-xs text-ink-3">Las fotos se suman en el paso siguiente.</p>
    </form>
  );
}

function DayMeals({ meals, date, onDeleted }: { meals: MealOption[]; date: string; onDeleted: () => void }) {
  const [pending, start] = useTransition();
  return (
    <div className="rounded-3xl border border-line bg-card p-4">
      <h2 className="mb-2 text-sm font-extrabold">Comidas cargadas ese día</h2>
      <ul className="divide-y divide-line text-sm">
        {meals.map((m) => (
          <li key={m.chatId} className="flex items-center gap-2 py-2">
            <span className="min-w-0 flex-1 truncate"><b>{m.category}</b> · {m.desc}</span>
            <span className="tabular-nums text-ink-2">{m.kcal != null ? `${Math.round(m.kcal)} kcal` : '—'}</span>
            <Link href={`/cargar?fecha=${date}&editar=${encodeURIComponent(m.chatId)}`} className="text-xs font-bold text-palta">corregir</Link>
            <button
              disabled={pending} className="text-xs font-bold text-coral disabled:opacity-40"
              onClick={() => { if (confirm(`¿Borrar "${m.category}: ${m.desc.slice(0, 40)}"?`)) start(async () => { await deleteMealAction(m.chatId); onDeleted(); }); }}
            >
              borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SleepForm({ trainingDay, onSubmit }: { trainingDay: boolean | null; onSubmit: (f: FormData, sleep: Record<string, unknown>) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const phases = ['vigilia', 'rem', 'ligero', 'profundo'].map((k) => num(f, k));
        onSubmit(f, {
          duration_min: (num(f, 'h') ?? 0) * 60 + (num(f, 'm') ?? 0), score: num(f, 'score'), wakeEnergy: num(f, 'wakeEnergy'), endEnergy: null,
          phases: phases.some((x) => x != null) ? { vigilia: phases[0], rem: phases[1], ligero: phases[2], profundo: phases[3] } : null,
        });
      }}
      className="space-y-3"
    >
      <p className="text-sm text-ink-2">De Apple Health / el Watch. Si tenés captura, mandásela a Claude y pegá el bloque en &quot;Del chat&quot;.</p>
      <div className="grid grid-cols-3 gap-2">
        <div><span className={label}>Horas</span><input name="h" required inputMode="numeric" className={input} /></div>
        <div><span className={label}>Minutos</span><input name="m" inputMode="numeric" className={input} /></div>
        <div><span className={label}>Score</span><input name="score" inputMode="numeric" className={input} /></div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {([['vigilia', 'Vigilia %'], ['rem', 'REM %'], ['ligero', 'Ligero %'], ['profundo', 'Profundo %']] as const).map(([k, l]) => (
          <div key={k}><span className={label}>{l}</span><input name={k} inputMode="decimal" className={`${input} px-2 text-center`} /></div>
        ))}
      </div>
      <div className="w-40"><span className={label}>Energía al despertar (1–10)</span><input name="wakeEnergy" inputMode="numeric" className={input} /></div>
      <TipoDia trainingDay={trainingDay} />
      <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Ver vista previa</button>
    </form>
  );
}

function TrainingForm({ onSubmit }: { onSubmit: (f: FormData, training: Record<string, unknown>) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSubmit(f, {
          tipo: String(f.get('tipo') ?? '').trim(), duracion: str(f, 'duracion'), ejercicios: str(f, 'ejercicios'),
          kcalActivas: num(f, 'kcalActivas'), kcalTotal: num(f, 'kcalTotal'), fcProm: str(f, 'fcProm'),
          esfuerzo: str(f, 'esfuerzo'), energia: null, dolor: str(f, 'dolor') ?? 'No',
        });
      }}
      className="space-y-3"
    >
      <p className="text-sm text-ink-2">Un solo entreno por día: si hubo dos sesiones, combinalas (&quot;41 min + 30 min&quot;, FC &quot;113 / 148&quot;).</p>
      <div className="grid grid-cols-2 gap-2">
        <div><span className={label}>Tipo</span><input name="tipo" required placeholder="Fuerza, Natación…" className={input} /></div>
        <div><span className={label}>Duración</span><input name="duracion" placeholder="60 min" className={input} /></div>
      </div>
      <div><span className={label}>Ejercicios</span><textarea name="ejercicios" rows={2} className={input} /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div><span className={label}>Kcal activas</span><input name="kcalActivas" inputMode="decimal" className={input} /></div>
        <div><span className={label}>Kcal totales</span><input name="kcalTotal" inputMode="decimal" className={input} /></div>
        <div><span className={label}>FC prom.</span><input name="fcProm" className={input} /></div>
        <div><span className={label}>Esfuerzo</span><input name="esfuerzo" className={input} /></div>
      </div>
      <div><span className={label}>Dolor</span><input name="dolor" placeholder="No" className={input} /></div>
      <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Ver vista previa</button>
    </form>
  );
}

function ActivityForm({ trainingDay, onSubmit }: { trainingDay: boolean | null; onSubmit: (f: FormData, a: Record<string, unknown>) => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit(f, { steps: num(f, 'steps'), activeKcal: num(f, 'activeKcal'), restKcal: num(f, 'restKcal') }); }}
      className="space-y-3"
    >
      <p className="text-sm text-ink-2">Del Watch: kcal en reposo, activas y pasos. Con esto se calcula el balance.</p>
      <div className="grid grid-cols-3 gap-2">
        <div><span className={label}>Reposo</span><input name="restKcal" required inputMode="decimal" className={input} /></div>
        <div><span className={label}>Activas</span><input name="activeKcal" required inputMode="decimal" className={input} /></div>
        <div><span className={label}>Pasos</span><input name="steps" inputMode="numeric" className={input} /></div>
      </div>
      <TipoDia trainingDay={trainingDay} />
      <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Ver vista previa</button>
    </form>
  );
}

function MeasureForm({ prev, trainingDay, onSubmit }: { prev: Meas | null; trainingDay: boolean | null; onSubmit: (f: FormData, m: Record<string, unknown>) => void }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); onSubmit(f, { weight: num(f, 'weight'), waist: num(f, 'waist'), hip: num(f, 'hip') }); }}
      className="space-y-3"
    >
      <p className="text-sm text-ink-2">
        Medición de los lunes.{prev && ` La anterior (${prev.date.slice(8)}/${prev.date.slice(5, 7)}): ${prev.weight ?? '—'} kg · cintura ${prev.waist ?? '—'} · cadera ${prev.hip ?? '—'}.`}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <div><span className={label}>Peso (kg)</span><input name="weight" inputMode="decimal" required className={input} /></div>
        <div><span className={label}>Cintura (cm)</span><input name="waist" inputMode="decimal" className={input} /></div>
        <div><span className={label}>Cadera (cm)</span><input name="hip" inputMode="decimal" className={input} /></div>
      </div>
      <TipoDia trainingDay={trainingDay} />
      <button className="rounded-full bg-palta px-6 py-3 text-sm font-bold text-white dark:text-bg">Ver vista previa</button>
    </form>
  );
}

function PhotoPicker({ preview }: { preview: Preview }) {
  const meals = preview.days.flatMap((d) => d.meals);
  const [files, setFiles] = useState<string[]>([]);
  if (!meals.length) return null;
  return (
    <div className="rounded-3xl border border-line bg-card p-4">
      <span className={label}>Fotos (opcional)</span>
      <label className="flex cursor-pointer items-center gap-3">
        <span className="rounded-full bg-palta-soft px-4 py-2 text-sm font-bold text-palta">📷 Elegir fotos</span>
        <span className="text-sm text-ink-2">{files.length ? `${files.length} elegida${files.length > 1 ? 's' : ''}` : 'Ninguna todavía'}</span>
        <input
          type="file" name="fotos" accept="image/*" multiple className="sr-only"
          onChange={(e) => setFiles([...(e.target.files ?? [])].map((f) => URL.createObjectURL(f)))}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {files.map((src) => <img key={src} src={src} alt="" className="size-16 rounded-xl object-cover" />)}
        </div>
      )}
      {meals.length > 1 ? (
        <select name="photoChatId" className={`${input} mt-2`} defaultValue={meals[0].chatId}>
          {meals.map((m) => <option key={m.chatId} value={m.chatId}>Para: {m.category} — {m.desc.slice(0, 40)}</option>)}
        </select>
      ) : (
        <input type="hidden" name="photoChatId" value={meals[0].chatId} />
      )}
    </div>
  );
}
