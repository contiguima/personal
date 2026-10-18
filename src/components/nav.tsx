'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconComidas, IconCuerpo, IconHoy, IconMas, IconPlus, IconSemana, IconTiempo } from './icons';

const SECTIONS = [
  { href: '/', label: 'Hoy', Icon: IconHoy },
  { href: '/semana', label: 'Semana', Icon: IconSemana },
  { href: '/comidas', label: 'Comidas', Icon: IconComidas },
  { href: '/cuerpo', label: 'Cuerpo y sueño', Icon: IconCuerpo },
  { href: '/tiempo', label: 'Tiempo', Icon: IconTiempo },
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));

export function Nav() {
  const path = usePathname();
  const moreActive = ['/cuerpo', '/tiempo', '/mas'].some((h) => path.startsWith(h));

  return (
    <>
      {/* Compu: barra superior */}
      <header className="sticky top-0 z-20 hidden border-b border-line bg-bg/90 backdrop-blur md:block">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-6 py-3">
          <Link href="/" className="mr-4 text-lg font-extrabold tracking-tight text-palta">bitácora 🥑</Link>
          {SECTIONS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${isActive(path, href) ? 'bg-palta-soft text-palta' : 'text-ink-2 hover:text-ink'}`}
            >
              {label}
            </Link>
          ))}
          <Link href="/cargar" className="ml-auto flex items-center gap-1.5 rounded-full bg-palta px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 dark:text-bg">
            <IconPlus className="size-4" /> Cargar
          </Link>
        </div>
      </header>

      {/* Celu: barra inferior con "Cargar" siempre a mano */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Secciones">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
          <Tab href="/" label="Hoy" active={isActive(path, '/')} Icon={IconHoy} />
          <Tab href="/semana" label="Semana" active={isActive(path, '/semana')} Icon={IconSemana} />
          <Link href="/cargar" className="-mt-5 flex flex-col items-center gap-0.5 pb-2" aria-label="Cargar">
            <span className={`grid size-14 place-items-center rounded-full bg-palta text-white shadow-lg ring-4 ring-bg dark:text-bg ${path.startsWith('/cargar') ? 'scale-105' : ''}`}>
              <IconPlus className="size-7" />
            </span>
            <span className="text-[11px] font-bold text-palta">Cargar</span>
          </Link>
          <Tab href="/comidas" label="Comidas" active={isActive(path, '/comidas')} Icon={IconComidas} />
          <Tab href="/mas" label="Más" active={moreActive} Icon={IconMas} />
        </div>
      </nav>
    </>
  );
}

function Tab({ href, label, active, Icon }: { href: string; label: string; active: boolean; Icon: typeof IconHoy }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2.5 ${active ? 'text-palta' : 'text-ink-3'}`} aria-current={active ? 'page' : undefined}>
      <Icon className="size-6" />
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
}

