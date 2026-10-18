export const TZ = 'America/Argentina/Buenos_Aires';

export const MEAL_CATEGORIES = ['Pre-entreno', 'Desayuno', 'Almuerzo', 'Snack', 'Merienda', 'Cena', 'Postre'] as const;
export type MealCategory = (typeof MEAL_CATEGORIES)[number];

export const CONFIDENCE = ['alta', 'media-alta', 'media', 'baja-media', 'baja'] as const;
export type Confidence = (typeof CONFIDENCE)[number];

export const TIME_CATEGORIES = [
  { key: 'deporte', label: 'Deporte' },
  { key: 'trabajoCorpo', label: 'Trabajo corpo' },
  { key: 'sideHustle', label: 'Side hustle' },
  { key: 'emprendedurismo', label: 'Emprendedurismo' },
  { key: 'aprendizaje', label: 'Aprendizaje' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'social', label: 'Social' },
  { key: 'otros', label: 'Otros' },
] as const;
export type TimeKey = (typeof TIME_CATEGORIES)[number]['key'];

export type Range = [number, number];
export type DayTargets = { kcal: Range; protein: Range; carbs: Range; fat: Range; fiber: Range };

export const DEFAULT_TARGETS: { training: DayTargets; rest: DayTargets } = {
  training: { kcal: [2000, 2150], protein: [135, 145], carbs: [180, 210], fat: [60, 70], fiber: [25, 30] },
  rest: { kcal: [1850, 2000], protein: [130, 140], carbs: [150, 180], fat: [60, 70], fiber: [25, 30] },
};

// Categorías históricas → las 7 actuales (la original se guarda en category_original).
const CATEGORY_MAP: Record<string, MealCategory> = {
  'Media mañana': 'Snack',
  'Extras/alcohol': 'Snack',
  'Media tarde': 'Merienda',
  'Post-entreno / Desayuno': 'Desayuno',
  'Cena social': 'Cena',
  'Merienda social': 'Merienda',
  'Cena pre-natación': 'Cena',
  'Merienda-cena': 'Merienda',
};

export function normalizeCategory(raw: string): { category: MealCategory; original: string | null } {
  if ((MEAL_CATEGORIES as readonly string[]).includes(raw)) return { category: raw as MealCategory, original: null };
  const mapped = CATEGORY_MAP[raw];
  if (!mapped) throw new Error(`Categoría de comida desconocida: "${raw}"`);
  return { category: mapped, original: raw };
}

export function normalizeConfidence(raw: string | null | undefined): Confidence | null {
  if (raw == null || raw === '') return null;
  if (raw === 'media-baja') return 'baja-media';
  if ((CONFIDENCE as readonly string[]).includes(raw)) return raw as Confidence;
  throw new Error(`Confianza desconocida: "${raw}"`);
}
