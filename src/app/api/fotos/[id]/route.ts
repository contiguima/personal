import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { readPhoto } from '@/lib/photos';

export async function GET(_req: Request, ctx: RouteContext<'/api/fotos/[id]'>) {
  const session = await auth();
  if (!session?.user) return new Response('No autorizado', { status: 401 });
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response('No encontrada', { status: 404 });
  const [photo] = await getDb().select().from(s.mealPhotos).where(eq(s.mealPhotos.id, id));
  const file = photo ? await readPhoto(photo.url) : null;
  if (!file) return new Response('No encontrada', { status: 404 });
  return new Response(file.body, { headers: { 'Content-Type': file.contentType, 'Cache-Control': 'private, max-age=31536000, immutable' } });
}
