import type { InertiaLinkProps } from '@inertiajs/react';
import { Deferred, Form, Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bell,
    Cable,
    CalendarClock,
    ChevronRight,
    CircleAlert,
    HeartPulse,
    LayoutDashboard,
    ReceiptText,
    Search,
    TriangleAlert,
    UserCheck,
    UserRoundX,
    WalletCards,
    WifiOff,
} from 'lucide-react';
import type { ReactNode } from 'react';
import PerformanceAreaChart from '@/components/dashboard/performance-area-chart';
import ProgressActivityPanel from '@/components/dashboard/progress-activity-panel';
import EmptyState from '@/components/empty-state';
import Money from '@/components/money';
import PageHeader from '@/components/page-header';
import PageSection from '@/components/page-section';
import StatCard from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/hooks/use-can';
import { formatDateTime, formatNumber } from '@/lib/format';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import { index as invoicesIndex } from '@/routes/invoices';
import { index as paymentsIndex } from '@/routes/payments';
import { index as reportsIndex, outstanding } from '@/routes/reports';
import type {
    CustomerCounts,
    CustomerStatus,
    DashboardSummary,
    HealthAlert,
} from '@/types';

type DashboardProps = {
    summary: DashboardSummary | null;
    customer_counts: CustomerCounts | null;
    /** Hanya terisi untuk admin; `undefined` selama prop deferred belum dimuat. */
    health?: HealthAlert[];
};

const customerCards: {
    status: CustomerStatus;
    title: string;
    icon: LucideIcon;
    className: string;
    indicatorClassName: string;
}[] = [
    {
        status: 'active',
        title: 'Pelanggan aktif',
        icon: UserCheck,
        className:
            'rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-success/10 p-5 backdrop-blur-md dark:border-white/10',
        indicatorClassName: 'bg-success',
    },
    {
        status: 'isolated',
        title: 'Diisolir',
        icon: WifiOff,
        className:
            'rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-warning/10 p-5 backdrop-blur-md dark:border-white/10',
        indicatorClassName: 'bg-warning',
    },
    {
        status: 'pending',
        title: 'Menunggu pemasangan',
        icon: Cable,
        className:
            'rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-info/10 p-5 backdrop-blur-md dark:border-white/10',
        indicatorClassName: 'bg-info',
    },
    {
        status: 'terminated',
        title: 'Berhenti',
        icon: UserRoundX,
        className:
            'rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-destructive/10 p-5 backdrop-blur-md dark:border-white/10',
        indicatorClassName: 'bg-destructive',
    },
];

export default function Dashboard({
    summary,
    customer_counts: customerCounts,
    health,
}: DashboardProps) {
    const can = useCan();

    const reviewCount = summary?.payments_needing_review ?? 0;
    const networkErrorCount =
        customerCounts?.network_error ??
        summary?.customers_with_network_error ??
        0;
    const showReview = can('payments.view') && reviewCount > 0;
    const showNetworkError = can('customers.view') && networkErrorCount > 0;
    const notificationCount =
        (showReview ? reviewCount : 0) +
        (showNetworkError ? networkErrorCount : 0);
    const hasNotifications = notificationCount > 0;
    const customerTotal = customerCounts
        ? customerCards.reduce(
              (total, card) => total + customerCounts[card.status],
              0,
          )
        : 0;

    return (
        <>
            <Head title="Dashboard" />
            <div className="relative isolate flex flex-1 overflow-hidden bg-linear-to-br from-background via-primary/5 to-info/10">
                <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    aria-hidden="true"
                >
                    <div className="absolute -top-24 -right-20 size-80 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute top-1/3 -left-28 size-72 rounded-full bg-info/10 blur-3xl" />
                    <div className="absolute right-1/4 -bottom-32 size-96 rounded-full bg-success/10 blur-3xl" />
                </div>

                <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 xl:p-8">
                    <div className="rounded-2xl border border-white/50 bg-card/65 p-4 shadow-sm backdrop-blur-xl sm:p-5 dark:border-white/10">
                        <PageHeader
                            title="Dashboard"
                            description={
                                summary
                                    ? 'Pantau keuangan, pelanggan, dan operasional ISP dalam satu tampilan.'
                                    : 'Pantau pelanggan dan operasional ISP dalam satu tampilan.'
                            }
                            actions={
                                <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                                    {can('customers.view') ? (
                                        <Form
                                            {...customersIndex.form()}
                                            className="relative min-w-0 flex-1 sm:w-40 sm:flex-none lg:w-56 xl:w-72"
                                        >
                                            <Input
                                                type="search"
                                                name="search"
                                                aria-label="Cari pelanggan"
                                                placeholder="Cari pelanggan…"
                                                autoComplete="off"
                                                className="h-10 rounded-xl border-white/50 bg-background/60 pr-11 shadow-xs backdrop-blur-sm dark:border-white/10"
                                            />
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-lg"
                                                aria-label="Cari pelanggan"
                                                title="Cari pelanggan"
                                            >
                                                <Search aria-hidden="true" />
                                            </Button>
                                        </Form>
                                    ) : null}

                                    {hasNotifications ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="icon"
                                            className="relative size-10 shrink-0 rounded-xl border-white/50 bg-background/60 shadow-xs backdrop-blur-sm dark:border-white/10"
                                        >
                                            <a
                                                href="#perlu-perhatian"
                                                aria-label={`${formatNumber(notificationCount)} notifikasi perlu perhatian`}
                                                title="Lihat notifikasi"
                                            >
                                                <Bell aria-hidden="true" />
                                                <span
                                                    className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] leading-none font-semibold text-white tabular-nums"
                                                    aria-hidden="true"
                                                >
                                                    {notificationCount > 99
                                                        ? '99+'
                                                        : formatNumber(
                                                              notificationCount,
                                                          )}
                                                </span>
                                            </a>
                                        </Button>
                                    ) : (
                                        <span title="Tidak ada notifikasi baru">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="size-10 rounded-xl border-white/50 bg-background/60 shadow-xs backdrop-blur-sm dark:border-white/10"
                                                aria-label="Tidak ada notifikasi baru"
                                                disabled
                                            >
                                                <Bell aria-hidden="true" />
                                            </Button>
                                        </span>
                                    )}
                                </div>
                            }
                        />
                    </div>

                    <Deferred data="health" fallback={<HealthSkeleton />}>
                        <HealthAlerts alerts={health} />
                    </Deferred>

                    {showReview || showNetworkError ? (
                        <div id="perlu-perhatian" className="scroll-mt-20">
                            <PageSection title="Perlu perhatian">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {showReview && summary ? (
                                        <AttentionLink
                                            href={paymentsIndex({
                                                query: {
                                                    review_status:
                                                        'needs_review',
                                                },
                                            })}
                                            icon={CircleAlert}
                                            title={`${formatNumber(reviewCount)} pembayaran perlu tinjauan`}
                                            description={
                                                <>
                                                    Total{' '}
                                                    <Money
                                                        amount={
                                                            summary.payments_needing_review_amount
                                                        }
                                                    />
                                                </>
                                            }
                                        />
                                    ) : null}
                                    {showNetworkError ? (
                                        <AttentionLink
                                            href={customersIndex({
                                                query: { network_error: true },
                                            })}
                                            icon={WifiOff}
                                            title={`${formatNumber(networkErrorCount)} pelanggan dengan galat router`}
                                            description="Perintah ke router gagal setelah semua percobaan."
                                        />
                                    ) : null}
                                </div>
                            </PageSection>
                        </div>
                    ) : null}

                    {summary ? (
                        <PageSection
                            title="Keuangan"
                            aside={`Diperbarui ${formatDateTime(summary.generated_at)} · tiap 5 menit`}
                        >
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <StatCard
                                    title="Pendapatan bulan ini"
                                    icon={WalletCards}
                                    href={reportsIndex()}
                                    value={
                                        <Money
                                            amount={summary.revenue_this_month}
                                        />
                                    }
                                    description={
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="size-2 rounded-full bg-success"
                                                aria-hidden="true"
                                            />
                                            {formatNumber(
                                                summary.payments_this_month,
                                            )}{' '}
                                            pembayaran
                                        </span>
                                    }
                                    className="rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-primary/10 p-5 backdrop-blur-md dark:border-white/10"
                                    liftOnHover
                                />
                                <StatCard
                                    title="Tunggakan"
                                    icon={ReceiptText}
                                    href={outstanding()}
                                    value={
                                        <Money
                                            amount={summary.outstanding_amount}
                                        />
                                    }
                                    description={
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="size-2 rounded-full bg-warning"
                                                aria-hidden="true"
                                            />
                                            {formatNumber(
                                                summary.outstanding_invoices,
                                            )}{' '}
                                            tagihan lewat jatuh tempo
                                        </span>
                                    }
                                    className="rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-warning/10 p-5 backdrop-blur-md dark:border-white/10"
                                    liftOnHover
                                />
                                <StatCard
                                    title="Jatuh tempo 7 hari ke depan"
                                    icon={CalendarClock}
                                    href={invoicesIndex({
                                        query: { due: 'this_week' },
                                    })}
                                    value={
                                        <Money
                                            amount={
                                                summary.due_this_week_amount
                                            }
                                        />
                                    }
                                    description={
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="size-2 rounded-full bg-info"
                                                aria-hidden="true"
                                            />
                                            {formatNumber(
                                                summary.due_this_week_invoices,
                                            )}{' '}
                                            tagihan belum dibayar
                                        </span>
                                    }
                                    className="rounded-2xl border-white/40 bg-linear-to-br from-card/90 via-card/70 to-info/10 p-5 backdrop-blur-md sm:col-span-2 xl:col-span-1 dark:border-white/10"
                                    liftOnHover
                                />
                            </div>
                        </PageSection>
                    ) : null}

                    {customerCounts ? (
                        <PageSection title="Pelanggan">
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                                {customerCards.map((card) => {
                                    const percentage =
                                        customerTotal > 0
                                            ? Math.round(
                                                  (customerCounts[card.status] /
                                                      customerTotal) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <StatCard
                                            key={card.status}
                                            title={card.title}
                                            icon={card.icon}
                                            href={customersIndex({
                                                query: {
                                                    status: card.status,
                                                },
                                            })}
                                            value={formatNumber(
                                                customerCounts[card.status],
                                            )}
                                            description={
                                                <span className="flex items-center gap-1.5">
                                                    <span
                                                        className={`size-2 rounded-full ${card.indicatorClassName}`}
                                                        aria-hidden="true"
                                                    />
                                                    {formatNumber(percentage)}%
                                                    dari{' '}
                                                    {formatNumber(
                                                        customerTotal,
                                                    )}{' '}
                                                    pelanggan
                                                </span>
                                            }
                                            className={card.className}
                                            liftOnHover
                                        />
                                    );
                                })}
                            </div>
                        </PageSection>
                    ) : null}

                    {customerCounts ? (
                        <PageSection
                            title="Wawasan pelanggan"
                            aside="Berdasarkan status pelanggan saat ini"
                        >
                            <div className="grid min-w-0 gap-4 xl:grid-cols-12">
                                <div className="min-w-0 xl:col-span-7 2xl:col-span-8">
                                    <PerformanceAreaChart
                                        customerCounts={customerCounts}
                                    />
                                </div>
                                <div className="min-w-0 xl:col-span-5 2xl:col-span-4">
                                    <ProgressActivityPanel
                                        customerCounts={customerCounts}
                                    />
                                </div>
                            </div>
                        </PageSection>
                    ) : null}

                    {!summary && !customerCounts ? (
                        <div className="rounded-2xl border border-white/40 bg-card/65 shadow-sm backdrop-blur-md dark:border-white/10">
                            <EmptyState
                                icon={LayoutDashboard}
                                title="Belum ada ringkasan untuk akun ini"
                                description="Hubungi admin jika Anda memerlukan akses ke data pelanggan atau laporan."
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}

function AttentionLink({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: NonNullable<InertiaLinkProps['href']>;
    icon: LucideIcon;
    title: string;
    description: ReactNode;
}) {
    return (
        <Link
            href={href}
            prefetch
            className="flex min-h-10 items-center gap-3 rounded-2xl border border-warning/25 bg-linear-to-br from-card/75 to-warning/10 p-4 text-sm shadow-sm backdrop-blur-md transition-[transform,box-shadow,border-color,background-color] duration-200 hover:border-warning/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
            />
        </Link>
    );
}

function HealthSkeleton() {
    return (
        <PageSection title="Kesehatan sistem">
            <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-24 rounded-2xl border border-white/40 bg-card/65 shadow-sm backdrop-blur-md motion-reduce:animate-none dark:border-white/10" />
                <Skeleton className="h-24 rounded-2xl border border-white/40 bg-card/65 shadow-sm backdrop-blur-md motion-reduce:animate-none dark:border-white/10" />
            </div>
        </PageSection>
    );
}

/**
 * Indikator kesehatan untuk admin. Tidak ditampilkan saat sistem sehat (array kosong) agar
 * dashboard tetap ringkas; `undefined` berarti prop deferred belum dimuat (ditangani Deferred).
 */
function HealthAlerts({ alerts }: { alerts: HealthAlert[] | undefined }) {
    if (!alerts || alerts.length === 0) {
        return null;
    }

    return (
        <PageSection title="Kesehatan sistem">
            <div className="grid gap-3 sm:grid-cols-2">
                {alerts.map((alert) => {
                    const isFail = alert.status === 'fail';
                    const Icon = isFail ? TriangleAlert : HeartPulse;

                    return (
                        <div
                            key={alert.name}
                            className={
                                isFail
                                    ? 'flex items-start gap-3 rounded-2xl border border-destructive/25 bg-linear-to-br from-card/75 to-destructive/10 p-4 text-sm shadow-sm backdrop-blur-md'
                                    : 'flex items-start gap-3 rounded-2xl border border-warning/25 bg-linear-to-br from-card/75 to-warning/10 p-4 text-sm shadow-sm backdrop-blur-md'
                            }
                        >
                            <span
                                className={
                                    isFail
                                        ? 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
                                        : 'flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning'
                                }
                            >
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">
                                    {alert.name}
                                    <span className="ml-2 font-normal text-muted-foreground">
                                        {alert.label}
                                    </span>
                                </p>
                                <p className="text-muted-foreground">
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </PageSection>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
