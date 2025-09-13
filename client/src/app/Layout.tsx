import { Outlet } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';

export default function Layout() {
  return (
    <section className="flex flex-row min-h-screen w-full bg-[hsl(var(--page-bg))]">
      {/* Navbar always visible */}
      <div className="sticky left-0 top-0 z-50 h-screen">
        <NavBar />
      </div>

      {/* Main Content fills space */}
      <main className="flex-1 w-full min-h-screen">
        <Outlet />
      </main>
    </section>
  );
}
