import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend, ComposedChart,
} from 'recharts';
import {
  Utensils, Dumbbell, Moon, Ruler, Settings, Plus, X, Check, Lock,
  AlertCircle, TrendingUp, Trash2, ChevronDown, ChevronUp, RotateCcw, Clock,
} from 'lucide-react';

const TZ = 'America/Argentina/Buenos_Aires';

const TIME_CATEGORIES = [
  { key: 'deporte', label: 'Deporte', color: 'var(--violet)' },
  { key: 'trabajoCorpo', label: 'Trabajo corpo', color: 'var(--moss)' },
  { key: 'sideHustle', label: 'Side hustle', color: 'var(--sidehustle)' },
  { key: 'emprendedurismo', label: 'Emprendedurismo', color: 'var(--blue2)' },
  { key: 'aprendizaje', label: 'Aprendizaje', color: 'var(--ochre)' },
  { key: 'tiktok', label: 'TikTok', color: 'var(--teal)' },
  { key: 'social', label: 'Social', color: 'var(--pink)' },
  { key: 'otros', label: 'Otros', color: 'var(--ink3)' },
];

// Semana del 20/07 al 26/07, clasificada junto con el usuario evento por evento
// (ver conversación: reglas confirmadas por categoría, solapamientos resueltos a mano).
const TIME_USE_UPDATES = {
  version: 64,
  days: {
    '2026-10-17': { deporte: 0, trabajoCorpo: 0, sideHustle: 3.75, emprendedurismo: 1.5, aprendizaje: 0, tiktok: 0, social: 3.5, otros: 0 },
    '2026-10-16': { deporte: 1, trabajoCorpo: 2.5, sideHustle: 6, emprendedurismo: 1.25, aprendizaje: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-10-15': { deporte: 1, trabajoCorpo: 9, sideHustle: 1, emprendedurismo: 1, aprendizaje: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-10-14': { deporte: 2, trabajoCorpo: 3, sideHustle: 5, emprendedurismo: 0.5, aprendizaje: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-10-13': { deporte: 0, trabajoCorpo: 9, sideHustle: 1, emprendedurismo: 1.83, aprendizaje: 0, tiktok: 1, social: 0, otros: 0 },
    '2026-10-12': { deporte: 1, trabajoCorpo: 0, sideHustle: 5.75, emprendedurismo: 0, aprendizaje: 0, tiktok: 0, social: 0, otros: 1 },
    '2026-10-11': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 1.75, aprendizaje: 0, tiktok: 0.75, social: 4, otros: 0 },
    '2026-10-10': { deporte: 1, trabajoCorpo: 0, sideHustle: 2.5, emprendedurismo: 1.5, aprendizaje: 0, tiktok: 0, social: 4.5, otros: 0 },
    '2026-10-09': { deporte: 1, trabajoCorpo: 4, sideHustle: 3.5, emprendedurismo: 2, aprendizaje: 0, tiktok: 0, social: 4, otros: 0 },
    '2026-10-08': { deporte: 1, trabajoCorpo: 2.75, sideHustle: 3, emprendedurismo: 1.5, aprendizaje: 0, tiktok: 0, social: 0, otros: 0.75 },
    '2026-10-07': { deporte: 1, trabajoCorpo: 9, sideHustle: 1.5, emprendedurismo: 1, aprendizaje: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-10-06': { deporte: 0, trabajoCorpo: 9, sideHustle: 3.5, emprendedurismo: 1.83, aprendizaje: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-10-05': { deporte: 0, trabajoCorpo: 1, sideHustle: 3, emprendedurismo: 0.25, aprendizaje: 0, tiktok: 0, social: 0, otros: 3 },
    '2026-10-01': { deporte: 0, trabajoCorpo: 2, sideHustle: 2, emprendedurismo: 0, aprendizaje: 3, tiktok: 0, social: 0, otros: 0 },
    '2026-09-30': { deporte: 1.5, trabajoCorpo: 2, sideHustle: 3.25, emprendedurismo: 0, aprendizaje: 0, tiktok: 0, social: 0, otros: 2 },
    '2026-09-29': { deporte: 0, trabajoCorpo: 9, sideHustle: 0, emprendedurismo: 1.83, aprendizaje: 0, tiktok: 0, social: 0, otros: 1 },
    '2026-09-28': { deporte: 2, trabajoCorpo: 9, sideHustle: 2, emprendedurismo: 0, aprendizaje: 0.5, tiktok: 0, social: 0, otros: 0 },
    '2026-09-27': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 0, aprendizaje: 6.25, tiktok: 0, social: 0, otros: 0.75 },
    '2026-09-26': { deporte: 1.5, trabajoCorpo: 0, sideHustle: 3.25, emprendedurismo: 0, aprendizaje: 0, tiktok: 0, social: 3.75, otros: 0.5 },
    '2026-09-25': { deporte: 1, trabajoCorpo: 4.25, sideHustle: 4, emprendedurismo: 0, aprendizaje: 1, tiktok: 0, social: 0, otros: 1.25 },
    '2026-09-24': { deporte: 0, trabajoCorpo: 9, sideHustle: 1, emprendedurismo: 0, aprendizaje: 0, tiktok: 1, social: 3.5, otros: 0 },
    '2026-09-23': { deporte: 1.25, trabajoCorpo: 4.25, sideHustle: 5.25, emprendedurismo: 0.75, aprendizaje: 1, tiktok: 0, social: 0, otros: 0 },
    '2026-09-22': { deporte: 0, trabajoCorpo: 9, sideHustle: 0, emprendedurismo: 1.83, aprendizaje: 0, tiktok: 0, social: 0, otros: 1 },
    '2026-09-21': { deporte: 2, trabajoCorpo: 4.9, sideHustle: 4, emprendedurismo: 0, aprendizaje: 1, tiktok: 0, social: 0, otros: 0.25 },
    '2026-09-20': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 2, aprendizaje: 3.75, tiktok: 0, social: 2, otros: 0 },
    '2026-09-19': { deporte: 1, trabajoCorpo: 0, sideHustle: 1, emprendedurismo: 1, aprendizaje: 0, tiktok: 0, social: 0, otros: 1.25 },
    '2026-09-18': { deporte: 1, trabajoCorpo: 0.5, sideHustle: 5, emprendedurismo: 2, aprendizaje: 0, tiktok: 0, social: 0, otros: 2.08 },
    '2026-09-17': { deporte: 0, trabajoCorpo: 9, sideHustle: 2.75, emprendedurismo: 0, aprendizaje: 0, tiktok: 0, social: 0, otros: 0.75 },
    '2026-09-16': { deporte: 1, trabajoCorpo: 2.5, sideHustle: 3, emprendedurismo: 1, aprendizaje: 1.75, tiktok: 0, social: 0, otros: 0.83 },
    '2026-09-15': { deporte: 0, trabajoCorpo: 9, sideHustle: 1.5, emprendedurismo: 0, aprendizaje: 0, tiktok: 1, social: 0, otros: 0 },
    '2026-09-14': { deporte: 2, trabajoCorpo: 1, sideHustle: 5, emprendedurismo: 1, aprendizaje: 2, tiktok: 0, social: 0, otros: 0 },
    '2026-09-13': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 1, aprendizaje: 1.5, tiktok: 0, social: 0, otros: 0.5 },
    '2026-09-12': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 1, aprendizaje: 0, tiktok: 0, social: 4, otros: 0 },
    '2026-09-11': { deporte: 1, trabajoCorpo: 4.5, sideHustle: 4, emprendedurismo: 1, aprendizaje: 0, tiktok: 0, social: 3, otros: 0 },
    '2026-09-10': { deporte: 0, trabajoCorpo: 9, sideHustle: 1, emprendedurismo: 0, aprendizaje: 0, tiktok: 0.75, social: 0, otros: 0.5 },
    '2026-09-09': { deporte: 1, trabajoCorpo: 3.5, sideHustle: 2.5, emprendedurismo: 1.25, aprendizaje: 2, tiktok: 0, social: 0, otros: 0.75 },
    '2026-09-08': { deporte: 0, trabajoCorpo: 10.75, sideHustle: 0, emprendedurismo: 0.75, aprendizaje: 0, tiktok: 1, social: 0, otros: 0 },
    '2026-09-07': { deporte: 2, trabajoCorpo: 4.5, sideHustle: 5.5, emprendedurismo: 0, aprendizaje: 1.5, tiktok: 0, social: 0, otros: 1 },
    '2026-07-20': { deporte: 1.5, trabajoCorpo: 3.5, sideHustle: 4.5, emprendedurismo: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-07-21': { deporte: 1.5, trabajoCorpo: 4, sideHustle: 3.5, emprendedurismo: 1.83, tiktok: 0, social: 0, otros: 2 },
    '2026-07-22': { deporte: 0, trabajoCorpo: 9, sideHustle: 0, emprendedurismo: 1, tiktok: 0, social: 3, otros: 0 },
    '2026-07-23': { deporte: 0, trabajoCorpo: 9, sideHustle: 4, emprendedurismo: 0, tiktok: 0.75, social: 0, otros: 0 },
    '2026-07-24': { deporte: 1.5, trabajoCorpo: 2.5, sideHustle: 4, emprendedurismo: 0, tiktok: 1, social: 0, otros: 1 },
    '2026-07-25': { deporte: 0, trabajoCorpo: 0, sideHustle: 8.5, emprendedurismo: 1, tiktok: 0, social: 5, otros: 0 },
    '2026-07-26': { deporte: 1, trabajoCorpo: 0, sideHustle: 1.5, emprendedurismo: 1, tiktok: 1.5, social: 0, otros: 1.5 },
    '2026-07-27': { deporte: 1.5, trabajoCorpo: 6, sideHustle: 4, emprendedurismo: 0.5, tiktok: 0, social: 1, otros: 0.33 },
    '2026-07-28': { deporte: 0, trabajoCorpo: 9, sideHustle: 2.5, emprendedurismo: 2.33, tiktok: 0, social: 0, otros: 0 },
    '2026-07-29': { deporte: 1.5, trabajoCorpo: 6.5, sideHustle: 3, emprendedurismo: 0, tiktok: 0.5, social: 0, otros: 1.5 },
    '2026-07-30': { deporte: 0, trabajoCorpo: 9, sideHustle: 3.5, emprendedurismo: 0, tiktok: 0, social: 0, otros: 1 },
    '2026-07-31': { deporte: 1.5, trabajoCorpo: 1.75, sideHustle: 1, emprendedurismo: 1, tiktok: 0, social: 0, otros: 3.75 },
    '2026-08-01': { deporte: 0, trabajoCorpo: 0.25, sideHustle: 9, emprendedurismo: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-08-02': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 0.5, tiktok: 0, social: 0, otros: 0.5 },
    '2026-08-03': { deporte: 0.75, trabajoCorpo: 9, sideHustle: 3.5, emprendedurismo: 0, tiktok: 0, social: 2.5, otros: 0.5 },
    '2026-08-04': { deporte: 1, trabajoCorpo: 2.75, sideHustle: 5.5, emprendedurismo: 2.83, tiktok: 0.5, social: 0, otros: 1.25 },
    '2026-08-05': { deporte: 1.5, trabajoCorpo: 3.5, sideHustle: 5.25, emprendedurismo: 1, tiktok: 0.25, social: 0, otros: 1 },
    '2026-08-06': { deporte: 0, trabajoCorpo: 9, sideHustle: 3, emprendedurismo: 0, tiktok: 0, social: 0, otros: 1 },
    '2026-08-07': { deporte: 1.5, trabajoCorpo: 2.5, sideHustle: 6.25, emprendedurismo: 1, tiktok: 0, social: 0, otros: 1.5 },
    '2026-08-08': { deporte: 1, trabajoCorpo: 0, sideHustle: 6, emprendedurismo: 1, tiktok: 0, social: 0, otros: 0 },
    '2026-08-09': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 0, tiktok: 1, social: 0, otros: 0 },
    '2026-08-10': { deporte: 1.5, trabajoCorpo: 4, sideHustle: 5.75, emprendedurismo: 0.5, tiktok: 0, social: 0, otros: 0.75 },
    '2026-08-11': { deporte: 0, trabajoCorpo: 9, sideHustle: 2, emprendedurismo: 1.83, tiktok: 0, social: 0.17, otros: 0 },
    '2026-08-12': { deporte: 1.5, trabajoCorpo: 3, sideHustle: 5.75, emprendedurismo: 1.5, tiktok: 1, social: 0, otros: 0.25 },
    '2026-08-13': { deporte: 0, trabajoCorpo: 9, sideHustle: 1.5, emprendedurismo: 0, tiktok: 0, social: 3, otros: 0.75 },
    '2026-08-14': { deporte: 1.5, trabajoCorpo: 1.5, sideHustle: 6.5, emprendedurismo: 0, tiktok: 0, social: 4, otros: 0.5 },
    '2026-08-15': { deporte: 1, trabajoCorpo: 0, sideHustle: 5.5, emprendedurismo: 0, tiktok: 0, social: 0, otros: 0 },
    '2026-08-16': { deporte: 0, trabajoCorpo: 0, sideHustle: 0, emprendedurismo: 1, tiktok: 1, social: 0, otros: 0 },
    '2026-08-17': { deporte: 0.75, trabajoCorpo: 0, sideHustle: 6, emprendedurismo: 0, tiktok: 0, social: 1, otros: 0 },
    '2026-08-18': { deporte: 1, trabajoCorpo: 9, sideHustle: 0, emprendedurismo: 1.83, tiktok: 0, social: 0, otros: 0 },
  },
};

async function applyTimeUseUpdates(timeUse) {
  let lastVersion = 0;
  try {
    const r = await window.storage.get('time-use-import-version');
    lastVersion = r ? Number(r.value) : 0;
  } catch (e) { lastVersion = 0; }
  if (!TIME_USE_UPDATES.version || TIME_USE_UPDATES.version <= lastVersion) return { timeUse, changed: false };
  const next = { ...timeUse };
  Object.entries(TIME_USE_UPDATES.days).forEach(([date, patch]) => {
    next[date] = { ...(next[date] || {}), date, ...patch };
  });
  try { await window.storage.set('time-use-import-version', String(TIME_USE_UPDATES.version)); } catch (e) {}
  return { timeUse: next, changed: true };
}

const DEFAULT_TARGETS = {
  training: { kcal: [2000, 2150], protein: [135, 145], carbs: [180, 210], fat: [60, 70], fiber: [25, 30] },
  rest: { kcal: [1850, 2000], protein: [130, 140], carbs: [150, 180], fat: [60, 70], fiber: [25, 30] },
};

const MEAL_CATEGORIES = ['Pre-entreno', 'Desayuno', 'Media mañana', 'Almuerzo', 'Merienda', 'Cena', 'Extras/alcohol'];
const CONFIDENCE = ['alta', 'media', 'baja'];

// ---------- helpers ----------
function todayArg() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function weekdayEs(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const s = d.toLocaleDateString('es-AR', { weekday: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function fmtShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}
function fmtLong(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function mid(range) { return range ? (range[0] + range[1]) / 2 : null; }
function pctRange(value, range) {
  if (value == null || isNaN(value) || !range) return null;
  const [min, max] = range;
  if (value >= min && value <= max) return 100;
  if (value < min) return Math.round((value / min) * 100);
  return Math.round((max / value) * 100);
}
function minToHM(min) {
  if (min == null) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}
function hmToMin(h, m) { return (Number(h) || 0) * 60 + (Number(m) || 0); }
function getMonday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay(); // 0 sun .. 6 sat
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function uid() { return Math.random().toString(36).slice(2, 9); }

function getDayTotals(day) {
  if (!day) return null;
  const withNumbers = (day.meals || []).filter(m => m.kcal != null && m.kcal !== '');
  if (withNumbers.length > 0) {
    const sum = withNumbers.reduce((acc, m) => {
      acc.kcal += Number(m.kcal) || 0;
      acc.protein += Number(m.protein) || 0;
      acc.carbs += Number(m.carbs) || 0;
      acc.fat += Number(m.fat) || 0;
      return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    sum.estimated = false;
    sum.partial = withNumbers.length < (day.meals || []).length;
    return sum;
  }
  if (day.estimatedTotals) {
    const et = day.estimatedTotals;
    return { kcal: mid(et.kcal), protein: mid(et.protein), carbs: mid(et.carbs), fat: mid(et.fat), estimated: true, range: et };
  }
  return null;
}

function targetFor(day, targets) {
  return day.trainingDay ? targets.training : targets.rest;
}

function dayComplianceScore(day, targets) {
  const totals = getDayTotals(day);
  if (!totals) return null;
  const t = targetFor(day, targets);
  const parts = [pctRange(totals.kcal, t.kcal), pctRange(totals.protein, t.protein), pctRange(totals.carbs, t.carbs), pctRange(totals.fat, t.fat)].filter(v => v != null);
  if (!parts.length) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

// ---------- seed data (from documento de traspaso) ----------
const SEED_DAYS = {
  '2026-07-14': {
    date: '2026-07-14', trainingDay: false, closed: true, migrated: true,
    meals: [
      { id: 'a1', category: 'Desayuno', desc: 'Tostada integral, huevo duro, chía, poco aceite, café', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'a2', category: 'Media mañana', desc: 'Yogur Ser Pro+', confidence: 'alta', kcal: 130, protein: 15, carbs: 14, fat: 1.9 },
      { id: 'a3', category: 'Almuerzo', desc: 'Pollo al curry con puré de batata (≈¾ del puré, dejó algo de pollo)', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'a4', category: 'Extras/alcohol', desc: 'Bocadito Marroc, 12 g', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'a5', category: 'Merienda', desc: 'Yogur Ilolay + ½ banana', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'a6', category: 'Cena', desc: 'Roast beef con morrón, cebolla y batata', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: null,
    sleep: { duration_min: 370, score: 86, wakeEnergy: null, endEnergy: null },
    measurements: null,
    activity: { steps: 10139, activeKcal: 584, restKcal: 1744 },
    estimatedTotals: null,
    note: 'Energía general reportada como buena. Migrado del documento de traspaso; sin desglose completo de macros por comida.',
  },
  '2026-07-15': {
    date: '2026-07-15', trainingDay: true, closed: true, migrated: true,
    meals: [
      { id: 'b1', category: 'Pre-entreno', desc: '½ banana', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'b2', category: 'Desayuno', desc: '2 claras + 1 huevo, 2 tostadas, queso crema, café con leche Protein', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'b3', category: 'Almuerzo', desc: '2 milanesas caseras de suprema + ensalada de cherry, arveja y choclo', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'b4', category: 'Merienda', desc: '2 medialunas + 2 sandwichitos (social)', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'b5', category: 'Cena', desc: 'Carré de cerdo con verduras', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Fuerza + caminadora', duracion: null, ejercicios: '', kcalActivas: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 369, score: 84, wakeEnergy: null, endEnergy: null },
    measurements: { weight: 76.95, waist: 95, hip: 108 },
    activity: null,
    estimatedTotals: null,
    note: 'Migrado del documento de traspaso.',
  },
  '2026-07-16': {
    date: '2026-07-16', trainingDay: true, closed: true, migrated: true,
    meals: [
      { id: 'c1', category: 'Desayuno', desc: '2 huevos, tostada, queso crema, café con leche Protein', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'c2', category: 'Media mañana', desc: 'Banana', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'c3', category: 'Almuerzo', desc: 'Carré + batata + ensalada', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'c4', category: 'Merienda', desc: 'Latte descremado + yogur', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'c5', category: 'Extras/alcohol', desc: 'Tostada con queso crema y huevo antes de psicóloga', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'c6', category: 'Cena', desc: '2 empanadas de atún + papas al horno', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Cardio (escaladora + cinta)', duracion: '30 min', ejercicios: '', kcalActivas: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 448, score: 91, wakeEnergy: 9, endEnergy: null },
    measurements: null,
    activity: { steps: 14078, activeKcal: 834, restKcal: 1715 },
    estimatedTotals: null,
    note: 'Dolor de cabeza / cansancio reportado; canceló una salida. Migrado del documento de traspaso.',
  },
  '2026-07-17': {
    date: '2026-07-17', trainingDay: true, closed: true, migrated: true,
    meals: [
      { id: 'd1', category: 'Pre-entreno', desc: 'Yogur con arándanos y algunos frutos secos', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'd2', category: 'Desayuno', desc: 'Omelet 2 claras + 1 huevo, tostada, queso crema, café con leche Protein', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'd3', category: 'Almuerzo', desc: 'Pasta con pollo y verduras', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'd4', category: 'Merienda', desc: 'Yogur', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'd5', category: 'Extras/alcohol', desc: 'Networking: 3 empanadas al horno, papas de paquete con guacamole, 1 vodka mango, 1 cuadradito de chocolate', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Fuerza + Z2', duracion: '+ 30 min Z2', ejercicios: '', kcalActivas: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 391, score: 90, wakeEnergy: null, endEnergy: null },
    measurements: null,
    activity: { steps: null, activeKcal: 915, restKcal: 1871 },
    estimatedTotals: null,
    note: 'Migrado del documento de traspaso.',
  },
  '2026-07-18': {
    date: '2026-07-18', trainingDay: false, closed: true, migrated: true,
    meals: [
      { id: 'e1', category: 'Desayuno', desc: '2 huevos revueltos con queso', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'e2', category: 'Almuerzo', desc: 'Lata de lomitos de atún + huevo + zanahoria + choclo + tomate', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'e3', category: 'Cena', desc: 'Pasta plant-based con pomodoro, copa de vino blanco y brownie compartido (social)', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: null,
    sleep: null,
    measurements: null,
    activity: { steps: null, activeKcal: 517, restKcal: 1731 },
    estimatedTotals: null,
    note: 'Sin merienda por falta de hambre. Migrado del documento de traspaso.',
  },
  '2026-07-19': {
    date: '2026-07-19', trainingDay: false, closed: true, migrated: true,
    meals: [
      { id: 'f1', category: 'Almuerzo', desc: 'Suprema de pollo casera, bombas de papa, maní, Campari con naranja, vodka con Monster Mango (social)', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'f2', category: 'Cena', desc: 'Choripán vegano con papas', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'f3', category: 'Extras/alcohol', desc: '6 cuadraditos de chocolate Águila 80%', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Caminata suave', duracion: '≈40 min', ejercicios: '', kcalActivas: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 587, score: 98, wakeEnergy: null, endEnergy: null },
    measurements: null,
    activity: { steps: null, activeKcal: 511, restKcal: 1635 },
    estimatedTotals: null,
    note: 'Probable mantenimiento o superávit leve. Migrado del documento de traspaso.',
  },
  '2026-07-20': {
    date: '2026-07-20', trainingDay: true, closed: true, migrated: true,
    meals: [
      { id: 'g1', category: 'Pre-entreno', desc: 'Yogur Ilolay con arándanos', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'g2', category: 'Desayuno', desc: 'Café con leche Protein, tostada de salvado, palta, queso crema descremado, semillas, omelet 2 huevos + 1 clara', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'g3', category: 'Almuerzo', desc: 'Pechuga/suprema al horno, papa, batata, tomate', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'g4', category: 'Merienda', desc: 'Submarino + budín de limón y arándanos (solo parte cortada, social)', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'g5', category: 'Cena', desc: 'Tortilla integral, 1 huevo + 1 clara, tomate, cebolla, poco queso vegano', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Fuerza (foco glúteos) + Z2', duracion: '1h 09m + 30 min', ejercicios: 'Hip thrust, búlgaras, peso muerto', kcalActivas: 614, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 383, score: 85, wakeEnergy: null, endEnergy: null },
    measurements: { weight: 77.30, waist: 93, hip: 108 },
    activity: { steps: 13440, activeKcal: 1094, restKcal: 1688 },
    estimatedTotals: { kcal: [1750, 1900], protein: [120, 135], carbs: [145, 165], fat: [50, 60], confidence: 'baja-media', balance: 'Déficit importante (no exacto)' },
    note: 'Estimación reconstruida a baja-media confianza. Migrado del documento de traspaso.',
  },
  '2026-07-21': {
    date: '2026-07-21', trainingDay: true, closed: true, migrated: true,
    meals: [
      { id: 'h1', category: 'Pre-entreno', desc: 'Yogur Ilolay, pocos arándanos, pequeña cantidad de frutos secos', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'h2', category: 'Desayuno', desc: '1 pan árabe, 1 huevo + 1 clara, palta, queso crema descremado, café con leche Protein', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'h3', category: 'Almuerzo', desc: 'Fideos con caldo de verduras, verduras, roast beef, algo de lentejas', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'h4', category: 'Merienda', desc: 'Banana, pocos frutos secos, algunas pasas', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'h5', category: 'Cena', desc: 'Suprema al horno, papas, poco de salsa de tomate, poco queso vegano, ensalada de rúcula y cherry', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: { tipo: 'Fuerza + Z2', duracion: '41 min + 30 min', ejercicios: 'Sentadilla c/barra 4x6, Remo Gironda 4x6, Press unilateral kettlebell 4x6, Curl bíceps 3x8, Abductor 4x12', kcalActivas: 420, fcProm: '113 / 148', esfuerzo: null, energia: null, dolor: 'No' },
    sleep: { duration_min: 424, score: 93, wakeEnergy: null, endEnergy: null },
    measurements: null,
    activity: { steps: 11174, activeKcal: 814, restKcal: 1625 },
    estimatedTotals: { kcal: [1600, 1750], protein: [135, 150], carbs: [145, 165], fat: [45, 55], confidence: 'baja-media', balance: 'Déficit moderado a importante' },
    note: 'Cardio Z2: 30 min, 3.44 km, ritmo 8:43 min/km. Estimación a baja-media confianza. Migrado del documento de traspaso.',
  },
  '2026-07-22': {
    date: '2026-07-22', trainingDay: false, closed: true, migrated: true,
    meals: [
      { id: 'i1', category: 'Desayuno', desc: '2 tostadas integrales, queso crema descremado, 1 huevo + 1 clara, un poco de palta, agua', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'i2', category: 'Media mañana', desc: 'Flat white + ½ banana', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'i3', category: 'Almuerzo', desc: '2 porciones de tarta integral de atún y tomate', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'i4', category: 'Merienda', desc: 'Yogur Ilolay + la otra ½ banana', confidence: 'media', kcal: null, protein: null, carbs: null, fat: null },
      { id: 'i5', category: 'Cena', desc: 'Social con Juani: panisse y risolle, plato mediano de musaka frita, meatball sandwich, agua (compartido)', confidence: 'baja', kcal: null, protein: null, carbs: null, fat: null },
    ],
    training: null,
    sleep: { duration_min: 426, score: 91, wakeEnergy: null, endEnergy: null },
    measurements: null,
    activity: { steps: 10900, activeKcal: 591, restKcal: 1766 },
    estimatedTotals: { kcal: [2000, 2300], protein: [95, 115], carbs: [185, 225], fat: [80, 105], confidence: 'baja', balance: 'Mantenimiento o déficit pequeño' },
    note: 'Cena de restaurante, compartida: baja confianza. Migrado del documento de traspaso.',
  },
};

// ---------- chat auto-sync ----------
// Claude actualiza este bloque cada vez que registrás algo por chat.
// Al abrir/refrescar el artifact, se aplica solo (no pisa días ya cerrados, no duplica comidas).
//
// PERFILES DE INGREDIENTES DE REFERENCIA (reusar sin volver a estimar):
// - Fideos coditos Lucchetti secos: 80g (1 plato) = 268 kcal / 8.6g prot / 56g carbs / 0.9g fat / 2.4g fibra (etiqueta)
// - Crema de leche La Serenísima: 15ml (2 cdas) = 20 kcal / 0.4g prot / 0.6g carbs / 1.8g fat (etiqueta)
// - Pechuga de pollo 250g crudo con ajo (porción habitual de Conti, cocida ~200g): ≈330 kcal / 62g prot / 7.2g fat / 0 carbs
// - Fideos proteicos Matarazzo secos: 80g (1 plato) = 274 kcal / 17g prot / 49g carbs / 1.1g fat / 5.1g fibra (etiqueta)
// - Yogur nuevo (marca sin identificar, pote con tapa celeste): porción recomendada 140g (1 pote = 1/2 vaso) = 111 kcal / 7.4g prot / 11g carbs (10g azúcares) / 4.2g fat / 0g fibra / 116mg sodio (etiqueta) — Conti usa esta porción de ahora en más
//
// PREFERENCIA PERMANENTE (desde 19/09/2026): al cerrar cada día, incluir siempre
// el resumen de kcal quemadas (reposo + actividad) vs consumidas, indicando déficit o superávit.
const CHAT_UPDATES = {
  version: 450,
  days: {
    '2026-07-23': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 357, score: 86, wakeEnergy: null, endEnergy: null },
      activity: { steps: 9645, activeKcal: 524, restKcal: 1598 },
      meals: [
        { chatId: '2026-07-23-desayuno', category: 'Desayuno', desc: 'Café con leche Protein y yogur Ilolay con fruta deshidratada (arándanos y pasas)', confidence: 'media', kcal: 255, protein: 14.5, carbs: 36, fat: 4.5 },
        { chatId: '2026-07-23-media-manana-1', category: 'Media mañana', desc: '2 tostadas integrales con queso crema untable + huevo revuelto (1 huevo + 1 clara)', confidence: 'media', kcal: 315, protein: 19, carbs: 30, fat: 15 },
        { chatId: '2026-07-23-almuerzo', category: 'Almuerzo', desc: 'Tarta integral de atún, tomate y choclo (2 porciones) + side de rúcula y tomate cherry', confidence: 'media', kcal: 415, protein: 31.5, carbs: 40, fat: 12.5 },
        { chatId: '2026-07-23-media-manana-2', category: 'Media mañana', desc: '1 banana mediana', confidence: 'alta', kcal: 102, protein: 1, carbs: 26, fat: 0 },
        { chatId: '2026-07-23-merienda', category: 'Merienda', desc: 'Omelet (1 huevo + 1 clara) con 1 feta de jamón cocido', confidence: 'media', kcal: 120, protein: 14.5, carbs: 0.5, fat: 6.5 },
        { chatId: '2026-07-23-cena', category: 'Cena', desc: 'Milanesa de soja (~60 g) con mozzarella y salsa de tomate, papas al horno, rúcula y tomate cherry con oliva', confidence: 'media', kcal: 375, protein: 15, carbs: 43, fat: 17 },
      ],
      note: 'Sueño corto (5h57). Día de descanso, cerrado. Reloj: 9.645 pasos, 524 kcal actividad, 1.598 kcal reposo.',
    },
    '2026-07-24': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 444, score: 96, wakeEnergy: null, endEnergy: null, phases: { vigilia: 0, rem: 28, ligero: 60, profundo: 11 } },
      activity: { steps: 12907, activeKcal: 895, restKcal: 1691 },
      training: {
        tipo: 'Fuerza (tradicional) + Cardio (caminadora)',
        duracion: '36 min fuerza + 30 min cardio',
        ejercicios: 'Calentamiento: activación flexores de cadera con banda 2x10, estiramiento dinámico de psoas 2x10, "La T" 2x10. Principal: burpees 3x12, dominada agarre neutro asistida con goma 4x12, patada de glúteo en polea 4x12, press de banca inclinado con mancuernas 4x12, plancha lateral isométrica de codo 4x12. Cardio: carrera en caminadora 2,89 km, ritmo 10\'29"/km.',
        kcalActivas: 427,
        fcProm: '130 (fuerza) / 144 (cardio)',
        esfuerzo: 4,
        energia: null,
        dolor: 'No',
      },
      meals: [
        { chatId: '2026-07-24-pre-entreno', category: 'Pre-entreno', desc: 'Yogur Ilolay natural con arándanos deshidratados', confidence: 'media', kcal: 160, protein: 7.5, carbs: 27.5, fat: 3 },
        { chatId: '2026-07-24-desayuno', category: 'Desayuno', desc: 'Pan árabe con queso crema descremado, un poco de palta, 2 huevos revueltos con jamón (sin aceite) + café con leche Protein (50ml)', confidence: 'media', kcal: 458, protein: 30, carbs: 39.5, fat: 19.5 },
        { chatId: '2026-07-24-almuerzo', category: 'Almuerzo', desc: 'Tarta integral de atún, tomate y choclo (2 porciones) + ensalada de rúcula y tomates cherry', confidence: 'media', kcal: 415, protein: 31.5, carbs: 40, fat: 12.5 },
        { chatId: '2026-07-24-merienda', category: 'Merienda', desc: 'Licuado (½ banana + 200ml leche Protein) + tostada integral con queso crema descremado, ¼ feta de jamón, 1 huevo duro y semillas de chía', confidence: 'media', kcal: 380, protein: 25.5, carbs: 42, fat: 13 },
        { chatId: '2026-07-24-cena', category: 'Cena', desc: '2 pizzetas caseras (masa integral, <100g total) con queso proteico, cebolla, tomates cherry y jamón cocido', confidence: 'media', kcal: 485, protein: 41.5, carbs: 51.5, fat: 16 },
      ],
      note: 'Sueño muy bueno (7h24, score 96). Entrenamiento 7:06-8:13 (fuerza+cardio), ~427 kcal activas. Reloj: 12.907 pasos, 895 kcal actividad, 1.691 kcal reposo. Mejor día de proteína hasta ahora (~97% del objetivo). Día cerrado.',
    },
    '2026-07-25': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 465, score: 98, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 23, ligero: 63, profundo: 12 } },
      activity: { steps: 9528, activeKcal: 540, restKcal: 1693 },
      meals: [
        { chatId: '2026-07-25-desayuno', category: 'Desayuno', desc: 'Mate + 2 tostadas integrales con queso crema descremado, palta y semillas + omelet (1 huevo + 1 clara) con jamón y queso', confidence: 'media', kcal: 518, protein: 32.5, carbs: 43.5, fat: 26 },
        { chatId: '2026-07-25-almuerzo', category: 'Almuerzo', desc: '80g fettuccini Vicentín con puré de tomate, cebolla y morrón, roast beef (~50g) y queso rallado parmesano', confidence: 'media', kcal: 497, protein: 29.5, carbs: 70, fat: 11.5 },
        { chatId: '2026-07-25-merienda', category: 'Merienda', desc: 'Café con leche descremada + medio budín de limón y semillas de amapola con glaseado (social, café con una amiga)', confidence: 'baja-media', kcal: 288, protein: 8, carbs: 39.5, fat: 11 },
        { chatId: '2026-07-25-cena', category: 'Cena', desc: '80g ravioles rellenos de 4 quesos con tomates naturales y queso rallado (sin foto)', confidence: 'media', kcal: 278, protein: 13.5, carbs: 34, fat: 10.5 },
      ],
      note: 'Sueño muy bueno (7h45, score 98), segunda noche seguida alta. Día de descanso, cerrado. Reloj: 9.528 pasos, 540 kcal actividad, 1.693 kcal reposo (gasto total ≈2.233 kcal). Carbohidratos sobre el rango, proteína por debajo — mismo patrón de otros días, revisar tendencia.',
    },
    '2026-07-26': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 403, score: 65, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 28, ligero: 56, profundo: 15 } },
      activity: { steps: 10479, activeKcal: 621, restKcal: 1576 },
      training: {
        tipo: 'Easy run + caminata (aire libre)',
        duracion: '22 min carrera + 16 min caminata',
        ejercicios: 'Carrera al aire libre 3,00 km, ritmo 7\'29"/km. Caminata al aire libre 907 m.',
        kcalActivas: 261,
        fcProm: '170 (carrera) / 130 (caminata)',
        esfuerzo: 7,
        energia: null,
        dolor: 'No',
      },
      meals: [
        { chatId: '2026-07-26-desayuno', category: 'Desayuno', desc: 'Omelet simple (1 huevo + 1 clara) con 1 feta de jamón + mate', confidence: 'alta', kcal: 120, protein: 14.5, carbs: 1.2, fat: 7.2 },
        { chatId: '2026-07-26-almuerzo', category: 'Almuerzo', desc: 'Roast beef al horno con papa y batata al horno + tomate', confidence: 'baja-media', kcal: 600, protein: 43, carbs: 55.5, fat: 22 },
        { chatId: '2026-07-26-merienda', category: 'Merienda', desc: 'Licuado (½ banana + 200ml leche Protein) + 1 pan árabe con queso crema descremado, palta y semillas', confidence: 'media', kcal: 480, protein: 23.5, carbs: 62, fat: 17 },
        { chatId: '2026-07-26-cena', category: 'Cena', desc: '3 empanaditas de hojaldre con roast beef (sobrante del almuerzo) y cebolla', confidence: 'media', kcal: 375, protein: 25.5, carbs: 22.5, fat: 19.5 },
      ],
      note: 'Sueño más corto y más bajo (6h43, score 65 "Regular") por acostarse tarde. Easy run corrido más rápido de lo planeado (esfuerzo 7/10, FC prom 170) tras sentirse abrumada emocionalmente antes de entrenar. Siesta de ~30 min después de entrenar. Reloj: 10.479 pasos, 621 kcal actividad, 1.576 kcal reposo (gasto total ≈2.197 kcal). Día cerrado.',
    },
    '2026-07-27': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 383, score: 88, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 23, ligero: 60, profundo: 15 } },
      measurements: { weight: 75.9, waist: 89, hip: 107 },
      activity: { steps: 8557, activeKcal: 864, restKcal: 1603 },
      training: {
        tipo: 'Fuerza (tradicional) + Cardio (caminadora)',
        duracion: '56 min fuerza + 30 min cardio',
        ejercicios: 'Calentamiento: retracción escapular + aperturas en A 3x8, rotación de raquis decúbito lateral 3x8, rotación interna de hombro en cuadrupedia 3x8. Principal: hip thrust en banco; superserie jalón al pecho agarre prono + press de banca con mancuernas (x4 rondas, 8 reps); superserie sentadilla búlgara + peso muerto a una pierna + gemelo en multipower (x4 rondas); elevaciones laterales 3x3. Finalizador: bicicletas 3x3, plancha frontal isométrica + toques 3x3, extensión simultánea de brazos y piernas. Cardio: caminadora 2,60 km, ritmo 11\'30"/km.',
        kcalActivas: 537,
        fcProm: '134 (fuerza) / 143 (cardio)',
        esfuerzo: 5,
        energia: null,
        dolor: 'No',
      },
      meals: [
        { chatId: '2026-07-27-pre-entreno', category: 'Pre-entreno', desc: 'Yogur Ilolay natural con arándanos deshidratados y frutos secos', confidence: 'media', kcal: 172, protein: 9.5, carbs: 16, fat: 8 },
        { chatId: '2026-07-27-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 1½ tostada integral con queso crema descremado, palta y semillas + omelet (1 huevo + 1 clara) con jamón', confidence: 'media', kcal: 442, protein: 30.5, carbs: 38, fat: 20 },
        { chatId: '2026-07-27-almuerzo', category: 'Almuerzo', desc: 'Lentejas hervidas (porción generosa) con 1 empanada de roast beef picada y salteado de verduras (tomate, morrón, cebolla)', confidence: 'media', kcal: 415, protein: 29, carbs: 57.5, fat: 10 },
        { chatId: '2026-07-27-merienda', category: 'Merienda', desc: 'Pan árabe con queso crema descremado y 2 huevos revueltos', confidence: 'media-alta', kcal: 400, protein: 21.5, carbs: 35.5, fat: 18 },
        { chatId: '2026-07-27-cena', category: 'Cena', desc: 'Porotos con roast beef picado, zanahoria, morrón y tomate + queso rallado', confidence: 'media', kcal: 410, protein: 39.5, carbs: 44, fat: 11 },
      ],
      note: 'Sueño algo más corto (6h23) pero puntuación buena (88) por acostarse a horario. Medición semanal: peso -1.4kg, cintura -4cm, cadera -1cm vs. la semana pasada. Entrenamiento completo: fuerza (56min) + cardio (30min), ~537 kcal activas. Reloj: 8.557 pasos, 864 kcal actividad, 1.603 kcal reposo (gasto total ≈2.467 kcal). Día más parejo en macros hasta ahora — proteína ~93% del objetivo gracias a legumbres+carne todo el día. Día cerrado.',
    },
    '2026-07-28': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 427, score: 93, wakeEnergy: null, endEnergy: null, phases: { vigilia: 5, rem: 25, ligero: 63, profundo: 7 } },
      activity: { steps: 12172, activeKcal: 598, restKcal: 1663 },
      meals: [
        { chatId: '2026-07-28-desayuno', category: 'Desayuno', desc: 'Yogur Ilolay natural con arándanos deshidratados y frutos secos', confidence: 'media', kcal: 172, protein: 9.5, carbs: 16, fat: 8 },
        { chatId: '2026-07-28-media-manana', category: 'Media mañana', desc: 'Pan blanco con queso crema + huevo revuelto (2 huevos) + café con leche Protein', confidence: 'media', kcal: 378, protein: 23.5, carbs: 28.5, fat: 18.5 },
        { chatId: '2026-07-28-almuerzo', category: 'Almuerzo', desc: 'Tarta integral (1 porción atún y tomate + 1 porción espinaca, choclo y queso)', confidence: 'media', kcal: 455, protein: 24, carbs: 43, fat: 17.5 },
        { chatId: '2026-07-28-media-tarde', category: 'Media mañana', desc: '~Medio alfajor (etiqueta: 287 kcal el alfajor entero de 57g)', confidence: 'baja-media', kcal: 145, protein: 2, carbs: 16, fat: 8 },
        { chatId: '2026-07-28-colacion', category: 'Media mañana', desc: '1 manzana mediana', confidence: 'alta', kcal: 92, protein: 0.5, carbs: 24, fat: 0.3 },
        { chatId: '2026-07-28-merienda', category: 'Merienda', desc: 'Tostada integral con queso crema descremado, 1 huevo hervido y semillas', confidence: 'alta', kcal: 215, protein: 12, carbs: 20, fat: 10.5 },
        { chatId: '2026-07-28-cena', category: 'Cena', desc: 'Milanesa de soja (1 unidad) con papas y batata al horno', confidence: 'media', kcal: 430, protein: 14.5, carbs: 72, fat: 11 },
      ],
      note: 'Sueño muy bueno (7h07, score 93). Día de descanso sin entrenamiento. Reloj: 12.172 pasos, 598 kcal actividad, 1.663 kcal reposo (gasto total ≈2.261 kcal). Proteína floja (~64%) y carbohidratos/grasas sobre el rango — sin una comida "ancla" de proteína en el día. Calendario: Trabajo corpo 9h (La Caja), Side hustle 2.5h (Trabajar Yaro x2), Emprendedurismo 2.33h (reunión Vanesa Beretta + Genesis 2026 Nucleate). Día cerrado.',
    },
    '2026-07-29': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 397, score: 92, wakeEnergy: null, endEnergy: null, phases: null },
      activity: { steps: 10750, activeKcal: 893, restKcal: 1610 },
      training: {
        tipo: 'Fuerza (tradicional) + Cardio (caminadora)',
        duracion: '35 min fuerza + 30 min cardio',
        ejercicios: 'Activación: bird-dog alterno 3x20", puente de glúteo unilateral 3x20", activación core anterior con musculatura respiratoria 3x20". Fuerza: sentadilla con barra 4x6, remo Gironda agarre neutro cerrado 4x6, press de hombro con kettlebell a 1 brazo 4x6, curl de bíceps 3x8, abductor en máquina 4x12. Cardio: caminadora 3,23 km, ritmo 9\'17"/km.',
        kcalActivas: 406,
        fcProm: '122 (fuerza) / 146 (cardio)',
        esfuerzo: 4.5,
        energia: null,
        dolor: 'No',
      },
      meals: [
        { chatId: '2026-07-29-pre-entreno', category: 'Pre-entreno', desc: 'Banana (parcialmente consumida)', confidence: 'media', kcal: 90, protein: 1, carbs: 22.5, fat: 0 },
        { chatId: '2026-07-29-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + pan árabe con huevo revuelto, queso crema descremado y semillas de chía', confidence: 'media', kcal: 455, protein: 29, carbs: 44.5, fat: 21.5 },
        { chatId: '2026-07-29-almuerzo', category: 'Almuerzo', desc: 'Carré de cerdo al horno con papa, batata y zanahoria al horno + acelga salteada', confidence: 'media', kcal: 635, protein: 49, carbs: 44.5, fat: 31.5 },
        { chatId: '2026-07-29-merienda', category: 'Merienda', desc: 'Barra de proteína Pure Wellness cookies & cream + yogur Ilolay natural con arándanos deshidratados', confidence: 'media-alta', kcal: 332, protein: 21.5, carbs: 39, fat: 11.6 },
        { chatId: '2026-07-29-cena', category: 'Cena', desc: 'Pechuga de pollo en air fryer con acelga, choclo y zanahoria', confidence: 'media', kcal: 324, protein: 52.4, carbs: 13.6, fat: 6.5 },
      ],
      note: 'Sueño 6h37, score 92 (Buena). Entrenamiento completo: fuerza (35min) + cardio (30min), ~406 kcal activas. Reloj: 10.750 pasos, 893 kcal actividad, 1.610 kcal reposo (gasto total ≈2.503 kcal). Proteína superó el objetivo (152.9g), grasa justo en el límite. Calendario: Trabajo corpo 6.5h (Trabajar Caja + Volsmart), Side hustle 3h (Trabajar Yar + Salesblue Call), Deporte 1.5h (Gimnasio + Correr), TikTok 0.5h, Otros 1.5h (Ergometría + Organizar finanzas). Día cerrado.',
    },
    '2026-07-30': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 404, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 19, ligero: 70, profundo: 9 } },
      activity: { steps: 11984, activeKcal: 621, restKcal: 1716 },
      meals: [
        { chatId: '2026-07-30-desayuno', category: 'Desayuno', desc: 'Yogur Ilolay natural', confidence: 'media', kcal: 92, protein: 7, carbs: 4, fat: 4.5 },
        { chatId: '2026-07-30-media-manana', category: 'Media mañana', desc: 'Tostada integral con queso crema descremado, 1 huevo duro y semillas de chía + café con leche Protein', confidence: 'media', kcal: 345, protein: 27, carbs: 28, fat: 13.5 },
        { chatId: '2026-07-30-almuerzo', category: 'Almuerzo', desc: 'Asado en equipo (8 personas): entraña/vacío, papas fritas (porción reducida), provoleta, ensalada de rúcula con parmesano', confidence: 'baja-media', kcal: 675, protein: 47, carbs: 24, fat: 44 },
        { chatId: '2026-07-30-merienda', category: 'Merienda', desc: '2 galletitas grandes de chocolate (panadería/oficina) + barra de proteína Pure Wellness cookies & cream', confidence: 'baja-media', kcal: 875, protein: 22, carbs: 109, fat: 40.8 },
        { chatId: '2026-07-30-cena', category: 'Cena', desc: 'Porción de tarta integral de atún', confidence: 'media', kcal: 210, protein: 14, carbs: 18, fat: 9 },
      ],
      note: 'Sueño 6h44, score 92 (Buena). Día sin entrenamiento. Reloj: 11.984 pasos, 621 kcal actividad, 1.716 kcal reposo (gasto total ≈2.337 kcal). Día con exceso de grasa (galletitas de oficina + asado) y calorías levemente por encima del rango. Calendario: Trabajo corpo 9h (La Caja), Side hustle 3.5h (Trabajar Yaro), Otros 1h (Retirar zapas + Psicóloga). Día cerrado.',
    },
    '2026-07-31': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 443, score: 97, wakeEnergy: null, endEnergy: null, phases: { vigilia: 0.5, rem: 25, ligero: 64, profundo: 10 } },
      training: { tipo: 'Fuerza tradicional + Cinta (carrera)', duracion: '28:54 + 30:00', ejercicios: '', kcalActivas: 402, fcProm: '128 / 147', esfuerzo: 'Moderado (4-5)', energia: null, dolor: 'No' },
      activity: { steps: 10188, activeKcal: 747, restKcal: 1585 },
      meals: [
        { chatId: '2026-07-31-pre-entreno', category: 'Pre-entreno', desc: 'Banana', confidence: 'alta', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
        { chatId: '2026-07-31-desayuno', category: 'Desayuno', desc: 'Pan árabe con queso crema descremado, 2 huevos revueltos y semillas de chía + café con leche Protein', confidence: 'media-alta', kcal: 535, protein: 37.5, carbs: 44.5, fat: 23 },
        { chatId: '2026-07-31-almuerzo', category: 'Almuerzo', desc: 'Porción de tarta integral de atún con tomate + pechuga de pollo salteada con morrón, cebolla y tomate', confidence: 'media', kcal: 580, protein: 49.5, carbs: 30, fat: 27 },
        { chatId: '2026-07-31-merienda', category: 'Merienda', desc: 'Yogur natural con barrita de proteína troceada', confidence: 'media', kcal: 267, protein: 21, carbs: 23, fat: 11.3 },
        { chatId: '2026-07-31-cena', category: 'Cena', desc: '15 piezas de sushi mixto (rolls con arroz, algunos con tempura/crocante, salmón, queso crema)', confidence: 'baja-media', kcal: 675, protein: 37.5, carbs: 90, fat: 22.5 },
      ],
      note: 'Sueño 7h23, score 97 (Muy alta). Entrenamiento completo: fuerza tradicional (28:54min, 219 kcal, FC prom 128) + carrera en caminadora (30:00min, 3.14km, 271 kcal, FC prom 147). Esfuerzo moderado en ambos. Reloj: 10.188 pasos, 747 kcal actividad, 1.585 kcal reposo (gasto total ≈2.332 kcal). Nutrición: 2162 kcal/146.8g prot (objetivo cumplido)/214.5g carbs/84.2g grasa — carbs y grasa levemente por encima por el sushi de cena. Calendario: Trabajo corpo 1.75h (La Caja: Daily, Embarcaciones, Sync Rol, Práctica interpretación), Otros 3.75h (Peluquería, Turno Dr, Farmacity), Deporte 1.5h (Gimnasio+Correr), Emprendedurismo 1h (Reunión Nucleate), Side hustle 1h (Trabajar Yar). Día cerrado.',
    },
    '2026-08-01': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 561, score: 99, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 61, profundo: 12 } },
      activity: { steps: 8635, activeKcal: 461, restKcal: 1556 },
      meals: [
        { chatId: '2026-08-01-desayuno', category: 'Desayuno', desc: '2 tostadas integrales con queso crema descremado y huevo revuelto (1 huevo + 1 clara) + mate', confidence: 'media-alta', kcal: 315, protein: 19, carbs: 30, fat: 15 },
        { chatId: '2026-08-01-almuerzo', category: 'Almuerzo', desc: 'Carré de cerdo al horno con papas y batatas al horno + acelga', confidence: 'media', kcal: 580, protein: 39, carbs: 54, fat: 24 },
        { chatId: '2026-08-01-merienda', category: 'Merienda', desc: 'Yogur natural con barra de proteína troceada y un poco de manzana', confidence: 'media', kcal: 293, protein: 21.1, carbs: 30, fat: 11.4 },
        { chatId: '2026-08-01-snack', category: 'Snack', desc: 'Sandwich triple de jamón cocido y queso en pan blanco (3 unidades, 120g)', confidence: 'alta', kcal: 190, protein: 14, carbs: 11, fat: 10 },
        { chatId: '2026-08-01-cena', category: 'Cena', desc: 'Capeletinis de jamón y queso (~80g) con salsa natural de tomate, zanahoria, morrón y cebolla, suprema de pollo en cubos y queso rallado', confidence: 'media', kcal: 445, protein: 38, carbs: 40, fat: 15 },
      ],
      note: 'Sueño 9h21, score 99 (Muy alta). Sábado sin entrenamiento. Reloj: 8.635 pasos, 461 kcal actividad, 1.556 kcal reposo. Nutrición: 1823 kcal/131.1g prot/165g carbs/75.4g grasa (grasa levemente por encima). Calendario: Side hustle 9h (Yar work), Trabajo corpo 0.25h (resto de Ver capacitaciones polaris tras solapamiento). Día cerrado.',
    },
    '2026-08-02': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 434, score: 64, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 26, ligero: 59, profundo: 11 } },
      activity: { steps: 6164, activeKcal: 367, restKcal: 1472 },
      meals: [
        { chatId: '2026-08-02-desayuno', category: 'Desayuno', desc: '2 tostadas integrales con queso crema descremado, huevo revuelto (1 huevo + 1 clara) con un poco de queso cremoso y semillas de chía + café con leche Protein', confidence: 'media-alta', kcal: 495, protein: 36, carbs: 38.5, fat: 22.5 },
        { chatId: '2026-08-02-almuerzo', category: 'Almuerzo', desc: 'Capeletinis de jamón y queso con salsa natural de tomate y queso rallado (misma receta que la cena de ayer, porción más chica)', confidence: 'media', kcal: 311, protein: 26.6, carbs: 28, fat: 10.5 },
        { chatId: '2026-08-02-merienda', category: 'Merienda', desc: '4 brownies caseros de cacao amargo con nueces y huevo (menos de 100g en total)', confidence: 'media', kcal: 400, protein: 6, carbs: 44, fat: 22 },
        { chatId: '2026-08-02-cena', category: 'Cena', desc: 'Bowl de lechuga, tomates cherry y zanahoria con pechuga de pollo al horno con tomate y queso', confidence: 'media', kcal: 300, protein: 37, carbs: 11, fat: 12 },
      ],
      note: 'Sueño 7h14, score 64 (Regular) — se acostó tarde. Domingo de descanso total. Reloj: 6.164 pasos, 367 kcal actividad, 1.472 kcal reposo. Nutrición: 1506 kcal/105.6g prot/121.5g carbs/67g grasa. Calendario: Emprendedurismo 0.5h (Lecturas Nucleate), Otros 0.5h (Ver tareas psicóloga). Día cerrado.',
    },
    '2026-08-03': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 414, score: 94, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 15, ligero: 69, profundo: 14 } },
      measurements: { weight: 75.55, waist: 89, hip: 108 },
      training: { tipo: 'Carrera al aire libre', duracion: '30:44', ejercicios: '3.87km, ritmo prom ~7\'56"/km', kcalActivas: 266, fcProm: '161', esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 15651, activeKcal: 897, restKcal: 1813 },
      meals: [
        { chatId: '2026-08-03-pre-entreno', category: 'Pre-entreno', desc: 'Media manzana', confidence: 'alta', kcal: 26, protein: 0.1, carbs: 7, fat: 0 },
        { chatId: '2026-08-03-desayuno', category: 'Desayuno', desc: '1 tostada integral con queso crema descremado y huevo revuelto (1 huevo + 1 clara) + café con leche Protein', confidence: 'media-alta', kcal: 340, protein: 31, carbs: 28, fat: 14 },
        { chatId: '2026-08-03-almuerzo', category: 'Almuerzo', desc: 'Canastita de atún y cebolla + empanada de pollo + ensalada de lechuga y tomates cherry', confidence: 'baja-media', kcal: 470, protein: 18.5, carbs: 40, fat: 27 },
        { chatId: '2026-08-03-snack', category: 'Snack', desc: 'Barra de proteína + 3 porciones de brownie casero (sobras de ayer)', confidence: 'media', kcal: 475, protein: 18.5, carbs: 52, fat: 23.3 },
        { chatId: '2026-08-03-cena', category: 'Cena', desc: 'Pechuga de pollo a la plancha con salsa de hierbas + papas al horno + ensalada de lechuga, tomate y brócoli', confidence: 'media', kcal: 530, protein: 50, carbs: 35, fat: 20 },
        { chatId: '2026-08-03-snack2', category: 'Snack', desc: '2 porciones más de brownie casero (sobras)', confidence: 'media', kcal: 200, protein: 3, carbs: 22, fat: 11 },
      ],
      note: 'Sueño 6h54, score 94 (Buena). Medición semanal lunes: peso 75.55kg, cintura 89cm, cadera 108cm. Carrera al aire libre 30:44min, 3.87km, 310 kcal, FC prom 161, esfuerzo moderado. Reloj: 15.651 pasos, 897 kcal actividad, 1.813 kcal reposo (gasto total ≈2.710 kcal). Nutrición: 2041 kcal/121.1g prot/184g carbs/95.3g grasa — día con varios gustitos de oficina (brownies), grasa bastante por encima del objetivo. Calendario: Trabajo corpo 9h (La Caja), Side hustle 3.5h (Yar work x2), Social 2.5h (Cena Gonza), Deporte 0.75h (Correr), Otros 0.5h (Verdulería). Día cerrado.',
    },
    '2026-08-04': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 363, score: 84, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 23, ligero: 66, profundo: 9 } },
      training: { tipo: 'Fuerza tradicional (glúteos con hip thrust)', duracion: '45:43', ejercicios: 'Mismo día de glúteos con hip thrust que la semana pasada', kcalActivas: 242, fcProm: '121', esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 6577, activeKcal: 648, restKcal: 1702 },
      meals: [
        { chatId: '2026-08-04-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'alta', kcal: 53, protein: 0.65, carbs: 13.5, fat: 0.2 },
        { chatId: '2026-08-04-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelette de 1 huevo, 1 clara y tomate cherry + tostada integral con queso crema descremado y palta', confidence: 'media-alta', kcal: 380, protein: 32, carbs: 25, fat: 18 },
        { chatId: '2026-08-04-almuerzo', category: 'Almuerzo', desc: 'Dos milanesas de pollo pequeñas (huevo y pan rallado) con queso cremoso y salsa + papas al horno + ensalada de lechuga y tomate', confidence: 'media', kcal: 700, protein: 39, carbs: 72, fat: 29 },
        { chatId: '2026-08-04-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con arándanos y 1/4 manzana + tostada integral con dulce de leche light (10g)', confidence: 'media-alta', kcal: 176, protein: 9, carbs: 21, fat: 5.5 },
        { chatId: '2026-08-04-cena', category: 'Cena', desc: 'Cazuela de roastbeef con porotos negros, zanahoria, cebolla y morrón', confidence: 'media', kcal: 410, protein: 36, carbs: 36, fat: 13.5 },
      ],
      note: 'Sueño 6h3, score 84 (Buena) — algo corto pero se acostó a horario. Fuerza tradicional (glúteos con hip thrust) 45:43min, 310 kcal, FC prom 121. Reloj: 6.577 pasos, 648 kcal actividad, 1.702 kcal reposo. Nutrición: 1719 kcal/116.65g prot/167.5g carbs/66.2g grasa — día bien balanceado, todo dentro de rango. Calendario: Side hustle 5.5h (Trabajar Yar x4), Emprendedurismo 2.83h (Genesis 2026 + Reunión food tech), Trabajo corpo 2.75h (Meeting Constanza, Daily, Análisis Pagos, Logs), Otros 1.25h, Deporte 1h (Gimnasio), TikTok 0.5h (Editar videos). Día cerrado.',
    },
    '2026-08-05': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 453, score: 93, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 21, ligero: 63, profundo: 13 } },
      training: { tipo: 'Fuerza tradicional + Cinta (carrera)', duracion: '29:56 + 30:07', ejercicios: '3.20km en cinta, ritmo prom 9\'23"/km', kcalActivas: 350, fcProm: '116 / 141', esfuerzo: 'Moderado (6 / 4)', energia: null, dolor: 'No' },
      activity: { steps: 8140, activeKcal: 671, restKcal: 1618 },
      meals: [
        { chatId: '2026-08-05-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'alta', kcal: 53, protein: 0.65, carbs: 13.5, fat: 0.2 },
        { chatId: '2026-08-05-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + huevo revuelto (1 huevo + 1 clara) + tostada integral con queso crema descremado y tomate cherry', confidence: 'media-alta', kcal: 335, protein: 31, carbs: 21, fat: 17 },
        { chatId: '2026-08-05-almuerzo', category: 'Almuerzo', desc: 'Capeletinis de jamón y queso con salsa de tomate, morrón y cebolla + roast beef de carne + queso rallado', confidence: 'media', kcal: 675, protein: 48, carbs: 63, fat: 24 },
        { chatId: '2026-08-05-merienda', category: 'Merienda', desc: 'Yogur natural con media manzana, arándanos y barrita de proteína', confidence: 'media', kcal: 326, protein: 21.65, carbs: 38, fat: 11.5 },
        { chatId: '2026-08-05-cena', category: 'Cena', desc: 'Muslo de pollo al horno (con piel) con ensalada de lechuga, tomate y zanahoria', confidence: 'media', kcal: 450, protein: 36, carbs: 8, fat: 30 },
      ],
      note: 'Sueño 7h33, score 93 (Buena). Entrenamiento doble: fuerza tradicional (29:56min) + carrera en caminadora (30:07min, 3.20km), 350 kcal activas combinadas. Reloj: 8.140 pasos, 671 kcal actividad, 1.618 kcal reposo. Nutrición: 1839 kcal/137.3g prot (objetivo cumplido)/143.5g carbs/82.7g grasa — grasa por encima del objetivo por el pollo con piel. Calendario: Side hustle 5.25h (Yar work x3 + Trabajar Yar), Trabajo corpo 3.5h (Caja + Daily + Revisamos Propuesta + Logs + Pre-Refi + APP Ramo 344), Deporte 1.5h (Gimnasio+Correr), Otros 1h (Pagar alquiler + Turno Dr), Emprendedurismo 1h (Reunión Foodtech), TikTok 0.25h. Día cerrado.',
    },
    '2026-08-06': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 314, score: 60, wakeEnergy: null, endEnergy: null, phases: { vigilia: 24, rem: 10, ligero: 59, profundo: 7 } },
      activity: { steps: 9903, activeKcal: 576, restKcal: 1639 },
      meals: [
        { chatId: '2026-08-06-desayuno', category: 'Desayuno', desc: '2 tostadas integrales con queso crema descremado y palta + huevo revuelto (1 huevo + 1 clara) + café con leche Protein', confidence: 'media-alta', kcal: 470, protein: 35, carbs: 45, fat: 24 },
        { chatId: '2026-08-06-snack', category: 'Snack', desc: 'Alfajor Terrabusi (70g)', confidence: 'alta', kcal: 271, protein: 4.8, carbs: 40, fat: 9.3 },
        { chatId: '2026-08-06-almuerzo', category: 'Almuerzo', desc: '2 empanadas de tapa integral (pollo con tomate, atún con zanahoria y cebolla) + ensalada de lechuga, tomate y zanahoria', confidence: 'media', kcal: 500, protein: 26, carbs: 48, fat: 23 },
        { chatId: '2026-08-06-media-tarde', category: 'Media tarde', desc: 'Alfajor Terrabusi (70g)', confidence: 'alta', kcal: 271, protein: 4.8, carbs: 40, fat: 9.3 },
        { chatId: '2026-08-06-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural', confidence: 'media', kcal: 92, protein: 7, carbs: 4, fat: 4.5 },
        { chatId: '2026-08-06-cena', category: 'Cena', desc: 'Fideos proteicos con pollo, cebolla, morrón, tomate, caldo de verduras y queso rallado', confidence: 'media', kcal: 530, protein: 53, carbs: 40, fat: 14.5 },
      ],
      note: 'Sueño 5h14, score 60 (Baja) — mala noche, mucho tiempo en vigilia (24%). Día sin entrenamiento. Reloj: 9.903 pasos, 576 kcal actividad, 1.639 kcal reposo. Nutrición: 2134 kcal/165.4g prot (bien arriba del objetivo)/217g carbs/79.3g grasa — día con dos alfajores que empujaron carbs y kcal por encima del rango, pero cena con fideos proteicos + pollo compensó fuerte la proteína. Calendario: Trabajo corpo 9h (La Caja), Side hustle 3h (Trabajar Yar + Yar work), Otros 1h (Compras farmacity/psicóloga). Día cerrado.',
    },
    '2026-08-07': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 422, score: 96, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 62, profundo: 11 } },
      training: { tipo: 'Fuerza tradicional + Cinta (carrera)', duracion: '29:51 + 30:13', ejercicios: '3.29km en cinta, ritmo prom 9\'10"/km', kcalActivas: 377, fcProm: '120 / 150', esfuerzo: 'Moderado (4 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 11685, activeKcal: 822, restKcal: 1808 },
      meals: [
        { chatId: '2026-08-07-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'alta', kcal: 53, protein: 0.65, carbs: 13.5, fat: 0.2 },
        { chatId: '2026-08-07-desayuno', category: 'Desayuno', desc: '2 tostadas integrales con queso crema descremado (una con 5g de palta) + huevos revueltos (1 huevo + 2 claras) + café con leche Protein', confidence: 'media-alta', kcal: 448, protein: 40.1, carbs: 43.4, fat: 23.7 },
        { chatId: '2026-08-07-almuerzo', category: 'Almuerzo', desc: 'Muslo de pollo al horno (sin piel) con papa y batata al horno + ensalada de lechuga y zanahoria hervida', confidence: 'media', kcal: 490, protein: 35.5, carbs: 53, fat: 17 },
        { chatId: '2026-08-07-merienda', category: 'Merienda', desc: 'Yogur natural con arándanos y media manzana', confidence: 'media-alta', kcal: 155, protein: 7.65, carbs: 20, fat: 4.7 },
        { chatId: '2026-08-07-cena', category: 'Cena', desc: 'Pizza casera finita con salsa, queso y cebolla + huevo hervido', confidence: 'media', kcal: 520, protein: 26, carbs: 50.5, fat: 23 },
      ],
      note: 'Sueño 7h2, score 96 (Muy alta) — excelente recuperación tras la mala noche anterior. Entrenamiento doble: fuerza tradicional (29:51min) + carrera en caminadora (30:13min, 3.29km), 377 kcal activas combinadas. Reloj: 11.685 pasos, 822 kcal actividad, 1.808 kcal reposo. Nutrición: 1666 kcal/109.9g prot/180.4g carbs/68.6g grasa — día bien balanceado. Calendario: Side hustle 6.25h (Yar work x2), Trabajo corpo 2.5h (tickets home + Métricas APP/PP), Otros 1.5h (Pagar ABL/Galicia + Compras farmacity), Deporte 1.5h (Gimnasio+correr), Emprendedurismo 1h (Reunión FoodTech). Día cerrado.',
    },
    '2026-08-08': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 478, score: 99, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 26, ligero: 56, profundo: 17 } },
      training: { tipo: 'Natación en piscina', duracion: '45:14', ejercicios: '1425m — Dorso 50m, Mariposa 50m, Tabla 100m, Pecho 425m, Libre 800m', kcalActivas: 262, fcProm: '134', esfuerzo: 'Moderado (5 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 8134, activeKcal: 787, restKcal: 1582 },
      meals: [
        { chatId: '2026-08-08-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'media', kcal: 45, protein: 0.5, carbs: 11, fat: 0.1 },
        { chatId: '2026-08-08-desayuno', category: 'Desayuno', desc: 'Avocado toast en pan integral rústico con huevos revueltos, palta y bacon crocante + café con leche Protein (bar/café) — porción ajustada a la baja por el usuario', confidence: 'baja-media', kcal: 510, protein: 31, carbs: 30.3, fat: 28.2 },
        { chatId: '2026-08-08-almuerzo', category: 'Almuerzo', desc: 'Lenteja con arroz hervido, salsa de tomate y cebollas', confidence: 'media', kcal: 384, protein: 15.4, carbs: 67, fat: 4.9 },
        { chatId: '2026-08-08-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural (140g) con arándanos', confidence: 'alta', kcal: 115, protein: 7.3, carbs: 9.7, fat: 4.6 },
        { chatId: '2026-08-08-cena', category: 'Cena', desc: 'Empanada de suprema de pollo y tomate (horno) + empanada de atún y cebolla (horno) + resto de lenteja con arroz del mediodía', confidence: 'media', kcal: 546, protein: 22.9, carbs: 58.8, fat: 24.2 },
        { chatId: '2026-08-08-postre', category: 'Postre', desc: '1/4 de helado de chocolate semiamargo', confidence: 'media', kcal: 368, protein: 6.4, carbs: 40, fat: 20.8 },
      ],
      note: 'Sueño 7h58, score 99 (Muy alta) — excelente. Natación en piscina 45:14min, 1425m, 262 kcal activas, FC prom 134. Reloj: 8.134 pasos, 787 kcal actividad, 1.582 kcal reposo. Nutrición: 1968 kcal/83.5g prot/216.8g carbs/82.8g grasa — kcal en objetivo pero proteína quedó ~52-62g por debajo del target y carbs/grasa por encima (empanadas + helado a la noche). Gap de proteína persiste como patrón recurrente. Calendario: Deporte 1h (Natación), Side hustle 6h (Trabajar Yar), Emprendedurismo 1h (Nucleate - Buscar patentes). Sin eventos de Trabajo corpo, Social u Otros. Día cerrado.',
    },
    '2026-08-09': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 496, score: 94, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 31, ligero: 59, profundo: 7 } },
      training: null,
      activity: { steps: 20467, activeKcal: 802, restKcal: 1758 },
      meals: [
        { chatId: '2026-08-09-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 2 tostadas integrales con queso crema descremada, 10g palta y huevos revueltos (1 huevo entero + 1 clara)', confidence: 'media-alta', kcal: 456, protein: 36.2, carbs: 44.8, fat: 17 },
        { chatId: '2026-08-09-almuerzo', category: 'Almuerzo', desc: 'Roast beef con salsa, zanahoria, cebolla y morrón + papa + batata (calabaza) al horno + tomates cherry', confidence: 'media', kcal: 599, protein: 56.4, carbs: 57, fat: 15.6 },
        { chatId: '2026-08-09-merienda', category: 'Merienda', desc: 'Merienda social compartida entre 6: ~3 pan de queso + 1 medialuna rellena (dulce de leche/chocolate) — porción estimada, sin confirmar cantidad exacta', confidence: 'baja', kcal: 415, protein: 13, carbs: 42, fat: 24 },
      ],
      note: 'Sueño 8h16, score 94 (Buena). Día de descanso sin entreno formal pero con muchísimo movimiento: 20.467 pasos, 802 kcal actividad, 1.758 kcal reposo. Nutrición: 1470 kcal/105.6g prot/143.8g carbs/56.6g grasa — muy buen día de proteína, casi en objetivo de descanso (130-140g) a pesar de no cargar cena. Gasto total ~2560 kcal vs consumo 1470 kcal = déficit considerable, coherente con el gran volumen de pasos. Calendario: TikTok 1h (Content?). Sin otros eventos. Día cerrado.',
    },
    '2026-08-10': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 472, score: 91, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 20, ligero: 68, profundo: 10 } },
      training: { tipo: 'Fuerza tradicional + Cinta (carrera)', duracion: '48:18 + 25:11', ejercicios: '2.31km en cinta, ritmo prom 10\'53"/km', kcalActivas: 416, fcProm: '119 / 136', esfuerzo: 'Moderado (6 / 4)', energia: null, dolor: 'No' },
      activity: { steps: 9769, activeKcal: 783, restKcal: 1637 },
      measurements: { weight: 75.35, waist: 88, hip: 108 },
      meals: [
        { chatId: '2026-08-10-pre-entreno', category: 'Pre-entreno', desc: 'Yogur Ilolay natural con un poco de arándanos y manzana', confidence: 'alta', kcal: 124, protein: 7.25, carbs: 12.4, fat: 4.65 },
        { chatId: '2026-08-10-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + tostada integral con queso crema descremado y palta + huevos revueltos (1 huevo + 2 claras)', confidence: 'media-alta', kcal: 414, protein: 32.2, carbs: 31, fat: 16 },
        { chatId: '2026-08-10-almuerzo', category: 'Almuerzo', desc: 'Capeletinis de jamón y queso con salsa de tomate, roast beef, cebolla, morrón, calabaza, zanahoria y queso rallado', confidence: 'media', kcal: 585, protein: 40.5, carbs: 67.5, fat: 17.8 },
        { chatId: '2026-08-10-merienda', category: 'Merienda', desc: 'Licuado de media banana + leche Protein (200ml) + tostada integral con queso crema descremado y un huevo duro', confidence: 'media', kcal: 345, protein: 27.5, carbs: 39.5, fat: 8.6 },
        { chatId: '2026-08-10-cena', category: 'Cena', desc: 'Lata de atún al agua con zanahoria hervida y tomates cherry', confidence: 'alta', kcal: 172, protein: 29.2, carbs: 9.6, fat: 1.2 },
      ],
      note: 'Sueño 7h52, score 91 (Buena). Entreno doble: fuerza tradicional (48:18min) + carrera en cinta (25:11min, 2.31km), 416 kcal activas combinadas. Reloj: 9.769 pasos, 783 kcal actividad, 1.637 kcal reposo. Nutrición: 1640 kcal/136.65g prot/160g carbs/48.25g grasa — proteína en objetivo por primera vez en varios días (135-145g), buen día parejo en las 4 comidas. Kcal algo por debajo del objetivo pero sin hambre reportada. Medición semanal: peso 75.35kg (-0.20kg vs semana pasada), cintura 88cm (-1cm), cadera 108cm (sin cambio) — segunda semana consecutiva con tendencia leve a la baja. Calendario: Side hustle 5.75h (Yar Work), Trabajo corpo 4h (Planning APP&PORTAL, La Caja-ver tema rol, Clientes APP, Revisión Propuesta, Link de pago), Deporte 1.5h (Gimnasio+Correr), Otros 0.75h (Pagar expensas, Ver plata), Emprendedurismo 0.5h (Presentación Biofábrica). Nota: se identificó que el calendario importado 9vci5q9d0qdl34cch6ihs53c1lsis610@import.calendar.google.com corresponde a eventos reales de La Caja (Trabajo corpo), no a Volsmart — actualizar criterio de clasificación. Mañana día social en la oficina. Día cerrado.',
    },
    '2026-08-11': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 393, score: 89, wakeEnergy: null, endEnergy: null, phases: { vigilia: 5, rem: 22, ligero: 61, profundo: 12 } },
      training: null,
      activity: { steps: 10665, activeKcal: 558, restKcal: 1554 },
      meals: [
        { chatId: '2026-08-11-desayuno', category: 'Desayuno', desc: 'Omelet de 1 huevo + 2 claras + tostada integral con queso crema descremado y palta (mínima) + café con leche Protein', confidence: 'media-alta', kcal: 384, protein: 32.2, carbs: 29, fat: 13 },
        { chatId: '2026-08-11-almuerzo', category: 'Almuerzo', desc: 'Parrilla social: tiras de carne asada (matambre/entraña), papas fritas (porción chica) y ensalada de rúcula con queso en tiras', confidence: 'media', kcal: 840, protein: 74, carbs: 31, fat: 48 },
        { chatId: '2026-08-11-snack', category: 'Snack', desc: 'Cookie de oficina con chocolate y nueces/almendras', confidence: 'media', kcal: 180, protein: 3, carbs: 20, fat: 10 },
        { chatId: '2026-08-11-cena', category: 'Cena', desc: 'Zanahoria y calabaza hervidas (con semillas), milanesa de soja mediana al air fryer y tomates cherry', confidence: 'media', kcal: 306, protein: 19.1, carbs: 34.4, fat: 12.85 },
      ],
      note: 'Sueño 6h33, score 89 (Buena) — costó dormir por mucho mate durante el día. Sin entreno formal, día social/laboral cargado. Reloj: 10.665 pasos, 558 kcal actividad, 1.554 kcal reposo. Nutrición: 1710 kcal/128.3g prot/114.4g carbs/83.85g grasa — buen día de proteína gracias al asado del almuerzo social, pero grasa bastante por encima del objetivo (83.85g vs 60-70g) por la combinación de carne+queso+cookie. Calendario: Trabajo corpo 9h (La Caja, jornada completa con múltiples reuniones incluyendo Daily APP&PORTAL, PPT Cris, Sync plan, Ambiente de pruebas, Patente UX Musiquita, Análisis de Pago, absorbiendo el almuerzo parrilla dentro del bloque), Side hustle 2h (Yar work x2), Emprendedurismo 1.83h (Genesis 2026 - Nucleate), Social 0.17h (Ver cambios vero). Día cerrado.',
    },
    '2026-08-12': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 461, score: 98, wakeEnergy: null, endEnergy: null, phases: { vigilia: 0, rem: 26, ligero: 59, profundo: 14 } },
      training: { tipo: 'Fuerza tradicional + Cinta (carrera)', duracion: '30:45 + 29:59', ejercicios: '3.52km en cinta, ritmo prom 8\'31"/km, tramos con FC hasta 160lpm', kcalActivas: 363, fcProm: '114 / 150', esfuerzo: 'Moderado (5 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 9835, activeKcal: 761, restKcal: 1810 },
      meals: [
        { chatId: '2026-08-12-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'media', kcal: 45, protein: 0.5, carbs: 11, fat: 0.1 },
        { chatId: '2026-08-12-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 2 tostadas integrales con queso crema descremado y palta + huevo revuelto (1 huevo + 1 clara)', confidence: 'media-alta', kcal: 448, protein: 40.1, carbs: 43.4, fat: 23.7 },
        { chatId: '2026-08-12-almuerzo', category: 'Almuerzo', desc: 'Guiso de lentejas y arroz con zanahoria, tomate y morrón', confidence: 'media', kcal: 420, protein: 17, carbs: 72, fat: 6 },
        { chatId: '2026-08-12-merienda', category: 'Merienda', desc: 'Omelet de 1 huevo + 1 clara con jamón + tostada integral con queso crema descremado', confidence: 'media-alta', kcal: 212, protein: 18.6, carbs: 16.8, fat: 7.5 },
        { chatId: '2026-08-12-cena', category: 'Cena', desc: 'Pata muslo de pollo al horno con papa y batata al horno', confidence: 'media', kcal: 570, protein: 33, carbs: 51, fat: 25.3 },
      ],
      note: 'Sueño 7h41, score 98 (Muy alta). Entreno doble: fuerza tradicional (30:45min) + carrera en cinta (29:59min, 3.52km), 363 kcal activas combinadas. Reloj: 9.835 pasos, 761 kcal actividad, 1.810 kcal reposo. Nutrición: 1695 kcal/109.2g prot/194.2g carbs/62.6g grasa — buen día parejo, proteína algo corta del objetivo entreno (135-145g) pero grasa y carbs bien encuadrados. Calendario: Side hustle 5.75h (Yar work - Test CMM + Yar work), Trabajo corpo 3h (Daily APP&PORTAL, La Caja work, TIA EN APP-Sync, Espacio Rediseño/Migración, Debatimos quick actions), Emprendedurismo 1.5h (Reunión Biofábrica + Genesis-Workshop), Deporte 1.5h (Gimnasio+Correr), TikTok 1h (Content work?), Otros 0.25h (Compras super). Día cerrado (con demora, cargado retroactivamente).',
    },
    '2026-08-13': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 302, score: 55, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 4, ligero: 79, profundo: 13 } },
      training: null,
      activity: { steps: 13486, activeKcal: 651, restKcal: 1770 },
      meals: [
        { chatId: '2026-08-13-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 2 tostadas integrales con queso crema descremado + huevo revuelto con jamón (1 huevo + 1 clara)', confidence: 'media-alta', kcal: 473, protein: 41.6, carbs: 44.4, fat: 21.7 },
        { chatId: '2026-08-13-snack', category: 'Snack', desc: 'Yogurísimo Griego (190g, pote con etiqueta)', confidence: 'alta', kcal: 96, protein: 3.1, carbs: 13, fat: 3.5 },
        { chatId: '2026-08-13-almuerzo', category: 'Almuerzo', desc: 'Ensalada de atún y pollo con zanahoria rallada, calabaza, lechuga, tomate y trozos de masa/hojaldre', confidence: 'media', kcal: 397, protein: 33.7, carbs: 36, fat: 13.3 },
        { chatId: '2026-08-13-postre', category: 'Postre', desc: 'Barrita de chocolate (porción 38g, con etiqueta)', confidence: 'alta', kcal: 210, protein: 5.5, carbs: 17, fat: 13 },
        { chatId: '2026-08-13-postre-2', category: 'Postre', desc: 'Segunda barrita de chocolate igual (porción 38g)', confidence: 'alta', kcal: 210, protein: 5.5, carbs: 17, fat: 13 },
        { chatId: '2026-08-13-cena', category: 'Cena', desc: 'Pasta al pesto (restaurante La Piccola, porción generosa con parmesano)', confidence: 'media', kcal: 650, protein: 18, carbs: 85, fat: 24 },
      ],
      note: 'Sueño 5h02, score 55 (Baja) — noche floja, casi sin REM. Sin entreno. Reloj: 13.486 pasos, 651 kcal actividad, 1.770 kcal reposo. Nutrición: 2036 kcal/107.4g prot/212.4g carbs/88.5g grasa — kcal, carbs y grasa por encima del objetivo de descanso (dos chocolates + pasta al pesto en cena social), proteína quedó corta. Calendario: Trabajo corpo 9h (La Caja, jornada completa), Social 3h (Cena Juani en Tita la vedette — coincide con la pasta al pesto), Side hustle 1.5h (Yar work), Otros 0.75h (Psicóloga). Día cerrado.',
    },
    '2026-08-14': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 438, score: 95, wakeEnergy: null, endEnergy: null, phases: { vigilia: 0, rem: 26, ligero: 56, profundo: 17 } },
      training: { tipo: 'Carrera en cinta (ayunas)', duracion: '30:05', ejercicios: '3.61km, ritmo prom 8\'20"/km, tramos con FC hasta 160lpm', kcalActivas: 234, fcProm: '147', esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 11346, activeKcal: 796, restKcal: 1764 },
      meals: [
        { chatId: '2026-08-14-desayuno', category: 'Desayuno', desc: 'Café con leche + 2 tostadas integrales con queso crema descremado y palta + huevo revuelto/omelet doblado con queso', confidence: 'media', kcal: 480, protein: 35, carbs: 45, fat: 20 },
        { chatId: '2026-08-14-almuerzo', category: 'Almuerzo', desc: 'Pollo hervido desmenuzado con jamón, tomate, papa, batata y calabaza en caldo', confidence: 'media', kcal: 317, protein: 38.8, carbs: 27, fat: 5.4 },
        { chatId: '2026-08-14-postre', category: 'Postre', desc: 'Chocolate Arcor (barra 55g, con etiqueta)', confidence: 'alta', kcal: 303, protein: 5.34, carbs: 27.5, fat: 19.25 },
        { chatId: '2026-08-14-merienda', category: 'Merienda', desc: 'Yogur Tregar natural (140g) + una medialuna + un sándwich de miga', confidence: 'media', kcal: 442, protein: 18, carbs: 44, fat: 19.5 },
        { chatId: '2026-08-14-cena', category: 'Cena', desc: 'Media pizza de cebolla estilo Güerrín (fugazza/fugazzeta, restaurante — porción generosa, sin balanza)', confidence: 'media', kcal: 1400, protein: 45, carbs: 150, fat: 60 },
      ],
      note: 'Sueño 7h18, score 95 (Buena). Entreno en ayunas: carrera en cinta 30:05min, 3.61km, 234 kcal activas, FC prom 147, tramos con picos de 158-160lpm. Reloj: 11.346 pasos, 796 kcal actividad, 1.764 kcal reposo. Nutrición: 2942 kcal/142.14g prot/293.5g carbs/124.65g grasa — día muy por encima del objetivo entreno en kcal, carbs y grasa (pizza Güerrín en la cena post-show), pero proteína cerró en objetivo (135-145g). Calendario: Side hustle 6.5h (Trabajar Yar x2), Social 4h (Show Flor Bertotti en el Gran Rex), Deporte 1.5h (Gimnasio+Correr), Trabajo corpo 1.5h (Daily APP&PORTAL, Trabajar Caja, Siniestros Motor), Otros 0.5h (Revisar luz Edenor). Día cerrado.',
    },
    '2026-08-15': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 468, score: 73, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 28, ligero: 58, profundo: 11 } },
      training: { tipo: 'Natación en piscina', duracion: '45:36', ejercicios: '1825m — Tabla 125m, Pecho 550m, Libre 1150m', kcalActivas: 322, fcProm: '144', esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 9427, activeKcal: 886, restKcal: 1492 },
      meals: [
        { chatId: '2026-08-15-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 1 huevo + 1 clara con jamón', confidence: 'media-alta', kcal: 250, protein: 28, carbs: 11, fat: 10 },
        { chatId: '2026-08-15-almuerzo', category: 'Almuerzo', desc: 'Porción de pizza sobrante de Güerrín (fugazza) recalentada con tomates cherry', confidence: 'media', kcal: 511, protein: 16.5, carbs: 55.5, fat: 21.7 },
        { chatId: '2026-08-15-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural + media banana + arándanos', confidence: 'alta', kcal: 148, protein: 7.65, carbs: 17.9, fat: 4.65 },
        { chatId: '2026-08-15-cena', category: 'Cena', desc: 'Pata muslo de pollo al horno sin piel con papa, calabaza, batata y cebolla asadas + salsa mayo/mostaza', confidence: 'media', kcal: 790, protein: 64.5, carbs: 64, fat: 31.5 },
      ],
      note: 'Sueño 7h48, score 73 (Regular). Entreno: natación 45:36min, 1825m (Tabla 125m, Pecho 550m, Libre 1150m), 322 kcal activas, FC prom 144. Reloj: 9.427 pasos, 886 kcal actividad, 1.492 kcal reposo. Nutrición: 1699 kcal/116.65g prot/148.4g carbs/67.85g grasa — día equilibrado, proteína y kcal levemente por debajo del objetivo entreno pero grasa dentro de rango. Buena variedad de verduras (calabaza, batata, cebolla, tomates cherry, banana, arándanos). Calendario: Side hustle 5.5h (Yar work x2), Deporte 1h (Natación). Día cerrado.',
    },
    '2026-08-16': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 524, score: 71, wakeEnergy: null, endEnergy: null, phases: { vigilia: 19, rem: 16, ligero: 60, profundo: 5 } },
      training: null,
      activity: { steps: 3856, activeKcal: 252, restKcal: 1447 },
      meals: [
        { chatId: '2026-08-16-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + huevo revuelto (1 huevo + 1 clara) con queso y jamón + tostada integral con queso crema descremado y palta', confidence: 'media-alta', kcal: 470, protein: 38, carbs: 32, fat: 23 },
        { chatId: '2026-08-16-almuerzo', category: 'Almuerzo', desc: 'Ensalada de lechuga y tomate + fideos + bifes de nalga hervidos con cebolla, morrón y zanahoria', confidence: 'media', kcal: 617, protein: 59.6, carbs: 57.4, fat: 15.3 },
        { chatId: '2026-08-16-merienda', category: 'Merienda', desc: 'Yogur natural con arándanos y media banana', confidence: 'alta', kcal: 148, protein: 7.65, carbs: 17.9, fat: 4.65 },
        { chatId: '2026-08-16-cena', category: 'Cena', desc: 'Ensalada de lechuga y tomate + milanesas de soja al air fryer con calabaza, papa y zanahoria asadas', confidence: 'media', kcal: 462, protein: 25.6, carbs: 66.4, fat: 12.4 },
      ],
      note: 'Sueño 8h44, score 71 (Regular) — varios despertares al baño, buena duración pero fragmentado. Día chill sin entreno, muy poca actividad física (3.856 pasos). Reloj: 252 kcal actividad, 1.447 kcal reposo. Nutrición: 1697 kcal/130.85g prot/173.7g carbs/55.35g grasa — proteína en objetivo, día muy equilibrado en general. Calendario: Emprendedurismo 1h (Preparar workshop Nucleate + Ver Nucleate), TikTok 1h (Ver video Lank). Día cerrado.',
    },
    '2026-08-17': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 426, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 5, rem: 19, ligero: 65, profundo: 11 } },
      training: null,
      activity: { steps: 14982, activeKcal: 845, restKcal: 1806 },
      measurements: { weight: 74.65, waist: 87, hip: 105 },
      meals: [
        { chatId: '2026-08-17-desayuno', category: 'Desayuno', desc: 'Café con leche y yogur natural con arándanos' },
        { chatId: '2026-08-17-almuerzo', category: 'Almuerzo', desc: 'Milanesa de carne con puré de papa y queso rallado, huevo duro, lechuga y tomate' },
        { chatId: '2026-08-17-merienda', category: 'Merienda', desc: 'Social: café con leche y una cookie' },
        { chatId: '2026-08-17-cena', category: 'Cena', desc: 'Liviana: dos empanadas caseras de pollo y tomate con masa integral' },
      ],
      note: 'Sueño 7h06, score 92 (Buena). Entreno: correr. Reloj: 14.982 pasos, 845 kcal actividad, 1.806 kcal reposo. Medición semanal: peso 74.65kg (-0.70kg), cintura 87cm (-1cm), cadera 105cm (-3cm) — tercera semana consecutiva a la baja. Comidas del día (formato liviano): desayuno café con leche + yogur con arándanos, almuerzo milanesa con puré/queso/huevo/ensalada, merienda social (café con Ian + cookie), cena liviana con empanadas caseras integrales. Calendario: Side hustle 6h (Yar work x3), Social 1h (Café Ian), Deporte 0.75h (Correr). Día cerrado. Primer día con el nuevo formato liviano de tracking (sin desglose de macros por comida).',
    },
    '2026-08-18': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 338, score: 75, wakeEnergy: null, endEnergy: null, phases: { vigilia: 7, rem: 22, ligero: 61, profundo: 10 } },
      training: { tipo: 'Fuerza tradicional', duracion: '57:52', ejercicios: '', kcalActivas: 320, fcProm: '124', esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 13252, activeKcal: 895, restKcal: 1815 },
      meals: [
        { chatId: '2026-08-18-pre-entreno', category: 'Pre-entreno', desc: 'Yogur' },
        { chatId: '2026-08-18-desayuno', category: 'Desayuno', desc: 'Café con leche + omelet de 1 huevo + 1 clara con jamón' },
        { chatId: '2026-08-18-almuerzo', category: 'Almuerzo', desc: 'Dos empanadas de pollo con ensalada' },
        { chatId: '2026-08-18-merienda', category: 'Merienda', desc: 'Oficina: dos medialunas y una porción de budín' },
        { chatId: '2026-08-18-cena', category: 'Cena', desc: 'Bife con fideos' },
      ],
      note: 'Sueño 5h38, score 75 (Regular) — corto para un día de entreno pesado. Entreno: fuerza tradicional 57:52min, 320 kcal activas, FC prom 124. Reloj: 13.252 pasos, 895 kcal actividad, 1.815 kcal reposo. Comidas (formato liviano): pre-entreno yogur, desayuno café con leche + omelet con jamón, almuerzo 2 empanadas de pollo con ensalada, merienda de oficina (2 medialunas + budín), cena bife con fideos — estimación general ~1900-2100 kcal, buena proteína repartida en el día, merienda fue el punto más dulce/calórico. Calendario: Trabajo corpo 9h (La Caja, jornada completa), Emprendedurismo 1.83h (Genesis 2026 - Nucleate), Deporte 1h (Gimnasio). Día cerrado.',
    },
    '2026-08-19': {
      trainingDay: false,
      closed: false,
      sleep: { duration_min: 494, score: 88, wakeEnergy: null, endEnergy: null, phases: { vigilia: 7, rem: 19, ligero: 58, profundo: 16 } },
      training: null,
      activity: null,
      meals: [],
      note: 'Se siente enferma/congestionada, no entrenó hoy. Contexto: noche anterior de sueño corto (5h38) tras día de entreno pesado.',
    },
    '2026-08-24': {
      trainingDay: null,
      closed: false,
      sleep: null,
      training: null,
      activity: null,
      measurements: { weight: 74, waist: 86, hip: 105 },
      meals: [],
      note: 'Semana de baja carga de entreno (gripe de por medio), sueño promedio ~8h/noche, alimentación variada sin control estricto de macros. Resultado: peso y cintura siguen bajando pese a entrenar menos y no controlar tan de cerca. Cuarta semana consecutiva de mediciones con tendencia estable/positiva.',
    },
    '2026-09-07': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 407, score: 87, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 62, profundo: 11 } },
      training: { tipo: 'Fuerza (rutina de glúteos) + Natación en piscina', duracion: '41:41 + 36:14', ejercicios: 'Natación: 1200m — Tabla 50m, Mariposa 75m, Dorso 100m, Pecho 175m, Libre 800m', kcalActivas: 218 + 217, fcProm: '120 / 149', esfuerzo: 'Moderado (6 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 10287, activeKcal: 1030, restKcal: 1726 },
      meals: [
        { chatId: '2026-09-07-pre-entreno', category: 'Pre-entreno', desc: 'Yogur Ilolay natural + media banana + 1 cdita granola natural + frutos rojos congelados', confidence: 'media-alta', kcal: 192, protein: 9, carbs: 25, fat: 6.2, calidad: { ultraprocesado: 'Bajo — todos los ingredientes son alimentos mínimamente procesados (NOVA 1-2): yogur natural, fruta entera, granola simple y frutos rojos congelados sin agregados.', beneficios: 'Buena combinación pre-entreno: probióticos y calcio del yogur, potasio y carbs de rápida disponibilidad de la banana, fibra de la granola, antioxidantes de los frutos rojos.', puntaje: 9 } },
        { chatId: '2026-09-07-post-entreno', category: 'Post-entreno / Desayuno', desc: 'Tostada de pan artesano integral con queso crema descremado y tomates confitados (air fryer) + omelet de 2 claras y 1 yema con queso cremoso proteico La Serenísima y mini tirita de jamón + café con leche Protein', confidence: 'media', kcal: 400, protein: 28, carbs: 37, fat: 16, calidad: { ultraprocesado: 'Moderado — mezcla de alimentos base poco procesados (huevo, tomate, pan integral artesanal) con productos más industrializados (queso crema descremado, queso proteico fortificado, jamón, leche Protein), estos últimos NOVA 3-4 por sus procesos de fortificación/curado.', beneficios: 'Buen combo post-entreno: proteína de alta calidad (huevo + queso proteico + jamón) para recuperación muscular, carbs del pan integral para reponer glucógeno, licopeno del tomate cocido (aumenta con la cocción), fibra del pan integral.', puntaje: 7 } },
        { chatId: '2026-09-07-almuerzo', category: 'Almuerzo', desc: 'Poke bowl: pollo pechuga, salmón, arroz de sushi, palta, huevo, cebolla, zanahoria, repollo morado, pepino, salsa teriyaki', confidence: 'media', kcal: 560, protein: 46, carbs: 44, fat: 22, calidad: { ultraprocesado: 'Bajo-moderado — la base es casi toda alimentos enteros (pollo, salmón, huevo, palta, vegetales, arroz), el único componente más procesado es la salsa teriyaki (NOVA 3-4, aporta sodio y azúcar).', beneficios: 'Comida muy completa y balanceada: doble fuente de proteína magra (pollo + salmón), omega-3 del salmón, grasas saludables de la palta, fibra y micronutrientes de los vegetales variados, carbs complejos del arroz.', puntaje: 9 } },
        { chatId: '2026-09-07-merienda', category: 'Merienda', desc: 'Licuado de media banana con 200ml leche Protein + tostada integral con huevo y tomates confitados (todo en air fryer)', confidence: 'media', kcal: 375, protein: 23, carbs: 43, fat: 12, calidad: { ultraprocesado: 'Moderado — banana, huevo y tomate son mínimamente procesados, pero la leche Protein (fortificada) y el pan integral de molde son productos más industrializados (NOVA 3).', beneficios: 'Buena merienda funcional: proteína extra de la leche fortificada + huevo para sostener la saciedad, carbs de rápida y media absorción (banana + pan) para reponer después del gasto del día, licopeno del tomate cocido.', puntaje: 7 } },
        { chatId: '2026-09-07-cena', category: 'Cena', desc: 'Carne molida salteada con morrón rojo y amarillo y cebolla (sin aceite agregado) + batata y zanahoria hervida, con un toque de queso rallado', confidence: 'media', kcal: 510, protein: 37, carbs: 46, fat: 18, calidad: { ultraprocesado: 'Bajo — carne, vegetales y tubérculo son alimentos enteros mínimamente procesados; el único agregado más industrializado es el toque de queso rallado (NOVA 3, en cantidad chica).', beneficios: 'Cena bien completa: proteína de calidad y hierro/zinc de la carne roja, betacarotenos de zanahoria y morrones, carbs de liberación gradual de la batata (buen timing pre-natación), y buena variedad de vegetales que veníamos viendo como punto flojo.', puntaje: 8 } },
      ],
      note: 'Primer día de vuelta al modo estricto tras ~2 semanas sin tracking de comidas. Medición semanal: peso 77.2kg (+3.2kg vs 24/08), cintura 87cm (+1cm vs 24/08), cadera 105cm (sin cambios) — vuelve a valores cercanos al inicio del registro (14/07: 76.95kg/95cm/108cm). Sueño 6h47, score 87 (Buena). Entreno doble: fuerza (rutina de glúteos, 41:41min, 218 kcal activas, FC prom 120, esfuerzo moderado 6) + natación (36:14min, 1200m — Tabla 50m, Mariposa 75m, Dorso 100m, Pecho 175m, Libre 800m, 217 kcal activas, FC prom 149, esfuerzo moderado 6). Reloj: 10.287 pasos, 1.030 kcal actividad, 1.726 kcal reposo (gasto total ≈2.756 kcal). Nutrición: 2037 kcal/143g prot/195g carbs/74.2g grasa — excelente cierre, kcal/proteína/carbs cayeron justo en objetivo de entreno (2000-2150/135-145/180-210), grasa apenas por encima (60-70 objetivo). Buena variedad de vegetales y dos comidas con doble fuente de proteína animal (pollo+salmón en almuerzo). Calendario: Side hustle 5.5h (Yar work x3 + reimbursment), Trabajo corpo 4.5h (Meeting Constanza, Planning APP&PORTAL, Revisar mensajes, Denuncia Siniestro, Presentación Renaper, Caja Work), Deporte 2h (Gimnasio + Natación), Aprendizaje 1.5h (Tesis — categoría nueva agregada hoy, separada de Emprendedurismo), Otros 1h (Cargar horas clocky + Entrevista Mastercard). Día cerrado.',
    },
    '2026-09-08': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 442, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 22, ligero: 63, profundo: 14 } },
      training: null,
      activity: { steps: 11395, activeKcal: 694, restKcal: 1581 },
      measurements: null,
      meals: [
        { chatId: '2026-09-08-desayuno', category: 'Desayuno', desc: 'Mismo desayuno que ayer: tostada integral con queso crema descremado y tomates + omelet con huevo, queso y jamón + café con leche Protein', confidence: 'media', kcal: 400, protein: 28, carbs: 37, fat: 16, calidad: { ultraprocesado: 'Moderado — base de huevo, tomate y pan integral con algunos agregados más industrializados (queso, jamón, leche Protein fortificada).', beneficios: 'Buen desayuno con proteína sólida para arrancar el día, carbs del pan integral y licopeno del tomate.', puntaje: 7 } },
        { chatId: '2026-09-08-media-manana', category: 'Media mañana', desc: 'Banana entera con un poco de granola (avena, almendras, cornflakes)', confidence: 'media-alta', kcal: 170, protein: 3, carbs: 36, fat: 3, calidad: { ultraprocesado: 'Bajo — banana entera + granola simple, sin agregados industriales relevantes.', beneficios: 'Snack liviano y funcional: potasio y carbs de rápida disponibilidad de la banana, algo de fibra y grasas buenas de la granola con almendras. Buena elección para sostener energía antes del almuerzo.', puntaje: 8 } },
        { chatId: '2026-09-08-almuerzo', category: 'Almuerzo', desc: 'Media wrap integral con una lata entera de atún en lomitos, espinaca, choclo, zanahoria, tomate, cebolla y morrón + sobras de batata y zanahoria hervida', confidence: 'media', kcal: 400, protein: 21, carbs: 60, fat: 8, calidad: { ultraprocesado: 'Bajo-moderado — la tortilla integral y el atún en lata (probablemente en aceite) son los componentes más procesados (NOVA 3), pero siguen siendo alimentos base reconocibles; vegetales y batata mínimamente procesados.', beneficios: 'Almuerzo bastante más completo de lo que parecía a primera vista: buena proteína del atún, mucha fibra y variedad de vegetales (espinaca, choclo, zanahoria, tomate, cebolla, morrón), y carbs complejos de la batata reciclada de ayer.', puntaje: 8 } },
        { chatId: '2026-09-08-snack-oficina', category: 'Snack', desc: 'Medialuna de manteca (oficina)', confidence: 'media', kcal: 200, protein: 4, carbs: 22, fat: 10, calidad: { ultraprocesado: 'Alto — producto de panadería industrial/comercial, harina refinada, manteca y glaseado azucarado (NOVA 3-4).', beneficios: 'Aporta energía rápida pero poco valor nutricional — casi nada de fibra, proteína o micronutrientes. Es un placer puntual más que un alimento funcional.', puntaje: 4 } },
        { chatId: '2026-09-08-merienda', category: 'Merienda', desc: 'Yogur sin lactosa sin azúcares agregados (140g, etiqueta confirmada) + granola/muesli (frutos secos y pasas)', confidence: 'alta', kcal: 183, protein: 10, carbs: 25, fat: 5, calidad: { ultraprocesado: 'Moderado — el yogur sin lactosa/sin azúcar agregada tiene ingredientes funcionales (almidón modificado, proteínas lácteas, estabilizantes) que lo ubican en NOVA 3; la granola con frutos secos es más simple.', beneficios: 'Buen combo: proteína decente del yogur fortificado (7.3g cada 140g) sin azúcar añadida, más fibra y grasas buenas de la granola con almendras y pasas.', puntaje: 7 } },
        { chatId: '2026-09-08-cena', category: 'Cena', desc: 'Filet de merluza al horno gratinado con jamón, tomate y queso + fideos hervidos con queso', confidence: 'media', kcal: 605, protein: 52, carbs: 58, fat: 16, calidad: { ultraprocesado: 'Bajo-moderado — pescado y tomate son alimentos enteros, el jamón y el queso son procesados en cantidad moderada (NOVA 3-4), y los fideos son un producto envasado simple (harina y agua, NOVA 1-2).', beneficios: 'Excelente proteína del pescado (magra y de calidad), licopeno del tomate horneado, calcio del queso. Los fideos suman carbs extra al día pero como "gustito" ocasional no hay drama — el resto del plato es sólido nutricionalmente.', puntaje: 7 } },
      ],
      note: 'Martes sin entreno. Sueño excelente: 7h22, score 92 (Buena) — duración 47/50, interrupciones 20/20. Bajón de energía a media tarde (sugar crash) probablemente por almuerzo carb-heavy sin suficiente proteína/grasa + recuperación de glucógeno post-natación del día anterior + reacomodo tras las 2 semanas sin control estricto. Nutrición: 1958 kcal/118g prot/238g carbs/58g grasa — kcal en rango, proteína quedó un poco corta, carbs se pasó bastante (fideos en la cena como gustito consciente), grasa apenas debajo del objetivo. Reloj: 11.395 pasos, 694 kcal actividad, 1.581 kcal reposo (gasto total ≈2.275 kcal). Calendario: día muy cargado de oficina — Trabajo corpo 10.75h (La Caja: Bajas, Comunicaciones, Pagos y Siniestros, Sync Comu Telecom), TikTok 1h (Content work), Emprendedurismo 0.75h (FoodTech + Liaisons). Tesis planificada pero no se hizo. Día cerrado.',
    },
    '2026-09-09': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 413, score: 86, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 23, ligero: 59, profundo: 14 } },
      training: { tipo: 'Fuerza + caminata en caminadora', duracion: '31:19 + 10:00', ejercicios: 'Fuerza tradicional 7:04-7:35 + caminata 773m (7:35-7:45, ritmo 12\'57"/km)', kcalActivas: 134 + 32, fcProm: '109 / 109', esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 6425, activeKcal: 539, restKcal: 1599 },
      measurements: null,
      meals: [
        { chatId: '2026-09-09-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'media-alta', kcal: 50, protein: 0.6, carbs: 13, fat: 0.2, calidad: { ultraprocesado: 'Ninguno — fruta entera.', beneficios: 'Carbs de rápida disponibilidad y potasio, ideal como combustible liviano pre-entreno.', puntaje: 9 } },
        { chatId: '2026-09-09-desayuno', category: 'Desayuno', desc: 'Tostada integral con queso crema y tomates (air fryer) + omelet de 2 claras y 1 yema con queso proteico y jamón + café con leche Protein', confidence: 'media', kcal: 400, protein: 28, carbs: 37, fat: 16, calidad: { ultraprocesado: 'Moderado — base de huevo, tomate y pan integral con agregados más industrializados (queso proteico, jamón, leche Protein fortificada).', beneficios: 'Buen desayuno post-entreno con proteína sólida para recuperación, carbs del pan integral y licopeno del tomate.', puntaje: 7 } },
        { chatId: '2026-09-09-almuerzo', category: 'Almuerzo', desc: 'Guiso de lentejas con arroz, salsa natural, morrón, cebolla, zanahoria y tomatitos', confidence: 'media', kcal: 385, protein: 17, carbs: 66, fat: 5, calidad: { ultraprocesado: 'Bajo — legumbres, arroz y vegetales frescos/salsa natural, prácticamente sin componentes industrializados.', beneficios: 'Excelente aporte de fibra e hierro de las lentejas, buena variedad de vegetales, carbs complejos del arroz. La proteína es de origen vegetal (más baja en aminoácidos esenciales que la animal), así que conviene sumar algo de proteína animal o láctea más tarde en el día.', puntaje: 9 } },
        { chatId: '2026-09-09-merienda', category: 'Merienda', desc: 'Huevo revuelto con queso proteico + yogur Ilolay natural con granola, media banana y frutos rojos congelados', confidence: 'media-alta', kcal: 315, protein: 20, carbs: 28, fat: 13, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — huevo, yogur natural, banana y frutos rojos son mínimamente procesados; el queso proteico y la granola comercial son los componentes más industrializados.', beneficios: 'Muy buen combo de proteína completa (huevo + yogur) con carbs de calidad y algo de fibra de la granola y las frutas. Buena elección para completar el déficit de proteína del día.', puntaje: 8 } },
        { chatId: '2026-09-09-cena', category: 'Cena', desc: 'Wrap de carne molida, choclo, espinaca, morrón y cebolla con salsa de tomate y queso proteico + media papa al horno + porción extra de wrap (para sumar proteína)', confidence: 'media', kcal: 890, protein: 52, carbs: 95, fat: 30, fiber: 14, calidad: { ultraprocesado: 'Bajo-moderado — carne, vegetales y papa (con cáscara) son alimentos enteros; la tortilla integral y el queso proteico son los componentes más industrializados.', beneficios: 'Buena proteína completa entre carne y queso proteico, fibra destacable por la combinación de vegetales variados, choclo y papa con cáscara. La porción extra ayudó a cerrar mejor el objetivo de proteína del día.', puntaje: 8 } },
      ],
      note: 'Miércoles día de entreno. Sueño 6h53, score 86 (Buena) — duración 44/50, interrupciones 18/20. Entreno: fuerza (31:19min, 134kcal activas, FC prom 109, esfuerzo moderado 5) + caminata en caminadora (10min, 773m, 32kcal activas, ritmo 12\'57"/km). Nutrición: 2040 kcal/117.6g prot/239g carbs/64.2g grasa — kcal y grasa en rango, proteína quedó un poco corta pese al refuerzo consciente en la cena, carbs se pasó levemente. Reloj: 6.425 pasos, 539 kcal actividad, 1.599 kcal reposo (gasto total ≈2.138 kcal). Calendario: Trabajo corpo 3.5h (Caja work, UX Caja, Trabajar Caja, Repaso semanal), Side hustle 2.5h (Yar - Meeting Danay, Support tickets, Wilson), Aprendizaje 2h (Tesis x2, sí se hizo hoy a diferencia de ayer), Emprendedurismo 1.25h (Lautaro Foodtech Nucleate, NDA Lauti), Deporte 1h (Gimnasio), Otros 0.75h (entrevista Mastercard). Día cerrado.',
    },
    '2026-09-10': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 369, score: null, wakeEnergy: null, endEnergy: null, phases: { vigilia: 11, rem: 20, ligero: 56, profundo: 13 } },
      training: null,
      activity: { steps: 16838, activeKcal: 700, restKcal: 1644 },
      measurements: null,
      meals: [
        { chatId: '2026-09-10-desayuno', category: 'Desayuno', desc: 'Café con leche + omelet de 2 claras y 1 huevo con queso proteico + tostada con queso crema y tomates confitados', confidence: 'media', kcal: 400, protein: 29, carbs: 29, fat: 17, fiber: 3, calidad: { ultraprocesado: 'Moderado — huevo, tomate y pan son la base; el queso proteico y el café con leche aportan el componente más industrializado.', beneficios: 'Buena proteína para arrancar el día, carbs moderados del pan y licopeno del tomate.', puntaje: 7 } },
        { chatId: '2026-09-10-almuerzo', category: 'Almuerzo', desc: '3 pedazos de wrap de carne molida, choclo, espinaca, morrón (uno con extra queso y salsa) + tomates cherry cortados', confidence: 'media', kcal: 375, protein: 29, carbs: 36, fat: 17, fiber: 5, calidad: { ultraprocesado: 'Bajo-moderado — carne y vegetales enteros, tortilla y queso/salsa del pedazo extra como componentes más procesados.', beneficios: 'Buena proteína y variedad de vegetales reciclando la preparación de anoche, tomates cherry suman vitamina C y fibra extra.', puntaje: 8 } },
        { chatId: '2026-09-10-snack-oficina', category: 'Snack', desc: 'Alfajor triple (etiqueta confirmada: 57g, 1 unidad)', confidence: 'alta', kcal: 287, protein: 2.9, carbs: 33, fat: 16, fiber: 0, calidad: { ultraprocesado: 'Alto — producto industrial NOVA 4: azúcar, grasa vegetal, aceite, leudantes químicos, emulsionantes, saborizantes artificiales.', beneficios: 'Prácticamente ninguno nutricionalmente — 21g de azúcar añadida y 8.5g de grasa saturada en una sola porción. Es puro placer puntual.', puntaje: 3 } },
        { chatId: '2026-09-10-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con granola (perfil establecido)', confidence: 'alta', kcal: 157, protein: 9, carbs: 13, fat: 7, fiber: 2, calidad: { ultraprocesado: 'Bajo — yogur natural simple y granola con ingredientes reconocibles.', beneficios: 'Probióticos y calcio del yogur, algo de fibra de la granola. Buena opción liviana.', puntaje: 8 } },
        { chatId: '2026-09-10-snack-tarde', category: 'Snack', desc: 'Croissant de jamón y queso (afuera)', confidence: 'media', kcal: 350, protein: 12, carbs: 30, fat: 20, fiber: 1, calidad: { ultraprocesado: 'Alto — masa de hojaldre industrial con fiambre y queso procesado, NOVA 3-4.', beneficios: 'Aporta algo de proteína por el jamón y queso, pero la mayoría de las calorías vienen de grasa saturada de la masa. Placer ocasional más que opción funcional.', puntaje: 4 } },
      ],
      note: 'Jueves sin entreno. Sueño más corto y movido: 6h9, vigilia 11% (más alta que lo habitual), sin score visible en la captura. Reportó pesadillas, posiblemente asociado a haber comido más de lo habitual la noche anterior. Nutrición: no cenó (sin hambre) — acumulado final del día 1569 kcal/81.9g prot/144g carbs/77g grasa, quedó corto de proteína y pasado de grasa (por el alfajor y el croissant), sin cena que compensara. Reloj: 16.838 pasos, 700 kcal actividad, 1.644 kcal reposo (gasto total ≈2.344 kcal) — día con mucho movimiento físico pese a ser día de descanso de entreno formal. Calendario: Trabajo corpo 9h (La Caja, incluye Nucleate Genesis 2026), Side hustle 1h (Support tickets SB), TikTok 0.75h (Grabar contenido), Otros 0.5h (pagar expensas y tarjeta naranja). Día cerrado.',
    },
    '2026-09-11': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 457, score: 91, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 24, ligero: 57, profundo: 17 } },
      training: { tipo: 'Fuerza tradicional', duracion: '56:29', ejercicios: 'Entrenamiento tradicional de fuerza, 7:07-8:03 a.m.', kcalActivas: 313, fcProm: '121', esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 7740, activeKcal: 781, restKcal: 1848 },
      measurements: null,
      meals: [
        { chatId: '2026-09-11-pre-entreno', category: 'Pre-entreno', desc: 'Yogur natural con granola y frutos rojos congelados', confidence: 'alta', kcal: 172, protein: 9.1, carbs: 16, fat: 7.1, fiber: 2, calidad: { ultraprocesado: 'Bajo — yogur natural, granola simple y fruta congelada sin agregados.', beneficios: 'Probióticos y calcio del yogur, antioxidantes de los frutos rojos, fibra y carbs de la granola. Buen pre-entreno liviano.', puntaje: 9 } },
        { chatId: '2026-09-11-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 2 claras y 1 yema con queso proteico y jamón + tostada integral con queso crema light, palta y tomates confitados', confidence: 'media', kcal: 448, protein: 29, carbs: 40, fat: 20, fiber: 4, calidad: { ultraprocesado: 'Moderado — base de huevo, tomate, pan y palta (mínimamente procesados) con queso proteico, jamón y leche Protein como componentes más industrializados.', beneficios: 'Sumar palta mejora el perfil de grasas (más monoinsaturada, menos dependiente de la del queso/jamón), aporta fibra extra y potasio. Buen desayuno post-entreno.', puntaje: 8 } },
        { chatId: '2026-09-11-almuerzo', category: 'Almuerzo', desc: 'Lomitos de atún con choclo, espinaca, queso proteico, huevo entero hervido, zanahoria y batata hervida', confidence: 'media', kcal: 590, protein: 54, carbs: 42, fat: 24, fiber: 8, calidad: { ultraprocesado: 'Bajo-moderado — atún en lata y queso proteico son lo más procesado; el resto (huevo, vegetales, tubérculo) es comida entera.', beneficios: 'Plato muy completo: triple fuente de proteína de calidad (atún, huevo, queso), buena fibra de batata/zanahoria/espinaca/choclo, carbs complejos bien distribuidos.', puntaje: 9 } },
        { chatId: '2026-09-11-merienda', category: 'Merienda', desc: 'Yogur natural con granola y frutos rojos (igual al pre-entreno)', confidence: 'alta', kcal: 172, protein: 9.1, carbs: 16, fat: 7.1, fiber: 2, calidad: { ultraprocesado: 'Bajo — yogur natural, granola simple y fruta congelada sin agregados.', beneficios: 'Probióticos y calcio del yogur, antioxidantes de los frutos rojos, fibra y carbs de la granola.', puntaje: 9 } },
        { chatId: '2026-09-11-cena', category: 'Cena social', desc: 'Picada compartida entre 5 (papas smiley, aceitunas, papas fritas, maní) + hamburguesa simple McDonald\'s + vodka con agua y frutos rojos/limón', confidence: 'baja-media', kcal: 960, protein: 22, carbs: 72, fat: 41, fiber: 4, calidad: { ultraprocesado: 'Alto — picada de snacks fritos/envasados, comida rápida y alcohol, todo NOVA 3-4.', beneficios: 'Poco valor nutricional funcional, es una cena social de disfrute puntual. El maní y las aceitunas aportan algo de grasas buenas dentro del combo.', puntaje: 3 } },
      ],
      note: 'Viernes día de entreno. Excelente noche de sueño: 7h37, score 91 (Buena) — duración 48/50, interrupciones 19/20. Entreno: fuerza tradicional (56:29min, 313kcal activas, FC prom 121, esfuerzo moderado 6) — sesión más larga e intensa que las de días previos. Nutrición: 2342 kcal/123.2g prot/186g carbs/99.2g grasa — cena social (picada compartida + McDonald\'s + vodka) empujó bastante la grasa y las kcal por encima del objetivo (2000-2150/60-70g grasa), proteína quedó algo corta pese al buen manejo durante el día. Esperable y sin drama por ser evento social puntual. Reloj: 7.740 pasos, 781 kcal actividad, 1.848 kcal reposo (gasto total ≈2.629 kcal). Calendario: Trabajo corpo 4.5h (incluye Retro semanal), Side hustle 4h (Support tickets, Yar x3), Social 3h (cena con amigos), Deporte 1h (Gimnasio), Emprendedurismo 1h (Equipo Food tech). Día cerrado.',
    },
    '2026-09-12': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 350, score: 73, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 23, ligero: 61, profundo: 14 } },
      training: null,
      activity: { steps: 11148, activeKcal: 593, restKcal: 1812 },
      measurements: null,
      meals: [
        { chatId: '2026-09-12-desayuno', category: 'Desayuno', desc: 'Mate + tostada integral con queso crema + omelet de 2 claras y 1 yema', confidence: 'media', kcal: 200, protein: 15, carbs: 17, fat: 7, fiber: 2, calidad: { ultraprocesado: 'Bajo — pan, huevo y queso crema en cantidad chica; el mate no aporta calorías relevantes.', beneficios: 'Buena proteína para el tamaño de la porción, desayuno liviano y simple.', puntaje: 8 } },
        { chatId: '2026-09-12-almuerzo', category: 'Almuerzo', desc: 'Albóndigas de carne molida con huevo + zanahoria, morrón, cebolla, tomate + fideos hervidos + puré de tomate', confidence: 'media', kcal: 615, protein: 44, carbs: 61, fat: 21, fiber: 6, calidad: { ultraprocesado: 'Bajo — carne, huevo, vegetales y pasta simple, prácticamente todo casero y reconocible.', beneficios: 'Plato casero muy completo: buena proteína de las albóndigas, variedad de vegetales, carbs de los fideos. Comida tradicional bien balanceada.', puntaje: 9 } },
        { chatId: '2026-09-12-merienda', category: 'Merienda social', desc: 'Dos porciones de budín con chocolate y almendras + mate (con un amigo)', confidence: 'media', kcal: 300, protein: 5, carbs: 35, fat: 15, fiber: 2, calidad: { ultraprocesado: 'Moderado-alto — budín casero pero rico en azúcar, manteca y chocolate; el mate no suma calorías.', beneficios: 'Poco valor nutricional funcional, es un placer social puntual con un amigo. Los frutos secos (almendras) aportan algo de grasas buenas.', puntaje: 4 } },
        { chatId: '2026-09-12-cena', category: 'Cena', desc: '1/4 de tarta integral de espinaca y queso + ensalada de espinaca, tomate y queso + una caipirinha', confidence: 'baja-media', kcal: 510, protein: 14, carbs: 44, fat: 18, fiber: 4, calidad: { ultraprocesado: 'Moderado — tarta casera con masa integral y ensalada fresca son mínimamente procesadas; la caipirinha aporta azúcar y alcohol.', beneficios: 'Buena base de vegetales (espinaca, tomate) y algo de proteína del queso; la caipirinha es el componente menos funcional pero suma disfrute social.', puntaje: 6 } },
      ],
      note: 'Sábado. Sueño más corto y de menor calidad: 5h50, score 73 (Regular) — duración 35/50, se acostó 1h03 más tarde de lo habitual. Nutrición: 1625 kcal/78g prot/157g carbs/61g grasa — kcal y carbs en rango, grasa en el límite superior, proteína bastante por debajo del objetivo (día social relajado, sin drama). Reloj: 11.148 pasos, 593 kcal actividad, 1.812 kcal reposo (gasto total ≈2.405 kcal) — buen nivel de actividad informal pese a no tener entreno formal. Calendario: Social 4h (continuación cena con amigos hasta la madrugada), Emprendedurismo 1h (Nucleate investigación). "Marta" y "Ropa" quedaron sin clasificar a pedido. Día cerrado.',
    },
    '2026-09-13': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 459, score: 98, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 30, ligero: 49, profundo: 20 } },
      training: null,
      activity: { steps: 11955, activeKcal: 601, restKcal: 1538 },
      measurements: null,
      meals: [
        { chatId: '2026-09-13-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + tostada integral con queso crema, palta y tomates cherry + omelet de 2 claras y 1 yema con jamón', confidence: 'media', kcal: 365, protein: 28, carbs: 30, fat: 14, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — base de huevo, palta, tomate y pan (mínimamente procesados) con jamón y leche Protein como componentes más industrializados.', beneficios: 'Buena proteína y grasas saludables de la palta, fibra extra del tomate y la palta. Desayuno bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-13-almuerzo', category: 'Almuerzo', desc: 'Suprema de pollo al horno con condimentos y ajo + tomates cherry crudos + papa y batata al horno', confidence: 'media', kcal: 545, protein: 65, carbs: 40, fat: 12, fiber: 5, calidad: { ultraprocesado: 'Ninguno — pollo, papa, batata y tomate frescos, condimentados con hierbas y ajo, todo casero.', beneficios: 'Excelente proteína magra de calidad, carbs complejos bien distribuidos entre papa y batata, vitamina C del tomate crudo. Plato muy limpio y bien balanceado.', puntaje: 9 } },
        { chatId: '2026-09-13-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con granola, banana y frutos rojos', confidence: 'media-alta', kcal: 227, protein: 10, carbs: 30, fat: 7, fiber: 3, calidad: { ultraprocesado: 'Bajo — yogur natural, granola simple, banana y frutos rojos, sin agregados industriales relevantes.', beneficios: 'Probióticos y calcio del yogur, antioxidantes de los frutos rojos, potasio de la banana y fibra de la granola.', puntaje: 9 } },
        { chatId: '2026-09-13-cena', category: 'Cena', desc: 'Lentejas con capeletinis, zanahoria, morrón rojo y amarillo, cebolla, queso parmesano y puré de tomate', confidence: 'media', kcal: 455, protein: 23, carbs: 68, fat: 10, fiber: 8, calidad: { ultraprocesado: 'Bajo-moderado — lentejas y vegetales frescos con puré de tomate; los capeletinis (pasta rellena envasada) y el parmesano son los componentes más procesados.', beneficios: 'Buena fibra e hierro de las lentejas, variedad de vegetales, proteína completada por el relleno de los capeletinis y el parmesano. Buen cierre del día.', puntaje: 8 } },
      ],
      note: 'Domingo, descanso activo (caminata planeada). Sueño excelente: 7h39, score 98 (Muy alta) — duración 48/50, hora de acostarse 30/30, interrupciones 20/20. Profundo 20%, por encima de lo habitual. Nutrición: 1592 kcal/126g prot/168g carbs/43g grasa — uno de los días mejor balanceados de la semana, kcal y carbs en rango, proteína casi en objetivo, grasa con margen de sobra. Buena fibra por lentejas, batata, tomate y palta a lo largo del día. Reloj: 11.955 pasos, 601 kcal actividad, 1.538 kcal reposo (gasto total ≈2.139 kcal). Calendario: Aprendizaje 1.5h (Tesis), Emprendedurismo 1h (Foodtech), Otros 0.5h (trámite licencia). Día cerrado.',
    },
    '2026-09-14': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 413, score: 82, wakeEnergy: null, endEnergy: null, phases: { vigilia: 6, rem: 23, ligero: 64, profundo: 7 } },
      training: { tipo: 'Fuerza (glúteos) + Natación en piscina', duracion: '52:10 + 38:05', ejercicios: 'Fuerza tradicional 7:03-7:55 a.m. + Natación 1475m — Tabla 75m, Pecho 275m, Libre 1125m (9:00-9:38 p.m.)', kcalActivas: 270 + 254, fcProm: '117 / 143', esfuerzo: 'Moderado (6 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 8257, activeKcal: 1036, restKcal: 1713 },
      measurements: { weight: 75.35, waist: 86, hip: 104 },
      meals: [
        { chatId: '2026-09-14-pre-entreno', category: 'Pre-entreno', desc: 'Yogur natural de siempre con granola y banana', confidence: 'alta', kcal: 202, protein: 9.3, carbs: 24.5, fat: 7.2, fiber: 2, calidad: { ultraprocesado: 'Bajo — yogur natural, granola simple y banana entera.', beneficios: 'Probióticos y calcio del yogur, carbs de rápida disponibilidad de la banana, fibra de la granola. Buen pre-entreno liviano.', puntaje: 9 } },
        { chatId: '2026-09-14-desayuno', category: 'Desayuno', desc: 'Café con leche + tostada integral con queso crema, palta y tomates cherry + omelet de 2 claras y 1 yema con jamón y queso proteico', confidence: 'media', kcal: 410, protein: 29, carbs: 31, fat: 18, fiber: 4, calidad: { ultraprocesado: 'Moderado — base de huevo, palta, tomate y pan (mínimamente procesados) con jamón, queso proteico y leche como componentes más industrializados.', beneficios: 'Buena proteína y grasas saludables de la palta, fibra extra del tomate y la palta. Desayuno post-entreno bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-14-almuerzo', category: 'Almuerzo', desc: 'Lata de atún en lomitos, huevo y medio duro, tomates cherry, lentejas, zanahoria, papa, batata, choclo y espinaca', confidence: 'media', kcal: 795, protein: 58, carbs: 78, fat: 26, fiber: 12, calidad: { ultraprocesado: 'Bajo — atún en lata es el único componente algo procesado; el resto (huevo, legumbres, vegetales, tubérculos) es comida entera.', beneficios: 'Plato extremadamente completo: triple fuente de proteína (atún, huevo, lentejas), gran variedad de vegetales y tubérculos, muy buena fibra e hierro. Uno de los almuerzos más nutritivos de la semana.', puntaje: 9 } },
        { chatId: '2026-09-14-merienda', category: 'Merienda social', desc: 'Dos cookies caseras (blanca y de chocolate) hechas por una amiga', confidence: 'baja-media', kcal: 570, protein: 7.5, carbs: 74, fat: 28, fiber: 2, calidad: { ultraprocesado: 'Moderado-alto — caseras pero ricas en azúcar, manteca/chocolate; ingredientes reconocibles aunque en proporciones de repostería.', beneficios: 'Poco valor funcional, es un gustito social hecho con cariño por una amiga. Disfrute puntual sin problema.', puntaje: 4 } },
        { chatId: '2026-09-14-cena', category: 'Cena pre-natación', desc: 'Sobras de lentejas, choclo, espinaca y zanahoria + carne molida', confidence: 'media', kcal: 370, protein: 33, carbs: 29, fat: 13, fiber: 6, calidad: { ultraprocesado: 'Ninguno — todo comida entera reciclada del almuerzo más carne magra.', beneficios: 'Justo lo que hacía falta: proteína magra sin sumar mucha grasa, buena fibra de las legumbres y vegetales. Excelente ajuste después del feedback de la merienda.', puntaje: 9 } },
      ],
      note: 'Lunes de medición semanal: peso 75.35kg (-1.85kg vs 07/09), cintura 86cm (-1cm vs 07/09), cadera 104cm (-1cm vs 07/09) — primera semana completa de vuelta al modo estricto con resultado positivo en las tres medidas. Día de entreno doble: fuerza glúteos (52:10min, 270kcal activas, FC prom 117, esfuerzo moderado 6) + natación 1475m (38:05min, 254kcal activas, FC prom 143, esfuerzo moderado 6). Sueño más movido: 6h53, score 82 (Buena) — profundo solo 7% (bastante por debajo de lo habitual), varias interrupciones (13/20 en ese ítem). Nutrición: 2347 kcal/136.8g prot/236.5g carbs/92.2g grasa — proteína cayó justo en objetivo, kcal/carbs/grasa por encima (desayuno con palta + almuerzo grande + cookies sociales), pero buen ajuste en la cena tras el feedback. Reloj: 8.257 pasos, 1.036 kcal actividad, 1.713 kcal reposo (gasto total ≈2.749 kcal) — día de mucho gasto por el doble entreno. Calendario: Side hustle 5h (Yar x5), Aprendizaje 2h (Tesis), Deporte 2h (Gimnasio + Natación), Trabajo corpo 1h (Trabajar Caja), Emprendedurismo 1h (Foodtech - Pivot). Día cerrado.',
    },
    '2026-09-15': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 406, score: 93, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 25, ligero: 65, profundo: 9 } },
      training: null,
      activity: { steps: 11444, activeKcal: 555, restKcal: 1645 },
      measurements: null,
      meals: [
        { chatId: '2026-09-15-desayuno', category: 'Desayuno', desc: 'Café con leche + tostada integral con queso crema, palta y tomates cherry + omelet de 2 claras y 1 huevo con queso proteico y 1/4 fetita de jamón', confidence: 'media', kcal: 410, protein: 29, carbs: 31, fat: 18, fiber: 4, calidad: { ultraprocesado: 'Moderado — base de huevo, palta, tomate y pan (mínimamente procesados) con jamón, queso proteico y leche como componentes más industrializados.', beneficios: 'Buena proteína y grasas saludables de la palta, fibra extra del tomate y la palta.', puntaje: 8 } },
        { chatId: '2026-09-15-almuerzo', category: 'Almuerzo', desc: 'Wrap integral con carne molida, choclo, espinaca, zanahoria, cebolla y morrón + 4 tomates cherry', confidence: 'media', kcal: 511, protein: 33.5, carbs: 54.5, fat: 18, fiber: 7, calidad: { ultraprocesado: 'Bajo-moderado — carne y vegetales enteros; la tortilla integral es el único componente más procesado.', beneficios: 'Buena proteína y gran variedad de vegetales, carbs complejos de la zanahoria y el choclo, fibra sólida.', puntaje: 8 } },
        { chatId: '2026-09-15-merienda', category: 'Merienda', desc: '3 tequeños venezolanos de queso (oficina, sin foto)', confidence: 'baja', kcal: 270, protein: 9, carbs: 27, fat: 14, fiber: 1, calidad: { ultraprocesado: 'Alto — masa frita rellena de queso, NOVA 3-4.', beneficios: 'Poco valor funcional, aporta algo de proteína y calcio del queso pero la mayoría son calorías de fritura. Gustito ocasional de oficina.', puntaje: 4 } },
        { chatId: '2026-09-15-cena', category: 'Cena', desc: 'Fideos penne con 2 huevos duros, carne, cebolla, morrón, ajo y queso rallado', confidence: 'media', kcal: 655, protein: 49, carbs: 51, fat: 28, fiber: 5, calidad: { ultraprocesado: 'Bajo-moderado — carne, huevo y vegetales enteros; la pasta y el queso rallado son los componentes más procesados.', beneficios: 'Buena proteína entre huevo y carne, comida casera bien balanceada para cerrar el día.', puntaje: 8 } },
      ],
      note: 'Martes sin entreno. Sueño muy bueno: 6h46, score 93 (Buena) — duración 43/50, hora de acostarse 30/30, interrupciones 20/20. Nutrición: 1846 kcal/120.5g prot/163.5g carbs/78g grasa — kcal y carbs cayeron justo en rango, proteína apenas por debajo del objetivo, grasa un poco pasada (tequeños + queso de la cena). Buen día en general. Reloj: 11.444 pasos, 555 kcal actividad, 1.645 kcal reposo (gasto total ≈2.200 kcal). Calendario: Trabajo corpo 9h (La Caja, incluye reunión food tech), Side hustle 1.5h (Trabajar Yaro), TikTok 1h (Content). Día cerrado.',
    },
    '2026-09-16': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 453, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 51, profundo: 22 } },
      training: { tipo: 'Fuerza tradicional', duracion: '57:48', ejercicios: 'Entrenamiento tradicional de fuerza, 7:02-8:00 a.m.', kcalActivas: 253, fcProm: '106', esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 5616, activeKcal: 626, restKcal: 1795 },
      measurements: null,
      meals: [
        { chatId: '2026-09-16-pre-entreno', category: 'Pre-entreno', desc: 'Banana', confidence: 'alta', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3, calidad: { ultraprocesado: 'Ninguno — fruta entera.', beneficios: 'Carbs de rápida disponibilidad y potasio, buen combustible pre-entreno.', puntaje: 9 } },
        { chatId: '2026-09-16-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + tostada integral con palta y tomates cherry + omelet de 2 claras y 1 yema con queso proteico y 1/4 fetita de jamón', confidence: 'media', kcal: 410, protein: 29, carbs: 31, fat: 18, fiber: 4, calidad: { ultraprocesado: 'Moderado — base de huevo, palta, tomate y pan (mínimamente procesados) con jamón, queso proteico y leche Protein como componentes más industrializados.', beneficios: 'Buena proteína y grasas saludables de la palta, fibra extra del tomate y la palta. Buen desayuno post-entreno.', puntaje: 8 } },
        { chatId: '2026-09-16-almuerzo', category: 'Almuerzo', desc: 'Chuleta de cerdo al horno con papa, zanahoria y calabaza al horno', confidence: 'media', kcal: 575, protein: 40, carbs: 51, fat: 23, fiber: 7, calidad: { ultraprocesado: 'Ninguno — todo comida entera casera al horno.', beneficios: 'Buena proteína magra del cerdo, carbs complejos bien distribuidos entre papa y calabaza, fibra y betacarotenos de zanahoria y calabaza.', puntaje: 9 } },
        { chatId: '2026-09-16-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con granola, kiwi y frutos rojos', confidence: 'media-alta', kcal: 214, protein: 10, carbs: 26, fat: 7, fiber: 4, calidad: { ultraprocesado: 'Bajo — yogur natural, granola simple, fruta entera y frutos rojos, sin agregados industriales relevantes.', beneficios: 'Probióticos y calcio del yogur, vitamina C del kiwi, antioxidantes de los frutos rojos, fibra de la granola. Muy buena variedad de fruta.', puntaje: 9 } },
        { chatId: '2026-09-16-cena', category: 'Cena', desc: 'Puré de papa (1 papa mediana) con leche proteica + milanesa de suprema de pollo napolitana empanada con granola y huevo, queso proteico y salsa de tomate', confidence: 'media', kcal: 600, protein: 66, carbs: 46, fat: 15, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — pollo, papa y huevo son la base; el queso proteico y la salsa de tomate envasada son los componentes más procesados.', beneficios: 'Excelente proteína (pollo + queso proteico + leche proteica), buena creatividad usando granola como empanado para sumar fibra. Cena muy completa para cerrar el día.', puntaje: 8 } },
      ],
      note: 'Miércoles día de entreno. Excelente noche de sueño: 7h33, score 92 (Buena) — duración 48/50, interrupciones 19/20, profundo 22% (muy bueno). Nutrición: 1904 kcal/146.3g prot/181g carbs/63.4g grasa — excelente día, todo dentro o muy cerca del objetivo de entreno (2000-2150/135-145/180-210/60-70), proteína incluso superó el mínimo. Reloj: 5.616 pasos, 626 kcal actividad, 1.795 kcal reposo (gasto total ≈2.421 kcal) — pasos bajos porque fue día de mucha entrevista/reuniones sentada. Calendario: Side hustle 3h (Yar x3), Trabajo corpo 2.5h (Trabajar Caja x2 + Repaso semanal), Aprendizaje 1.75h (Genesis Open Lecture + Tesis), Emprendedurismo 1h (Food tech), Deporte 1h (Gimnasio), Otros 0.83h (entrevista Mastercard). Día cerrado (con un día de retraso).',
    },
    '2026-09-17': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 422, score: 93, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 27, ligero: 56, profundo: 15 } },
      training: null,
      activity: { steps: 13386, activeKcal: 957, restKcal: 1856, totalEnergy: 2813 },
      measurements: null,
      meals: [
        { chatId: '2026-09-17-desayuno', category: 'Desayuno', desc: 'Café con leche proteica + tostada con queso crema y palta + omelet de 2 claras y 1 huevo con queso', confidence: 'media', kcal: 415, protein: 32, carbs: 25, fat: 20, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — base de huevo, palta y pan (mínimamente procesados) con queso crema, queso de omelet y leche Protein como componentes más industrializados.', beneficios: 'Muy buena proteína (huevo + queso + leche Protein) y grasas saludables de la palta. Al no tener jamón esta vez, el perfil es incluso un poco más limpio que el desayuno habitual.', puntaje: 8 } },
        { chatId: '2026-09-17-almuerzo', category: 'Almuerzo', desc: 'Pechuga de pollo al horno cortada + medio wrap integral con carne molida, zanahoria, choclo, morrón y cebolla (almuerzo de oficina)', confidence: 'media', kcal: 470, protein: 57, carbs: 27, fat: 14, fiber: 3.5, calidad: { ultraprocesado: 'Bajo-moderado — pollo, carne y vegetales enteros como base; la tortilla integral del wrap es el único componente más procesado.', beneficios: 'Excelente proteína (pechuga de pollo + carne molida), buena variedad de vegetales con carbs complejos de zanahoria y choclo, fibra sólida.', puntaje: 8 } },
        { chatId: '2026-09-17-merienda', category: 'Merienda', desc: 'Alfajor (60g, según etiqueta) de oficina', confidence: 'alta', kcal: 303, protein: 6.7, carbs: 34, fat: 16, fiber: 1.2, calidad: { ultraprocesado: 'Alto — NOVA 4, con emulsionantes, aromas artificiales, conservante y azúcares añadidos (18g de los 19g totales).', beneficios: 'Poco valor funcional, es un gustito de oficina. Aporta energía rápida pero casi todo de azúcar añadida y grasas saturadas (7.6g).', puntaje: 3 } },
        { chatId: '2026-09-17-merienda2', category: 'Merienda', desc: 'Yogur Ilolay natural con granola (frutos secos y avena)', confidence: 'media', kcal: 182, protein: 9, carbs: 16, fat: 8, fiber: 1.5, calidad: { ultraprocesado: 'Bajo-moderado — yogur natural mínimamente procesado, la granola aporta algo de azúcares añadidos según la marca.', beneficios: 'Buena combinación de proteína (yogur) con grasas buenas y algo de fibra de los frutos secos y la avena de la granola.', puntaje: 7 } },
        { chatId: '2026-09-17-cena', category: 'Cena', desc: 'Lata de lomitos de atún al natural + huevo duro + tomate chico + lechuga + zanahoria rallada + espinaca y choclo', confidence: 'media', kcal: 375, protein: 36, carbs: 20, fat: 16, fiber: 5.5, calidad: { ultraprocesado: 'Bajo — atún enlatado al natural, huevo y vegetales frescos, mínimo procesamiento.', beneficios: 'Excelente proteína magra (atún + huevo), buena variedad de vegetales frescos y fibra sólida para cerrar el día.', puntaje: 9 } },
      ],
      note: 'Miércoles día de descanso (sin entreno). Sueño muy bueno: 7h02, score 93 (Buena) — duración 46/50, interrupciones 18/20, REM 27%. Nutrición: 1745 kcal/140.7g prot/122g carbs/74g grasa/15.7g fibra — proteína superó ampliamente el objetivo de descanso (130-140g), fibra bien encaminada, carbs algo bajos y grasa levemente por arriba del rango (60-70g). Reloj: 13.386 pasos, 957 kcal actividad, 1.856 kcal reposo (gasto total ≈2.813 kcal) — pasos altos pese a no haber entrenado. Calendario: Trabajo corpo 9h (La Caja), Side hustle 2.75h (Battlemap Yar + Trabajar Yar), Otros 0.75h (Psicóloga). Sin Deporte, Aprendizaje, Emprendedurismo, TikTok ni Social. Día cerrado.',
    },
    '2026-09-18': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 448, score: 94, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 19, ligero: 67, profundo: 13 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza)', duracion: '40 min', ejercicios: '', kcalActivas: 239, kcalTotal: 298, fcProm: 127, esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 6067, activeKcal: 625, restKcal: 1809, totalEnergy: 2434 },
      measurements: null,
      meals: [
        { chatId: '2026-09-18-snack1', category: 'Snack', desc: 'Banana muy madura', confidence: 'media', kcal: 90, protein: 1, carbs: 23, fat: 0.3, fiber: 2.5, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Buena fuente de potasio y carbs de rápida disponibilidad, útil como energía antes de entrenar. Al estar muy madura, el azúcar es más simple y de absorción más rápida.', puntaje: 9 } },
        { chatId: '2026-09-18-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + tostada de queso crema proteico, palta y tomates + omelet de 2 claras y 1 yema con queso proteico (post-entreno)', confidence: 'media', kcal: 400, protein: 30, carbs: 30, fat: 17, fiber: 4, calidad: { ultraprocesado: 'Moderado — base de huevo, palta y tomate (mínimamente procesados) con queso crema proteico, queso de omelet y leche Protein como componentes más industrializados.', beneficios: 'Muy buena proteína post-entreno para recuperación, grasas saludables de la palta. Sin jamón esta vez, perfil un poco más limpio que lo habitual.', puntaje: 8 } },
        { chatId: '2026-09-18-almuerzo', category: 'Almuerzo', desc: 'Fideos mostachol con carne molida, tomate, zanahoria, morrón y cebolla + puré de tomates + queso proteico rallado', confidence: 'media', kcal: 680, protein: 48, carbs: 79, fat: 21, fiber: 7.5, calidad: { ultraprocesado: 'Moderado — pasta, carne y vegetales frescos como base; el queso proteico rallado es el componente más industrializado.', beneficios: 'Buena combinación de carbs complejos, proteína sólida (carne + queso proteico) y fibra de los vegetales. Plato completo y generoso, ideal día de entreno.', puntaje: 7 } },
        { chatId: '2026-09-18-merienda', category: 'Merienda', desc: 'Yogur con granola, frutos rojos congelados y kiwi + huevo duro', confidence: 'media', kcal: 385, protein: 17.5, carbs: 46, fat: 15, fiber: 8, calidad: { ultraprocesado: 'Bajo-moderado — yogur, kiwi y frutos rojos mínimamente procesados; la granola aporta el componente más industrializado.', beneficios: 'Excelente fibra y antioxidantes (frutos rojos + kiwi), buena vitamina C, y el huevo suma proteína de alta calidad.', puntaje: 8 } },
        { chatId: '2026-09-18-cena', category: 'Cena', desc: 'Papas fritas de paquete + pizza casera de tomate y cebolla (buena cantidad)', confidence: 'baja-media', kcal: 800, protein: 24, carbs: 85, fat: 38, fiber: 5, calidad: { ultraprocesado: 'Alto — las papas fritas de paquete son NOVA 4; la pizza casera es más casera pero con harina refinada y grasas del horneado.', beneficios: 'Cena más de gusto que funcional — aporta energía y algo de carbs, pero poco valor nutricional destacable más allá del tomate y la cebolla.', puntaje: 4 } },
      ],
      note: 'Viernes día de entreno: fuerza tradicional a la mañana (40 min, 239 kcal activas, esfuerzo moderado 6/10). Sueño excelente: 7h28, score 94 (Buena) — mejor que el día anterior. Nutrición: 2355 kcal/120.5g prot/263g carbs/91.3g grasa/27g fibra — la cena (papas fritas + pizza casera) hizo que el día se pasara bastante de los objetivos de entreno en carbs, grasa y kcal totales, aunque la proteína se quedó corta (120.5g de 135-145g). Fibra muy bien (27g). Reloj: 6.067 pasos, 625 kcal actividad, 1.809 kcal reposo (gasto total ≈2.434 kcal) — pasos bajos por día de muchas reuniones/entrevistas sentada. Calendario: Side hustle 5h (Battlemap + CMM Session Yar + Yar work + Trabajar Yar), Emprendedurismo 2h (Reu FoodTech x2), Otros ≈2.08h (pagar cuota Despegar + 2 entrevistas finales con Mastercard para el puesto de Junior Technical Project Manager), Deporte 1h (Gimnasio), Trabajo corpo 0.5h (Trabajar Caja). Dos solapamientos resueltos por regla del evento más largo: "Retro + Repaso semanal" absorbido por "Yar work", y "Tesis PPT" absorbido por las reuniones de FoodTech. Día cerrado.',
    },
    '2026-09-19': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 338, score: 60, wakeEnergy: null, endEnergy: null, phases: { vigilia: 6, rem: 20, ligero: 66, profundo: 8 } },
      training: { tipo: 'Cardio', duracion: '1h', ejercicios: '', kcalActivas: null, kcalTotal: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
      activity: { steps: 19556, activeKcal: 983, restKcal: 1598, totalEnergy: 2581 },
      measurements: null,
      meals: [
        { chatId: '2026-09-19-desayuno', category: 'Desayuno', desc: '2 tostadas integrales con huevo revuelto (2 claras + 1 yema) + 1 tostada con queso crema y tomate', confidence: 'media', kcal: 355, protein: 20, carbs: 39, fat: 12, fiber: 6.5, calidad: { ultraprocesado: 'Bajo-moderado — pan integral, huevo y tomate frescos, con el queso crema como componente más industrializado.', beneficios: 'Buenos carbs complejos y fibra del pan integral, proteína decente del huevo. Perfil liviano, adecuado para un sábado sin definir aún si hay entreno.', puntaje: 7 } },
        { chatId: '2026-09-19-almuerzo', category: 'Almuerzo', desc: '2 milanesas napolitanas chicas (pollo y nalga) con jamón y queso + papas al horno + ensalada de lechuga, tomate y zanahoria', confidence: 'media', kcal: 770, protein: 48, carbs: 60, fat: 37, fiber: 5, calidad: { ultraprocesado: 'Moderado-alto — milanesas rebozadas y fritas con jamón y queso procesado (NOVA 3-4); papas y ensalada frescas equilibran el plato.', beneficios: 'Buena proteína entre las dos carnes, y la ensalada + papas aportan fibra y micronutrientes. Almuerzo completo pero con bastante grasa por el rebozado y el queso.', puntaje: 6 } },
        { chatId: '2026-09-19-merienda', category: 'Merienda', desc: 'Yogur con frutos rojos y granola', confidence: 'media', kcal: 210, protein: 9.5, carbs: 23, fat: 8, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — yogur y frutos rojos mínimamente procesados, granola como componente más industrializado.', beneficios: 'Buena fibra y antioxidantes de los frutos rojos, proteína decente del yogur.', puntaje: 8 } },
        { chatId: '2026-09-19-cena', category: 'Cena', desc: 'Fideos coditos con crema, cebolla y morrón + 250g de pechuga de pollo con ajo', confidence: 'alta', kcal: 795, protein: 72, carbs: 65, fat: 26, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — pasta seca, pollo, crema y vegetales frescos; la crema de leche es el único ingrediente algo más industrializado.', beneficios: 'Excelente proteína (250g de pechuga), buen aporte de carbs de la pasta y algo de fibra de la cebolla y el morrón. Plato completo y bien balanceado.', puntaje: 8 } },
      ],
      note: 'Sábado post-pijamada, sueño flojo y fragmentado (5h38, score 60 Baja). Entreno: 1h de cardio (sin evento en calendario, sin detalle de kcal/FC específico del entreno). Nutrición: 2130 kcal/149.5g prot/187g carbs/83g grasa/19.5g fibra — muy buena proteína. Reloj: 19.556 pasos, 983 kcal actividad, 1.598 kcal reposo (gasto total ≈2.581 kcal, datos tomados ~21hs, casi cierre de día). Déficit del día: ≈451 kcal (gasto 2.581 vs consumo 2.130). Calendario: Emprendedurismo 1h (Entregable foodtech), Side hustle 1h (Trabajar Yaro), Otros 1.25h (peluquería + Comprar vuelta Galicia + Ordenar finanzas), Deporte 1h (cardio, sin evento propio). "Pijamada memes" (00:00-10:00) excluida del cómputo de tiempo por solaparse completo con el sueño ya registrado — a confirmar si se prefiere contar aparte. Día cerrado.',
    },
    '2026-09-20': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 550, score: 99, wakeEnergy: null, endEnergy: null, phases: {} },
      training: null,
      activity: { steps: 8222, activeKcal: 454, restKcal: 1638, totalEnergy: 2092 },
      measurements: null,
      meals: [
        { chatId: '2026-09-20-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 2 tostadas integrales (queso crema/palta/tomate y queso crema/jamón) + huevos revueltos (1 y medio)', confidence: 'media', kcal: 480, protein: 32, carbs: 39, fat: 24, fiber: 6.5, calidad: { ultraprocesado: 'Bajo-moderado — pan integral, palta, tomate y huevo mínimamente procesados; queso crema, jamón y leche Protein como componentes más industrializados.', beneficios: 'Buena proteína variada (huevo + jamón + leche Protein), grasas saludables de la palta y fibra decente del pan integral y la palta.', puntaje: 7 } },
        { chatId: '2026-09-20-almuerzo', category: 'Almuerzo', desc: 'Milanesa casera de nalga empanada (huevo y pan rallado) con tomate + ensalada de lechuga y zanahoria + batata al horno', confidence: 'media', kcal: 490, protein: 31, carbs: 53, fat: 16, fiber: 6.5, calidad: { ultraprocesado: 'Bajo-moderado — milanesa casera con breading, resto de ingredientes frescos (tomate, lechuga, zanahoria, batata).', beneficios: 'Buena proteína de la carne, la batata aporta carbs complejos y buena fibra, ensalada fresca suma micronutrientes. Plato casero bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-20-merienda', category: 'Merienda', desc: 'Alfajor Terrabusi (70g, según etiqueta)', confidence: 'alta', kcal: 271, protein: 4.8, carbs: 40, fat: 13, fiber: 1, calidad: { ultraprocesado: 'Alto — NOVA 4, con 27g de azúcares añadidos sobre 40g de carbohidratos totales.', beneficios: 'Prácticamente sin valor nutricional funcional, es un gustito de placer puro. El antojo de dulce tiene bastante lógica fisiológica después del cardio de ayer.', puntaje: 2 } },
        { chatId: '2026-09-20-cena', category: 'Cena', desc: 'Costillitas de vaca a la riojana con papas al horno, huevo frito y jamón (cena afuera, compartida)', confidence: 'baja-media', kcal: 850, protein: 49, carbs: 54, fat: 47, fiber: 5, calidad: { ultraprocesado: 'Moderado — carne, papas y huevo frescos con salsa riojana casera; el jamón es lo único algo más procesado.', beneficios: 'Buena proteína de la carne, aunque el plato es bastante calórico y graso. Cena de gusto/social, no busca ser funcional.', puntaje: 6 } },
      ],
      note: 'Domingo de descanso. Sueño excelente: 9h10, score 99 (Muy alta) — duración 50/50, hora de acostarse 30/30, interrupciones 19/20. Buena recuperación después de la noche floja del sábado. Nutrición: 2091 kcal/116.8g prot/186g carbs/100g grasa/19g fibra — incluyó un alfajor de media tarde y una cena afuera (costillitas a la riojana), día más de gusto que de control estricto. Reloj: 8.222 pasos, 454 kcal actividad, 1.638 kcal reposo (gasto total ≈2.092 kcal). Balance calórico: prácticamente en mantenimiento (~1 kcal de diferencia entre consumo y gasto). Calendario: Aprendizaje 3.75h (Tesis x2), Emprendedurismo 2h (Entregable + Reunión foodtech), Social 2h (cena afuera, sin evento propio en calendario, duración estimada). Día cerrado.',
    },
    '2026-09-21': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 362, score: 80, wakeEnergy: null, endEnergy: null, phases: { vigilia: 6, rem: 18, ligero: 68, profundo: 8 } },
      training: { tipo: 'Cardio (caminadora) + Natación en piscina', duracion: '30:00 + 40:19', ejercicios: 'Caminadora 3.80km, ritmo 7\'54"/km (7:11-7:41 a.m.) + Natación 1400m — Tabla 150m, Pecho 375m, Mariposa 400m, Libre 475m (8:59-9:40 p.m.)', kcalActivas: 238 + 264, kcalTotal: 283 + 325, fcProm: '147 / 142', esfuerzo: 'Moderado (4 / 6)', energia: null, dolor: 'No' },
      activity: { steps: 12944, activeKcal: 997, restKcal: 1679, totalEnergy: 2676 },
      measurements: { weight: 74.65, waist: 85, hip: 105 },
      meals: [
        { chatId: '2026-09-21-pre-entreno1', category: 'Pre-entreno', desc: 'Banana pequeña', confidence: 'media', kcal: 70, protein: 0.9, carbs: 18, fat: 0.2, fiber: 2, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Buena fuente de potasio y carbs de rápida disponibilidad, ideal antes de entrenar.', puntaje: 9 } },
        { chatId: '2026-09-21-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + tostada integral con queso crema, palta y tomate + omelet de 2 claras y 1 yema (post-entreno)', confidence: 'media', kcal: 335, protein: 25, carbs: 25, fat: 14.5, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — base de huevo, palta y tomate mínimamente procesados, queso crema y leche Protein como componentes más industrializados.', beneficios: 'Buena proteína post-entreno para recuperación, grasas saludables de la palta.', puntaje: 8 } },
        { chatId: '2026-09-21-snack1', category: 'Snack', desc: 'Medialuna', confidence: 'media', kcal: 150, protein: 3, carbs: 18, fat: 7, fiber: 0.5, calidad: { ultraprocesado: 'Alto — masa de manteca/margarina con glaseado azucarado, NOVA 3-4.', beneficios: 'Poco valor funcional, es un gustito de panadería. Aporta energía rápida principalmente de grasas y carbs simples.', puntaje: 3 } },
        { chatId: '2026-09-21-almuerzo', category: 'Almuerzo', desc: 'Pata-muslo de pollo sin piel + ravioles de 4 quesos con salsa de cebolla y morrón', confidence: 'media', kcal: 750, protein: 62, carbs: 58, fat: 29, fiber: 3.5, calidad: { ultraprocesado: 'Moderado — pollo fresco y salsa casera de cebolla/morrón; los ravioles son pasta rellena industrial (NOVA 3).', beneficios: 'Excelente proteína del pollo, buen aporte de carbs de la pasta. Almuerzo abundante y potente como venía anunciado.', puntaje: 6 } },
        { chatId: '2026-09-21-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con granola', confidence: 'media', kcal: 192, protein: 9, carbs: 17, fat: 8.5, fiber: 1.5, calidad: { ultraprocesado: 'Bajo-moderado — yogur natural mínimamente procesado, granola como componente más industrializado.', beneficios: 'Buena proteína del yogur, algo de fibra de la granola.', puntaje: 7 } },
        { chatId: '2026-09-21-cena', category: 'Cena', desc: 'Milanesa de carne napolitana (air fryer) + papas y batata mini en air fryer con cáscara (pre-natación)', confidence: 'media', kcal: 570, protein: 32, carbs: 64, fat: 21, fiber: 6, calidad: { ultraprocesado: 'Bajo-moderado — milanesa con breading y queso, papas y batata con cáscara cocidas en air fryer (menos grasa añadida que frito tradicional).', beneficios: 'Buena proteína, y la cáscara de las papas/batata suma fibra extra. Cocción en air fryer más liviana en grasa.', puntaje: 7 } },
      ],
      note: 'Lunes, medición semanal: peso 74.65kg (-0.7kg vs lunes pasado), cintura 85cm (-1cm vs lunes pasado), cadera 105cm (+1cm vs lunes pasado). Sueño flojo: 6h02, score 80 (Regular) — duración 36/50, interrupciones 14/20. Día de doble entreno: cardio en caminadora a la mañana (30min, 3.80km, 238 kcal activas) + natación a la noche (40min, 1.400m, 264 kcal activas). Nutrición: 2067 kcal/131.9g prot/200g carbs/80.2g grasa/17.5g fibra — buena proteína, algo por debajo del objetivo pero cerca. Reloj: 12.944 pasos, 997 kcal actividad, 1.679 kcal reposo (gasto total ≈2.676 kcal). Déficit del día: ≈609 kcal. Calendario: Trabajo corpo 4.9h (Meeting with Constanza + Planning APP&PORTAL + Revisar mensajes app + Trabajar Caja), Side hustle 4h (Yar work + Battlemap Yar + Trabajar Yar), Deporte 2h (Gimnasio + Natación), Aprendizaje 1h (Tesis), Otros 0.25h (trámite licencia). Regla de solapamiento confirmada por Conti: siempre tomar el evento más largo. Día cerrado.',
    },
    '2026-09-22': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 430, score: 95, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 55, profundo: 18 } },
      training: null,
      activity: { steps: 12477, activeKcal: 742, restKcal: 1635, totalEnergy: 2377 },
      measurements: null,
      meals: [
        { chatId: '2026-09-22-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 2 claras y 1 huevo con queso proteico y jamón + tostada integral con queso crema y palta', confidence: 'alta', kcal: 400, protein: 29, carbs: 29, fat: 18, fiber: 3.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo y palta mínimamente procesados; jamón, queso proteico y leche Protein como componentes más industrializados.', beneficios: 'Muy buena proteína (huevo + jamón + queso proteico + leche Protein), grasas saludables de la palta. Perfil habitual y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-22-almuerzo', category: 'Almuerzo', desc: 'Wrap integral con atún natural, zanahoria, espinaca, choclo y queso proteico (oficina)', confidence: 'media', kcal: 620, protein: 50, carbs: 76, fat: 13, fiber: 11, calidad: { ultraprocesado: 'Bajo — atún, vegetales frescos y tortilla integral; el queso proteico es lo único más industrializado.', beneficios: 'Excelente proteína (atún + queso proteico), muy buena fibra y buenos carbs complejos de la tortilla integral y los vegetales.', puntaje: 9 } },
        { chatId: '2026-09-22-merienda', category: 'Merienda', desc: 'Yogur Ilolay natural con banana y granola', confidence: 'media', kcal: 270, protein: 10, carbs: 39, fat: 8, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — yogur natural y banana mínimamente procesados, granola como componente más industrializado.', beneficios: 'Buena proteína del yogur, potasio y carbs de rápida disponibilidad de la banana, algo de fibra de la granola.', puntaje: 8 } },
        { chatId: '2026-09-22-cena', category: 'Cena', desc: 'Chuleta de cerdo con papa, batata, tomate y cebolla al horno', confidence: 'media', kcal: 575, protein: 39, carbs: 52, fat: 22, fiber: 7.5, calidad: { ultraprocesado: 'Bajo — carne y vegetales frescos, todo horneado sin exceso de aceite.', beneficios: 'Buena proteína de la chuleta, muy buena variedad de vegetales horneados con fibra sólida. Cena casera bien balanceada.', puntaje: 8 } },
      ],
      note: 'Martes de descanso. Sueño muy bueno: 7h10, score 95 (Buena) — duración 46/50, hora de acostarse 30/30, interrupciones 19/20. Nutrición: 1865 kcal/128g prot/196g carbs/61g grasa/26g fibra — kcal casi en el objetivo de descanso, fibra excelente, proteína a 2g del mínimo. Reloj: 12.477 pasos, 742 kcal actividad, 1.635 kcal reposo (gasto total ≈2.377 kcal). Déficit del día: ≈512 kcal. Calendario: Trabajo corpo 9h (La Caja, absorbe Food tech por regla del evento más largo), Emprendedurismo 1h50 (Genesis 2026), Otros 1h (compras del súper). Día cerrado.',
    },
    '2026-09-23': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 433, score: 95, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 25, ligero: 62, profundo: 9 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — Día 1', duracion: '47 min', ejercicios: 'Activación: elevación de cadera 1pp (3s pausa), plancha dinámica codo-palma, abs bolita — 3x30"/10" pausa. Hip thrust 4x8 (a 1 repe del fallo). Abductores de cadera 3x12 (2 repes del fallo). Camilla adelante 3x12 (2 repes del fallo). Circuito 4x8 (3 repes del fallo): dominadas en polea, press de hombro con mancuerna, remo a 1 brazo con mancuerna.', kcalActivas: 280, kcalTotal: 348, fcProm: 127, esfuerzo: 'Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 5313, activeKcal: 600, restKcal: 1616, totalEnergy: 2216 },
      measurements: null,
      meals: [
        { chatId: '2026-09-23-pre-entreno1', category: 'Pre-entreno', desc: 'Banana', confidence: 'media', kcal: 90, protein: 1, carbs: 23, fat: 0.3, fiber: 2.5, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Buena fuente de potasio y carbs de rápida disponibilidad, ideal antes de entrenar.', puntaje: 9 } },
        { chatId: '2026-09-23-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 2 claras y 1 yema con queso proteico y jamón + tostada integral con queso crema, palta y tomate (post-entreno)', confidence: 'alta', kcal: 410, protein: 29, carbs: 31, fat: 18, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — huevo, palta y tomate mínimamente procesados; jamón, queso proteico y leche Protein como componentes más industrializados.', beneficios: 'Muy buena proteína post-entreno para recuperación, grasas saludables de la palta. Desayuno completo y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-23-almuerzo', category: 'Almuerzo', desc: 'Ravioles rellenos de carne con puré de tomate, cebolla y morrón + 150g pechuga de pollo + queso parmesano', confidence: 'media', kcal: 695, protein: 60.5, carbs: 57.5, fat: 21.6, fiber: 3.5, calidad: { ultraprocesado: 'Moderado — pollo fresco y salsa casera; los ravioles son pasta rellena industrial (NOVA 3).', beneficios: 'Excelente proteína combinada (pollo + relleno de carne + parmesano), almuerzo completo y potente.', puntaje: 7 } },
        { chatId: '2026-09-23-merienda', category: 'Merienda', desc: 'Mate + tostada integral con huevo revuelto y queso proteico + yogur (nuevo, porción 140g) con granola y kiwi', confidence: 'alta', kcal: 435, protein: 25, carbs: 43, fat: 19, fiber: 5, calidad: { ultraprocesado: 'Bajo-moderado — huevo, kiwi y tostada mínimamente procesados; queso proteico y yogur industrial como lo más procesado.', beneficios: 'Buena proteína variada, algo de fibra del kiwi y la granola.', puntaje: 7 } },
        { chatId: '2026-09-23-cena', category: 'Cena', desc: 'Costilla de cerdo con batata y papa al horno, tomates cherry y lechuga', confidence: 'media', kcal: 640, protein: 34, carbs: 43, fat: 35, fiber: 6.5, calidad: { ultraprocesado: 'Bajo — carne y vegetales frescos, todo al horno. La costilla es un corte más graso que la nalga/pollo que solés usar.', beneficios: 'Buena proteína y buena variedad de vegetales con fibra, aunque el corte de cerdo elegido sube bastante la grasa total del día.', puntaje: 6 } },
      ],
      note: 'Miércoles día de entreno: fuerza tradicional Día 1 a la mañana (47min, 280 kcal activas, esfuerzo moderado 6/10). Sueño muy bueno: 7h13, score 95 (Buena). Nutrición: 2270 kcal/149.5g prot/197.5g carbs/93.9g grasa/21.5g fibra — proteína superó el objetivo, pero la grasa se disparó por la costilla de cerdo de la cena (corte más graso que lo habitual). Reloj: 5.313 pasos, 600 kcal actividad, 1.616 kcal reposo (gasto total ≈2.216 kcal) — pasos bajos, día de mucho trabajo sentada. Balance calórico: leve superávit de ≈54 kcal, prácticamente mantenimiento. Calendario: Side hustle 5.25h (Trabajar Yar x3, absorbe Jira sync y Métricas Ivan), Trabajo corpo 4.25h (Trabajar Caja x2), Deporte 1.25h (Gimnasio), Aprendizaje 1h (Tesis), Emprendedurismo 0.75h (Reunión food tech). Día cerrado.',
    },
    '2026-09-24': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 390, score: 91, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 20, ligero: 62, profundo: 15 } },
      training: null,
      activity: { steps: 11313, activeKcal: 964, restKcal: 1759, totalEnergy: 2723 },
      measurements: null,
      meals: [
        { chatId: '2026-09-24-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 2 claras y 1 yema con queso proteico + tostada integral con queso crema, tomate y palta', confidence: 'alta', kcal: 400, protein: 29, carbs: 29, fat: 18, fiber: 3.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo, palta y tomate mínimamente procesados; queso proteico y leche Protein como componentes más industrializados.', beneficios: 'Muy buena proteína, grasas saludables de la palta. Perfil habitual y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-24-snack1', category: 'Snack', desc: '4 pan de queso (oficina)', confidence: 'media', kcal: 400, protein: 10, carbs: 40, fat: 22, fiber: 1.2, calidad: { ultraprocesado: 'Alto — masa de harina y queso horneada tipo panadería, NOVA 3-4.', beneficios: 'Poco valor funcional, es un gustito de oficina. El "panzazo" ya empezó, como venías anticipando.', puntaje: 4 } },
        { chatId: '2026-09-24-almuerzo', category: 'Almuerzo', desc: '2 porciones de entraña + ensalada de rúcula con queso + papas fritas + porción chica de flan con dulce de leche y crema (almuerzo social compartido entre 9)', confidence: 'baja-media', kcal: 680, protein: 45.5, carbs: 42, fat: 40, fiber: 2.5, calidad: { ultraprocesado: 'Moderado — carne y rúcula frescas, papas fritas y flan como lo más indulgente del plato.', beneficios: 'Muy buena proteína entre las dos porciones de entraña, rúcula fresca. Almuerzo social de disfrute, con porciones controladas de lo más pesado (papas y flan).', puntaje: 6 } },
        { chatId: '2026-09-24-meriencena', category: 'Merienda-cena', desc: 'Vaso de vodka con jugo + papitas, maní y nachos (junta social)', confidence: 'baja', kcal: 647, protein: 11, carbs: 55, fat: 31, fiber: 4.5, calidad: { ultraprocesado: 'Alto — papitas y nachos NOVA 4, el maní es lo más entero del combo, el alcohol suma calorías vacías.', beneficios: 'Poco valor nutricional funcional, es picoteo social. El maní aporta algo de proteína y grasas buenas en medio de todo lo demás.', puntaje: 3 } },
      ],
      note: 'Jueves de descanso, día social (almuerzo compartido entre 9 + after office). Sueño bueno: 6h30, score 91 (Buena). Nutrición: 2127 kcal/95.5g prot/166g carbs/111g grasa/11.7g fibra — día de gusto con pan de queso, almuerzo social y picoteo nocturno. Reloj: 11.313 pasos, 964 kcal actividad, 1.759 kcal reposo (gasto total ≈2.723 kcal). Balance calórico: déficit de ≈596 kcal pese al día social, gracias a la alta actividad. Calendario: Trabajo corpo 9h (La Caja), Social 3.5h (After office), TikTok 1h (Content work - Pilares), Side hustle 1h (Trabajar Yar, absorbe Arreglar specs). Día cerrado.',
    },
    '2026-09-25': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 424, score: 95, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 25, ligero: 55, profundo: 18 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — Glúteo "analítico" + pecho y bíceps', duracion: '1h01m', ejercicios: '', kcalActivas: 363, kcalTotal: 454, fcProm: 124, esfuerzo: 'Difícil (7)', energia: null, dolor: 'No' },
      activity: { steps: 5023, activeKcal: 724, restKcal: 1817, totalEnergy: 2541 },
      measurements: null,
      meals: [
        { chatId: '2026-09-25-pre-entreno1', category: 'Pre-entreno', desc: '2 cucharadas de yogur con granola y 1/4 kiwi', confidence: 'media', kcal: 70, protein: 2, carbs: 9, fat: 2.5, fiber: 1.5, calidad: { ultraprocesado: 'Bajo — yogur y kiwi mínimamente procesados, granola como componente algo más industrializado.', beneficios: 'Snack liviano pre-entreno, aporta algo de carbs rápidos y vitamina C del kiwi.', puntaje: 8 } },
        { chatId: '2026-09-25-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + 2 tostadas integrales con queso crema, palta y tomate + omelet de 2 claras y 1 huevo con queso proteico (post-entreno)', confidence: 'alta', kcal: 565, protein: 39, carbs: 41, fat: 27, fiber: 8, calidad: { ultraprocesado: 'Bajo-moderado — huevo, palta y tomate mínimamente procesados; queso proteico y leche Protein como componentes más industrializados.', beneficios: 'Excelente proteína post-entreno para recuperación (39g), muy buena fibra (8g) y grasas saludables de la palta.', puntaje: 8 } },
        { chatId: '2026-09-25-almuerzo', category: 'Almuerzo', desc: 'Lata de atún al natural con espinaca, choclo y tomates cherry + batata + un poco de zanahoria', confidence: 'media', kcal: 340, protein: 19, carbs: 64, fat: 1.5, fiber: 11, calidad: { ultraprocesado: 'Bajo — atún al natural (etiqueta) y vegetales frescos, prácticamente sin procesamiento.', beneficios: 'Excelente fibra (11g) y gran variedad de vegetales, buenos carbs complejos de la batata. Proteína moderada, liviano en grasa.', puntaje: 9 } },
        { chatId: '2026-09-25-merienda', category: 'Merienda', desc: 'Yogur (2 cucharadas) con 1/2 kiwi y granola + tostada integral con huevo revuelto y tomates cherry', confidence: 'media', kcal: 260, protein: 13, carbs: 30, fat: 9.5, fiber: 4.5, calidad: { ultraprocesado: 'Bajo-moderado — yogur, kiwi, huevo y tomate mínimamente procesados, granola como lo más industrializado.', beneficios: 'Buena combinación de proteína y fibra, snack liviano y variado.', puntaje: 8 } },
        { chatId: '2026-09-25-cena', category: 'Cena', desc: 'Chuleta de carne al horno con papas al horno, papas sonrisa, cebolla y tomates cherry', confidence: 'media', kcal: 730, protein: 45, carbs: 48.5, fat: 38, fiber: 5, calidad: { ultraprocesado: 'Bajo-moderado — carne y vegetales frescos, las papas sonrisa son un producto congelado procesado (NOVA 4).', beneficios: 'Buena proteína de la chuleta, buena variedad de vegetales. Las papas sonrisa suman grasa extra por ser fritas/procesadas.', puntaje: 6 } },
      ],
      note: 'Viernes día de entreno: fuerza (glúteo analítico + pecho y bíceps), 1h01m, esfuerzo difícil (7/10), 363 kcal activas. Sueño muy bueno: 7h04, score 95 (Buena). Nutrición: 1965 kcal/118g prot/192.5g carbs/78.5g grasa/30g fibra — kcal casi en objetivo, fibra excelente, proteína algo corta del mínimo de entreno. Reloj: 5.023 pasos, 724 kcal actividad, 1.817 kcal reposo (gasto total ≈2.541 kcal) — pasos bajos, día sentada de mucho laburo. Déficit del día: ≈576 kcal. Calendario: Trabajo corpo 4.25h (Trabajar Caja x3), Side hustle 4h (Trabajar Yar), Deporte 1h (Gimnasio), Aprendizaje 1h (Tesis), Otros 1.25h (Invitación formal + Recruitment Touchbase + Coti-Dai Product Manager). Cierre de la semana. Día cerrado.',
    },
    '2026-09-26': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 483, score: 99, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 26, ligero: 62, profundo: 10 } },
      training: { tipo: 'Fuerza', duracion: '1h', ejercicios: '', kcalActivas: null, kcalTotal: null, fcProm: null, esfuerzo: null, energia: null, dolor: 'No' },
      activity: { steps: 13813, activeKcal: 873, restKcal: 1701, totalEnergy: 2574 },
      measurements: null,
      meals: [
        { chatId: '2026-09-26-pre-entreno1', category: 'Pre-entreno', desc: 'Banana', confidence: 'media', kcal: 90, protein: 1, carbs: 23, fat: 0.3, fiber: 2.5, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Buena fuente de potasio y carbs de rápida disponibilidad, ideal antes de entrenar.', puntaje: 9 } },
        { chatId: '2026-09-26-desayuno', category: 'Desayuno', desc: 'Mate + tostada integral con tomate confitado + omelet de 2 claras y 1 huevo con queso proteico (post-entreno)', confidence: 'media', kcal: 275, protein: 23, carbs: 16, fat: 13.5, fiber: 2.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo, tomate y pan integral mínimamente procesados; queso proteico como componente más industrializado.', beneficios: 'Buena proteína post-entreno, perfil liviano y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-26-almuerzo', category: 'Almuerzo', desc: '20 piezas de sushi premium de salmón (rolls variados: salmón simple, con avocado/queso crema, con sésamo/crocante)', confidence: 'baja-media', kcal: 970, protein: 54, carbs: 118, fat: 44, fiber: 2, calidad: { ultraprocesado: 'Moderado — salmón fresco de buena calidad, pero arroz blanco refinado, salsas y algunas rolls con queso crema/crocante suman procesamiento y sodio.', beneficios: 'Buena proteína y omega-3 del salmón. Almuerzo de gusto, generoso en porción (20 piezas).', puntaje: 6 } },
        { chatId: '2026-09-26-merienda', category: 'Merienda', desc: 'Submarino + medio brownie con nueces (con una amiga)', confidence: 'baja-media', kcal: 420, protein: 10.5, carbs: 42, fat: 19, fiber: 1, calidad: { ultraprocesado: 'Alto — chocolate en barra, brownie con azúcar, NOVA 4.', beneficios: 'Poco valor funcional, es un gustito social. Las nueces del brownie aportan algo de grasas buenas en medio del resto.', puntaje: 3 } },
        { chatId: '2026-09-26-cena', category: 'Cena', desc: '2 porciones de pizza napolitana (jamón, morrón, tomate, aceitunas) + 1 empanada de carne, todo al horno', confidence: 'media', kcal: 690, protein: 29, carbs: 68, fat: 33, fiber: 3.5, calidad: { ultraprocesado: 'Moderado — masa refinada, jamón y queso procesado; empanada horneada casera o de rotisería.', beneficios: 'Cena de gusto, sabrosa pero sin mucho valor nutricional destacable. Cierre de un día bastante indulgente pero con alta actividad física.', puntaje: 5 } },
      ],
      note: 'Sábado día de entreno: fuerza 1h. Sueño excelente: 8h03, score 99 (Muy alta). Nutrición: 2445 kcal/117.5g prot/267g carbs/109.8g grasa/11.5g fibra — día bien indulgente (sushi, submarino/brownie, pizza y empanada), carbs y grasa bien por arriba del objetivo de entreno. Reloj: 13.813 pasos, 873 kcal actividad, 1.701 kcal reposo (gasto total ≈2.574 kcal). Balance calórico: leve déficit de ≈129 kcal pese al día de gusto, gracias a la alta actividad. Calendario: Side hustle 3.25h (Trabajar Yar, absorbe Support tickets), Social 3.75h (Teatro + cafecito + Shopping), Deporte 1.5h (Gimnasio), Otros 0.5h (Postulaciones Ivan). Día cerrado.',
    },
    '2026-09-27': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 550, score: 81, wakeEnergy: null, endEnergy: null, phases: { vigilia: 8, rem: 24, ligero: 56, profundo: 12 } },
      training: null,
      activity: { steps: 4232, activeKcal: 335, restKcal: 1541 },
      measurements: null,
      meals: [
        { chatId: '2026-09-27-desayuno', category: 'Desayuno', desc: '2 huevos revueltos con queso proteico + media banana con granola + mate', confidence: 'media', kcal: 330, protein: 20, carbs: 24.5, fat: 17.8, fiber: 2.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo y banana mínimamente procesados; queso proteico y granola como componentes más industrializados.', beneficios: 'Buena proteína para arrancar el día, potasio y carbs de rápida disponibilidad de la banana.', puntaje: 8 } },
        { chatId: '2026-09-27-almuerzo', category: 'Almuerzo', desc: 'Ravioles de carne con salsa de carne molida, morrón, ajo y tomate + queso proteico rallado', confidence: 'media', kcal: 625, protein: 34, carbs: 56.5, fat: 28, fiber: 4, calidad: { ultraprocesado: 'Moderado — ravioles como pasta rellena industrial (NOVA 3), salsa y queso proteico agregan proteína.', beneficios: 'Buena proteína combinada entre el relleno, la salsa y el queso proteico. Almuerzo casero completo.', puntaje: 7 } },
        { chatId: '2026-09-27-merienda', category: 'Merienda', desc: 'Tostada integral con tomates confitados + yogur natural (60g) con granola', confidence: 'alta', kcal: 250, protein: 8.5, carbs: 33, fat: 9, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — pan integral, tomate y yogur natural mínimamente procesados, granola como lo más industrializado.', beneficios: 'Buena fibra, snack liviano y balanceado.', puntaje: 8 } },
        { chatId: '2026-09-27-cena', category: 'Cena', desc: 'Pechuga de pollo (250g crudo) con puré de tomate, orégano y ajo al horno + papas al horno con cáscara + lechuga y tomates cherry', confidence: 'media', kcal: 635, protein: 70, carbs: 59, fat: 12.5, fiber: 7.5, calidad: { ultraprocesado: 'Nulo — pollo, papa, tomate y lechuga frescos, todo casero al horno.', beneficios: 'Proteína magra de calidad, carbs complejos de la papa con cáscara (fibra extra) y vitamina C del tomate y la lechuga. Cena limpia y muy balanceada.', puntaje: 9 } },
      ],
      note: 'Domingo de descanso. Sueño: 9h10, score 81 (Buena) — duración 50/50, hora de acostarse 21/30 (se desveló un poco), interrupciones 10/20. Nutrición: 1840 kcal/132.5g prot/173g carbs/67.3g grasa/18g fibra — día parejo, proteína, carbs y grasa dentro del objetivo de descanso; kcal 10 por debajo del piso y fibra corta (18g de 25-30). Cena limpia: pechuga al horno con puré de tomate + papas con cáscara + ensalada. Reloj (datos ~21hs, parciales): 4.232 pasos, 335 kcal actividad, 1.541 kcal reposo (gasto total ≈1.876 kcal). Balance calórico: ≈-36 kcal, mantenimiento. Calendario: Aprendizaje 6.25h (Tesis x2), Otros 0.75h (Postulaciones Ivan + Tareas psico). "Orne :)" (Proyecto Web3) excluido. Día cerrado.',
    },
    '2026-09-28': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 303, score: 62, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 22, ligero: 54, profundo: 20 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) + Natación en piscina', duracion: '46:26 + 58:34', ejercicios: 'Natación 2650m — Mariposa 75m, Dorso 225m, Pecho 300m, Libre 2050m (20:01-21:00, ritmo 2\'12"/100m, 106 vueltas, pileta 25m)', kcalActivas: 245 + 482, kcalTotal: 312 + 570, fcProm: '119 / 160', esfuerzo: 'Moderado (5) / Difícil (7)', energia: null, dolor: 'No' },
      activity: { steps: 13021, activeKcal: 1385, restKcal: 1675 },
      measurements: { weight: 74.7, waist: 87, hip: 102 },
      meals: [
        { chatId: '2026-09-28-pre-entreno', category: 'Pre-entreno', desc: 'Media banana', confidence: 'media-alta', kcal: 45, protein: 0.5, carbs: 11.5, fat: 0.2, fiber: 1.3, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Carbs de rápida disponibilidad y potasio, combustible liviano ideal antes de entrenar.', puntaje: 9 } },
        { chatId: '2026-09-28-desayuno', category: 'Desayuno', desc: 'Post-entreno: tostada integral con queso crema y tomates confitados + omelet de 2 claras y 1 yema con queso proteico + café negro', confidence: 'media', kcal: 280, protein: 22.5, carbs: 21, fat: 11, fiber: 3, calidad: { ultraprocesado: 'Bajo-moderado — huevo, tomate y pan integral mínimamente procesados; queso crema y queso proteico como componentes más industrializados.', beneficios: 'Buena proteína post-entreno para recuperación muscular, licopeno del tomate confitado (aumenta con la cocción) y algo de fibra del pan integral. Perfil liviano y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-28-almuerzo', category: 'Almuerzo', desc: 'Pechuga de pollo a la plancha (250g crudo) con espinaca, choclo, morrón y mostaza + papas al horno con cáscara + lechuga y tomates cherry', confidence: 'media', kcal: 630, protein: 72, carbs: 51.5, fat: 15, fiber: 10, calidad: { ultraprocesado: 'Bajo — pollo, verduras y papa frescos, cocinados a la plancha y al horno; la mostaza es lo único algo procesado y va en cantidad chica.', beneficios: 'Excelente proteína magra (72g), fibra sólida de la papa con cáscara, la espinaca, el choclo y la ensalada, y carbs complejos para el doble turno. Plato muy completo y variado en verduras.', puntaje: 9 } },
        { chatId: '2026-09-28-snack', category: 'Snack', desc: 'Barra de cereal con chocolate y frutos secos Zafrán (42g, de máquina expendedora) — post almuerzo, para las ganas de dulce', confidence: 'alta', kcal: 194, protein: 6.8, carbs: 17, fat: 11, fiber: 2.9, calidad: { ultraprocesado: 'Alto — NOVA 4: barra industrial con azúcares añadidos (7.2g de 8.9g totales), jarabe, chocolate y aromatizantes.', beneficios: 'Aporta algo de proteína (6.8g) y fibra (2.9g) por la avena y los frutos secos, con grasas mayormente insaturadas y bajo sodio. Bastante mejor opción que un alfajor, aunque sigue siendo un producto dulce procesado.', puntaje: 5 } },
        { chatId: '2026-09-28-merienda', category: 'Merienda', desc: 'Yogur proteico frutilla Ser (175g, etiqueta) con granola y almendras (oficina)', confidence: 'media-alta', kcal: 198, protein: 8.7, carbs: 22, fat: 18, fiber: 1.5, calidad: { ultraprocesado: 'Moderado — el yogur proteico es un producto fortificado (NOVA 3-4, con 14g de azúcar añadida), la granola con almendras es más simple.', beneficios: 'Buen aporte de proteína (7.2g del yogur) fácil de llevar a la oficina, más algo de grasas buenas y textura crocante de la granola con almendras.', puntaje: 6 } },
        { chatId: '2026-09-28-cena', category: 'Cena', desc: 'Hamburguesa de carne a la plancha (1 unidad, ~55g, etiqueta) con arroz y queso rallado, medio tomate, media zanahoria hervida, un huevo duro y orégano', confidence: 'media', kcal: 495, protein: 25.5, carbs: 50.5, fat: 21, fiber: 2.2, calidad: { ultraprocesado: 'Moderado — la hamburguesa es carne procesada (NOVA 3, con nitrito y glutamato según etiqueta), el resto (arroz, huevo, tomate, zanahoria) es comida entera.', beneficios: 'Buena proteína combinada entre la hamburguesa, el queso y el huevo, carbs de recuperación del arroz tras el doble entreno, y algo de fibra y vitaminas de tomate y zanahoria. Cena reparadora acorde al desgaste del día.', puntaje: 7 } },
      ],
      note: 'Lunes, medición semanal: peso 74.7kg (+0.05kg vs 21/09), cintura 87cm (+2cm vs 21/09), cadera 102cm (-3cm vs 21/09). Semana de recibida, con ansiedad y noche costosa para dormir. Sueño corto: 5h03, score 62 (Regular) — duración 28/50, hora de acostarse 15/30 (1h25 más tarde de lo habitual), interrupciones 19/20; profundo 20%. Entreno doble: fuerza (46:26min, 7:04-7:50, 245 kcal activas, FC prom 119, esfuerzo moderado 5) + natación (58:34min, 20:01-21:00, 2.650m — mariposa 75m, dorso 225m, pecho 300m, libre 2.050m, 482 kcal activas, FC prom 160, esfuerzo difícil 7). Nutrición: 1642 kcal/136g prot/173.5g carbs/76.2g grasa/20.9g fibra — proteína cumplió el objetivo de entreno pese al día pesado, kcal y fibra quedaron algo cortas, grasa levemente por encima. Reloj: 13.021 pasos, 1.385 kcal actividad, 1.675 kcal reposo (gasto total ≈3.060 kcal). Balance calórico: ≈-1.418 kcal, déficit grande por el doble entreno. Calendario: Trabajo corpo 9h (La Caja), Side hustle 2h (Trabajar Yar), Deporte 2h (Gimnasio + Natación), Aprendizaje 0.5h (Tesis). "Proyecto Web3" y "Volsmart" excluidos; sub-tareas de La Caja absorbidas por regla del evento más largo. Día cerrado.',
    },
    '2026-09-29': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 384, score: 82, wakeEnergy: null, endEnergy: null, phases: { vigilia: 5, rem: 18, ligero: 70, profundo: 7 } },
      training: null,
      activity: { steps: 12308, activeKcal: 793, restKcal: 1606 },
      measurements: null,
      meals: [
        { chatId: '2026-09-29-desayuno', category: 'Desayuno', desc: 'Tostada integral con queso crema y tomates cherry confitados + omelet de 2 claras y 1 yema + café negro', confidence: 'media', kcal: 260, protein: 20, carbs: 20.5, fat: 10.5, fiber: 2.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo, tomate y pan integral mínimamente procesados; el queso crema es el único componente algo más industrializado.', beneficios: 'Buena proteína del huevo para empezar el día, licopeno del tomate confitado y algo de fibra del pan integral. Desayuno liviano y limpio, sin agregados como jamón o leche Protein esta vez.', puntaje: 8 } },
        { chatId: '2026-09-29-snack1', category: 'Snack', desc: 'Bocadito de chocolate Marroc (1 unidad, oficina)', confidence: 'alta', kcal: 76, protein: 1.5, carbs: 7.4, fat: 4.5, fiber: 0.3, calidad: { ultraprocesado: 'Alto — bocadito de chocolate industrial, NOVA 4.', beneficios: 'Poco valor funcional, gustito chico de oficina en porción controlada.', puntaje: 3 } },
        { chatId: '2026-09-29-snack2', category: 'Snack', desc: 'Bizcochuelo Exquisita sabor vainilla, porción mediana ~60g (oficina)', confidence: 'alta', kcal: 175.5, protein: 3.6, carbs: 30, fat: 4.6, fiber: 0.5, calidad: { ultraprocesado: 'Alto — bizcochuelo industrial envasado, NOVA 4, harina refinada y azúcar.', beneficios: 'Poco valor nutricional, aporta energía rápida pero casi nada de fibra o micronutrientes. Gustito de oficina.', puntaje: 3 } },
        { chatId: '2026-09-29-almuerzo', category: 'Almuerzo', desc: 'Arroz con una lata de atún al natural, tomate y zanahoria', confidence: 'media', kcal: 375, protein: 33.5, carbs: 53.5, fat: 1.9, fiber: 3.9, calidad: { ultraprocesado: 'Bajo — atún enlatado al natural es un producto mínimamente procesado (NOVA 1-2), arroz, tomate y zanahoria son alimentos enteros.', beneficios: 'Excelente proteína magra y prácticamente sin grasa, buena fibra y vitaminas de las verduras. Plato muy limpio y equilibrado.', puntaje: 9 } },
        { chatId: '2026-09-29-snack3', category: 'Snack', desc: 'Banana bien madura, entera (tarde, para evitar el deseo de dulce)', confidence: 'alta', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, calidad: { ultraprocesado: 'Nulo — fruta entera, NOVA 1.', beneficios: 'Buena estrategia: el dulce natural y la fibra ayudan a cortar el antojo sin recurrir a algo ultraprocesado. Potasio y carbs de calidad.', puntaje: 9 } },
        { chatId: '2026-09-29-merienda', category: 'Merienda', desc: 'Yogur (marca sin identificar, pote celeste, 180g) con granola', confidence: 'media-alta', kcal: 208, protein: 11, carbs: 22, fat: 8.4, fiber: 1, calidad: { ultraprocesado: 'Bajo-moderado — yogur fermentado con leche fluida y en polvo (NOVA 2-3), granola simple.', beneficios: 'Buena proteína y calcio del yogur, algo de fibra y carbs de la granola. Merienda liviana y funcional.', puntaje: 7 } },
        { chatId: '2026-09-29-cena', category: 'Cena', desc: 'Pechuga de pollo al horno (~100g crudo) con papas sonrisa, zanahoria y tomate', confidence: 'media', kcal: 323, protein: 28.2, carbs: 30.7, fat: 9.6, fiber: 4.8, calidad: { ultraprocesado: 'Moderado — pollo, zanahoria y tomate frescos; las papas sonrisa son un producto congelado procesado (NOVA 4).', beneficios: 'Buena proteína magra del pollo y fibra/vitaminas de las verduras asadas; las papas sonrisa suman algo de grasa extra por ser fritas/procesadas, pero en porción moderada.', puntaje: 7 } },
        { chatId: '2026-09-29-postre', category: 'Postre', desc: '1/4 kg de helado (mitad chocolate con almendras, mitad dulce de leche con nueces) — comió la mitad del cuarto (~125g), síntoma de ansiedad pre-recibida', confidence: 'baja-media', kcal: 295, protein: 5, carbs: 33, fat: 15, fiber: 1, calidad: { ultraprocesado: 'Alto — helado industrial con crema, azúcar y grasas, NOVA 3-4.', beneficios: 'Poco valor nutricional funcional; las almendras y nueces aportan algo de grasas buenas dentro del combo. Es un gustito puntual ligado a la ansiedad, no una elección funcional.', puntaje: 4 } },
      ],
      note: 'Martes, día sin entreno. Sueño mejoró vs ayer: 6h24, score 82 (Buena) — duración 40/50, hora de acostarse 28/30, interrupciones 14/20. Sigue la ansiedad pre-recibida, pero irse a dormir a horario ayudó al puntaje. Se sumó un helado (1/4, comió la mitad) como síntoma de esa ansiedad. Nutrición: 1817.5 kcal/104.1g prot/223.7g carbs/54.9g grasa/17.7g fibra — con el agregado del helado, kcal y grasa se acercaron más al objetivo de descanso, proteína siguió algo corta. Reloj: 12.308 pasos, 793 kcal actividad, 1.606 kcal reposo (gasto total ≈2.399 kcal). Balance calórico: ≈-581.5 kcal, déficit moderado. Calendario: Trabajo corpo 9h (La Caja, absorbe Cita con Buenos Aires), Emprendedurismo 1.83h (Genesis 2026), Otros 1h (Peluquería, tramo sin solapar con Genesis). "Proyecto Web3" y "Volsmart" excluidos; "Pedir turno para facial" (tarea de Google Tasks) excluida. Día cerrado.',
    },
    '2026-09-30': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 412, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 24, ligero: 57, profundo: 17 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — Glúteo analítico', duracion: '58:01', ejercicios: '', kcalActivas: 336, kcalTotal: 421, fcProm: 126, esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 7799, activeKcal: 738, restKcal: 1704 },
      measurements: null,
      meals: [
        { chatId: '2026-09-30-pre-entreno', category: 'Pre-entreno', desc: 'Yogur natural (120g) con media banana y granola', confidence: 'media-alta', kcal: 189, protein: 8, carbs: 23, fat: 7.1, fiber: 2.3, calidad: { ultraprocesado: 'Bajo — yogur natural, banana entera y granola simple.', beneficios: 'Buena combinación pre-entreno: probióticos y proteína del yogur, carbs de rápida disponibilidad de la banana, algo de fibra de la granola.', puntaje: 9 } },
        { chatId: '2026-09-30-desayuno', category: 'Desayuno', desc: 'Mate + 2 tostadas integrales con tomates confitados + omelet de 2 claras, 1 yema y 10g de queso proteico (post-entreno)', confidence: 'media', kcal: 344, protein: 21, carbs: 37.3, fat: 8.9, fiber: 4, calidad: { ultraprocesado: 'Bajo-moderado — pan integral, tomate y huevo mínimamente procesados; el queso proteico es el componente más industrializado.', beneficios: 'Buena proteína post-entreno para recuperación, licopeno del tomate confitado y fibra del pan integral. Desayuno liviano y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-09-30-almuerzo', category: 'Almuerzo', desc: 'Ravioles de carne con salsa de tomate, carne molida extra, zanahoria y ajo + queso reggianito rallado', confidence: 'media', kcal: 650, protein: 41, carbs: 52, fat: 31.5, fiber: 4.5, calidad: { ultraprocesado: 'Moderado — los ravioles son pasta rellena industrial (NOVA 3), la salsa con zanahoria y ajo es casera; queso reggianito y carne molida suman proteína de calidad.', beneficios: 'Buena proteína entre el relleno, la carne molida extra y el queso, más fibra y betacarotenos de la zanahoria en la salsa. Plato abundante y sabroso, con harina refinada de la pasta como punto a moderar.', puntaje: 6 } },
        { chatId: '2026-09-30-merienda', category: 'Merienda', desc: 'Medialuna y porción de budín de limón (aeropuerto, trabajando en la tesis)', confidence: 'baja-media', kcal: 430, protein: 7, carbs: 56, fat: 20, fiber: 1.5, calidad: { ultraprocesado: 'Alto — productos de panadería comercial, harina refinada, manteca/margarina y azúcar, NOVA 3-4.', beneficios: 'Poco valor nutricional funcional, es energía rápida para sostener la tarde de laburo en el aeropuerto. Gustito puntual sin mucho aporte más allá de las calorías.', puntaje: 3 } },
        { chatId: '2026-09-30-cena', category: 'Cena', desc: 'Dos porciones de tarta casera de jamón, queso y huevo (masa hojaldrada) con ensalada de repollo y tomates cherry', confidence: 'media', kcal: 630, protein: 29.5, carbs: 48, fat: 36, fiber: 5, calidad: { ultraprocesado: 'Moderado — masa hojaldrada, jamón y queso son procesados (NOVA 3), el huevo y la ensalada son alimentos enteros.', beneficios: 'Buena proteína entre huevo, jamón y queso, y la ensalada de repollo con tomate suma fibra y vitamina C. La masa hojaldrada es lo que más pesa en grasa del plato.', puntaje: 6 } },
      ],
      note: 'Miércoles, día de entreno en el gym (glúteo analítico, 58:01min, 336 kcal activas, FC prom 126, esfuerzo moderado 5). Sueño: 6h52, score 92 (Buena) — duración 44/50, hora de acostarse 30/30, interrupciones 18/20; profundo 17%. Viaje a Posadas por la noche (vuelo BUE-PSS 19:00-21:00). Nutrición: 2243 kcal/106.5g prot/193.3g carbs/103.4g grasa/15g fibra — proteína y carbs algo por debajo del objetivo de entreno, grasa bastante por encima (budín, medialuna y tarta hojaldrada), fibra corta. Reloj: 7.799 pasos, 738 kcal actividad, 1.704 kcal reposo (gasto total ≈2.442 kcal). Balance calórico: ≈-199 kcal, casi mantenimiento. Calendario: Side hustle 3.25h (Reunión+Orange Yar, Product Demo Yar, Yar work absorbe Repaso semanal), Trabajo corpo 2h (Trabajar Caja), Deporte 1.5h (Gimnasio), Otros 2h (Vuelo a Posadas). "Volsmart" excluido; tareas de Google Tasks (Armar bolso, Ver temas recibida, Responder mail Mastercard, Tareas psico) excluidas; duplicado del vuelo descartado. Día cerrado.',
    },
    '2026-10-01': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 362, score: 66, wakeEnergy: null, endEnergy: null, phases: { vigilia: 26, rem: 19, ligero: 48, profundo: 7 } },
      training: null,
      activity: { steps: 11392, activeKcal: 603, restKcal: 1672 },
      measurements: null,
      meals: [
        { chatId: '2026-10-01-desayuno', category: 'Desayuno', desc: 'Tostada con omelet de huevo y queso derretido + tomates cherry asados', confidence: 'baja-media', kcal: 390, protein: 23, carbs: 23, fat: 22.3, fiber: 1.5, calidad: { ultraprocesado: 'Bajo-moderado — huevo, pan y tomate mínimamente procesados; el queso derretido es el componente más industrializado.', beneficios: 'Buena proteína del huevo y el queso, licopeno extra de los tomates asados. Desayuno completo para arrancar el día de la recibida.', puntaje: 7 } },
        { chatId: '2026-10-01-almuerzo', category: 'Almuerzo', desc: 'Pechuga de pollo a la plancha (~250g crudo) con papas en air fryer, zanahoria, cebolla y zapallito verde', confidence: 'media', kcal: 580, protein: 67.8, carbs: 48.9, fat: 10.5, fiber: 6, calidad: { ultraprocesado: 'Nulo — pollo y vegetales frescos, cocción a la plancha y air fryer sin agregados.', beneficios: 'Excelente proteína magra, buena fibra y variedad de vegetales, carbs complejos de la papa. Plato muy limpio y bien balanceado.', puntaje: 9 } },
        { chatId: '2026-10-01-merienda', category: 'Merienda', desc: 'Un sandwichito de miga (jamón y queso, de un pack comprado en la calle)', confidence: 'media', kcal: 100, protein: 4, carbs: 12, fat: 4, fiber: 0.5, calidad: { ultraprocesado: 'Alto — pan de miga de molde, fiambre y queso procesado, NOVA 3-4.', beneficios: 'Poco valor nutricional funcional, es un gustito chico de calle. En porción única no pesa demasiado en el día.', puntaje: 4 } },
        { chatId: '2026-10-01-cena', category: 'Cena', desc: '4 porciones de pizza (muzzarella, jamón y aceitunas)', confidence: 'baja-media', kcal: 1100, protein: 45, carbs: 110, fat: 45, fiber: 4, calidad: { ultraprocesado: 'Moderado-alto — masa refinada, jamón y muzzarella procesados (NOVA 3-4), las aceitunas son lo más entero del plato.', beneficios: 'Cena de gusto, aporta algo de proteína y calcio del queso y jamón, pero el fuerte es energía y carbs refinados. Día de disfrute antes de volver a la rutina.', puntaje: 4 } },
      ],
      note: '¡Mañana se recibe! Últimos dos días "de locura" antes de volver a hábitos normales, palabras de Conti. Sueño corto y más agitado: 6h02, score 66 (Regular) — duración 36/50, hora de acostarse 30/30 (perfecta), interrupciones 0/20 (sin apariciones de interrupciones aunque hubo un bloque largo de vigilia). Sin entreno hoy. Nutrición: 2170 kcal/139.8g prot/193.9g carbs/81.8g grasa/12g fibra — muy buena proteína gracias al almuerzo, cena de disfrute (pizza) antes de la recibida. Reloj: 11.392 pasos, 603 kcal actividad, 1.672 kcal reposo (gasto total ≈2.275 kcal). Balance calórico: ≈-105 kcal, prácticamente mantenimiento. Calendario (consultado directo desde Google Calendar, los 5 calendarios: Trabajo, Estudios, Deporte, Calendario-La Caja, contiguima@gmail.com): Aprendizaje 3h (Tesis), Trabajo corpo 2h (Refinamiento APP&PORTAL + Análisis Display Portal), Side hustle 2h (Yar work + Trabajar Yar). "Facturar Yar" y "Coordinar quincho" (tareas de Google Tasks) excluidas; sub-tareas de La Caja absorbidas por el evento más largo. Día cerrado.',
    },
    '2026-10-05': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 365, score: 81, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 17, ligero: 67, profundo: 13 } },
      training: null,
      activity: { steps: 5804, activeKcal: 420, restKcal: 1634 },
      measurements: null,
      meals: [
        { chatId: '2026-10-05-desayuno', category: 'Desayuno', desc: 'Omelet de 2 claras y 1 yema + 2 panes blancos (feta fina) con queso crema y tomate confitado', confidence: 'media', kcal: 334, protein: 18.3, carbs: 36.5, fat: 11.9, fiber: 2.4, calidad: { ultraprocesado: 'Moderado — huevo y tomate mínimamente procesados; el pan blanco y el queso crema son los componentes más industrializados.', beneficios: 'Buena proteína del huevo para arrancar el día y licopeno del tomate confitado. El pan blanco aporta menos fibra que el integral habitual, pero es un desayuno liviano y simple para la vuelta a la rutina.', puntaje: 7 } },
        { chatId: '2026-10-05-almuerzo', category: 'Almuerzo', desc: 'Fideos con salsa, carne palera guisada y verduras (papa, morrón, tomate, cebolla) + queso rallado — hecho por su mamá, porción abundante', confidence: 'baja-media', kcal: 775, protein: 45, carbs: 100, fat: 20, fiber: 8, calidad: { ultraprocesado: 'Bajo-moderado — carne, verduras y salsa casera; la pasta seca y el queso rallado son los componentes más industrializados.', beneficios: 'Muy buena proteína de la carne palera, carbs de la pasta y la papa para reponer energía, y fibra de las verduras de la salsa. Comida casera completa; solo la porción abundante la empuja en kcal y carbs.', puntaje: 7 } },
        { chatId: '2026-10-05-merienda', category: 'Merienda', desc: 'Dos medialunas', confidence: 'media', kcal: 300, protein: 6, carbs: 36, fat: 14, fiber: 1, calidad: { ultraprocesado: 'Alto — masa de manteca/margarina con glaseado azucarado, NOVA 3-4.', beneficios: 'Poco valor funcional, gustito de despedida en Posadas. Aporta energía rápida de grasas y carbs simples.', puntaje: 3 } },
        { chatId: '2026-10-05-cena', category: 'Cena', desc: 'Dos porciones de pizza de jamón y morrón (antes del vuelo de vuelta a Buenos Aires)', confidence: 'media', kcal: 550, protein: 22.5, carbs: 55, fat: 22.5, fiber: 3, calidad: { ultraprocesado: 'Moderado-alto — masa refinada, jamón y muzzarella procesados (NOVA 3-4); el morrón es lo más entero del plato.', beneficios: 'Cena de gusto con algo de proteína y calcio del queso y jamón, más vitamina C del morrón. Porción acotada (2 porciones).', puntaje: 5 } },
      ],
      note: 'Lunes, vuelta a la rutina tras la recibida (02, 03 y 04/10 sin registro por decisión de Conti, para no estresarse). Último día en Posadas. Medición semanal salteada esta semana a propósito (el peso post-festejo no es representativo); la próxima es el lunes 12/10. Sueño: 6h05, score 81 (Buena) — duración 37/50, hora de acostarse 25/30, interrupciones 19/20; profundo 13%. Sin entreno. Nutrición: 1959 kcal/91.8g prot/227.5g carbs/68.4g grasa/14.4g fibra — día de descanso con carbs algo por encima del rango y proteína por debajo del objetivo, comida casera de su mamá en el almuerzo (porción abundante) y pizza antes del vuelo. Reloj (datos ~21:35, parciales por el vuelo): 5.804 pasos, 420 kcal actividad, 1.634 kcal reposo (gasto total ≈2.054 kcal). Balance calórico: ≈-95 kcal, mantenimiento. Calendario (Google Calendar): Side hustle 3h (Yar work weekly, NPS meeting Yar, Yar work), Trabajo corpo 1h (Planning APP&PORTAL, absorbe Revisar mensajes), Emprendedurismo 0.25h (Foodtech, tramo sin solapar con Planning), Otros 3h (Vuelta PSS-BUE 1.5h + evento genérico "Titulo" 1.5h que Conti clasificó como Otros, absorbe "Título facultad"). Tareas de Google Tasks (Pagar personal, Pagar alquiler, Pagar a marti brownie, Comprar pasajes Iván) y all-day tasks excluidas. Día cerrado.',
    },
    '2026-10-06': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 291, score: 47, wakeEnergy: null, endEnergy: null, phases: { vigilia: 0, rem: 24, ligero: 55, profundo: 20 } },
      training: null,
      activity: { steps: 11214, activeKcal: 595, restKcal: 1759 },
      measurements: null,
      meals: [
        { chatId: '2026-10-06-desayuno', category: 'Desayuno', desc: 'Una tostada con palta + media banana con granola + omelet de 2 claras y 1 yema', confidence: 'media', kcal: 334, protein: 15.2, carbs: 38.6, fat: 13.6, fiber: 5.1, calidad: { ultraprocesado: 'Bajo — pan, palta, banana y huevo mínimamente procesados; la granola es el único componente algo industrializado.', beneficios: 'Grasas saludables de la palta, potasio y carbs de la banana, y proteína del huevo. Desayuno liviano y balanceado para retomar la rutina en Buenos Aires.', puntaje: 8 } },
        { chatId: '2026-10-06-almuerzo', category: 'Almuerzo', desc: 'Churrasco de cuadril a la plancha (~180g cocido) con ensalada de lechuga, tomate y zanahoria rallada (almuerzo de oficina)', confidence: 'media', kcal: 400, protein: 51, carbs: 6, fat: 17.5, fiber: 2, calidad: { ultraprocesado: 'Nulo — carne y vegetales frescos, cocción a la plancha sin agregados industriales.', beneficios: 'Excelente proteína de calidad con hierro y zinc de la carne roja, ensalada fresca con betacarotenos y vitamina C. Plato muy limpio, bajo en carbs: conviene sumar algo de carbohidrato complejo en la tarde.', puntaje: 8 } },
        { chatId: '2026-10-06-merienda', category: 'Merienda', desc: 'Café con leche + 1/6 de torta brownie con dulce de leche y crema (la llevó a la oficina para festejar la recibida y compartir)', confidence: 'baja-media', kcal: 495, protein: 10, carbs: 59, fat: 24.5, fiber: 2, calidad: { ultraprocesado: 'Alto — torta de brownie con dulce de leche, crema y azúcar; repostería casera rica en azúcar y grasa (NOVA 3-4 por los componentes industriales).', beneficios: 'Poco valor funcional, pero es un festejo compartido por la recibida, en porción chica (1/6). El café con leche suma algo de proteína y calcio.', puntaje: 4 } },
        { chatId: '2026-10-06-cena', category: 'Cena', desc: 'Fideos proteicos Matarazzo (80g secos, etiqueta) con pechuga de pollo (~150g crudo), zanahoria, cebolla y morrón, salsa de queso crema y un poco de queso rallado', confidence: 'media', kcal: 596, protein: 61.4, carbs: 61.6, fat: 10.8, fiber: 7.8, calidad: { ultraprocesado: 'Bajo-moderado — pollo y verduras frescos; los fideos proteicos son pasta fortificada (NOVA 3) y el queso crema y rallado son los componentes más industrializados, en cantidad chica.', beneficios: 'Excelente proteína (pollo + fideos proteicos), buena fibra de la pasta (5.1g por plato) y de las verduras, y muy poca grasa. Cena muy completa que cierra bien el día después de una noche corta.', puntaje: 8 } },
      ],
      note: 'Martes, de regreso en Buenos Aires, día sin entreno. El vuelo de vuelta se atrasó y recién pudo dormir ~2am. Sueño: 4h51, score 47 (Baja) — duración 27/50, hora de acostarse 0/30 (acostada muy tarde), interrupciones 20/20 (sin despertares); profundo 20% y REM 24% por encima de lo habitual pese a lo corto. Nutrición: 1825 kcal/137.6g prot/165.2g carbs/66.4g grasa/16.9g fibra — día de descanso muy parejo: proteína, carbs y grasa dentro del objetivo, kcal apenas bajo el piso y fibra corta. Cena con fideos proteicos Matarazzo (perfil de etiqueta agregado a las referencias). Reloj (~22:57): 11.214 pasos, 595 kcal actividad, 1.759 kcal reposo (gasto total ≈2.354 kcal). Balance calórico: ≈-529 kcal, déficit moderado. Calendario (Google Calendar): Trabajo corpo 9h (La Caja, absorbe Análisis con score 8, Sync, Score 8, Geolocalización ACA y Mesa Feedback UX), Side hustle 3.5h (Trabajar Yar x3), Emprendedurismo 1.83h (Genesis 2026). Tareas de Google Tasks (Pedir facturas psico, Bonus Yar), recordatorio libre (Recordar Maxi Rave) y reunión cancelada (KPI EF) excluidos. Noche de trabajo hasta las 23:00 prevista en calendario. Día cerrado.',
    },
    '2026-10-07': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 385, score: 90, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 24, ligero: 57, profundo: 17 } },
      training: { tipo: 'Natación en piscina', duracion: '52:34', ejercicios: 'Natación 2300m — Mariposa 150m, Pecho 175m, Dorso 250m, Libre 1725m (20:06-20:59, ritmo 2\'17"/100m, 92 vueltas, pileta 25m). Mayor parte del tiempo en Zona 4 (166-178 lpm): 26:38 min.', kcalActivas: 422, kcalTotal: 500, fcProm: 163, esfuerzo: 'Difícil (7)', energia: null, dolor: 'No' },
      activity: { steps: 11551, activeKcal: 1091, restKcal: 1694 },
      measurements: null,
      meals: [
        { chatId: '2026-10-07-desayuno', category: 'Desayuno', desc: 'Café con leche Protein + omelet de 2 claras y 1 yema con queso proteico y jamón + tostada integral con queso cremoso, cherrys condimentados y 5g de palta', confidence: 'alta', kcal: 405, protein: 31, carbs: 29, fat: 17.5, fiber: 3, calidad: { ultraprocesado: 'Moderado — huevo, tomate, pan integral y palta mínimamente procesados; queso proteico, jamón, queso cremoso y leche Protein fortificada son los componentes más industrializados.', beneficios: 'Muy buena proteína (huevo + queso proteico + jamón + leche Protein) para arrancar un día de entreno, carbs del pan integral y licopeno de los cherrys condimentados. Desayuno habitual, completo y bien balanceado.', puntaje: 8 } },
        { chatId: '2026-10-07-media-manana', category: 'Media mañana', desc: 'Yogur sin lactosa sin azúcares agregados (pote 140g, perfil de etiqueta) con granola (oficina)', confidence: 'media-alta', kcal: 176, protein: 8.9, carbs: 19, fat: 7.2, fiber: 1, calidad: { ultraprocesado: 'Bajo-moderado — yogur con proteínas lácteas y estabilizantes (NOVA 3), granola con avena, girasol y almendras más simple.', beneficios: 'Buena proteína y calcio del yogur sin azúcar agregada, más carbs de avena y grasas buenas de semillas y almendras. Snack liviano y funcional antes de la natación de la noche.', puntaje: 7 } },
        { chatId: '2026-10-07-almuerzo', category: 'Almuerzo', desc: 'Fideos proteicos Matarazzo (80g secos, etiqueta) con pechuga de pollo (~150g crudo), zanahoria, cebolla y morrón, salsa de queso crema y queso rallado — ídem cena del 06/10 (almuerzo de oficina)', confidence: 'media', kcal: 596, protein: 61.4, carbs: 61.6, fat: 10.8, fiber: 7.8, calidad: { ultraprocesado: 'Bajo-moderado — pollo y verduras frescos; los fideos proteicos son pasta fortificada (NOVA 3) y el queso crema y rallado son lo más industrializado, en cantidad chica.', beneficios: 'Excelente proteína (pollo + fideos proteicos), buena fibra de la pasta y las verduras y muy poca grasa. Almuerzo ideal antes de una natación a la noche: carbs complejos y proteína sin pesadez.', puntaje: 8 } },
        { chatId: '2026-10-07-snack', category: 'Snack', desc: 'Paquete entero de macucas (galletitas de chocolate con relleno sabor limón, ~100g = 4 porciones de 25g según etiqueta) en la oficina — no había traído más comida y ya se había comido el yogur', confidence: 'alta', kcal: 476, protein: 7.2, carbs: 64, fat: 20, fiber: 2.8, calidad: { ultraprocesado: 'Alto — NOVA 4: galletitas con relleno, 29g de azúcares añadidos cada 100g, grasas trans 0.9g/100g, saborizantes.', beneficios: 'Poco valor funcional, aporta sobre todo carbs rápidos y grasa. Como hoy entrena natación a la noche, los carbs no se desperdician, aunque conviene que no reemplacen una comida con proteína.', puntaje: 3 } },
        { chatId: '2026-10-07-cena', category: 'Cena', desc: 'Post-natación: arroz con una lata de lomitos de atún, tomates cherry, brócoli, choclo y queso proteico', confidence: 'media', kcal: 520, protein: 45.4, carbs: 68.6, fat: 6.2, fiber: 3.6, calidad: { ultraprocesado: 'Bajo — arroz, atún enlatado al natural, brócoli, choclo y tomate son alimentos poco procesados; el queso proteico es lo más industrializado, en cantidad chica.', beneficios: 'Cena ideal post-natación: carbs de arroz para reponer glucógeno, proteína magra del atún y queso proteico para la recuperación muscular, casi sin grasa, y fibra y vitaminas de brócoli, choclo y cherrys.', puntaje: 9 } },
      ],
      note: 'Miércoles, día de entreno: natación a la noche. Muy buena recuperación de sueño: 6h25, score 90 (Buena) — duración 40/50, hora de acostarse 30/30, interrupciones 20/20; profundo 17% y REM 24%. Entreno: natación 2300m, 52:34min, 422 kcal activas, FC prom 163, esfuerzo difícil 7 (26:38 en zona 4). Nutrición: 2173 kcal/153.9g prot/242.2g carbs/61.7g grasa/18.2g fibra — proteína y grasa en objetivo, kcal justo en el techo y carbs algo arriba (macucas en la oficina, compensadas por la natación); fibra corta. Reloj (~21:57): 11.551 pasos, 1.091 kcal actividad, 1.694 kcal reposo (gasto total ≈2.785 kcal). Balance calórico: ≈-612 kcal. Calendario (Google Calendar): Trabajo corpo 9h (La Caja, absorbe todas las reuniones del calendario de La Caja), Side hustle 1.5h (Trabajar Yar), Emprendedurismo 1h (FoodTech + Nucleate), Deporte 1h (Natación). Tareas de Google Tasks (Pagar ABL) y eventos en estado libre (Lecturas, Logs, Logs e invgates, all-day) excluidos. Día cerrado.',
    },
    '2026-10-08': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 434, score: 94, wakeEnergy: null, endEnergy: null, phases: { vigilia: 2, rem: 23, ligero: 54, profundo: 21 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — Glúteo analítico + core', duracion: '43:17', ejercicios: '7:05–7:48. Bloque 1 (core): elevaciones de cadera CORE EX 3x20 t, plancha dinámica FB 3x20 t, plancha lateral corta estrella 3x15 t. Bloque 2: empuje de cadera BR 4x8 (80 kg), abductores MQ 3x12 (30 kg), sillón cuádriceps 3x12 (25 kg), dorsalera prona MQ 4x8 (35 kg), vuelo frontal/lateral 3x8, remo 1 mano KB 1x8 (12 kg).', kcalActivas: 219, kcalTotal: 282, fcProm: 119, esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 4877, activeKcal: 572, restKcal: 1638 },
      measurements: null,
      meals: [
        { chatId: '2026-10-08-pre-entreno', category: 'Pre-entreno', desc: 'Una tostada de pan integral con queso crema', confidence: 'media', kcal: 135, protein: 4.7, carbs: 17, fat: 5.2, fiber: 2.5, calidad: { ultraprocesado: 'Bajo-medio — pan integral de panadería/envasado y queso crema son procesados moderados, en porción chica.', beneficios: 'Carbs de digestión rápida con poca grasa y poca fibra: buen combustible liviano para entrenar sin pesadez. Falta algo de proteína.', puntaje: 7 } },
        { chatId: '2026-10-08-desayuno', category: 'Desayuno', desc: 'Post-entreno: café con leche proteína + una tostada integral con queso crema, palta y cherrys + omelet de 2 claras y 1 yema con queso proteico y jamón', confidence: 'media', kcal: 473, protein: 33, carbs: 30.7, fat: 23.2, fiber: 4.7, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico y el café con leche proteico son los procesados; el resto (huevo, palta, cherrys, pan integral) es comida real.', beneficios: 'Desayuno post-gym con ~33g de proteína de buena calidad (huevo + queso proteico + jamón + leche), grasas buenas de la palta y yema, fibra de pan integral, palta y tomate. Carbos moderados para reponer sin pasarse.', puntaje: 8 } },
        { chatId: '2026-10-08-almuerzo', category: 'Almuerzo', desc: 'Todo al horno: pechuga de pollo (~250g crudo), brócoli, papa, batata, zanahoria, cherrys, morrón, cebolla, ajo y aceite de horno', confidence: 'media', kcal: 854, protein: 74.2, carbs: 92.7, fat: 20.6, fiber: 16.9, calidad: { ultraprocesado: 'Muy bajo — todo comida real: pollo, verduras y tubérculos; lo único elaborado es el aceite.', beneficios: 'Plato completo: ~74g de proteína magra, carbos complejos de papa y batata (con cáscara) para reponer tras el gym, y mucha fibra y micronutrientes de brócoli, zanahoria, cherrys y cebolla. El horno suma poca grasa; la batata aporta betacarotenos.', puntaje: 9 } },
        { chatId: '2026-10-08-merienda', category: 'Merienda', desc: 'Yogur sin lactosa sin azúcares agregados (pote 140g, el de siempre) con granola (~20g) y frutas congeladas (frutilla, frambuesa, arándanos, mora ~70g)', confidence: 'media-alta', kcal: 226, protein: 10, carbs: 30, fat: 7.8, fiber: 4, calidad: { ultraprocesado: 'Bajo-medio — el yogur sin azúcar y la granola son procesados moderados; las frutas congeladas son fruta entera.', beneficios: 'Merienda liviana con probióticos del yogur, antioxidantes (antocianinas) de los frutos rojos, fibra de fruta y avena de la granola, sin azúcar agregada en el yogur. Suma proteína moderada.', puntaje: 8 } },
        { chatId: '2026-10-08-cena', category: 'Cena', desc: 'Todo al horno: milanesa de suprema al horno (~120g crudo, un pedacito) con queso proteico y tomate + revuelto de zapallo y queso con cebolla', confidence: 'media-baja', kcal: 465, protein: 42.4, carbs: 24.2, fat: 22.3, fiber: 2.4, calidad: { ultraprocesado: 'Medio — el queso proteico y el rebozado son lo más procesado; suprema, zapallo, cebolla y tomate son comida real, y la cocción al horno evita fritura.', beneficios: 'Cena alta en proteína magra (~42g de suprema + queso) con carbos moderados del zapallo, que además aporta betacarotenos. Al horno suma poca grasa; la fibra queda algo corta.', puntaje: 8 } },
      ],
      note: 'Jueves, día de entreno en el gym. Muy buen sueño: 7h14, score 94 (Buena) — duración 46/50, hora de acostarse 28/30, interrupciones 20/20; profundo 21% y REM 23%. Primera noche de 7h+ desde el 05/10 y mejor puntaje de la semana. Entreno: fuerza 43:17min (7:05–7:48), glúteo analítico + core, 219 kcal activas, FC prom 119, esfuerzo moderado 5. Nutrición: 2153 kcal/164.3g prot/194.6g carbs/79.1g grasa/30.5g fibra — kcal en el techo del objetivo, carbs y fibra en rango, proteína (+19g) y grasa (+9g) por encima. Reloj (~22:01): 4.877 pasos, 572 kcal actividad, 1.638 kcal reposo (gasto total ≈2.210 kcal). Balance calórico: ≈-57 kcal (mantenimiento; con el reposo hasta medianoche cierra cerca de -150/-200). Calendario (Google Calendar): Deporte 1h (Gimnasio), Trabajo corpo 2.75h (Trabajar Caja x2, Logs e Invgate, Review APP & Portal que gana el solape con Trabajar Yar 18:00–18:45), Side hustle 3h (Trabajar Yar), Emprendedurismo 1.5h (Demo Day 4 Nextfellow), Otros 0.75h (Psicóloga). Tareas de Google Tasks (Ver comprar cargador), eventos libres (Logs, VER USUARIOS ACTIVOS, Recordar pato números) y Psicologa duplicada del calendario importado excluidos. Día cerrado.',
    },
    '2026-10-09': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 362, score: 85, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 24, ligero: 56, profundo: 16 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — Tren superior + glúteo', duracion: '46:33', ejercicios: '7:18–8:05. Bloque 1: RE hombro acostado 2x12 (30 kg), flexo-extensión cadera asistido 2x12, hallo 1P KB 2x12 (8 kg). Bloque 2: caminata del granjero KB 4x12 (20 kg), empuje de cadera BR 4x10-12 (80 kg), bajadas al podio 3x12, aperturas MQ 3x12, dorsalera neutra MQ 3x8, tríceps PL 3x12, gemelos MC 4x15.', kcalActivas: 220, kcalTotal: 289, fcProm: 110, esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 8089, activeKcal: 681, restKcal: 1842 },
      measurements: null,
      meals: [
        { chatId: '2026-10-09-pre-entreno', category: 'Pre-entreno', desc: 'Una tostada de pan integral con queso crema y dos fetas de jamón cocido', confidence: 'media', kcal: 171, protein: 10.2, carbs: 17.4, fat: 6.6, fiber: 2.5, calidad: { ultraprocesado: 'Medio — el jamón cocido es un fiambre procesado y el queso crema y el pan son procesados moderados; porción chica.', beneficios: 'Carbos de digestión rápida con poca fibra para entrenar liviano, y ~10g de proteína del jamón, mejor que un pre solo de carbos. El sodio del jamón es lo más a vigilar.', puntaje: 7 } },
        { chatId: '2026-10-09-desayuno', category: 'Desayuno', desc: 'Post-entreno: café con leche proteína + una tostada integral con queso crema, palta y cherrys + omelet de 2 claras y 1 yema', confidence: 'media', kcal: 392, protein: 24.6, carbs: 30.3, fat: 18.6, fiber: 4.9, calidad: { ultraprocesado: 'Bajo-medio — huevo, palta y cherrys son comida real; el café con leche proteico, el queso crema y el pan son lo procesado.', beneficios: 'Desayuno post-gym con ~25g de proteína de huevo y leche, grasas buenas de palta y yema, y fibra de pan integral, palta y tomate. Buen perfil, aunque corto de proteína para un post-entreno: sin queso proteico ni jamón queda por debajo del de ayer.', puntaje: 8 } },
        { chatId: '2026-10-09-almuerzo', category: 'Almuerzo', desc: 'Fideos coditos (~80g secos) con puré de tomate, morrón, cebolla, queso proteico rallado y pechuga de pollo (150g)', confidence: 'media', kcal: 637, protein: 53.5, carbs: 71.2, fat: 14.1, fiber: 5.8, calidad: { ultraprocesado: 'Bajo-medio — fideos secos, puré de tomate y queso proteico son procesados moderados; pollo, morrón y cebolla son comida real.', beneficios: 'Plato completo para un día de entreno: ~54g de proteína magra del pollo y el queso, carbos de la pasta para reponer, y vegetales del tomate, morrón y cebolla. Fibra algo corta para el tamaño del plato; sumar brócoli o espinaca lo mejora.', puntaje: 8 } },
        { chatId: '2026-10-09-merienda', category: 'Merienda', desc: 'Yogur sin lactosa sin azúcares agregados (pote 140g, el de siempre) con granola (~20g) y frutas congeladas (frutilla, mora, arándanos, frambuesa ~70g)', confidence: 'media-alta', kcal: 226, protein: 10, carbs: 30, fat: 7.8, fiber: 4, calidad: { ultraprocesado: 'Bajo-medio — el yogur sin azúcar y la granola son procesados moderados; las frutas congeladas son fruta entera.', beneficios: 'Merienda liviana con probióticos del yogur, antioxidantes de los frutos rojos, fibra de fruta y avena de la granola, sin azúcar agregada en el yogur. Suma proteína moderada.', puntaje: 8 } },
        { chatId: '2026-10-09-cena', category: 'Cena', desc: 'Cena con amigas, todo al horno: hamburguesa de suprema de pollo (~110g) + hamburguesa de carne molida (~120g crudo) + papas smile + batata en rodajas + tomates cherry confitados', confidence: 'media-baja', kcal: 639, protein: 47.3, carbs: 38.3, fat: 32.8, fiber: 5.2, calidad: { ultraprocesado: 'Medio-alto — las hamburguesas y las papas smile son productos industrializados; la batata y los tomates son comida real, y el horno evita la fritura.', beneficios: 'Aporta ~47g de proteína (pollo y carne) y carbos de batata y papa, con tomates que suman licopeno y fibra. Las papas smile y el aceite de los confitados suben la grasa; la fibra queda algo corta.', puntaje: 6 } },
        { chatId: '2026-10-09-postre', category: 'Snack', desc: 'Postre de la cena con amigas: brownie compartido entre 3 (un tercio de la porción, ~30g)', confidence: 'baja', kcal: 126, protein: 1.5, carbs: 15, fat: 6.6, fiber: 0.9, calidad: { ultraprocesado: 'Alto — brownie de pastelería, con harina refinada, azúcar y manteca o aceite.', beneficios: 'Antojo dulce en porción chica y compartida: aporta energía rápida y algo de grasa, sin valor nutricional destacado. Un tercio de brownie no mueve la aguja del día.', puntaje: 4 } },
      ],
      note: 'Viernes, día de entreno. Sueño: 6h02, score 85 (Buena) — duración 36/50, hora de acostarse 30/30, interrupciones 19/20; REM 24%, ligero 56%, profundo 16%, vigilia 4%. Baja respecto a la noche anterior (7h14, score 94). Entreno: fuerza 46:33min (7:18–8:05), tren superior + glúteo, 220 kcal activas, FC prom 110, esfuerzo moderado 5. Nutrición: 2191 kcal/147.1g prot/202.2g carbs/86.5g grasa/23.3g fibra — kcal apenas sobre el techo (+41), proteína en el techo, carbs en rango, grasa +16g arriba (cena con amigas: hamburguesas, papas smile, confitados y brownie compartido) y fibra ~2g corta. Reloj: 8.089 pasos, 681 kcal actividad, 1.842 kcal reposo (gasto total ≈2.523 kcal). Balance calórico: ≈-332 kcal, déficit moderado. Calendario (Google Calendar): Deporte 1h (Gimnasio), Emprendedurismo 2h (Reunión FoodTech con Mentor + Reu FoodTech), Trabajo corpo 4h (Trabajar Caja, Caja Work, Geolocalización/Trackeo Auxilio ACA), Side hustle 3.5h (Trabajar Yar x2 + Yar work 17–19h, que absorbe Meeting Melissa, Usuarios activos y Actualización normativas Ecommerce porque fue Yar), Social 4h (Fiestita Marti 20:00–24:00; las 3h restantes hasta las 3am quedan para el sábado). Cancelado Normativas postventa y tareas excluidos. Día cerrado.',
    },
    '2026-10-10': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 293, score: 52, wakeEnergy: null, endEnergy: null, phases: null },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — mix de fuerza y cardio', duracion: '39:44', ejercicios: '11:46–12:26. Mix de fuerza y cardio en el gym (sin detalle de ejercicios).', kcalActivas: 172, kcalTotal: 231, fcProm: 108, esfuerzo: 'Moderado (4)', energia: null, dolor: 'No' },
      activity: { steps: 15391, activeKcal: 695, restKcal: 1741 },
      measurements: null,
      meals: [
        { chatId: '2026-10-10-desayuno', category: 'Desayuno', desc: 'Café con leche proteína + una tostada integral con queso crema y tomates confitados + omelet de 2 claras y 1 yema con jamón y queso proteico', confidence: 'media', kcal: 495, protein: 32.7, carbs: 29.4, fat: 25.9, fiber: 3.5, calidad: { ultraprocesado: 'Medio — jamón, queso proteico, queso crema y el café con leche proteico son los procesados; huevo, tomates y pan integral son comida real.', beneficios: 'Desayuno con ~33g de proteína de huevo, jamón, queso proteico y leche, y carbos del pan integral para arrancar el día de entreno. Los tomates confitados suman licopeno y algo de fibra; la grasa sube un poco por el aceite de los tomates, la yema y los quesos.', puntaje: 8 } },
        { chatId: '2026-10-10-almuerzo', category: 'Almuerzo', desc: 'Post-entreno: pechuga de pollo al horno condimentada (~200g crudo) con batata en rodajas al horno, zanahoria y cherrys', confidence: 'media', kcal: 525, protein: 53.6, carbs: 43.9, fat: 14.3, fiber: 7.8, calidad: { ultraprocesado: 'Muy bajo — pollo, batata, zanahoria y cherrys son comida real; solo el aceite y los condimentos están elaborados.', beneficios: 'Almuerzo post-gym casi ideal: ~54g de proteína magra para la recuperación muscular, carbos complejos de la batata para reponer glucógeno y buena fibra, con betacarotenos de batata y zanahoria y licopeno de los cherrys.', puntaje: 9 } },
        { chatId: '2026-10-10-merienda', category: 'Merienda', desc: 'Una tostada integral partida con queso crema (mitad palta, mitad tomates confitados) + una rodaja de jamón cocido + un huevo revuelto', confidence: 'media', kcal: 347, protein: 16.4, carbs: 21.5, fat: 21.7, fiber: 4.8, calidad: { ultraprocesado: 'Medio — el jamón cocido y el queso crema son los procesados; huevo, palta, tomates y pan integral son comida real.', beneficios: 'Merienda salada con ~16g de proteína de huevo y jamón, grasas buenas de la palta y fibra del pan integral, la palta y el tomate. Saciante y equilibrada; la grasa sube por la palta, el queso crema y el aceite del revuelto.', puntaje: 8 } },
        { chatId: '2026-10-10-snack', category: 'Snack', desc: 'Buñuelos de espinaca congelados al horno (4 unidades), antes de la cena tardía con su hermano', confidence: 'baja-media', kcal: 200, protein: 8, carbs: 25, fat: 7.5, fiber: 3, calidad: { ultraprocesado: 'Medio — buñuelo congelado industrial (rebozado y aglutinantes), pero al horno y con espinaca como base.', beneficios: 'Snack razonable para el hambre previa a una cena tardía: algo de proteína (huevo/queso del buñuelo), fibra de la espinaca y poca grasa por ir al horno en vez de fritos.', puntaje: 6 } },
        { chatId: '2026-10-10-cena', category: 'Cena', desc: 'Cena social con su hermano: hamburguesa simple con cheddar y bacon (pan brioche) + porción de papas fritas, agua', confidence: 'baja-media', kcal: 1210, protein: 46, carbs: 107, fat: 67, fiber: 7, calidad: { ultraprocesado: 'Alto — pan de hamburguesería, cheddar fundido, bacon y papas fritas de fritura profunda; la carne es lo único poco procesado.', beneficios: 'Aporta ~46g de proteína (carne, queso, bacon) y fue una cena social disfrutada, pero es muy densa en calorías y grasa (~67g, buena parte saturada) y con poca fibra ni vegetales. Compensa tomar agua en vez de gaseosa.', puntaje: 3 } },
      ],
      note: 'Sábado, día de entreno en el gym a la tarde. Sueño corto tras la fiestita: 4h53, score 52 (Baja) — duración 27/50, hora de acostarse 5/30 (acostada muy tarde), interrupciones 20/20 (sin despertares). Sin fases cargadas todavía. Arrastre del viernes: 3h de Social (Fiestita Marti 00:00–03:00). Día muy activo: 15.391 pasos, 695 kcal activas + 1741 en reposo = 2436 kcal gastadas. Cena social con su hermano (hamburguesa con cheddar y bacon + papas): comió 2777 kcal, balance +341 kcal (superávit), grasa 136 g (~2× el tope), proteína 157 g y fibra 26 g en rango. Semana lun–sáb: −1.284 kcal acumuladas, sigue en déficit.',
    },
    '2026-10-11': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 481, score: 97, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 30, ligero: 53, profundo: 16 } },
      training: null,
      activity: { steps: 11800, activeKcal: 560, restKcal: 1600 },
      measurements: null,
      meals: [
        { chatId: '2026-10-11-desayuno', category: 'Desayuno', desc: 'Omelet de 2 claras + 1 yema con jamón cocido y queso proteico + cherrys, mate (sin azúcar). Desayuno liviano antes de caminar y comer pastas con su hermano', confidence: 'media', kcal: 201, protein: 18.9, carbs: 4.2, fat: 11.3, fiber: 0.7, calidad: { ultraprocesado: 'Bajo-medio — huevo y cherrys son comida real; el jamón cocido y el queso proteico son los procesados.', beneficios: 'Desayuno proteico y liviano: ~19g de proteína con muy pocos carbos, ideal para un domingo de descanso con almuerzo de pastas por delante. Poca fibra, que se compensa más tarde.', puntaje: 8 } },
        { chatId: '2026-10-11-almuerzo', category: 'Almuerzo', desc: 'Almuerzo en restaurante con su hermano: fideos de huevo (tallarines) al pesto, plato muy abundante, comió solo la mitad (~175 g cocidos) + un vaso de jugo de naranja exprimido (~250 ml) + un pan de la panera (~40 g)', confidence: 'baja-media', kcal: 570, protein: 16.2, carbs: 91, fat: 15.5, fiber: 4, calidad: { ultraprocesado: 'Medio — pasta fresca de huevo y pesto de restaurante son poco procesados; el pan de panera es refinado; el jugo es de naranja exprimido (sin azúcar agregada y con vitamina C), pero igual es azúcar libre sin casi nada de la fibra de la fruta.', beneficios: 'Almuerzo de carbos para un domingo de caminata, con grasas del aceite y la albahaca del pesto. Comer la mitad del plato ayudó con la porción; el jugo y el pan suman carbos rápidos (~45g entre ambos) con poca proteína y fibra, así que conviene compensar en la cena.', puntaje: 5 } },
        { chatId: '2026-10-11-merienda', category: 'Merienda', desc: 'Yogur de siempre (140 g, sin lactosa y sin azúcares) con granola (~20 g) y frutas congeladas (frutillas, moras y arándanos, ~90 g)', confidence: 'media', kcal: 234, protein: 10.2, carbs: 31.9, fat: 7.9, fiber: 4.7, calidad: { ultraprocesado: 'Bajo-medio — yogur y granola son los procesados; las frutas congeladas son fruta entera sin agregados.', beneficios: 'Merienda liviana y equilibrada: ~10g de proteína del yogur, antioxidantes de las frutas rojas y fibra de la fruta y la avena de la granola (~4,7g). Ayuda a sumar fibra en un día que venía corto y es baja en grasa.', puntaje: 8 } },
        { chatId: '2026-10-11-cena', category: 'Cena', desc: 'Pata muslo de pollo al horno sin piel (~150 g de carne cocida) + media batata al horno condimentada (~130 g crudo)', confidence: 'media', kcal: 415, protein: 39, carbs: 26, fat: 16.6, fiber: 3.5, calidad: { ultraprocesado: 'Muy bajo — pollo y batata son comida real; solo el aceite y los condimentos están elaborados.', beneficios: 'Cena casera con ~39g de proteína completa del pollo (sin piel, lo que recorta mucha grasa saturada) y carbos complejos con betacarotenos de la batata. Falta una verdura para sumar fibra: sin ella el día queda corto.', puntaje: 8 } },
        { chatId: '2026-10-11-postre', category: 'Postre', desc: 'Alfajor de 85 g (1 unidad, valores según etiqueta del envase), postre compartido con su hermano', confidence: 'alta', kcal: 397, protein: 4.5, carbs: 64, fat: 13, fiber: 0, calidad: { ultraprocesado: 'Muy alto — alfajor industrial con azúcares añadidos (26 g), grasas saturadas altas (7,8 g, 35% del valor diario) y cobertura/relleno elaborados.', beneficios: 'Gusto de domingo en familia, sin mayor aporte nutricional: casi sin proteína ni fibra y mucha azúcar. Cabe en el día porque el resto de las comidas fue casero, pero es de consumo ocasional.', puntaje: 2 } },
      ],
      note: 'Domingo de descanso. Sueño excelente: 8h01, score 97 (Muy alta) — duración 50/50, hora de acostarse 27/30, interrupciones 20/20. Fases: vigilia <1%, REM 30%, ligero 53%, profundo 16%. Caminata y almuerzo de pastas con su hermano (fideos de huevo al pesto, comió la mitad del plato + jugo exprimido y un pan). Día activo sin gym: 11.800 pasos, 560 kcal activas + 1600 en reposo = 2160 kcal gastadas. Comió 1817 kcal: balance −343 kcal (déficit). Proteína 88,8 g (corta, ~41–51 g menos), carbos 217 g (por encima por el jugo, el pan, la pasta y el alfajor del postre), grasa 64,3 g en rango, fibra 12,9 g (corta). Semana lun–dom: −1.627 kcal acumuladas. Pendiente: medición semanal el lunes 12/10 (comparar con 28/09: 74,7 kg / cintura 87 / cadera 102).',
    },
    '2026-10-12': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 469, score: 98, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 27, ligero: 58, profundo: 12 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza)', duracion: '45:43', ejercicios: '8:44–9:30. Entrenamiento de fuerza en el gym (sin detalle de ejercicios).', kcalActivas: 210, kcalTotal: 274, fcProm: 112, esfuerzo: 'Moderado (5)', energia: null, dolor: 'No' },
      activity: { steps: 9800, activeKcal: 666, restKcal: 1600 },
      measurements: { weight: 75.6, waist: 85, hip: 101 },
      meals: [
        { chatId: '2026-10-12-pre-entreno', category: 'Pre-entreno', desc: 'Yogur de siempre (140 g, sin lactosa y sin azúcares) con granola (~20 g) y frutas congeladas (~70 g), antes del gym', confidence: 'media', kcal: 226, protein: 10, carbs: 30, fat: 7.8, fiber: 4, calidad: { ultraprocesado: 'Bajo-medio — yogur y granola son los procesados; las frutas congeladas son fruta entera sin agregados.', beneficios: 'Pre-entreno liviano y de fácil digestión: carbos de la granola y la fruta para tener energía en el gym, ~10g de proteína del yogur y poca grasa, que no pesa antes de entrenar. Suma fibra desde temprano.', puntaje: 8 } },
        { chatId: '2026-10-12-desayuno', category: 'Desayuno', desc: 'Post-entreno: tostada integral con queso crema, palta y tomates + omelet de 2 claras y 1 yema con queso proteico y jamón + café con leche protein', confidence: 'media', kcal: 480, protein: 33.1, carbs: 32.1, fat: 23.3, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema y el café con leche protein son los procesados; huevo, palta, tomate y pan integral son comida real.', beneficios: 'Desayuno post-gym con ~33g de proteína (omelet y café con leche protein) para la recuperación muscular, carbos del pan integral y grasas buenas de la palta. Cumple como post-entreno; el resto del día tiene que seguir sumando proteína.', puntaje: 8 } },
        { chatId: '2026-10-12-almuerzo', category: 'Almuerzo', desc: 'Bowl: 1 lata de lomitos de atún al natural (~120 g escurrido) con choclo, rúcula, tomate cherry, zanahoria, batata cocida (~50 g) y brócoli, con un chorrito de aceite y condimentos', confidence: 'media', kcal: 437, protein: 38.4, carbs: 46.3, fat: 13.5, fiber: 11.1, calidad: { ultraprocesado: 'Muy bajo — atún al natural, verduras, choclo y batata son comida real; solo el atún enlatado y el aceite son elaborados.', beneficios: 'Almuerzo casi ideal: ~40g de proteína magra del atún, carbos complejos de la batata y el choclo para reponer el entreno, y ~11g de fibra de brócoli, rúcula, zanahoria y tomate. Suma omega-3 del atún, betacarotenos y vitamina C, con poca grasa.', puntaje: 9 } },
        { chatId: '2026-10-12-merienda', category: 'Merienda', desc: 'Chocolatada protein: 250 ml de leche descremada proteica (etiqueta: 42 kcal / 5,2 g prot / 4,6 g carbs / 0 g grasa cada 100 ml) con cacao en polvo (~5 g)', confidence: 'media-alta', kcal: 116, protein: 14, carbs: 14.4, fat: 0.7, fiber: 1.7, calidad: { ultraprocesado: 'Medio — la leche proteica es un producto industrial (leche descremada + concentrado de proteínas lácteas, lactasa y vitaminas A, C y D); el cacao en polvo suma poco procesamiento.', beneficios: 'Merienda liviana con ~14g de proteína, 0 grasa y sin azúcares añadidos (según la etiqueta), buen aporte de calcio y vitaminas A, D y B12. El cacao suma antioxidantes y algo de fibra. Ayuda a sumar proteína sin sumar muchas calorías.', puntaje: 7 } },
        { chatId: '2026-10-12-cena', category: 'Cena', desc: 'Fideos proteicos (~80 g secos) con nalga salteada (~120 g cocida), morrón, cebolla, ajo y salsa de tomate, con queso rallado por encima (~10 g)', confidence: 'media', kcal: 651, protein: 58.9, carbs: 63.5, fat: 17.7, fiber: 8.4, calidad: { ultraprocesado: 'Bajo-medio — la pasta proteica es el producto más procesado; la nalga, las verduras y la salsa de tomate casera son comida real, y el queso rallado suma un poco de grasa.', beneficios: 'Cena muy completa: ~59g de proteína entre la nalga magra y los fideos proteicos, carbos para recuperar del entreno y ~8g de fibra de la pasta, el morrón, la cebolla y el tomate. Cierra la proteína del día con poca grasa.', puntaje: 8 } },
      ],
      note: 'Lunes, medición semanal. 75,6 kg / cintura 85 cm / cadera 101 cm. Vs 28/09 (74,7 kg / 87 / 102): +0,9 kg, −2 cm de cintura, −1 cm de cadera. Se ve físicamente bien y siente que hay recomposición corporal (cintura y cadera bajan aunque el peso sube un poco). Semana previa en déficit calórico de ~−1.627 kcal. Sueño excelente: 7h49, score 98 (Muy alta) — duración 49/50, hora de acostarse 30/30 (se acostó 48 min antes de lo habitual), interrupciones 19/20. Fases: vigilia 3%, REM 27%, ligero 58%, profundo 12%. Día de entreno en el gym a la mañana (fuerza, 45:43, 210 kcal activas). Feriado: sin trabajo corpo, 5,75 h de Yar (side hustle) y Mealprep a la noche. Actividad: 9.800 pasos, 666 kcal activas + 1600 en reposo = 2266 kcal gastadas. Comió 1910 kcal: balance −356 kcal (déficit). Proteína 154,4 g (9–19 g por encima), carbos 186,3 g, grasa 63 g y fibra 30,4 g, todo en rango; solo ~90–240 kcal por debajo del objetivo. Día muy bien logrado en macros.',
    },
    '2026-10-13': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 456, score: 91, wakeEnergy: null, endEnergy: null, phases: { vigilia: 3, rem: 20, ligero: 69, profundo: 8 } },
      training: null,
      activity: { steps: 10631, activeKcal: 609, restKcal: 1692 },
      measurements: null,
      meals: [
        { chatId: '2026-10-13-desayuno', category: 'Desayuno', desc: 'Tostada integral con queso crema descremado, palta y cherrys + omelet de 2 claras y 1 yema con jamón y queso proteico + café con leche protein', confidence: 'media', kcal: 457, protein: 33.3, carbs: 32.1, fat: 20.3, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema descremado y el café con leche protein son los procesados; huevo, palta, cherrys y pan integral son comida real.', beneficios: 'Desayuno proteico para arrancar el día de descanso: ~33g de proteína (omelet, café con leche protein y queso crema), grasas buenas de la palta, fibra del pan integral y la palta, y licopeno de los cherrys. El queso crema descremado recorta un poco de grasa.', puntaje: 8 } },
        { chatId: '2026-10-13-snack', category: 'Snack', desc: 'Snack de oficina: 3 panes de queso / chipa (~25 g c/u, ~75 g en total). Sin foto, estimado por tamaño típico', confidence: 'baja', kcal: 250, protein: 6, carbs: 28.5, fat: 12, fiber: 0.5, calidad: { ultraprocesado: 'Medio-alto — pan de queso industrial/de panadería con almidón de mandioca refinado, queso y grasa; sin fibra ni ingredientes enteros.', beneficios: 'Snack de oficina rico y saciante a corto plazo, pero aporta sobre todo almidón refinado y grasa, con poca proteína y casi nada de fibra. Entra bien en un día de descanso con margen calórico; conviene compensar con proteína y verduras en el almuerzo.', puntaje: 4 } },
        { chatId: '2026-10-13-almuerzo', category: 'Almuerzo', desc: 'Almuerzo en la oficina: wrap integral de suprema de pollo (~120 g cocida) con zanahoria, espinaca, brócoli, choclo y morrón + ensalada de rúcula y cherrys. Porciones estimadas por foto', confidence: 'media', kcal: 569, protein: 48.4, carbs: 51.8, fat: 19.2, fiber: 10, calidad: { ultraprocesado: 'Bajo-medio — la tortilla integral es industrial, el resto son alimentos enteros (pollo, verduras, ensalada).', beneficios: 'Muy buen almuerzo: proteína magra alta, bastante fibra y variedad de verduras (brócoli, espinaca, zanahoria, morrón, rúcula). Carbo moderado de la tortilla y el choclo. La grasa depende del aderezo/aceite, que es lo más incierto.', puntaje: 8 } },
        { chatId: '2026-10-13-merienda', category: 'Merienda', desc: 'Merienda en la oficina: yogur proteico sabor frutilla (pote 175 g, según etiqueta 133 kcal / 15 g prot / 14 g carbs / 1.9 g grasa) + granola (~20 g, estimada por foto)', confidence: 'media-alta', kcal: 218, protein: 17, carbs: 26.5, fat: 5.2, fiber: 1.5, calidad: { ultraprocesado: 'Medio — yogur proteico industrial con aditivos/edulcorantes y granola procesada; sin azúcares agregados según etiqueta.', beneficios: 'Buena merienda para sumar proteína (15 g) con pocas kcal y grasa. La granola aporta algo de fibra, semillas y crocante. Poca fibra en total, así que conviene compensar en la cena con verduras.', puntaje: 7 } },
        { chatId: '2026-10-13-cena', category: 'Cena', desc: 'Cena casera tipo pastel: carne molida magra (~120 g cruda) con papa y batata hervidas, morrón, cebolla y salsa de tomate, salteado con un poco de aceite. Porciones estimadas por foto', confidence: 'media', kcal: 426, protein: 30.6, carbs: 50.2, fat: 11.6, fiber: 7.8, calidad: { ultraprocesado: 'Bajo — todo casero con alimentos enteros (carne, papa, batata, verduras).', beneficios: 'Cena completa y saciante: proteína magra, carbos de buena calidad (papa y batata hervidas) y verduras. Cierra el día con fibra en rango. La grasa depende del aceite y del porcentaje de grasa real de la carne, que es lo más incierto.', puntaje: 8 } },
      ],
      note: 'Martes, día de descanso. Sueño bueno: 7h36, score 91 (Buena) — duración 48/50, hora de acostarse 24/30, interrupciones 19/20. Fases: vigilia 3%, REM 20%, ligero 69%, profundo 8%. Cierre: 1920 kcal / 135 g prot / 189 g carbs / 68 g grasa / 25 g fibra. Actividad: reposo 1692 + actividad 609 = 2301 kcal quemadas, 10.631 pasos. Balance −381 kcal.',
    },
    '2026-10-14': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 409, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 21, ligero: 63, profundo: 15 } },
      training: { tipo: 'Fuerza + Natación', duracion: '2h (fuerza 1h + natación 59 min)', ejercicios: 'Natación en piscina 25 m: 2.600 m en total (libre 1.925, pecho 200, dorso 225, mariposa 225), 104 vueltas, ritmo prom. 2:16 min/100 m', kcalActivas: 765, kcalTotal: 941, fcProm: '116 / 159', esfuerzo: 'Moderado (5) / Moderado (6)', energia: null, dolor: 'No' },
      activity: { steps: 7686, activeKcal: 1228, restKcal: 1690 },
      measurements: null,
      meals: [
        { chatId: '2026-10-14-pre', category: 'Pre-entreno', desc: 'Pre entreno: media banana (~50 g pelada)', confidence: 'media-alta', kcal: 45, protein: 0.6, carbs: 11.5, fat: 0.2, fiber: 1.3, calidad: { ultraprocesado: 'Ninguno — fruta entera.', beneficios: 'Carbo rápido y liviano antes de entrenar, con algo de potasio. Ideal para no ir con el estómago pesado; alcanza para un entreno temprano.', puntaje: 8 } },
        { chatId: '2026-10-14-desayuno', category: 'Desayuno', desc: 'Post-entreno: tostada integral con queso crema, palta y tomates + omelet de 2 claras y 1 yema con queso proteico y jamón + café con leche protein', confidence: 'media', kcal: 480, protein: 33.1, carbs: 32.1, fat: 23.3, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema y el café con leche protein son los procesados; huevo, palta, tomate y pan integral son comida real.', beneficios: 'Desayuno post-gym con ~33 g de proteína (omelet y café con leche protein) para la recuperación muscular, grasas buenas de la palta y fibra del pan integral y la palta. Los carbos son moderados, así que conviene reforzarlos en el almuerzo y la merienda pre-natación.', puntaje: 8 } },
        { chatId: '2026-10-14-almuerzo', category: 'Almuerzo', desc: 'Almuerzo: hamburguesa casera de pollo (~140 g) + papa y batata al horno (~250 g) + ensalada de berro/rúcula y cherrys. Porciones estimadas por foto', confidence: 'media', kcal: 535, protein: 37.8, carbs: 62.2, fat: 14, fiber: 7.7, calidad: { ultraprocesado: 'Bajo — todo casero: pollo, papa, batata y verduras; solo el aceite y condimentos del horno.', beneficios: 'Almuerzo muy bien armado para un día de doble entreno: ~38 g de proteína magra y ~62 g de carbos de buena calidad (papa y batata) que sirven de combustible para la natación. La fibra viene de las papas con cáscara y la ensalada. La grasa depende del aceite del horno, lo más incierto.', puntaje: 9 } },
        { chatId: '2026-10-14-merienda', category: 'Merienda', desc: 'Merienda pre-natación: tostada integral con queso crema + yogur (~140 g) con granola (~20 g), kiwi (~80 g) y frutos rojos congelados (~40 g). Porciones estimadas por foto', confidence: 'media', kcal: 397, protein: 15.3, carbs: 56, fat: 13.3, fiber: 7.8, calidad: { ultraprocesado: 'Bajo-medio — pan integral, queso crema y granola son los procesados; yogur, kiwi y frutos rojos son comida real.', beneficios: 'Muy buena merienda pre-natación: ~56 g de carbos (tostada, granola y fruta) para llegar con energía a la pileta, con algo de proteína del yogur y mucha fibra y vitamina C del kiwi y los frutos rojos.', puntaje: 8 } },
        { chatId: '2026-10-14-cena', category: 'Cena', desc: 'Cena post-natación: fideos proteicos (80 g secos) con suprema de pollo (~200 g cruda), cebolla y morrón, condimentos y crema de leche liviana (~45 ml, según etiqueta 20 kcal / 1,8 g grasa por 15 ml), salteado con un poco de aceite. Porciones estimadas por foto', confidence: 'media', kcal: 668, protein: 68.8, carbs: 57.3, fat: 17, fiber: 6.9, calidad: { ultraprocesado: 'Medio — fideos proteicos y crema liviana con estabilizantes son los procesados; pollo, cebolla y morrón son comida real.', beneficios: 'Cena de recuperación ideal después de dos horas de entreno: ~69 g de proteína (pollo y fideos proteicos), carbos para reponer glucógeno y fibra de los fideos y las verduras. La crema liviana suma cremosidad con poca grasa. La cantidad de crema y de aceite es lo más incierto.', puntaje: 8 } },
      ],
      note: 'Miércoles, día de doble entreno. Sueño bueno: 6h49, score 92 (Buena) — duración 44/50, hora de acostarse 29/30, interrupciones 19/20. Fases: vigilia 1%, REM 21%, ligero 63%, profundo 15%. Entreno doble: gym 7:00 (fuerza 1h, esfuerzo 5) + natación 20:00 (2.600 m, esfuerzo 6). Cierre: 2125 kcal / 156 g prot / 219 g carbs / 68 g grasa / 29 g fibra. Actividad: reposo 1690 + actividad 1228 = 2918 kcal quemadas, 7.686 pasos. Balance −793 kcal.',
    },
    '2026-10-15': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 427, score: 92, wakeEnergy: null, endEnergy: null, phases: { vigilia: 5, rem: 17, ligero: 67, profundo: 11 } },
      training: { tipo: 'Natación en piscina', duracion: '58 min', ejercicios: 'Piscina 25 m: 2.525 m en total (libre 2.100, mariposa 150, dorso 125, pecho 125, tabla 25), 101 vueltas, ritmo prom. 2:19 min/100 m. FC: 15:43 en zona 3 y 17:27 en zona 4', kcalActivas: 437, kcalTotal: 524, fcProm: 157, esfuerzo: 'Difícil (7)', energia: null, dolor: 'No' },
      activity: { steps: 12000, activeKcal: 1100, restKcal: 1600 },
      measurements: null,
      meals: [
        { chatId: '2026-10-15-desayuno', category: 'Desayuno', desc: 'Tostada integral con queso crema, palta y tomates + omelet de 2 claras y 1 yema con queso proteico y jamón + café con leche protein', confidence: 'media', kcal: 480, protein: 33.1, carbs: 32.1, fat: 23.3, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema y el café con leche protein son los procesados; huevo, palta, tomate y pan integral son comida real.', beneficios: 'Desayuno proteico para arrancar el día: ~33 g de proteína (omelet y café con leche protein), grasas buenas de la palta y fibra del pan integral y la palta. Los carbos son moderados, así que conviene reforzarlos en el almuerzo y la merienda pre-natación.', puntaje: 8 } },
        { chatId: '2026-10-15-almuerzo', category: 'Almuerzo', desc: 'Almuerzo en la oficina: wrap integral con media lata de atún (~60 g escurrido), choclo, brócoli, espinaca, morrón y cebolla + ensalada de cherrys y zanahoria hervida. Porciones estimadas por foto', confidence: 'media', kcal: 426, protein: 25.3, carbs: 53.3, fat: 12.4, fiber: 11.2, calidad: { ultraprocesado: 'Bajo-medio — la tortilla integral y el atún enlatado son lo procesado; el resto son verduras enteras.', beneficios: 'Almuerzo liviano y muy rico en fibra y verduras (brócoli, espinaca, zanahoria, morrón, choclo), con buenos carbos para el entreno de la noche. Es el punto flojo en proteína (~25 g) porque es media lata de atún, así que conviene compensarlo en la merienda y la cena.', puntaje: 8 } },
        { chatId: '2026-10-15-merienda', category: 'Merienda', desc: 'Merienda en la oficina: yogur proteico (pote 175 g, según etiqueta 133 kcal / 15 g prot / 14 g carbs / 1,9 g grasa) con granola (~30 g, estimada por foto)', confidence: 'media-alta', kcal: 260, protein: 18, carbs: 32.8, fat: 6.9, fiber: 2.3, calidad: { ultraprocesado: 'Medio — yogur proteico industrial y granola procesada; sin azúcares agregados según la etiqueta del yogur.', beneficios: 'Merienda práctica para sumar proteína (~18 g) con pocas kcal y grasa, más carbos de la granola para el entreno de la noche. Aporta poca fibra, que se compensa con verduras en la cena.', puntaje: 7 } },
        { chatId: '2026-10-15-snack', category: 'Snack', desc: 'Gustito de oficina: porción de torta de cumpleaños (bizcocho de chocolate con crema y frutilla, ~90 g). Estimado por foto', confidence: 'baja', kcal: 315, protein: 4, carbs: 36, fat: 17, fiber: 1.4, calidad: { ultraprocesado: 'Alto — torta de pastelería con bizcocho refinado, crema, relleno de dulce y azúcar; poco de alimento entero (la frutilla).', beneficios: 'Gustito social y bien disfrutado; aporta sobre todo azúcar y grasa, con poca proteína y fibra. Una porción puntual entra sin problema en un día de mucho gasto como hoy, con natación a la noche.', puntaje: 3 } },
        { chatId: '2026-10-15-pre', category: 'Pre-entreno', desc: 'Pre natación: 1 huevo duro (~50 g) con pimienta', confidence: 'alta', kcal: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, calidad: { ultraprocesado: 'Ninguno — alimento entero.', beneficios: 'Proteína de alta calidad, liviana y fácil de digerir antes de nadar. Aporta saciedad y micronutrientes (colina, vitamina D, B12) sin sumar casi carbos ni mucha grasa.', puntaje: 9 } },
        { chatId: '2026-10-15-cena', category: 'Cena', desc: 'Post natación, todo al horno: bife de bondiola de cerdo magra (~150 g cocida, ~285 kcal / 40 g prot / 12 g grasa) + media batata con cáscara (~150 g, ~135 kcal / 31 g carbos / 4.5 g fibra) + ~1 cdta de aceite del horno (~40 kcal / 4.5 g grasa), con hierbas y pimentón. Estimado por foto', confidence: 'media', kcal: 460, protein: 43, carbs: 31, fat: 16.7, fiber: 4.5, calidad: { ultraprocesado: 'Ninguno — carne y vegetal enteros, cocción al horno con aceite y condimentos simples.', beneficios: 'Proteína completa (~43 g) para recuperar después de la natación y carbo de buena calidad de la batata (fibra, betacarotenos, potasio). Cocción al horno sin fritura. Cena un poco corta en fibra y con algo más de grasa que el margen; el cerdo magro ayuda a contenerla.', puntaje: 8 } },
      ],
      note: 'Jueves, día de entreno (natación a la noche). Sueño bueno: 7h07, score 92 (Buena) — duración 46/50, hora de acostarse 30/30, interrupciones 16/20 (varios despertares). Fases: vigilia 5%, REM 17%, ligero 67%, profundo 11%. Preparación para entrenar (informe matutino): 87%. Cierre: natación difícil (7) de 2.525 m; comió 2013 kcal / 129.7 g prot / 185.6 g carbs / 81.1 g grasa / 24.6 g fibra (grasa alta por la torta de oficina y el aceite del horno, proteína ~5 g corta). Gasto 2700 kcal (reposo 1600 + actividad 1100, 12.000 pasos) → balance −687 kcal. Semana lun–jue: promedio 1992 kcal, 144 g prot, 27 g fibra, sueño 7.3 h / score 93.',
    },
    '2026-10-16': {
      trainingDay: true,
      closed: true,
      sleep: { duration_min: 350, score: 83, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 18, ligero: 71, profundo: 7 } },
      training: { tipo: 'Fuerza (Entrenamiento tradicional de fuerza) — full body con glúteo', duracion: '38 min', ejercicios: 'Bloque 1: RE hombro acostado 2×12 (30 K), flexo-extensión de cadera asistido 2×12, hallo 1P KB 2×12 (8 K). Bloque 2: caminata del granjero KB 4×12 (20 K), empuje de cadera BR 4×10–12 (80 K), bajadas al podio 3×12, aperturas MQ 3×12, dorsalera neutra MQ 3×8, tríceps PL 3×12, gemelos MC 4×15', kcalActivas: 163, kcalTotal: 220, fcProm: 102, esfuerzo: 'Moderado (4)', energia: null, dolor: 'Dolor muscular leve (elongó un poco)' },
      activity: { steps: 6336, activeKcal: 520, restKcal: 1617 },
      measurements: null,
      meals: [
        { chatId: '2026-10-16-pre', category: 'Pre-entreno', desc: 'Pre entreno: media banana (~50 g pelada)', confidence: 'media-alta', kcal: 45, protein: 0.6, carbs: 11.5, fat: 0.2, fiber: 1.3, calidad: { ultraprocesado: 'Ninguno — fruta entera.', beneficios: 'Carbo rápido y liviano antes de entrenar, con algo de potasio. Ideal para no ir con el estómago pesado; alcanza para un entreno temprano.', puntaje: 8 } },
        { chatId: '2026-10-16-desayuno', category: 'Desayuno', desc: 'Post gym, el de siempre "más power": tostada integral con queso crema, palta y tomates + omelet de 3 claras y 1 yema (una clara extra) con queso proteico y jamón + café con leche protein', confidence: 'media', kcal: 497, protein: 36.7, carbs: 32.3, fat: 23.4, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema y el café con leche protein son los procesados; huevo, palta, tomate y pan integral son comida real.', beneficios: 'Desayuno proteico post entreno: ~37 g de proteína (omelet y café con leche protein), con la clara extra sumando proteína casi sin grasa. Grasas buenas de la palta y fibra del pan integral y la palta. Los carbos son moderados, así que conviene reforzarlos en el almuerzo y la cena.', puntaje: 8 } },
        { chatId: '2026-10-16-almuerzo', category: 'Almuerzo', desc: 'Pechuga de pollo al horno (~220 g cruda) con 1 cda de mostaza (~290 kcal / 55 g prot) + papa y batata al horno (~230 g en total, con ~1 cdta de aceite, ~250 kcal / 48 g carbos / 5.5 g fibra) + salteado de brócoli (~100 g), choclo (~60 g) y tomates cherry (~60 g) con un toque de aceite y condimentos (~120 kcal / 5.5 g fibra). Estimado por foto', confidence: 'media', kcal: 671, protein: 65.1, carbs: 70.1, fat: 15.2, fiber: 11.3, calidad: { ultraprocesado: 'Ninguno — pollo, tubérculos y verduras enteros; la mostaza es el único condimento procesado, en cantidad mínima.', beneficios: 'Plato muy completo post entreno: ~65 g de proteína magra, carbos de papa y batata para recuperar y ~11 g de fibra del brócoli, el choclo y los tubérculos con cáscara. Cocción al horno y poco aceite. Los carbos quedaron algo por encima de lo previsto, así que se compensan achicando la merienda.', puntaje: 9 } },
        { chatId: '2026-10-16-merienda', category: 'Merienda', desc: 'Yogur proteico (pote ~175 g) con poca granola (~15 g, menos de lo habitual), 1 kiwi (~70 g) y frutos rojos congelados (~50 g)', confidence: 'media', kcal: 261, protein: 17.7, carbs: 38.5, fat: 5.1, fiber: 5, calidad: { ultraprocesado: 'Bajo — el yogur proteico y la granola son los procesados; el kiwi y los frutos rojos son fruta entera.', beneficios: 'Merienda con ~18 g de proteína del yogur, fibra y vitamina C del kiwi y antioxidantes de los frutos rojos. Achicó la granola para compensar los carbos del almuerzo, que quedaron algo arriba, y dejar espacio para la pizza.', puntaje: 8 } },
        { chatId: '2026-10-16-cena', category: 'Cena', desc: 'Pizza casera de masa fina compartida entre dos (una mitad con tomates cherry y cebolla, la otra con jamón; queso proteico). Estimada la mitad de la pizza: masa fina ~170 kcal, salsa de tomate ~12 kcal, queso proteico ~50 g (~138 kcal / 12.5 g prot / 8.8 g grasa), jamón ~30 g de promedio (~35 kcal), verduras y ~½ cdta de aceite (~35 kcal) = ~390 kcal / 23 g prot / 36 g carbos / 16 g grasa / 2.5 g fibra. Más 1 copa de vino blanco (~150 ml, ~115 kcal / 3 g carbos). Estimado por foto', confidence: 'baja-media', kcal: 504, protein: 23.2, carbs: 39.3, fat: 16.1, fiber: 2.5, calidad: { ultraprocesado: 'Medio — el jamón y el queso proteico son los procesados; la masa casera fina, la salsa y las verduras son comida más simple. El vino es alcohol, sin valor nutricional.', beneficios: 'Pizza casera con masa fina, queso proteico y toppings magros: ~23 g de proteína con una porción de carbos moderada, mucho mejor que una pizza tradicional. El vino suma calorías vacías, pero una copa en una cena social entra sin problemas.', puntaje: 7 } },
        { chatId: '2026-10-16-postre', category: 'Postre', desc: 'Helado artesanal de chocolate y dulce de leche con trocitos: medio kilo compartido entre dos (~250 g tuyos, ~200 kcal/100 g) + 1 copa más de vino blanco (~150 ml). Estimado por foto, con mucha incertidumbre sobre la cantidad real', confidence: 'baja', kcal: 615, protein: 9.1, carbs: 61, fat: 25, fiber: 2, calidad: { ultraprocesado: 'Alto — helado con azúcar, grasa y bases industriales en el dulce de leche y los trocitos; el vino es alcohol sin valor nutricional.', beneficios: 'Gustito social de viernes a la noche, disfrutado en compañía. Aporta casi solo azúcar y grasa saturada, con poca proteína y fibra, más calorías del alcohol. Una porción puntual dentro de un fin de semana de descanso y un déficit semanal grande no cambia la tendencia.', puntaje: 3 } },
      ],
      note: 'Viernes, día de entreno (gimnasio a la mañana). Sueño más corto: 5h50, score 83 (Buena) — duración 35/50, hora de acostarse 30/30, interrupciones 18/20. Fases: vigilia 4%, REM 18%, ligero 71%, profundo 7%. Fin de semana planificado de descanso total. Cierre: gym corto y moderado (4) tras noche corta; almuerzo de pollo con papa y batata, pizza casera compartida con queso proteico y, a la noche, helado compartido (~250 g) con 2 copas de vino blanco. Comió 2593 kcal / 152.4 g prot / 252.7 g carbs / 85.0 g grasa / 27.3 g fibra (arriba del objetivo por el helado y el vino). Gasto 2137 kcal (reposo 1617 + actividad 520, 6.336 pasos) → balance +456 kcal, un día puntual de superávit dentro de una semana con déficit promedio ~−350/día. Aviso: la medición del lunes puede marcar de más por agua, sal, alcohol y carbos.',
    },
    '2026-10-17': {
      trainingDay: false,
      closed: true,
      sleep: { duration_min: 459, score: 88, wakeEnergy: null, endEnergy: null, phases: { vigilia: 1, rem: 25, ligero: 58, profundo: 16 } },
      training: null,
      activity: { steps: 12134, activeKcal: 534, restKcal: 1627 },
      measurements: null,
      meals: [
        { chatId: '2026-10-17-desayuno', category: 'Desayuno', desc: 'Tostada integral (~35 g) con queso crema descremado (~20 g) + 2 huevos revueltos con queso proteico (~20 g) y un toque de aceite + mate (asumido sin azúcar)', confidence: 'media-alta', kcal: 328, protein: 22.6, carbs: 18.4, fat: 17.2, fiber: 2.5, calidad: { ultraprocesado: 'Bajo — huevo y pan integral son comida real; el queso proteico y el queso crema descremado son los procesados.', beneficios: 'Desayuno simple y saciante de día de descanso: ~23 g de proteína de los huevos y el queso proteico, carbo moderado de la tostada integral y poca grasa agregada. Queda corto en fibra, así que conviene compensarlo con verduras en el almuerzo.', puntaje: 8 } },
        { chatId: '2026-10-17-almuerzo', category: 'Almuerzo', desc: 'Pechuga de pollo al horno empanada con huevo y pan rallado (~200 g cruda, ~410 kcal / 55 g prot con empanado y aceite) + ensalada de lentejas (~120 g cocidas) con zanahoria hervida (~120 g) y tomates cherry (~80 g), con ~1 cdta de aceite de oliva y orégano (~235 kcal / 14 g fibra) + cucharada de salsa cremosa tipo hummus visible en el plato, no mencionada (~30 g, ~50 kcal). Estimado por foto', confidence: 'media', kcal: 695, protein: 69.9, carbs: 54.3, fat: 22, fiber: 16.3, calidad: { ultraprocesado: 'Bajo — pollo, legumbres y verduras enteros; el pan rallado es el único procesado, en cantidad moderada, y el empanado es al horno, no frito.', beneficios: 'Plato muy completo: ~70 g de proteína, lentejas que aportan fibra, hierro y carbo de absorción lenta, y verduras con antioxidantes. Empanado al horno con poco aceite, mucho más liviano que una milanesa frita. Con esto cubrís más de la mitad de la fibra del día.', puntaje: 9 } },
        { chatId: '2026-10-17-merienda', category: 'Merienda', desc: 'Merienda en un café durante una caminata: café con leche (~200 ml, leche entera, asumido sin azúcar, ~80 kcal) + medialuna de manteca grande rellena de jamón y queso (~65 g de medialuna + ~20 g de jamón + ~25 g de queso, ~345 kcal) + chips de papa (~20 g, ~107 kcal). Estimado por foto', confidence: 'baja-media', kcal: 532, protein: 18.4, carbs: 45.3, fat: 30.6, fiber: 1.9, calidad: { ultraprocesado: 'Alto — la medialuna de panadería (harina refinada y manteca) y los chips de papa son productos procesados; el café con leche, el jamón y el queso son más simples.', beneficios: 'Merienda social de salida, disfrutada en medio de una caminata. Aporta ~18 g de proteína del jamón, el queso y la leche, pero también bastante grasa y carbo refinado, con casi nada de fibra. Una porción puntual en un día de descanso con actividad suave entra sin problema.', puntaje: 4 } },
        { chatId: '2026-10-17-cena', category: 'Cena', desc: 'Hamburguesa casera de suprema de pollo (~150 g cruda, ~218 kcal / 37 g prot con aceite de cocción) en pan Lactal para hamburguesas abierto en dos mitades (1 unidad, 53 g, según etiqueta: 145 kcal / 5.3 g prot / 26 g carbos / 2.6 g grasa / 1.3 g fibra), con queso proteico derretido (~40 g en total, ~110 kcal), tomates cherry salteados (~60 g) y cebolla asada (~60 g) con un toque de aceite (~75 kcal), papa al horno corregida por ella (~50 g, sin aceite, ~47 kcal / 10.5 g carbos) y medio buñuelo de espinaca (~20 g, ~40 kcal, asumido al horno; lo verde del plato era el buñuelo, no una salsa). Estimado por foto, pan según etiqueta; cantidades de papa, buñuelo y salsa corregidas por ella', confidence: 'media', kcal: 635, protein: 56.6, carbs: 49.2, fat: 22.8, fiber: 4.7, calidad: { ultraprocesado: 'Medio — el pan de hamburguesa, el queso proteico y el buñuelo (si es industrial) son los procesados; la hamburguesa es casera de pollo entero y la papa, el tomate y la cebolla son comida real.', beneficios: 'Cena casera y completa: ~57 g de proteína magra del pollo y el queso, carbo moderado del pan y un poco de papa, y algo de fibra de la verdura. Porción razonable, aunque cayó sobre un día que ya venía alto en grasa por la merienda y el queso; la calidad de los ingredientes es muy buena.', puntaje: 8 } },
      ],
      note: 'Sábado, día de descanso total (con trabajo, modo tranquilo). Sueño muy bueno: 7h39, score 88 (Buena) — duración 48/50, hora de acostarse 21/30 (se acostó ~55 min más tarde de lo habitual), interrupciones 19/20. Fases: vigilia <1%, REM 25%, ligero 58%, profundo 16%. Se siente descansada. Cierre: día de descanso con trabajo tranquilo y paseo a la tarde (12.134 pasos, movimiento suave). Comió 2190 kcal / 167.5 g prot / 167.2 g carbs / 92.6 g grasa / 25.4 g fibra (grasa y proteína arriba del objetivo por la medialuna, los chips y el queso; carbos y fibra en rango; cena corregida por ella: papa 50 g sin aceite, medio buñuelo, sin salsa). Gasto 2161 kcal (reposo 1627 + actividad 534, capturado a las 22:06) → balance +29 kcal, mantenimiento. Promedio lun–sáb ~−290 kcal/día.',
    },
    '2026-10-18': {
      trainingDay: false,
      closed: false,
      sleep: { duration_min: 509, score: 94, wakeEnergy: null, endEnergy: null, phases: { vigilia: 4, rem: 24, ligero: 64, profundo: 8 } },
      training: null,
      activity: null,
      measurements: null,
      meals: [
        { chatId: '2026-10-18-desayuno', category: 'Desayuno', desc: 'El de siempre, en la cama: tostada integral con queso crema, palta y tomates + omelet de 2 claras y 1 yema con queso proteico y jamón + café con leche protein', confidence: 'media', kcal: 480, protein: 33.1, carbs: 32.1, fat: 23.3, fiber: 5.2, calidad: { ultraprocesado: 'Medio — el jamón, el queso proteico, el queso crema y el café con leche protein son los procesados; huevo, palta, tomate y pan integral son comida real.', beneficios: 'Desayuno proteico para arrancar el día: ~33 g de proteína (omelet y café con leche protein), grasas buenas de la palta y fibra del pan integral y la palta. Los carbos son moderados, así que conviene reforzarlos en el almuerzo y la merienda.', puntaje: 8 } },
        { chatId: '2026-10-18-almuerzo', category: 'Almuerzo', desc: 'Ravioles de carne Dia 100 g (1 porción de etiqueta: 257 kcal/8,6 g prot/47 g carbos/3,8 g grasa/2,6 g fibra) con salteado de nalga 150 g (crudo) con cebolla, morrón, zanahoria y tomate, sin aceite', confidence: 'media-alta', kcal: 502, protein: 41.9, carbs: 58, fat: 11, fiber: 6.2, calidad: { ultraprocesado: 'Medio — los ravioles industriales llevan aceite interesterificado, aditivos y relleno procesado; la nalga y las verduras del salteado son comida real.', beneficios: 'Buen aporte de proteína (~42 g) gracias a la nalga magra, y la fibra y vitaminas de las verduras del salteado. Cocinar sin aceite mantiene la grasa baja. Porción de ravioles moderada: carbos y calorías bien contenidos, con margen para el resto del día.', puntaje: 7 } },
        { chatId: '2026-10-18-merienda', category: 'Merienda', desc: 'Yogur proteico (pote 175 g) con kiwi y frutos rojos congelados (15 g de fruta en total) + tostada integral con queso crema descremado y huevo duro con pimentón', confidence: 'media-alta', kcal: 348, protein: 26.1, carbs: 33.2, fat: 12, fiber: 2.9, calidad: { ultraprocesado: 'Bajo-medio — el yogur proteico y el queso crema son los procesados; el huevo, la fruta y el pan integral son comida real.', beneficios: 'Merienda muy proteica (~26 g) con huevo y yogur, saciante y con pocas grasas. La fruta es poca, así que la fibra queda baja (~3 g): conviene compensarla en la cena con verduras.', puntaje: 8 } },
      ],
      note: 'Domingo, día de descanso total. Sueño excelente: 8h29, score 94 (Buena) — duración 50/50, hora de acostarse 30/30, interrupciones 14/20 (varios despertares). Fases: vigilia 4%, REM 24%, ligero 64%, profundo 8%.',
    },
  },
};

function normalizeActivityKeys(days) {
  let changed = false;
  const out = {};
  Object.entries(days).forEach(([date, day]) => {
    const a = day && day.activity;
    if (a && (a.restingKcal !== undefined || a.activeEnergy !== undefined || a.restEnergy !== undefined)) {
      const { restingKcal, activeEnergy, restEnergy, ...rest } = a;
      out[date] = { ...day, activity: {
        ...rest,
        activeKcal: rest.activeKcal ?? activeEnergy ?? null,
        restKcal: rest.restKcal ?? restEnergy ?? restingKcal ?? null,
      } };
      changed = true;
    } else {
      out[date] = day;
    }
  });
  return { days: out, changed };
}

async function applyChatUpdates(days) {
  let lastVersion = 0;
  try {
    const r = await window.storage.get('chat-import-version');
    lastVersion = r ? Number(r.value) : 0;
  } catch (e) { lastVersion = 0; }
  if (!CHAT_UPDATES.version || CHAT_UPDATES.version <= lastVersion) return { days, changed: false };
  const next = { ...days };
  Object.entries(CHAT_UPDATES.days).forEach(([date, patch]) => {
    const existing = next[date];
    if (existing && existing.closed) return; // no tocar días ya cerrados/congelados
    const base = existing || { date, trainingDay: null, closed: false, meals: [], training: null, sleep: null, measurements: null, activity: null, estimatedTotals: null, note: '' };
    const mergedMeals = [...(base.meals || [])];
    (patch.meals || []).forEach(m => {
      const idx = mergedMeals.findIndex(x => x.chatId && x.chatId === m.chatId);
      if (idx === -1) {
        mergedMeals.push({ id: uid(), ...m });
      } else {
        mergedMeals[idx] = { ...mergedMeals[idx], ...m };
      }
    });
    next[date] = {
      ...base,
      trainingDay: patch.trainingDay !== undefined ? patch.trainingDay : base.trainingDay,
      meals: mergedMeals,
      training: patch.training !== undefined ? patch.training : base.training,
      sleep: patch.sleep !== undefined ? patch.sleep : base.sleep,
      measurements: patch.measurements !== undefined ? patch.measurements : base.measurements,
      activity: patch.activity !== undefined ? patch.activity : base.activity,
      estimatedTotals: patch.estimatedTotals !== undefined ? patch.estimatedTotals : base.estimatedTotals,
      note: patch.note !== undefined ? patch.note : base.note,
      closed: patch.closed !== undefined ? patch.closed : base.closed,
    };
  });
  try { await window.storage.set('chat-import-version', String(CHAT_UPDATES.version)); } catch (e) {}
  return { days: next, changed: true };
}

// ---------- small UI atoms ----------
function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: 'var(--paper2)', color: 'var(--ink2)' },
    good: { bg: '#e7ece0', color: 'var(--moss)' },
    warn: { bg: '#f4e9d9', color: 'var(--ochre)' },
    bad: { bg: '#f3e0d7', color: 'var(--rust)' },
    train: { bg: '#eee3c8', color: 'var(--ochre)' },
    rest: { bg: '#dde6ee', color: 'var(--steel)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ background: t.bg, color: t.color, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 3, textTransform: 'uppercase', fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Bar1({ value, range, label }) {
  const pct = pctRange(value, range);
  const shownPct = value == null ? 0 : Math.min(100, (value / range[1]) * 100);
  let color = 'var(--moss)';
  if (pct == null) color = 'var(--ink3)';
  else if (pct < 85) color = 'var(--steel)';
  else if (pct === 100) color = 'var(--moss)';
  else color = 'var(--rust)';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink2)', marginBottom: 3 }}>
        <span>{label}</span>
        <span>{value == null ? '—' : Math.round(value * 10) / 10}{range ? ` / ${range[0]}–${range[1]}` : ''} {pct != null && `· ${pct}%`}</span>
      </div>
      <div style={{ height: 7, background: 'var(--paper2)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--rule)' }}>
        <div style={{ width: `${Math.min(100, shownPct)}%`, height: '100%', background: color, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, right, children }) {
  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 6, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon && <Icon size={16} color="var(--ochre)" strokeWidth={2} />}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: 0, letterSpacing: '0.01em' }}>{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function TextInput(props) {
  return <input {...props} className="lg-input" style={{ ...(props.style || {}) }} />;
}
function NumInput(props) {
  return <input type="number" step="any" {...props} className="lg-input lg-num" style={{ ...(props.style || {}) }} />;
}
function Select({ children, ...props }) {
  return <select {...props} className="lg-input">{children}</select>;
}
function BtnPrimary({ children, ...props }) {
  return <button {...props} className="lg-btn-primary">{children}</button>;
}
function BtnGhost({ children, ...props }) {
  return <button {...props} className="lg-btn-ghost">{children}</button>;
}

// ---------- App ----------
export default function App() {
  const [loading, setLoading] = useState(true);
  const [allDays, setAllDays] = useState({});
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [timeUse, setTimeUse] = useState({});
  const [tab, setTab] = useState('hoy');
  const [selectedDate, setSelectedDate] = useState(todayArg());
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    (async () => {
      let days = null, tg = null, tUse = null;
      try {
        const r = await window.storage.get('all-days');
        days = r ? JSON.parse(r.value) : null;
      } catch (e) { days = null; }
      if (!days) {
        days = SEED_DAYS;
        try { await window.storage.set('all-days', JSON.stringify(days)); } catch (e) {}
      }
      try {
        const r = await window.storage.get('targets');
        tg = r ? JSON.parse(r.value) : null;
      } catch (e) { tg = null; }
      if (!tg) {
        tg = DEFAULT_TARGETS;
        try { await window.storage.set('targets', JSON.stringify(tg)); } catch (e) {}
      }
      try {
        const r = await window.storage.get('time-use');
        tUse = r ? JSON.parse(r.value) : null;
      } catch (e) { tUse = null; }
      if (!tUse) tUse = {};
      const { days: merged0, changed: changed0 } = await applyChatUpdates(days);
      const { days: merged, changed: changed1 } = normalizeActivityKeys(merged0);
      const changed = changed0 || changed1;
      if (changed) {
        try { await window.storage.set('all-days', JSON.stringify(merged)); } catch (e) {}
      }
      const { timeUse: mergedTimeUse, changed: timeUseChanged } = await applyTimeUseUpdates(tUse);
      if (timeUseChanged) {
        try { await window.storage.set('time-use', JSON.stringify(mergedTimeUse)); } catch (e) {}
      }
      setAllDays(merged);
      setTargets(tg);
      setTimeUse(mergedTimeUse);
      setLoading(false);
    })();
  }, []);

  const persistDays = useCallback(async (next) => {
    setAllDays(next);
    try {
      const r = await window.storage.set('all-days', JSON.stringify(next));
      if (!r) setSaveError(true); else setSaveError(false);
    } catch (e) { setSaveError(true); }
  }, []);

  const persistTimeUse = useCallback(async (next) => {
    setTimeUse(next);
    try { await window.storage.set('time-use', JSON.stringify(next)); } catch (e) { setSaveError(true); }
  }, []);

  const persistTargets = useCallback(async (next) => {
    setTargets(next);
    try { await window.storage.set('targets', JSON.stringify(next)); } catch (e) { setSaveError(true); }
  }, []);

  const getOrCreateDay = useCallback((date) => {
    if (allDays[date]) return allDays[date];
    return { date, trainingDay: null, closed: false, meals: [], training: null, sleep: null, measurements: null, activity: null, estimatedTotals: null, note: '' };
  }, [allDays]);

  const updateDay = useCallback((date, patch) => {
    const current = getOrCreateDay(date);
    const next = { ...allDays, [date]: { ...current, ...patch } };
    persistDays(next);
  }, [allDays, getOrCreateDay, persistDays]);

  const sortedDates = useMemo(() => Object.keys(allDays).sort(), [allDays]);
  const closedDates = useMemo(() => sortedDates.filter(d => allDays[d].closed), [sortedDates, allDays]);

  if (loading) {
    return (
      <div style={{ ...rootStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <style>{globalCss}</style>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink2)' }}>Cargando bitácora…</span>
      </div>
    );
  }

  const day = getOrCreateDay(selectedDate);

  return (
    <div style={rootStyle}>
      <style>{globalCss}</style>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px 60px' }}>
        <Header saveError={saveError} />
        <TabNav tab={tab} setTab={setTab} />
        {tab === 'hoy' && (
          <HoyTab
            day={day}
            date={selectedDate}
            setDate={setSelectedDate}
            targets={targets}
            updateDay={updateDay}
            allDates={sortedDates}
          />
        )}
        {tab === 'historial' && <HistorialTab allDays={allDays} sortedDates={sortedDates} targets={targets} />}
        {tab === 'tiempo' && <TiempoTab allDays={allDays} timeUse={timeUse} persistTimeUse={persistTimeUse} />}
        {tab === 'cumplimiento' && <CumplimientoTab allDays={allDays} closedDates={closedDates} targets={targets} />}
        {tab === 'medidas' && <MedidasTab allDays={allDays} sortedDates={sortedDates} updateDay={updateDay} />}
        {tab === 'ajustes' && <AjustesTab targets={targets} persistTargets={persistTargets} allDays={allDays} persistDays={persistDays} />}
      </div>
    </div>
  );
}

function Header({ saveError }) {
  return (
    <div style={{ marginBottom: 22, borderBottom: '2px solid var(--ink)', paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--ochre)', textTransform: 'uppercase', marginBottom: 4 }}>
          Cuaderno de seguimiento · Buenos Aires
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>
          Bitácora de salud
        </h1>
      </div>
      {saveError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--rust)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <AlertCircle size={14} /> error al guardar
        </div>
      )}
    </div>
  );
}

function TabNav({ tab, setTab }) {
  const tabs = [
    { id: 'hoy', label: 'Hoy', icon: Utensils },
    { id: 'historial', label: 'Historial', icon: TrendingUp },
    { id: 'tiempo', label: 'Tiempo', icon: Clock },
    { id: 'cumplimiento', label: 'Cumplimiento', icon: Check },
    { id: 'medidas', label: 'Medidas', icon: Ruler },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];
  return (
    <div style={{ display: 'flex', gap: 2, marginBottom: 22, borderBottom: '1px solid var(--rule)', flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            fontFamily: 'var(--font-mono)', fontSize: 12.5, letterSpacing: '0.03em', textTransform: 'uppercase',
            color: tab === t.id ? 'var(--ink)' : 'var(--ink3)',
            borderBottom: tab === t.id ? '2px solid var(--ochre)' : '2px solid transparent',
            marginBottom: -1, fontWeight: tab === t.id ? 700 : 500,
          }}
        >
          <t.icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- HOY ----------
function HoyTab({ day, date, setDate, targets, updateDay, allDates }) {
  const totals = getDayTotals(day);
  const target = day.trainingDay == null ? targets.rest : (day.trainingDay ? targets.training : targets.rest);
  const [showMealForm, setShowMealForm] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const weekday = weekdayEs(date);

  function addMeal(meal) {
    const meals = [...(day.meals || []), { id: uid(), ...meal }];
    updateDay(date, { meals });
    setShowMealForm(false);
  }
  function removeMeal(id) {
    updateDay(date, { meals: (day.meals || []).filter(m => m.id !== id) });
  }
  function closeDay() {
    updateDay(date, { closed: true });
    setConfirmClose(false);
  }
  function reopenDay() {
    updateDay(date, { closed: false });
  }

  return (
    <div>
      <Section
        title={`${weekday}, ${fmtLong(date)}`}
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" value={date} max={todayArg()} onChange={e => setDate(e.target.value)} className="lg-input" style={{ width: 150 }} />
            {day.closed ? <Badge tone="good"><Lock size={10} style={{ marginRight: 4, display: 'inline' }} />Cerrado</Badge> : <Badge tone="warn">Abierto</Badge>}
          </div>
        }
      >
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink2)' }}>¿Día de entrenamiento?</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: day.closed ? 'default' : 'pointer' }}>
            <input type="radio" disabled={day.closed} checked={day.trainingDay === true} onChange={() => updateDay(date, { trainingDay: true })} /> Sí
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: day.closed ? 'default' : 'pointer' }}>
            <input type="radio" disabled={day.closed} checked={day.trainingDay === false} onChange={() => updateDay(date, { trainingDay: false })} /> No
          </label>
          {day.trainingDay != null && <Badge tone={day.trainingDay ? 'train' : 'rest'}>{day.trainingDay ? 'Entrenamiento' : 'Descanso'}</Badge>}
        </div>
      </Section>

      <Section
        icon={Utensils}
        title="Comidas del día"
        right={!day.closed && <BtnGhost onClick={() => setShowMealForm(s => !s)}><Plus size={13} /> Agregar comida</BtnGhost>}
      >
        {(day.meals || []).length === 0 && <EmptyNote text="Todavía no hay comidas registradas hoy." />}
        {(day.meals || []).map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--rule)', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                {m.category} {m.confidence && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink3)', textTransform: 'uppercase' }}> · confianza {m.confidence}</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 2 }}>{m.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink2)', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {m.kcal != null ? (
                <>{m.kcal} kcal<br />P{m.protein ?? 0} C{m.carbs ?? 0} G{m.fat ?? 0}</>
              ) : <span style={{ color: 'var(--ink3)' }}>sin macros</span>}
            </div>
            {!day.closed && <button onClick={() => removeMeal(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)' }}><Trash2 size={13} /></button>}
          </div>
        ))}
        {showMealForm && <MealForm onAdd={addMeal} onCancel={() => setShowMealForm(false)} />}
      </Section>

      <Section title="Acumulado vs. objetivo">
        {totals ? (
          <>
            {totals.estimated && <div style={{ marginBottom: 10 }}><Badge tone="warn">Estimación de rango — confianza {totals.range?.confidence || 'media'}</Badge></div>}
            {totals.partial && <div style={{ marginBottom: 10 }}><Badge tone="warn">Cálculo parcial — hay comidas sin macros cargados</Badge></div>}
            <Bar1 label="Calorías (kcal)" value={totals.kcal} range={target.kcal} />
            <Bar1 label="Proteína (g)" value={totals.protein} range={target.protein} />
            <Bar1 label="Carbohidratos (g)" value={totals.carbs} range={target.carbs} />
            <Bar1 label="Grasas (g)" value={totals.fat} range={target.fat} />
          </>
        ) : <EmptyNote text="Sin datos suficientes todavía para calcular el acumulado. Cargá comidas con macros o completá una estimación." />}
      </Section>

      <TrainingSection day={day} date={date} updateDay={updateDay} />
      <SleepSection day={day} date={date} updateDay={updateDay} />
      <ActivitySection day={day} date={date} updateDay={updateDay} />

      <Section title="Notas del día">
        <textarea
          disabled={day.closed}
          value={day.note || ''}
          onChange={e => updateDay(date, { note: e.target.value })}
          placeholder="Qué funcionó, qué ajustar, qué preparar para mañana (máx. 3 ideas)."
          className="lg-input"
          style={{ width: '100%', minHeight: 70, resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {day.closed ? (
          <BtnGhost onClick={reopenDay}><RotateCcw size={13} /> Reabrir para corrección</BtnGhost>
        ) : confirmClose ? (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink2)', alignSelf: 'center' }}>¿Confirmás cerrar el día? Queda congelado.</span>
            <BtnGhost onClick={() => setConfirmClose(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={closeDay}>Confirmar cierre</BtnPrimary>
          </>
        ) : (
          <BtnPrimary onClick={() => setConfirmClose(true)}><Lock size={13} /> Cerrar el día</BtnPrimary>
        )}
      </div>
    </div>
  );
}

function EmptyNote({ text }) {
  return <div style={{ fontSize: 13, color: 'var(--ink3)', fontStyle: 'italic', padding: '6px 0' }}>{text}</div>;
}

function MealForm({ onAdd, onCancel }) {
  const [category, setCategory] = useState(MEAL_CATEGORIES[1]);
  const [desc, setDesc] = useState('');
  const [confidence, setConfidence] = useState('media');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  function submit() {
    if (!desc.trim()) return;
    onAdd({
      category, desc: desc.trim(), confidence,
      kcal: kcal === '' ? null : Number(kcal),
      protein: protein === '' ? null : Number(protein),
      carbs: carbs === '' ? null : Number(carbs),
      fat: fat === '' ? null : Number(fat),
    });
  }

  return (
    <div style={{ marginTop: 12, padding: 14, background: 'var(--paper2)', borderRadius: 5, border: '1px dashed var(--rule)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <Label>Categoría</Label>
          <Select value={category} onChange={e => setCategory(e.target.value)}>
            {MEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label>Confianza de la estimación</Label>
          <Select value={confidence} onChange={e => setConfidence(e.target.value)}>
            {CONFIDENCE.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
      </div>
      <Label>Descripción (ingredientes, cocción, porción)</Label>
      <TextInput value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: suprema al horno, papa, batata, tomate" style={{ width: '100%', marginBottom: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
        <div><Label>kcal</Label><NumInput value={kcal} onChange={e => setKcal(e.target.value)} placeholder="opcional" /></div>
        <div><Label>Proteína g</Label><NumInput value={protein} onChange={e => setProtein(e.target.value)} placeholder="opcional" /></div>
        <div><Label>Carbos g</Label><NumInput value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="opcional" /></div>
        <div><Label>Grasas g</Label><NumInput value={fat} onChange={e => setFat(e.target.value)} placeholder="opcional" /></div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <BtnGhost onClick={onCancel}><X size={13} /> Cancelar</BtnGhost>
        <BtnPrimary onClick={submit}><Check size={13} /> Agregar</BtnPrimary>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink3)', marginBottom: 4 }}>{children}</div>;
}

function TrainingSection({ day, date, updateDay }) {
  const [editing, setEditing] = useState(false);
  const t = day.training || { tipo: '', duracion: '', ejercicios: '', kcalActivas: '', fcProm: '', esfuerzo: '', energia: '', dolor: 'No' };
  const [form, setForm] = useState(t);
  useEffect(() => { setForm(day.training || { tipo: '', duracion: '', ejercicios: '', kcalActivas: '', fcProm: '', esfuerzo: '', energia: '', dolor: 'No' }); }, [day.training, date]);

  function save() {
    updateDay(date, { training: form });
    setEditing(false);
  }

  return (
    <Section icon={Dumbbell} title="Entrenamiento" right={!day.closed && <BtnGhost onClick={() => setEditing(e => !e)}>{day.training ? 'Editar' : <><Plus size={13} /> Agregar</>}</BtnGhost>}>
      {!editing && !day.training && <EmptyNote text="Sin entrenamiento registrado — día de descanso o pendiente de carga." />}
      {!editing && day.training && (
        <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
          <div><b style={{ color: 'var(--ink)' }}>{day.training.tipo}</b> {day.training.duracion && `· ${day.training.duracion}`}</div>
          {day.training.ejercicios && <div>Ejercicios: {day.training.ejercicios}</div>}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 4 }}>
            {day.training.kcalActivas != null && day.training.kcalActivas !== '' && `${day.training.kcalActivas} kcal activas (estimado) · `}
            {day.training.fcProm && `FC prom ${day.training.fcProm} · `}
            {day.training.esfuerzo && `esfuerzo ${day.training.esfuerzo}/10 · `}
            {day.training.energia && `energía ${day.training.energia}/10`}
          </div>
          {day.training.dolor && day.training.dolor !== 'No' && <div style={{ color: 'var(--rust)' }}>Dolor/molestia: {day.training.dolor}</div>}
        </div>
      )}
      {editing && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><Label>Tipo</Label><TextInput value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} placeholder="Fuerza + Z2" style={{ width: '100%' }} /></div>
            <div><Label>Duración</Label><TextInput value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })} placeholder="41 min + 30 min" style={{ width: '100%' }} /></div>
          </div>
          <Label>Ejercicios</Label>
          <TextInput value={form.ejercicios} onChange={e => setForm({ ...form, ejercicios: e.target.value })} placeholder="Sentadilla 4x6, remo Gironda 4x6…" style={{ width: '100%', marginBottom: 10 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 10 }}>
            <div><Label>Kcal activas</Label><NumInput value={form.kcalActivas} onChange={e => setForm({ ...form, kcalActivas: e.target.value })} /></div>
            <div><Label>FC promedio</Label><TextInput value={form.fcProm} onChange={e => setForm({ ...form, fcProm: e.target.value })} placeholder="113 / 148" /></div>
            <div><Label>Esfuerzo 1-10</Label><NumInput min="1" max="10" value={form.esfuerzo} onChange={e => setForm({ ...form, esfuerzo: e.target.value })} /></div>
            <div><Label>Energía 1-10</Label><NumInput min="1" max="10" value={form.energia} onChange={e => setForm({ ...form, energia: e.target.value })} /></div>
          </div>
          <Label>Dolor / molestias</Label>
          <TextInput value={form.dolor} onChange={e => setForm({ ...form, dolor: e.target.value })} placeholder="No / detalle" style={{ width: '100%', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <BtnGhost onClick={() => setEditing(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}><Check size={13} /> Guardar</BtnPrimary>
          </div>
        </div>
      )}
    </Section>
  );
}

function SleepSection({ day, date, updateDay }) {
  const [editing, setEditing] = useState(false);
  const s = day.sleep;
  const [h, setH] = useState(s ? Math.floor(s.duration_min / 60) : '');
  const [m, setM] = useState(s ? s.duration_min % 60 : '');
  const [score, setScore] = useState(s?.score ?? '');
  const [wakeEnergy, setWakeEnergy] = useState(s?.wakeEnergy ?? '');
  const [endEnergy, setEndEnergy] = useState(s?.endEnergy ?? '');
  const [vigilia, setVigilia] = useState(s?.phases?.vigilia ?? '');
  const [rem, setRem] = useState(s?.phases?.rem ?? '');
  const [ligero, setLigero] = useState(s?.phases?.ligero ?? '');
  const [profundo, setProfundo] = useState(s?.phases?.profundo ?? '');

  useEffect(() => {
    setH(s ? Math.floor(s.duration_min / 60) : '');
    setM(s ? s.duration_min % 60 : '');
    setScore(s?.score ?? '');
    setWakeEnergy(s?.wakeEnergy ?? '');
    setEndEnergy(s?.endEnergy ?? '');
    setVigilia(s?.phases?.vigilia ?? '');
    setRem(s?.phases?.rem ?? '');
    setLigero(s?.phases?.ligero ?? '');
    setProfundo(s?.phases?.profundo ?? '');
  }, [day.sleep, date]);

  function save() {
    const hasPhases = vigilia !== '' || rem !== '' || ligero !== '' || profundo !== '';
    updateDay(date, {
      sleep: {
        duration_min: hmToMin(h, m),
        score: score === '' ? null : Number(score),
        wakeEnergy: wakeEnergy === '' ? null : Number(wakeEnergy),
        endEnergy: endEnergy === '' ? null : Number(endEnergy),
        phases: hasPhases ? {
          vigilia: vigilia === '' ? null : Number(vigilia),
          rem: rem === '' ? null : Number(rem),
          ligero: ligero === '' ? null : Number(ligero),
          profundo: profundo === '' ? null : Number(profundo),
        } : null,
      },
    });
    setEditing(false);
  }

  return (
    <Section icon={Moon} title="Sueño" right={!day.closed && <BtnGhost onClick={() => setEditing(e => !e)}>{s ? 'Editar' : <><Plus size={13} /> Agregar</>}</BtnGhost>}>
      {!editing && !s && <EmptyNote text="Sin dato de sueño para este día." />}
      {!editing && s && (
        <div style={{ fontSize: 13, color: 'var(--ink2)', fontFamily: 'var(--font-mono)' }}>
          <div>
            {minToHM(s.duration_min)} · puntuación {s.score ?? '—'} {s.wakeEnergy != null && `· energía al despertar ${s.wakeEnergy}/10`} {s.endEnergy != null && `· energía al final del día ${s.endEnergy}/10`}
          </div>
          {s.phases && (
            <div style={{ marginTop: 4, color: 'var(--ink3)' }}>
              Vigilia {s.phases.vigilia ?? '—'}% · REM {s.phases.rem ?? '—'}% · Ligero {s.phases.ligero ?? '—'}% · Profundo {s.phases.profundo ?? '—'}%
            </div>
          )}
        </div>
      )}
      {editing && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            <div><Label>Horas</Label><NumInput value={h} onChange={e => setH(e.target.value)} /></div>
            <div><Label>Minutos</Label><NumInput value={m} onChange={e => setM(e.target.value)} /></div>
            <div><Label>Puntuación reloj</Label><NumInput value={score} onChange={e => setScore(e.target.value)} /></div>
            <div><Label>Energía despertar 1-10</Label><NumInput value={wakeEnergy} onChange={e => setWakeEnergy(e.target.value)} /></div>
          </div>
          <Label>Fases de sueño (%)</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            <div><Label>Vigilia</Label><NumInput value={vigilia} onChange={e => setVigilia(e.target.value)} /></div>
            <div><Label>REM</Label><NumInput value={rem} onChange={e => setRem(e.target.value)} /></div>
            <div><Label>Ligero</Label><NumInput value={ligero} onChange={e => setLigero(e.target.value)} /></div>
            <div><Label>Profundo</Label><NumInput value={profundo} onChange={e => setProfundo(e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <BtnGhost onClick={() => setEditing(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}><Check size={13} /> Guardar</BtnPrimary>
          </div>
        </div>
      )}
    </Section>
  );
}

function ActivitySection({ day, date, updateDay }) {
  const [editing, setEditing] = useState(false);
  const a = day.activity;
  const [steps, setSteps] = useState(a?.steps ?? '');
  const [activeKcal, setActiveKcal] = useState(a?.activeKcal ?? '');
  const [restKcal, setRestKcal] = useState(a?.restKcal ?? '');

  useEffect(() => {
    setSteps(a?.steps ?? ''); setActiveKcal(a?.activeKcal ?? ''); setRestKcal(a?.restKcal ?? '');
  }, [day.activity, date]);

  function save() {
    updateDay(date, { activity: { steps: steps === '' ? null : Number(steps), activeKcal: activeKcal === '' ? null : Number(activeKcal), restKcal: restKcal === '' ? null : Number(restKcal) } });
    setEditing(false);
  }
  const total = (a?.activeKcal != null && a?.restKcal != null) ? a.activeKcal + a.restKcal : null;

  return (
    <Section title="Actividad (Apple Watch)" right={!day.closed && <BtnGhost onClick={() => setEditing(e => !e)}>{a ? 'Editar' : <><Plus size={13} /> Agregar</>}</BtnGhost>}>
      {!editing && !a && <EmptyNote text="Sin datos de actividad del reloj para este día." />}
      {!editing && a && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink2)' }}>
          {a.steps != null && `${a.steps.toLocaleString('es-AR')} pasos · `}
          {a.activeKcal != null && `${a.activeKcal} kcal activas · `}
          {a.restKcal != null && `${a.restKcal} kcal en reposo`}
          {total != null && <div style={{ marginTop: 4, color: 'var(--ink3)' }}>Gasto total estimado: ≈{total} kcal (estimación del reloj, no medición exacta)</div>}
        </div>
      )}
      {editing && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
            <div><Label>Pasos</Label><NumInput value={steps} onChange={e => setSteps(e.target.value)} /></div>
            <div><Label>Kcal activas</Label><NumInput value={activeKcal} onChange={e => setActiveKcal(e.target.value)} /></div>
            <div><Label>Kcal en reposo</Label><NumInput value={restKcal} onChange={e => setRestKcal(e.target.value)} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <BtnGhost onClick={() => setEditing(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}><Check size={13} /> Guardar</BtnPrimary>
          </div>
        </div>
      )}
    </Section>
  );
}

// ---------- TIEMPO ----------
const SLEEP_CATEGORY = { key: 'sueño', label: 'Sueño', color: 'var(--indigo)' };

function TiempoTab({ allDays, timeUse, persistTimeUse }) {
  const displayCategories = [...TIME_CATEGORIES, SLEEP_CATEGORY];
  const sortedTimeDates = useMemo(() => Object.keys(timeUse).sort(), [timeUse]);
  const minDate = sortedTimeDates[0] || todayArg();
  const maxDate = sortedTimeDates[sortedTimeDates.length - 1] || todayArg();
  const [from, setFrom] = useState(minDate);
  const [to, setTo] = useState(maxDate);
  useEffect(() => { setFrom(minDate); setTo(maxDate); }, [minDate, maxDate]); // eslint-disable-line

  const filteredDates = useMemo(
    () => sortedTimeDates.filter(d => d >= from && d <= to),
    [sortedTimeDates, from, to]
  );

  function sleepHours(d) {
    return allDays[d]?.sleep ? Math.round((allDays[d].sleep.duration_min / 60) * 100) / 100 : null;
  }
  function getHours(d, key) {
    if (key === 'sueño') return sleepHours(d);
    return timeUse[d]?.[key] || 0;
  }

  const chartData = filteredDates.map(d => {
    const entry = { date: fmtShort(d) };
    displayCategories.forEach(c => { entry[c.key] = Math.round((getHours(d, c.key) || 0) * 100) / 100; });
    return entry;
  });

  const totals = {};
  displayCategories.forEach(c => { totals[c.key] = 0; });
  filteredDates.forEach(d => { displayCategories.forEach(c => { totals[c.key] += (getHours(d, c.key) || 0); }); });
  const grandTotal = displayCategories.reduce((a, c) => a + totals[c.key], 0);
  const sleepValues = filteredDates.map(d => allDays[d]?.sleep?.duration_min).filter(v => v != null);
  const avgSleepH = sleepValues.length ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length / 60) * 10) / 10 : null;

  return (
    <div>
      <Section title="Rango de fechas">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><Label>Desde</Label><TextInput type="date" value={from} min={minDate} max={to} onChange={e => setFrom(e.target.value)} /></div>
          <div><Label>Hasta</Label><TextInput type="date" value={to} min={from} max={maxDate} onChange={e => setTo(e.target.value)} /></div>
          <BtnGhost onClick={() => { setFrom(minDate); setTo(maxDate); }}>Todo</BtnGhost>
        </div>
        {sortedTimeDates.length === 0 && <div style={{ marginTop: 10 }}><EmptyNote text="Todavía no hay datos de uso del tiempo cargados." /></div>}
      </Section>

      {chartData.length > 0 && (
        <Section
          icon={Clock}
          title="Horas por categoría, incluido sueño"
          right={avgSleepH != null && <Badge tone={avgSleepH >= 7 ? 'good' : 'warn'}>sueño promedio {avgSleepH} h</Badge>}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
              <YAxis domain={[0, 24]} tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} label={{ value: 'hs / día', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--ink3)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} />
              {displayCategories.map(c => (
                <Bar key={c.key} dataKey={c.key} name={c.label} stackId="cat" fill={c.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 8, fontStyle: 'italic' }}>
            Bloque de sueño incluido en la pila junto al resto de las categorías, para ver de un vistazo cómo se reparten las 24h del día.
          </div>
        </Section>
      )}

      <Section title="Totales del período">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
          {[...displayCategories].sort((a, b) => totals[b.key] - totals[a.key]).map(c => (
            <div key={c.key} style={{ borderLeft: `3px solid ${c.color}`, paddingLeft: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink3)', letterSpacing: '0.04em' }}>{c.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
                {Math.round(totals[c.key] * 10) / 10}h
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink3)' }}>
                {grandTotal > 0 ? Math.round((totals[c.key] / grandTotal) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Detalle por día">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--ink3)', textTransform: 'uppercase', fontSize: 10.5 }}>Fecha</th>
                {displayCategories.map(c => <th key={c.key} style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--ink3)', textTransform: 'uppercase', fontSize: 10.5 }}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...filteredDates].reverse().map(d => (
                <tr key={d} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '6px 8px' }}>{fmtShort(d)}</td>
                  {displayCategories.map(c => {
                    const v = getHours(d, c.key);
                    return <td key={c.key} style={{ padding: '6px 8px', textAlign: 'right' }}>{v ? `${Math.round(v * 100) / 100}h` : '—'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 10, fontStyle: 'italic' }}>
          Horas clasificadas a mano junto con Claude a partir de Google Calendar (Natación, Trabajo, y el calendario externo de reuniones de La Caja). Se actualiza semana a semana por chat.
        </div>
      </Section>
    </div>
  );
}

// ---------- HISTORIAL ----------
function HistorialTab({ allDays, sortedDates, targets }) {
  const minDate = sortedDates[0] || todayArg();
  const maxDate = sortedDates[sortedDates.length - 1] || todayArg();
  const [from, setFrom] = useState(minDate);
  const [to, setTo] = useState(maxDate);

  // keep filter range valid as new days get added
  useEffect(() => { if (to < maxDate && to === minDate) setTo(maxDate); }, [maxDate]); // eslint-disable-line

  const filteredDates = useMemo(
    () => sortedDates.filter(d => d >= from && d <= to),
    [sortedDates, from, to]
  );

  const measureRows = filteredDates.filter(d => allDays[d].measurements).map(d => ({ date: d, ...allDays[d].measurements }));
  const measureSeries = measureRows.map(r => ({ date: fmtShort(r.date), weight: r.weight, waist: r.waist, hip: r.hip }));

  const kcalSeries = filteredDates.map(d => {
    const day = allDays[d];
    const totals = getDayTotals(day);
    const target = day.trainingDay ? targets.training : targets.rest;
    return { date: fmtShort(d), kcal: totals ? Math.round(totals.kcal) : null, protein: totals ? Math.round(totals.protein) : null, min: target.kcal[0], max: target.kcal[1], trainingDay: day.trainingDay };
  }).filter(x => x.kcal != null);
  const sleepSeries = filteredDates.filter(d => allDays[d].sleep).map(d => ({ date: fmtShort(d), horas: Math.round((allDays[d].sleep.duration_min / 60) * 10) / 10 }));

  const weeklyTraining = useMemo(() => {
    const byWeek = {};
    filteredDates.forEach(d => {
      const day = allDays[d];
      if (day.trainingDay) {
        const wk = getMonday(d);
        byWeek[wk] = (byWeek[wk] || 0) + 1;
      } else if (!(getMonday(d) in byWeek)) {
        byWeek[getMonday(d)] = byWeek[getMonday(d)] || 0;
      }
    });
    return Object.keys(byWeek).sort().map(wk => ({ week: `Sem. ${fmtShort(wk)}`, sesiones: byWeek[wk] }));
  }, [allDays, filteredDates]);

  const avg = arr => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  const avgKcal = avg(kcalSeries.map(x => x.kcal));
  const avgProtein = avg(kcalSeries.map(x => x.protein).filter(v => v != null));
  const avgSleep = avg(sleepSeries.map(x => x.horas));
  const totalSessions = filteredDates.filter(d => allDays[d].trainingDay).length;

  const gastoSeries = filteredDates
    .filter(d => allDays[d].activity && allDays[d].activity.activeKcal != null && allDays[d].activity.restKcal != null)
    .map(d => ({ date: fmtShort(d), gasto: Math.round(allDays[d].activity.activeKcal + allDays[d].activity.restKcal) }));
  const avgGasto = avg(gastoSeries.map(g => g.gasto));

  const balanceSeries = filteredDates
    .map(d => {
      const day = allDays[d];
      const totals = getDayTotals(day);
      if (!totals || !day.activity || day.activity.activeKcal == null || day.activity.restKcal == null) return null;
      const gasto = day.activity.activeKcal + day.activity.restKcal;
      return { date: fmtShort(d), balance: Math.round(totals.kcal - gasto) };
    })
    .filter(Boolean);
  const avgBalance = avg(balanceSeries.map(b => b.balance));
  function balanceLabel(v) {
    if (v == null) return null;
    if (v <= -100) return 'déficit';
    if (v >= 100) return 'superávit';
    return 'mantenimiento';
  }
  function balanceColor(v) {
    if (v <= -100) return 'var(--moss)';
    if (v >= 100) return 'var(--rust)';
    return 'var(--steel)';
  }

  const firstMeasure = measureRows[0];
  const lastMeasure = measureRows[measureRows.length - 1];
  function delta(key) {
    if (!firstMeasure || !lastMeasure || firstMeasure[key] == null || lastMeasure[key] == null) return null;
    const d = Math.round((lastMeasure[key] - firstMeasure[key]) * 10) / 10;
    return d;
  }
  const wDelta = delta('weight'), waDelta = delta('waist'), hDelta = delta('hip');
  function deltaBadge(d, unit) {
    if (d == null) return null;
    const tone = d < 0 ? 'good' : d > 0 ? 'warn' : 'neutral';
    return <Badge tone={tone}>{d > 0 ? '+' : ''}{d}{unit}</Badge>;
  }

  return (
    <div>
      <Section title="Rango de fechas">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><Label>Desde</Label><TextInput type="date" value={from} min={minDate} max={to} onChange={e => setFrom(e.target.value)} /></div>
          <div><Label>Hasta</Label><TextInput type="date" value={to} min={from} max={maxDate} onChange={e => setTo(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
            <BtnGhost onClick={() => { setFrom(minDate); setTo(maxDate); }}>Todo</BtnGhost>
            <BtnGhost onClick={() => { setFrom(addDays(maxDate, -6) < minDate ? minDate : addDays(maxDate, -6)); setTo(maxDate); }}>Últimos 7 días</BtnGhost>
            <BtnGhost onClick={() => { setFrom(addDays(maxDate, -29) < minDate ? minDate : addDays(maxDate, -29)); setTo(maxDate); }}>Últimos 30 días</BtnGhost>
          </div>
        </div>
      </Section>

      {measureRows.length > 0 && (
        <Section
          icon={Ruler}
          title="Peso, cintura y cadera"
          right={
            <div style={{ display: 'flex', gap: 6 }}>
              {deltaBadge(wDelta, ' kg')}
              {deltaBadge(waDelta, ' cm')}
              {deltaBadge(hDelta, ' cm')}
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 16 }}>
            <MiniStat label="Peso actual" value={lastMeasure?.weight != null ? `${lastMeasure.weight} kg` : '—'} tone="neutral" />
            <MiniStat label="Cintura actual" value={lastMeasure?.waist != null ? `${lastMeasure.waist} cm` : '—'} tone="neutral" />
            <MiniStat label="Cadera actual" value={lastMeasure?.hip != null ? `${lastMeasure.hip} cm` : '—'} tone="neutral" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={measureSeries} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} />
              <Line yAxisId="l" type="monotone" dataKey="weight" name="Peso (kg)" stroke="var(--ochre)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line yAxisId="l" type="monotone" dataKey="waist" name="Cintura (cm)" stroke="var(--steel)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line yAxisId="l" type="monotone" dataKey="hip" name="Cadera (cm)" stroke="var(--moss)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 8, fontStyle: 'italic' }}>
            Variación calculada entre la primera y la última medición del rango seleccionado.
          </div>
        </Section>
      )}

      <Section
        icon={Utensils}
        title="Calorías diarias vs. objetivo"
        right={avgKcal != null && <Badge tone="neutral">promedio {avgKcal} kcal</Badge>}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={kcalSeries} margin={{ left: -10, right: 10 }}>
            <CartesianGrid stroke="var(--rule)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            {avgKcal != null && <ReferenceLine y={avgKcal} stroke="var(--ink3)" strokeDasharray="3 3" />}
            <Bar dataKey="kcal" radius={[3, 3, 0, 0]}>
              {kcalSeries.map((e, i) => {
                let color = 'var(--moss)';
                if (e.kcal < e.min) color = 'var(--steel)';
                else if (e.kcal > e.max) color = 'var(--rust)';
                return <Cell key={i} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink3)' }}>
          <LegendDot color="var(--steel)" label="bajo el rango" />
          <LegendDot color="var(--moss)" label="dentro del rango" />
          <LegendDot color="var(--rust)" label="sobre el rango" />
          {avgProtein != null && <span>· proteína promedio: {avgProtein} g</span>}
        </div>
      </Section>

      {sleepSeries.length > 0 && (
        <Section
          icon={Moon}
          title="Horas de sueño"
          right={avgSleep != null && <Badge tone={avgSleep >= 7 ? 'good' : 'warn'}>promedio {avgSleep} h</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sleepSeries} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={7} stroke="var(--ochre)" strokeDasharray="4 3" label={{ value: 'piso 7h', fontSize: 10, fill: 'var(--ochre)', position: 'insideTopRight' }} />
              <Bar dataKey="horas" fill="var(--steel)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      <Section
        icon={Dumbbell}
        title="Sesiones de entrenamiento por semana"
        right={<Badge tone="neutral">{totalSessions} en el rango</Badge>}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyTraining} margin={{ left: -10, right: 10 }}>
            <CartesianGrid stroke="var(--rule)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <ReferenceLine y={4} stroke="var(--ochre)" strokeDasharray="4 3" label={{ value: 'meta: 4', fontSize: 10, fill: 'var(--ochre)', position: 'insideTopRight' }} />
            <Bar dataKey="sesiones" fill="var(--ochre)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {gastoSeries.length > 0 && (
        <Section
          title="Gasto diario de actividad (Apple Watch)"
          right={avgGasto != null && <Badge tone="neutral">promedio {avgGasto} kcal/día</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gastoSeries} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              {avgGasto != null && <ReferenceLine y={avgGasto} stroke="var(--ink3)" strokeDasharray="3 3" />}
              <Bar dataKey="gasto" fill="var(--ochre)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 8, fontStyle: 'italic' }}>
            Suma de "energía en reposo" + "energía de actividad" que reporta el reloj — es una estimación del reloj, no una medición exacta.
          </div>
        </Section>
      )}

      {balanceSeries.length > 0 && (
        <Section
          title="Balance calórico (consumo − gasto)"
          right={avgBalance != null && <Badge tone={avgBalance <= -100 ? 'good' : avgBalance >= 100 ? 'warn' : 'neutral'}>promedio {avgBalance > 0 ? '+' : ''}{avgBalance} kcal ({balanceLabel(avgBalance)})</Badge>}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={balanceSeries} margin={{ left: -10, right: 10 }}>
              <CartesianGrid stroke="var(--rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: 'var(--ink3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={0} stroke="var(--ink)" />
              <Bar dataKey="balance" radius={[3, 3, 0, 0]}>
                {balanceSeries.map((e, i) => <Cell key={i} fill={balanceColor(e.balance)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink3)' }}>
            <LegendDot color="var(--moss)" label="déficit (< -100 kcal)" />
            <LegendDot color="var(--steel)" label="mantenimiento (±100 kcal)" />
            <LegendDot color="var(--rust)" label="superávit (> +100 kcal)" />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 6, fontStyle: 'italic' }}>
            Calorías consumidas (comida) menos gasto total estimado por el reloj. Solo incluye días con ambos datos cargados.
          </div>
        </Section>
      )}

      <Section title="Tabla de días registrados">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                {['Fecha', 'Tipo', 'Kcal', 'Prot.', 'Sueño', 'Pasos', 'Estado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--ink3)', textTransform: 'uppercase', fontSize: 10.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filteredDates].reverse().map(d => {
                const day = allDays[d];
                const totals = getDayTotals(day);
                return (
                  <tr key={d} style={{ borderBottom: '1px solid var(--rule)' }}>
                    <td style={{ padding: '6px 8px' }}>{fmtShort(d)}</td>
                    <td style={{ padding: '6px 8px' }}>{day.trainingDay == null ? '—' : day.trainingDay ? 'Entren.' : 'Descanso'}</td>
                    <td style={{ padding: '6px 8px' }}>{totals ? Math.round(totals.kcal) + (totals.estimated ? '≈' : '') : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{totals ? Math.round(totals.protein) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{day.sleep ? minToHM(day.sleep.duration_min) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{day.activity?.steps ?? '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{day.closed ? 'Cerrado' : 'Abierto'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function LegendDot({ color, label }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />{label}</span>;
}

// ---------- CUMPLIMIENTO ----------
function CumplimientoTab({ allDays, closedDates, targets }) {
  const weeks = useMemo(() => {
    const map = {};
    closedDates.forEach(d => {
      const wk = getMonday(d);
      if (!map[wk]) map[wk] = [];
      map[wk].push(d);
    });
    return Object.keys(map).sort().reverse().map(wk => ({ week: wk, dates: map[wk] }));
  }, [closedDates]);

  function computeWeek(dates) {
    const scores = { kcal: [], protein: [], carbs: [], fat: [] };
    let trainingCount = 0, sleepMinutes = [], overall = [];
    dates.forEach(d => {
      const day = allDays[d];
      const totals = getDayTotals(day);
      const target = day.trainingDay ? targets.training : targets.rest;
      if (totals) {
        ['kcal', 'protein', 'carbs', 'fat'].forEach(k => {
          const p = pctRange(totals[k], target[k]);
          if (p != null) scores[k].push(p);
        });
        const s = dayComplianceScore(day, targets);
        if (s != null) overall.push(s);
      }
      if (day.trainingDay) trainingCount++;
      if (day.sleep) sleepMinutes.push(day.sleep.duration_min);
    });
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    const sleepAvgMin = sleepMinutes.length ? Math.round(sleepMinutes.reduce((a, b) => a + b, 0) / sleepMinutes.length) : null;
    return {
      kcal: avg(scores.kcal), protein: avg(scores.protein), carbs: avg(scores.carbs), fat: avg(scores.fat),
      overall: avg(overall), trainingCount, trainingPct: Math.min(100, Math.round((trainingCount / 4) * 100)),
      sleepAvgMin, sleepPct: sleepAvgMin ? Math.min(100, Math.round((sleepAvgMin / 420) * 100)) : null,
      nDays: dates.length,
    };
  }

  const allTime = computeWeek(closedDates);

  return (
    <div>
      <Section title="Cumplimiento general (todos los días cerrados)" right={<Badge tone={allTime.overall >= 90 ? 'good' : allTime.overall >= 70 ? 'warn' : 'bad'}>{allTime.overall != null ? `${allTime.overall}%` : 'sin datos'}</Badge>}>
        <ComplianceGrid stats={allTime} />
      </Section>

      {weeks.map(({ week, dates }) => {
        const stats = computeWeek(dates);
        return (
          <Section
            key={week}
            title={`Semana del ${fmtShort(week)}`}
            right={<Badge tone={stats.overall >= 90 ? 'good' : stats.overall >= 70 ? 'warn' : 'bad'}>{stats.overall != null ? `${stats.overall}%` : 'sin datos'}</Badge>}
          >
            <ComplianceGrid stats={stats} />
          </Section>
        );
      })}

      {weeks.length === 0 && <EmptyNote text="Todavía no hay semanas cerradas para evaluar cumplimiento." />}
    </div>
  );
}

function ComplianceGrid({ stats }) {
  const items = [
    { label: 'Calorías', value: stats.kcal },
    { label: 'Proteína', value: stats.protein },
    { label: 'Carbohidratos', value: stats.carbs },
    { label: 'Grasas', value: stats.fat },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 14 }}>
        {items.map(it => (
          <MiniStat key={it.label} label={it.label} value={it.value != null ? `${it.value}%` : '—'} tone={it.value == null ? 'neutral' : it.value >= 90 ? 'good' : it.value >= 70 ? 'warn' : 'bad'} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        <MiniStat label="Entrenamientos" value={`${stats.trainingCount} / 4`} tone={stats.trainingCount >= 4 ? 'good' : stats.trainingCount >= 2 ? 'warn' : 'bad'} />
        <MiniStat label="Sueño promedio" value={stats.sleepAvgMin ? minToHM(stats.sleepAvgMin) : '—'} tone={stats.sleepPct == null ? 'neutral' : stats.sleepPct >= 100 ? 'good' : stats.sleepPct >= 88 ? 'warn' : 'bad'} />
        <MiniStat label="Días evaluados" value={stats.nDays} tone="neutral" />
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const colors = { good: 'var(--moss)', warn: 'var(--ochre)', bad: 'var(--rust)', neutral: 'var(--ink)' };
  return (
    <div style={{ borderLeft: `3px solid ${colors[tone]}`, paddingLeft: 10 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink3)', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

// ---------- MEDIDAS ----------
function MedidasTab({ allDays, sortedDates, updateDay }) {
  const [date, setDate] = useState(todayArg());
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');

  const rows = sortedDates.filter(d => allDays[d].measurements).map(d => ({ date: d, ...allDays[d].measurements }));

  function submit() {
    if (!weight && !waist && !hip) return;
    const existing = allDays[date] || { date, trainingDay: null, closed: false, meals: [], training: null, sleep: null, activity: null, estimatedTotals: null, note: '' };
    updateDay(date, {
      ...existing,
      measurements: {
        weight: weight === '' ? null : Number(weight),
        waist: waist === '' ? null : Number(waist),
        hip: hip === '' ? null : Number(hip),
      },
    });
    setWeight(''); setWaist(''); setHip('');
  }

  const weekday = weekdayEs(date);
  const isMonday = new Date(date + 'T12:00:00').getDay() === 1;

  return (
    <div>
      <Section icon={Ruler} title="Registrar medición">
        <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginBottom: 12 }}>
          Protocolo: al levantarse, después del baño, antes de comer, misma balanza y ropa similar. Cintura a la altura del ombligo; cadera en la parte más ancha de los glúteos.
          {!isMonday && <span style={{ color: 'var(--ochre)' }}> — hoy es {weekday.toLowerCase()}; el protocolo pide medir los lunes.</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
          <div><Label>Fecha</Label><TextInput type="date" value={date} max={todayArg()} onChange={e => setDate(e.target.value)} /></div>
          <div><Label>Peso (kg)</Label><NumInput value={weight} onChange={e => setWeight(e.target.value)} placeholder="77.30" /></div>
          <div><Label>Cintura (cm)</Label><NumInput value={waist} onChange={e => setWaist(e.target.value)} placeholder="93" /></div>
          <div><Label>Cadera (cm)</Label><NumInput value={hip} onChange={e => setHip(e.target.value)} placeholder="108" /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <BtnPrimary onClick={submit}><Check size={13} /> Guardar medición</BtnPrimary>
        </div>
      </Section>

      <Section title="Historial de mediciones">
        {rows.length === 0 ? <EmptyNote text="Sin mediciones cargadas." /> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink)' }}>
                {['Fecha', 'Peso', 'Cintura', 'Cadera'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--ink3)', textTransform: 'uppercase', fontSize: 10.5 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...rows].reverse().map(r => (
                <tr key={r.date} style={{ borderBottom: '1px solid var(--rule)' }}>
                  <td style={{ padding: '6px 8px' }}>{fmtLong(r.date)}</td>
                  <td style={{ padding: '6px 8px' }}>{r.weight != null ? `${r.weight} kg` : '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.waist != null ? `${r.waist} cm` : '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{r.hip != null ? `${r.hip} cm` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 10, fontStyle: 'italic' }}>
          Se necesitan al menos 4–8 semanas de mediciones para evaluar una tendencia real. Un solo cambio no confirma ganancia ni pérdida de grasa.
        </div>
      </Section>
    </div>
  );
}

// ---------- AJUSTES ----------
function ImportSection({ allDays, persistDays }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null); // {type:'ok'|'error', msg}

  function apply() {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setStatus({ type: 'error', msg: 'JSON inválido — revisá que esté completo y bien copiado.' });
      return;
    }
    const entries = parsed.date ? { [parsed.date]: parsed } : parsed;
    const dates = Object.keys(entries);
    if (dates.length === 0) {
      setStatus({ type: 'error', msg: 'No encontré ninguna fecha en el JSON.' });
      return;
    }
    const next = { ...allDays };
    dates.forEach(d => {
      const incoming = entries[d];
      const existing = next[d] || {};
      next[d] = {
        date: d,
        trainingDay: incoming.trainingDay ?? existing.trainingDay ?? null,
        closed: incoming.closed ?? existing.closed ?? false,
        meals: incoming.meals ?? existing.meals ?? [],
        training: incoming.training ?? existing.training ?? null,
        sleep: incoming.sleep ?? existing.sleep ?? null,
        measurements: incoming.measurements ?? existing.measurements ?? null,
        activity: incoming.activity ?? existing.activity ?? null,
        estimatedTotals: incoming.estimatedTotals ?? existing.estimatedTotals ?? null,
        note: incoming.note ?? existing.note ?? '',
      };
      // ensure meal ids
      next[d].meals = (next[d].meals || []).map(m => ({ id: m.id || uid(), ...m }));
    });
    persistDays(next);
    setStatus({ type: 'ok', msg: `Importado: ${dates.join(', ')}. Ya podés verlo en la pestaña Hoy o Historial.` });
    setText('');
  }

  return (
    <Section title="Importar registro del chat (JSON)">
      <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginBottom: 10 }}>
        Pegá acá el bloque JSON de un día que te haya armado Claude en el chat. Se combina con lo que ya tengas cargado para esa fecha (no borra lo demás).
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder='{"date":"2026-07-23","trainingDay":false,"meals":[...],"sleep":{...}}'
        className="lg-input"
        style={{ width: '100%', minHeight: 110, fontFamily: 'var(--font-mono)', fontSize: 12 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: status?.type === 'error' ? 'var(--rust)' : 'var(--moss)' }}>{status?.msg}</div>
        <BtnPrimary onClick={apply}><Check size={13} /> Importar</BtnPrimary>
      </div>
    </Section>
  );
}

function AjustesTab({ targets, persistTargets, allDays, persistDays }) {
  const [form, setForm] = useState(targets);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { setForm(targets); }, [targets]);

  function setRange(group, key, idx, val) {
    const next = { ...form, [group]: { ...form[group], [key]: form[group][key].map((v, i) => i === idx ? Number(val) : v) } };
    setForm(next);
  }
  function save() { persistTargets(form); }

  async function resetAll() {
    await persistDays(SEED_DAYS);
    await persistTargets(DEFAULT_TARGETS);
    setConfirmReset(false);
  }

  const rangeFields = [
    { key: 'kcal', label: 'Calorías (kcal)' },
    { key: 'protein', label: 'Proteína (g)' },
    { key: 'carbs', label: 'Carbohidratos (g)' },
    { key: 'fat', label: 'Grasas (g)' },
    { key: 'fiber', label: 'Fibra (g)' },
  ];

  return (
    <div>
      {['training', 'rest'].map(group => (
        <Section key={group} title={group === 'training' ? 'Objetivos — días de entrenamiento' : 'Objetivos — días sin entrenamiento'}>
          <div style={{ display: 'grid', gap: 10 }}>
            {rangeFields.map(f => (
              <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 20px 1fr', alignItems: 'center', gap: 8 }}>
                <Label>{f.label}</Label>
                <NumInput value={form[group][f.key][0]} onChange={e => setRange(group, f.key, 0, e.target.value)} />
                <span style={{ textAlign: 'center', color: 'var(--ink3)' }}>–</span>
                <NumInput value={form[group][f.key][1]} onChange={e => setRange(group, f.key, 1, e.target.value)} />
              </div>
            ))}
          </div>
        </Section>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <BtnPrimary onClick={save}><Check size={13} /> Guardar objetivos</BtnPrimary>
      </div>

      <ImportSection allDays={allDays} persistDays={persistDays} />

      <Section title="Recordatorios del protocolo">
        <ul style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.8, paddingLeft: 18, margin: 0 }}>
          <li>No bajar calorías de forma agresiva ni celebrar déficits de 800–1.000 kcal como algo habitual.</li>
          <li>No compensar una comida social salteando comidas ni "castigar" el día siguiente.</li>
          <li>Prioridad diaria: proteína suficiente → verduras/frutas → energía para entrenar y trabajar → déficit moderado en promedio semanal.</li>
          <li>En restaurantes o comidas compartidas, usar rangos — nunca una cifra exacta.</li>
          <li>Un día no cierra hasta confirmarlo explícitamente; una vez cerrado, se congela.</li>
        </ul>
      </Section>

      <Section title="Datos" right={
        confirmReset ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnGhost onClick={() => setConfirmReset(false)}>Cancelar</BtnGhost>
            <button onClick={resetAll} className="lg-btn-danger">Confirmar reinicio</button>
          </div>
        ) : <BtnGhost onClick={() => setConfirmReset(true)}><RotateCcw size={13} /> Reiniciar a datos originales</BtnGhost>
      }>
        <div style={{ fontSize: 12.5, color: 'var(--ink3)' }}>
          Los datos se guardan de forma persistente en este dispositivo/navegador. Reiniciar borra todo lo cargado y vuelve a dejar únicamente los registros históricos del documento de traspaso (14/07 al 22/07).
        </div>
      </Section>
    </div>
  );
}

// ---------- styles ----------
const rootStyle = {
  background: 'var(--paper2)', minHeight: '100vh', color: 'var(--ink)',
  fontFamily: 'var(--font-body)',
};

const tooltipStyle = {
  background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 4,
  fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink)',
};

const globalCss = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
:root {
  --paper: #F7F5F0;
  --paper2: #EFEBE1;
  --ink: #22303F;
  --ink2: #4A5A68;
  --ink3: #8B9199;
  --rule: #D8D2C4;
  --ochre: #B2791F;
  --moss: #5C7A4C;
  --rust: #B0512E;
  --steel: #4C6E8A;
  --violet: #6B5B95;
  --sidehustle: #8A9B4E;
  --blue2: #3E6E9E;
  --teal: #3F8F86;
  --pink: #C97B92;
  --indigo: #4B5A7A;
  --font-display: 'Source Serif 4', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;
}
.lg-input {
  font-family: var(--font-body);
  font-size: 13px;
  padding: 7px 9px;
  border: 1px solid var(--rule);
  border-radius: 4px;
  background: var(--paper);
  color: var(--ink);
  outline: none;
}
.lg-input:focus { border-color: var(--ochre); }
.lg-input:disabled { color: var(--ink3); background: var(--paper2); }
.lg-num { font-family: var(--font-mono); }
.lg-btn-primary {
  display: flex; align-items: center; gap: 6px;
  background: var(--ink); color: var(--paper);
  border: none; border-radius: 4px; padding: 8px 14px;
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em;
  cursor: pointer; text-transform: uppercase; font-weight: 600;
}
.lg-btn-primary:hover { background: var(--ochre); }
.lg-btn-ghost {
  display: flex; align-items: center; gap: 6px;
  background: transparent; color: var(--ink2);
  border: 1px solid var(--rule); border-radius: 4px; padding: 7px 12px;
  font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em;
  cursor: pointer; text-transform: uppercase;
}
.lg-btn-ghost:hover { border-color: var(--ochre); color: var(--ochre); }
.lg-btn-danger {
  background: var(--rust); color: var(--paper); border: none; border-radius: 4px;
  padding: 8px 14px; font-family: var(--font-mono); font-size: 12px; cursor: pointer; text-transform: uppercase;
}
table { font-variant-numeric: tabular-nums; }
input[type="date"]::-webkit-calendar-picker-indicator { filter: opacity(0.6); }
`;
