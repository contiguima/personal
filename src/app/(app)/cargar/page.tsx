import { PageHeader, Card } from '@/components/ui';
import { Palta } from '@/components/doodles';

// Etapa 4: carga por foto + texto. Por ahora, aviso.
export default function CargarPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Cargar" />
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <Palta className="size-20" />
        <p className="max-w-xs text-sm text-ink-2">Acá vas a cargar comidas, sueño, entreno y medidas. Llega en la próxima etapa.</p>
      </Card>
    </div>
  );
}
