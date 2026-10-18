import { Suspense } from 'react';
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import * as s from '@/db/schema';
import { auth, signOut } from '@/auth';

// Pantalla provisoria de la etapa 2: confirma login + base. "Hoy" llega en la etapa 3.
export default function Home() {
  return (
    <Suspense fallback={<main className="p-6">Cargando bitácora…</main>}>
      <Resumen />
    </Suspense>
  );
}

async function Resumen() {
  const session = await auth();
  const db = getDb();
  const [days] = await db.select({ n: sql<number>`count(*)::int`, first: sql<string>`min(date)`, last: sql<string>`max(date)` }).from(s.days);
  const [meals] = await db.select({ n: sql<number>`count(*)::int` }).from(s.meals);
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Hola, {session?.user?.name?.split(' ')[0] ?? 'Conti'} 🥑</h1>
      <p>
        La bitácora tiene <b>{days.n} días</b> ({days.first} → {days.last}) y <b>{meals.n} comidas</b>.
      </p>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
        <button className="text-sm underline">Salir</button>
      </form>
    </main>
  );
}
