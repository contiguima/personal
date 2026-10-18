import Link from 'next/link';
import type { Range } from '@/lib/constants';
import { rangeStatus } from '@/lib/calc';
import { IconChevron } from './icons';
import { Palta } from './doodles';

export function Card({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <section className={`aparecer rounded-3xl border border-line bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] md:p-5 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

export function CardTitle({ children, icon, right }: { children: React.ReactNode; icon?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon && <span className="text-ink-2">{icon}</span>}
      <h2 className="text-base font-extrabold tracking-tight">{children}</h2>
      {right && <div className="ml-auto text-sm text-ink-2">{right}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: React.ReactNode; subtitle?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p>}
      </div>
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}

export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'palta' | 'coral' | 'mostaza' | 'agua' }) {
  const tones = {
    neutral: 'bg-card-2 text-ink-2',
    palta: 'bg-palta-soft text-palta',
    coral: 'bg-coral-soft text-coral',
    mostaza: 'bg-mostaza-soft text-mostaza',
    agua: 'bg-agua-soft text-agua',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

/** Navegación ‹ fecha › con links (sin JS). */
export function PrevNext({ prev, next, children }: { prev?: string | null; next?: string | null; children: React.ReactNode }) {
  const btn = 'grid size-9 place-items-center rounded-full border border-line bg-card text-ink-2 hover:text-ink';
  return (
    <div className="flex items-center gap-2">
      {prev ? <Link href={prev} className={btn} aria-label="Anterior"><IconChevron dir="left" className="size-4" /></Link> : <span className={`${btn} opacity-30`}><IconChevron dir="left" className="size-4" /></span>}
      <div className="min-w-0 text-center text-sm font-bold">{children}</div>
      {next ? <Link href={next} className={btn} aria-label="Siguiente"><IconChevron className="size-4" /></Link> : <span className={`${btn} opacity-30`}><IconChevron className="size-4" /></span>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card-2 px-3 py-2.5">
      <div className="text-xs font-semibold text-ink-2">{label}</div>
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  );
}

export function Empty({ text, doodle }: { text: string; doodle?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-ink-2">
      {doodle ?? <Palta className="size-16" />}
      <p className="max-w-xs">{text}</p>
    </div>
  );
}

/** Anillo de progreso contra un rango objetivo. Llena hasta el máximo del rango. */
export function Ring({ value, range, label, unit, color }: { value: number; range: Range; label: string; unit: string; color: string }) {
  const r = 30;
  const len = 2 * Math.PI * r;
  const pct = Math.min(1, value / range[1]);
  const status = rangeStatus(value, range);
  const missing = Math.max(0, range[0] - value);
  const fmt = (n: number) => String(unit ? Math.round(n * 10) / 10 : Math.round(n)).replace('.', ',');
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative size-20 md:size-24">
        <svg viewBox="0 0 72 72" className="size-full -rotate-90" role="img" aria-label={`${label}: ${fmt(value)}${unit} de ${range[0]}–${range[1]}${unit}`}>
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--card-2)" strokeWidth="7" />
          {/* marca del mínimo del rango */}
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--line)" strokeWidth="7" strokeDasharray={`1.2 ${len}`} strokeDashoffset={-len * (range[0] / range[1]) + 0.6} />
          <circle
            className="ring-fill" cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={len * (1 - pct)} style={{ ['--ring-len' as string]: len }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-base font-extrabold tabular-nums md:text-lg">{fmt(value)}</span>
        </div>
      </div>
      <div className="mt-1 text-xs font-bold">{label}</div>
      <div className="text-[11px] text-ink-2 tabular-nums">{range[0]}–{range[1]}{unit}</div>
      <div className={`text-[11px] font-bold ${status === 'ok' ? 'text-palta' : status === 'alto' ? 'text-mostaza' : 'text-ink-3'}`}>
        {status === 'ok' ? '¡en rango!' : status === 'alto' ? 'pasado' : `faltan ${fmt(missing)}${unit}`}
      </div>
    </div>
  );
}

export const CONF_TONE: Record<string, 'palta' | 'agua' | 'mostaza' | 'coral' | 'neutral'> = {
  alta: 'palta', 'media-alta': 'palta', media: 'agua', 'baja-media': 'mostaza', baja: 'coral',
};

export function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const tone = score >= 8 ? 'palta' : score >= 6 ? 'mostaza' : 'coral';
  return <Pill tone={tone}>★ {score}/10</Pill>;
}
