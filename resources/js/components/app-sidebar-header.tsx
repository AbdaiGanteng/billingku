import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-white/40 bg-background/70 px-6 shadow-xs backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-background/55 md:px-4 dark:border-white/10 print:hidden">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger
                    className="-ml-1"
                    aria-label="Buka atau tutup menu"
                />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
