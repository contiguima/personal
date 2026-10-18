// Dibujitos doodle de trazo simple. Usan los colores del tema, así andan en claro y oscuro.
type P = { className?: string };
const stroke = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const Palta = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M32 6c-8 0-13 9-15 19-3 13 3 31 15 31s18-18 15-31C45 15 40 6 32 6Z" {...stroke} fill="var(--palta-soft)" stroke="var(--palta)" />
    <path d="M32 14c-5 0-9 7-10 14-1 9 3 21 10 21s11-12 10-21c-1-7-5-14-10-14Z" fill="var(--mostaza-soft)" stroke="none" />
    <circle cx="32" cy="38" r="7" fill="var(--mostaza)" opacity="0.55" />
    <circle cx="27.5" cy="27" r="1.4" fill="var(--ink)" />
    <circle cx="36.5" cy="27" r="1.4" fill="var(--ink)" />
    <path d="M29 30.5c1.6 1.6 4.4 1.6 6 0" {...stroke} strokeWidth={1.6} />
  </svg>
);

export const Luna = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M44 44A20 20 0 0 1 24 12a20 20 0 1 0 28 28 20 20 0 0 1-8 4Z" {...stroke} fill="var(--agua-soft)" stroke="var(--agua)" />
    <path d="M26 33c1.2 1 2.8 1 4 0M36 38c1.2 1 2.8 1 4 0" {...stroke} strokeWidth={1.6} />
    <path d="M48 10l1.2 2.6L52 14l-2.8 1.4L48 18l-1.2-2.6L44 14l2.8-1.4Z" fill="var(--mostaza)" stroke="none" />
  </svg>
);

export const Nadadora = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M6 44c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3 4-3 8-3" {...stroke} stroke="var(--agua)" />
    <path d="M6 53c4 0 4 3 8 3s4-3 8-3 4 3 8 3 4-3 8-3 4 3 8 3 4-3 8-3" {...stroke} stroke="var(--agua)" opacity="0.6" />
    <circle cx="20" cy="34" r="5" {...stroke} fill="var(--coral-soft)" />
    <path d="M17 31.5c1-2 5-2 6.5 0" {...stroke} stroke="var(--coral)" strokeWidth={3} />
    <path d="M25 36l12-3 10-9M37 33l9 5" {...stroke} />
  </svg>
);

export const Pesa = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <rect x="12" y="20" width="8" height="24" rx="3" {...stroke} fill="var(--coral-soft)" />
    <rect x="44" y="20" width="8" height="24" rx="3" {...stroke} fill="var(--coral-soft)" />
    <rect x="6" y="25" width="6" height="14" rx="2" {...stroke} fill="var(--coral)" />
    <rect x="52" y="25" width="6" height="14" rx="2" {...stroke} fill="var(--coral)" />
    <path d="M20 32h24" {...stroke} strokeWidth={3} />
  </svg>
);

export const Mate = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M18 26h28c0 14-4 28-14 28S18 40 18 26Z" {...stroke} fill="var(--mostaza-soft)" />
    <path d="M20 26c2-4 6-6 12-6s10 2 12 6" {...stroke} fill="var(--palta)" />
    <path d="M36 21 46 6" {...stroke} stroke="var(--ink-2)" strokeWidth={3} />
    <path d="M22 36h20" {...stroke} strokeWidth={1.4} opacity="0.5" />
  </svg>
);

export const Matraz = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M26 8h12M28 8v16L14 50c-2 4 0 7 4 7h28c4 0 6-3 4-7L36 24V8" {...stroke} fill="var(--card)" />
    <path d="M19 42h26l5 8c2 4 0 7-4 7H18c-4 0-6-3-4-7Z" fill="var(--palta-soft)" stroke="none" />
    <circle cx="27" cy="48" r="2" fill="var(--palta)" /><circle cx="35" cy="45" r="1.5" fill="var(--palta)" /><circle cx="38" cy="51" r="2.4" fill="var(--palta)" />
  </svg>
);

export const Tostada = ({ className }: P) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden>
    <path d="M14 26c-6-2-6-14 4-15 6-6 22-6 28 0 10 1 10 13 4 15v26c0 2-1 3-3 3H17c-2 0-3-1-3-3Z" {...stroke} fill="var(--mostaza-soft)" stroke="var(--mostaza)" />
    <circle cx="26" cy="34" r="1.4" fill="var(--ink)" /><circle cx="38" cy="34" r="1.4" fill="var(--ink)" />
    <path d="M28.5 39c2 1.8 5 1.8 7 0" {...stroke} strokeWidth={1.6} />
  </svg>
);
