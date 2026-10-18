import Link from 'next/link';
import { signOut } from '@/auth';
import { IconChevron, IconCuerpo, IconTiempo } from '@/components/icons';
import { PageHeader } from '@/components/ui';
import { Matraz } from '@/components/doodles';

const LINKS = [
  { href: '/cuerpo', label: 'Cuerpo y sueño', desc: 'Peso, cintura, cadera y cómo dormís', Icon: IconCuerpo },
  { href: '/tiempo', label: 'Tiempo', desc: 'En qué se te van las horas', Icon: IconTiempo },
];

export default function MasPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Más" />
      <ul className="space-y-2.5">
        {LINKS.map(({ href, label, desc, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-3 rounded-3xl border border-line bg-card p-4 hover:border-palta">
              <span className="grid size-11 place-items-center rounded-2xl bg-palta-soft text-palta"><Icon className="size-6" /></span>
              <span><span className="block font-extrabold">{label}</span><span className="text-sm text-ink-2">{desc}</span></span>
              <IconChevron className="ml-auto size-4 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
      <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }} className="flex flex-col items-center gap-3 pt-6">
        <Matraz className="size-14" />
        <button className="text-sm font-bold text-ink-2 underline underline-offset-4">Cerrar sesión</button>
      </form>
    </div>
  );
}
