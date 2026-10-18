import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { get, put } from '@vercel/blob';

// Fotos privadas: en Vercel Blob (access 'private') si hay BLOB_READ_WRITE_TOKEN; en local, en .uploads/.
// Se sirven siempre por /api/fotos/[id], que pide sesión.
const LOCAL_DIR = join(process.cwd(), '.uploads');
const MAX_BYTES = 10 * 1024 * 1024;
const blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export function validatePhoto(file: File) {
  if (!file.type.startsWith('image/')) return 'Solo se pueden subir imágenes.';
  if (file.size > MAX_BYTES) return 'La foto pesa más de 10 MB.';
  return null;
}

export async function savePhoto(file: File, chatId: string): Promise<string> {
  const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '');
  const name = `comidas/${chatId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (blobEnabled()) {
    const blob = await put(name, file, { access: 'private', contentType: file.type });
    return `blob:${blob.pathname}`;
  }
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) throw new Error('Falta BLOB_READ_WRITE_TOKEN para guardar fotos.');
  const path = join(LOCAL_DIR, name);
  await mkdir(join(LOCAL_DIR, 'comidas'), { recursive: true });
  await writeFile(path, Buffer.from(await file.arrayBuffer()));
  return `local:${name}`;
}

export async function readPhoto(key: string): Promise<{ body: BodyInit; contentType: string } | null> {
  if (key.startsWith('blob:')) {
    const res = await get(key.slice(5), { access: 'private' });
    if (!res || res.statusCode !== 200) return null;
    return { body: res.stream, contentType: res.blob.contentType };
  }
  if (key.startsWith('local:')) {
    const rel = key.slice(6);
    if (rel.includes('..')) return null;
    try {
      const buf = await readFile(join(LOCAL_DIR, rel));
      const ext = rel.split('.').pop();
      return { body: new Uint8Array(buf), contentType: ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg' };
    } catch {
      return null;
    }
  }
  return null;
}
