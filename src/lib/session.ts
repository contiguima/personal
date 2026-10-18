import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

/** Vista previa pública de solo lectura. Se prende con PUBLIC_PREVIEW=1; sacala para volver a proteger todo. */
export const previewEnabled = () => process.env.PUBLIC_PREVIEW === '1';

/** Para ESCRITURAS (server actions, borrar, fotos): siempre pide sesión, con o sin vista previa. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session.user;
}

/** Para LECTURAS: pide sesión salvo que la vista previa pública esté prendida. */
export async function requireViewer() {
  const session = await auth();
  if (session?.user) return { authed: true as const };
  if (previewEnabled()) return { authed: false as const };
  redirect('/login');
}
