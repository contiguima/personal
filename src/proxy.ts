import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Todo requiere sesión salvo el login, las rutas de Auth.js y los archivos estáticos/PWA.
// Con PUBLIC_PREVIEW=1 se pueden VER (GET) las pantallas de lectura sin login; Cargar, fotos y cualquier escritura siguen protegidas.
const PROTEGIDAS_EN_PREVIEW = ['/cargar', '/api/fotos'];

export default auth((req) => {
  if (req.auth?.user) return;
  const { pathname } = req.nextUrl;
  const abierta = process.env.PUBLIC_PREVIEW === '1' && req.method === 'GET' && !PROTEGIDAS_EN_PREVIEW.some((p) => pathname.startsWith(p));
  if (abierta) return NextResponse.next();
  const login = new URL('/login', req.url);
  login.searchParams.set('callbackUrl', req.url);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)'],
};
