'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-primary text-primary-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        <div className="text-xl font-bold">GeoApp</div>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`pb-2 transition-colors ${
              isActive('/')
                ? 'border-b-2 border-accent'
                : 'hover:text-accent'
            }`}
          >
            Carte
          </Link>
          <Link
            href="/dashboard"
            className={`pb-2 transition-colors ${
              isActive('/dashboard')
                ? 'border-b-2 border-accent'
                : 'hover:text-accent'
            }`}
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </nav>
  );
}
