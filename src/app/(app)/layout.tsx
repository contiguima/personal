import { Nav } from '@/components/nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-4 pt-4 pb-28 md:px-6 md:pt-6 md:pb-12">{children}</main>
    </>
  );
}
