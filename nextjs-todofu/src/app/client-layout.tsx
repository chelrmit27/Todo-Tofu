'use client';

import { usePathname } from 'next/navigation';
import NavBar from '@/components/layout/NavBar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show NavBar on landing page and auth pages
  const hideNavBar = pathname === '/' || pathname.startsWith('/auth');

  if (hideNavBar) {
    return <>{children}</>;
  }

  return (
    <section className="flex flex-row min-h-screen w-full bg-[hsl(var(--page-bg))]">
      {/* Navbar always visible for app pages */}
      <div className="sticky left-0 top-0 z-50 h-screen">
        <NavBar />
      </div>

      {/* Main Content fills space */}
      <main className="flex-1 w-full min-h-screen">
        {children}
      </main>
    </section>
  );
}
