// Íconos de trazo simple, estilo doodle. Heredan el color con currentColor.
type P = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconHoy = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.8v2.2M12 19v2.2M2.8 12H5M19 12h2.2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5" />
  </svg>
);

export const IconSemana = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 16.5h2M11 16.5h2" />
  </svg>
);

export const IconComidas = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M4 12.5h16a8 8 0 0 1-16 0Z" />
    <path d="M9 9c0-1.5 1-2 1-3.5M13 9c0-1.5 1-2 1-3.5" />
  </svg>
);

export const IconCuerpo = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
  </svg>
);

export const IconTiempo = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconMas = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <circle cx="6" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18" cy="12" r="1.3" />
  </svg>
);

export const IconPlus = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.4} aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconChevron = ({ className, dir = 'right' }: P & { dir?: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={2.2} aria-hidden>
    <path d={dir === 'right' ? 'M9.5 6l6 6-6 6' : 'M14.5 6l-6 6 6 6'} />
  </svg>
);

export const IconPesa = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M7 8v8M17 8v8M4.5 10v4M19.5 10v4M7 12h10" />
  </svg>
);

export const IconPasos = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M8 4.5c1.6 0 2.4 1.8 2.2 4-.2 2-1 3-2.4 3S5.8 10 5.9 8.2C6 6 6.6 4.5 8 4.5ZM6.4 14h3.6c0 2.2-.6 3.5-1.8 3.5S6.4 16.2 6.4 14ZM16 8.5c1.4 0 2 1.5 2.1 3.7.1 1.8-.9 3.3-2.2 3.3s-2.2-1-2.4-3c-.2-2.2.6-4 2.5-4ZM14 18h3.6c0 2.2-.6 3.5-1.8 3.5S14 20.2 14 18Z" />
  </svg>
);

export const IconFuego = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden>
    <path d="M12 21c-3.6 0-6-2.4-6-5.6 0-3.4 3-5 3-8.4 2 1 3.4 2.8 3.6 4.6.8-.6 1.4-1.6 1.4-2.8 2.2 1.6 4 4 4 6.6 0 3.2-2.4 5.6-6 5.6Z" />
  </svg>
);
