import 'server-only';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

/** Corta si no hay sesión. Se usa en lecturas, server actions y route handlers (además del proxy). */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return session.user;
}
