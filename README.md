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
