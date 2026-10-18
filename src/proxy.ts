import { auth } from '@/auth';

// Todo requiere sesión salvo el login, las rutas de Auth.js y los archivos estáticos/PWA.
export default auth;

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)'],
};
