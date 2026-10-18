import { connection } from 'next/server';
import { auth } from '@/auth';
import { previewEnabled } from '@/lib/session';

/** Aviso fijo mientras la vista previa pública esté prendida y quien mira no inició sesión. */
export async function PreviewBanner() {
  await connection(); // dinámico siempre: el valor de PUBLIC_PREVIEW se lee por request, no al compilar
  if (!previewEnabled() || (await auth())?.user) return null;
  return (
    <div className="bg-mostaza-soft px-4 py-2 text-center text-xs font-bold text-mostaza">
      Vista previa pública, solo lectura: cualquiera con este link ve estos datos. Para protegerla, sacá PUBLIC_PREVIEW en Vercel.
    </div>
  );
}
