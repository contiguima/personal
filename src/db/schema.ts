import {
  pgTable, text, boolean, integer, doublePrecision, jsonb, serial, timestamp, date, index,
} from 'drizzle-orm/pg-core';

// Fechas como 'YYYY-MM-DD' (hora de Buenos Aires), sin conversión de zona.
const day = (name: string) => date(name, { mode: 'string' });
const stamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const days = pgTable('days', {
  date: day('date').primaryKey(),
  trainingDay: boolean('training_day'),
  closed: boolean('closed').notNull().default(false),
  note: text('note').notNull().default(''),
  // Días viejos sin comidas detalladas: rangos estimados { kcal: [a, b], ..., confidence, balance }
  estimatedTotals: jsonb('estimated_totals'),
  migrated: boolean('migrated').notNull().default(false),
  ...stamps,
});

export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  chatId: text('chat_id').notNull().unique(),
  date: day('date').notNull().references(() => days.date, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  categoryOriginal: text('category_original'),
  desc: text('desc').notNull(),
  confidence: text('confidence'),
  kcal: doublePrecision('kcal'),
  protein: doublePrecision('protein'),
  carbs: doublePrecision('carbs'),
  fat: doublePrecision('fat'),
  fiber: doublePrecision('fiber'),
  calidadUltraprocesado: text('calidad_ultraprocesado'),
  calidadBeneficios: text('calidad_beneficios'),
  calidadPuntaje: integer('calidad_puntaje'),
  // Desglose por plato cuando la carga lo trae: [{ nombre, kcal, protein, ... }]
  items: jsonb('items'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...stamps,
}, (t) => [index('meals_date_idx').on(t.date)]);

export const mealPhotos = pgTable('meal_photos', {
  id: serial('id').primaryKey(),
  mealId: integer('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sleep = pgTable('sleep', {
  date: day('date').primaryKey().references(() => days.date, { onDelete: 'cascade' }),
  durationMin: integer('duration_min').notNull(),
  score: integer('score'),
  wakeEnergy: integer('wake_energy'),
  endEnergy: integer('end_energy'),
  vigilia: doublePrecision('vigilia'),
  rem: doublePrecision('rem'),
  ligero: doublePrecision('ligero'),
  profundo: doublePrecision('profundo'),
});

// Un solo objeto por día; dos sesiones se combinan en texto ("41 min + 30 min", "113 / 148").
export const training = pgTable('training', {
  date: day('date').primaryKey().references(() => days.date, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(),
  duracion: text('duracion'),
  ejercicios: text('ejercicios'),
  kcalActivas: doublePrecision('kcal_activas'),
  kcalTotal: doublePrecision('kcal_total'),
  fcProm: text('fc_prom'),
  esfuerzo: text('esfuerzo'),
  energia: text('energia'),
  dolor: text('dolor'),
});

export const activity = pgTable('activity', {
  date: day('date').primaryKey().references(() => days.date, { onDelete: 'cascade' }),
  steps: integer('steps'),
  activeKcal: doublePrecision('active_kcal'),
  restKcal: doublePrecision('rest_kcal'),
  totalEnergy: doublePrecision('total_energy'),
});

export const measurements = pgTable('measurements', {
  date: day('date').primaryKey().references(() => days.date, { onDelete: 'cascade' }),
  weight: doublePrecision('weight'),
  waist: doublePrecision('waist'),
  hip: doublePrecision('hip'),
});

export const timeUse = pgTable('time_use', {
  date: day('date').primaryKey().references(() => days.date, { onDelete: 'cascade' }),
  deporte: doublePrecision('deporte').notNull().default(0),
  trabajoCorpo: doublePrecision('trabajo_corpo').notNull().default(0),
  sideHustle: doublePrecision('side_hustle').notNull().default(0),
  emprendedurismo: doublePrecision('emprendedurismo').notNull().default(0),
  aprendizaje: doublePrecision('aprendizaje').notNull().default(0),
  tiktok: doublePrecision('tiktok').notNull().default(0),
  social: doublePrecision('social').notNull().default(0),
  otros: doublePrecision('otros').notNull().default(0),
  confirmed: boolean('confirmed').notNull().default(true),
});

// dayType: 'training' | 'rest'. Cada macro como rango [min, max].
export const targets = pgTable('targets', {
  dayType: text('day_type').primaryKey(),
  kcalMin: doublePrecision('kcal_min').notNull(), kcalMax: doublePrecision('kcal_max').notNull(),
  proteinMin: doublePrecision('protein_min').notNull(), proteinMax: doublePrecision('protein_max').notNull(),
  carbsMin: doublePrecision('carbs_min').notNull(), carbsMax: doublePrecision('carbs_max').notNull(),
  fatMin: doublePrecision('fat_min').notNull(), fatMax: doublePrecision('fat_max').notNull(),
  fiberMin: doublePrecision('fiber_min').notNull(), fiberMax: doublePrecision('fiber_max').notNull(),
});
