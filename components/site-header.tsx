'use client';

import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

const SEGMENT_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  audios: 'Audios',
  videos: 'Videos',
  memes: 'Memes',
  library: 'Library',
  editor: 'Editor',
};

function getHeaderTitle(pathname: string): string {
  if (!pathname || pathname === '/') return 'Dashboard';
  const segments = pathname.split('/').filter(Boolean);
  const knownPages = new Set(Object.keys(SEGMENT_TITLES));
  // Use the last segment that is a known page (e.g. "editor" in /dashboard/editor/abc-123)
  for (let i = segments.length - 1; i >= 0; i--) {
    const lower = segments[i].toLowerCase();
    if (knownPages.has(lower)) return SEGMENT_TITLES[lower];
  }
  const last = segments[segments.length - 1];
  return last ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ') : 'Dashboard';
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getHeaderTitle(pathname ?? '');

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
