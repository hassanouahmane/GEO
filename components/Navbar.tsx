'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Geospatial Console
          </p>
          <p className="text-base font-semibold text-foreground">GEO Intelligence</p>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-1">
          <Link
            href="/"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Carte
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </nav>
  );
}
