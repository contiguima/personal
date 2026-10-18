import { TZ } from './constants';

// Todas las fechas son strings 'YYYY-MM-DD' en hora de Buenos Aires.
export function todayAR(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const toUTC = (d: string) => new Date(`${d}T12:00:00Z`);
const fromUTC = (d: Date) => d.toISOString().slice(0, 10);

export function addDays(d: string, n: number): string {
  const x = toUTC(d);
  x.setUTCDate(x.getUTCDate() + n);
  return fromUTC(x);
}

/** 0 = lunes … 6 = domingo */
export function weekdayIdx(d: string): number {
  return (toUTC(d).getUTCDay() + 6) % 7;
}

export function mondayOf(d: string): string {
  return addDays(d, -weekdayIdx(d));
}

export function isWeekend(d: string) {
  return weekdayIdx(d) >= 5;
}

const WD = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const WD_SHORT = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const weekdayName = (d: string) => WD[weekdayIdx(d)];
export const weekdayShort = (d: string) => WD_SHORT[weekdayIdx(d)];

/** "18 oct" */
export function fmtShort(d: string) {
  const [, m, day] = d.split('-').map(Number);
  return `${day} ${MONTHS[m - 1]}`;
}

/** "domingo 18 oct" */
export function fmtLong(d: string) {
  return `${weekdayName(d)} ${fmtShort(d)}`;
}

export function isValidDate(d: unknown): d is string {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(toUTC(d).getTime());
}

export function minToHM(min: number | null | undefined) {
  if (min == null) return '—';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h${String(m).padStart(2, '0')}`;
}
