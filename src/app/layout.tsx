import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({ variable: '--font-nunito', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mi Bitácora de Salud',
  description: 'Dieta, sueño, entreno y tiempo de Conti',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f1e4' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1a15' },
  ],
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-AR" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
