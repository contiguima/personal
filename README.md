# Mi Bitácora de Salud

Web personal de Conti: dieta, sueño, entreno, actividad, medidas y uso del tiempo.
Next.js 16 (App Router) + TypeScript + Tailwind · Neon Postgres + Drizzle · Auth.js (Google, un solo mail) · Vercel.

## Datos

- `data/bitacora_salud.jsx`: el artefacto original, fuente del historial.
- `scripts/legacy.ts` evalúa sus constantes y reproduce el merge del artefacto.
- `src/lib/ingest.ts` es la única puerta de escritura: upsert por `chatId` (corregir nunca duplica) y respeta días cerrados salvo `force`.

## Puesta en marcha

```bash
cp .env.example .env.local     # completar
npm install
npm run db:migrate             # crea las tablas
npm run db:seed                # migra todo el historial (--reset para rehacer)
npm run db:verify              # compara la base contra el .jsx
npm test                       # reglas de carga (usar una base de prueba)
npm run dev
```

### Neon
Crear un proyecto en neon.tech y copiar el connection string en `DATABASE_URL`.

### Login con Google
1. Google Cloud Console → APIs y servicios → Credenciales → ID de cliente OAuth (aplicación web).
2. URI de redirección: `http://localhost:3000/api/auth/callback/google` y `https://<tu-dominio>/api/auth/callback/google`.
3. Copiar ID y secreto en `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. `AUTH_SECRET` sale de `npx auth secret`.
4. `ALLOWED_EMAIL` es el único mail que puede entrar.

### Vercel
Importar el repo, cargar las mismas variables de entorno y deployar. Correr `db:migrate` y `db:seed` una vez apuntando a Neon.

## Formato de carga (pantalla Cargar → "Del chat")

Sin API key de Anthropic, el análisis de las fotos se hace en el chat con Claude, que devuelve un bloque así para pegar en la app.
Se ve una vista previa (platos, total del día vs objetivo, lo que falta) y recién al confirmar se guarda.

```json
{
  "days": {
    "2026-10-18": {
      "trainingDay": false,
      "meals": [{
        "chatId": "2026-10-18-cena",
        "category": "Cena",
        "desc": "Pechuga al horno con papa y brócoli",
        "confidence": "media-alta",
        "kcal": 434, "protein": 52, "carbs": 38, "fat": 9, "fiber": 6.5,
        "items": [{ "nombre": "Pechuga al horno", "cantidad": "200 g cruda", "kcal": 264, "protein": 49.6, "carbs": 0, "fat": 5.8, "fiber": 0 }],
        "calidad": { "ultraprocesado": "Bajo", "beneficios": "Proteína magra y fibra", "puntaje": 9 }
      }],
      "sleep": { "duration_min": 509, "score": 94, "phases": { "vigilia": 4, "rem": 24, "ligero": 64, "profundo": 8 } },
      "training": { "tipo": "Fuerza", "duracion": "60 min", "kcalActivas": 320, "fcProm": "128", "dolor": "No" },
      "activity": { "steps": 9500, "activeKcal": 480, "restKcal": 1620 },
      "measurements": { "weight": 75.4, "waist": 85, "hip": 101 },
      "note": "…"
    }
  },
  "timeUse": { "2026-10-18": { "deporte": 1, "trabajoCorpo": 0, "sideHustle": 2, "emprendedurismo": 1, "aprendizaje": 0, "tiktok": 0.5, "social": 3, "otros": 0 } }
}
```

- Todos los bloques son opcionales. Lo que no viene no se toca; `null` borra ese bloque.
- **Mismo `chatId` = corrección**: se actualiza esa comida, no se duplica. Sin `chatId`, la app asigna `fecha-categoría` (con `-2`, `-3` si ya existe).
- Categorías: Pre-entreno, Desayuno, Almuerzo, Snack, Merienda, Cena, Postre. Confianza: alta, media-alta, media, baja-media, baja.
- Un día cerrado no se pisa salvo que lo tildes explícitamente en la vista previa.

## Vista previa pública (temporal)

Con `PUBLIC_PREVIEW=1` (en Vercel: Settings → Environment Variables → redeploy) se pueden **ver** Hoy, Semana, Comidas, Cuerpo y sueño y Tiempo sin iniciar sesión, para ir dando feedback del diseño.

- Es solo lectura: **Cargar, borrar y las fotos siguen pidiendo login**, y cualquier POST sin sesión se redirige al login.
- Las fotos de comidas nunca se muestran en la vista previa.
- Arriba aparece un aviso fijo mientras esté prendida, y las páginas llevan `noindex` (con o sin la vista previa).
- Cualquiera con el link ve los datos de salud que haya en la base. **Para protegerla de nuevo: borrar `PUBLIC_PREVIEW` y redeployar.** Sin la variable, todo exige login como antes.
