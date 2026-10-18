import { connection } from 'next/server';
import { Suspense } from 'react';
import { getDay, getPreviousMeasurement } from '@/lib/data';
import { fmtLong, isValidDate, todayAR, weekdayIdx } from '@/lib/dates';
import { PageHeader } from '@/components/ui';
import { Cargar, type MealOption } from './cargar';

export default function CargarPage({ searchParams }: PageProps<'/cargar'>) {
  return (
    <div className="space-y-4">
      <PageHeader title="Cargar" subtitle="Comidas, sueño, entreno, actividad y medidas" />
      <Suspense fallback={<p className="p-6 text-ink-2">Cargando…</p>}>
        <CargarData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CargarData({ searchParams }: Pick<PageProps<'/cargar'>, 'searchParams'>) {
  await connection(); // dinámica desde el principio: usa la fecha de hoy y la sesión
  const sp = await searchParams;
  const today = todayAR();
  const date = isValidDate(sp.fecha) && sp.fecha <= today ? sp.fecha : today;
  const [day, prevMeas] = await Promise.all([getDay(date), getPreviousMeasurement(date)]);
  const meals: MealOption[] = (day?.meals ?? []).map((m) => ({
    chatId: m.chatId, category: m.category, desc: m.desc, confidence: m.confidence,
    kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat, fiber: m.fiber,
    puntaje: m.calidadPuntaje, ultraprocesado: m.calidadUltraprocesado, beneficios: m.calidadBeneficios,
  }));
  const editar = typeof sp.editar === 'string' ? sp.editar : null;
  const tab = typeof sp.tab === 'string' ? sp.tab : editar ? 'comida' : 'chat';

  return (
    <Cargar
      key={`${date}-${editar ?? ''}`}
      date={date}
      today={today}
      dateLabel={fmtLong(date)}
      closed={!!day?.closed}
      trainingDay={day?.trainingDay ?? null}
      meals={meals}
      editChatId={editar && meals.some((m) => m.chatId === editar) ? editar : null}
      initialTab={tab}
      isMonday={weekdayIdx(date) === 0}
      hasMeasurement={!!day?.measurements}
      prevMeasurement={prevMeas ? { date: prevMeas.date, weight: prevMeas.weight, waist: prevMeas.waist, hip: prevMeas.hip } : null}
    />
  );
}
