import { Link } from '@inertiajs/react';
import {
    ChartNoAxesCombined,
    CreditCard,
    Gauge,
    LayoutDashboard,
    Network,
    ReceiptText,
    Settings,
    UserCog,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCan } from '@/hooks/use-can';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import { index as invoicesIndex } from '@/routes/invoices';
import { index as packagesIndex } from '@/routes/packages';
import { index as paymentsIndex } from '@/routes/payments';
import { index as reportsIndex } from '@/routes/reports';
import { index as routersIndex } from '@/routes/routers';
import { edit as businessSettingsEdit } from '@/routes/settings/business';
import { index as usersIndex } from '@/routes/users';
import type { NavGroup } from '@/types';

const navGroups: NavGroup[] = [
    {
        title: 'Utama',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutDashboard,
                exact: true,
            },
        ],
    },
    {
        title: 'Operasional',
        items: [
            {
                title: 'Pelanggan',
                href: customersIndex(),
                icon: Users,
                permission: 'customers.view',
            },
            {
                title: 'Tagihan',
                href: invoicesIndex(),
                icon: ReceiptText,
                permission: 'invoices.view',
            },
            {
                title: 'Pembayaran',
                href: paymentsIndex(),
                icon: CreditCard,
                permission: 'payments.view',
            },
        ],
    },
    {
        title: 'Master',
        items: [
            {
                title: 'Paket',
                href: packagesIndex(),
                icon: Gauge,
                permission: 'packages.view',
            },
            {
                title: 'Router',
                href: routersIndex(),
                icon: Network,
                permission: 'routers.manage',
            },
        ],
    },
    {
        title: 'Laporan',
        items: [
            {
                title: 'Pendapatan & tunggakan',
                href: reportsIndex(),
                icon: ChartNoAxesCombined,
                permission: 'reports.view',
            },
        ],
    },
    {
        title: 'Admin',
        items: [
            {
                title: 'Pengguna',
                href: usersIndex(),
                icon: UserCog,
                permission: 'users.manage',
            },
            {
                title: 'Pengaturan',
                href: businessSettingsEdit(),
                icon: Settings,
                permission: 'settings.manage',
            },
        ],
    },
];

export function AppSidebar() {
    const can = useCan();

    const visibleGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (item) => item.permission === undefined || can(item.permission),
            ),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[&_[data-sidebar=sidebar]]:rounded-2xl [&_[data-sidebar=sidebar]]:border [&_[data-sidebar=sidebar]]:border-white/40 [&_[data-sidebar=sidebar]]:bg-sidebar/80 [&_[data-sidebar=sidebar]]:shadow-sm [&_[data-sidebar=sidebar]]:backdrop-blur-xl dark:[&_[data-sidebar=sidebar]]:border-white/10"
        >
            <SidebarHeader className="border-b border-sidebar-border/60 bg-sidebar/55 p-2 backdrop-blur-xl">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="rounded-xl transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar/35 px-1 py-2">
                <NavMain groups={visibleGroups} />
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/60 bg-sidebar/55 p-2 backdrop-blur-xl [&_[data-sidebar=menu-button]]:rounded-xl">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
