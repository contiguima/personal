import { Suspense } from 'react';
import { signIn } from '@/auth';

export default function LoginPage({ searchParams }: PageProps<'/login'>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">Mi Bitácora de Salud</h1>
      <p className="max-w-xs text-sm opacity-70">Es privada: solo entra Conti.</p>
      <Suspense>
        <LoginError searchParams={searchParams} />
      </Suspense>
      <form
        action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/' });
        }}
      >
        <button className="rounded-full bg-green-700 px-6 py-3 font-medium text-white">Entrar con Google</button>
      </form>
    </main>
  );
}

async function LoginError({ searchParams }: Pick<PageProps<'/login'>, 'searchParams'>) {
  const { error } = await searchParams;
  return error ? <p className="text-sm text-red-700">Esa cuenta no tiene acceso.</p> : null;
}
