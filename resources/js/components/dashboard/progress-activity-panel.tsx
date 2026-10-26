import { Activity, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CustomerCounts, CustomerStatus } from '@/types';

const statusDetails: {
    status: CustomerStatus;
    label: string;
    indicatorClassName: string;
}[] = [
    {
        status: 'active',
        label: 'Pelanggan aktif',
        indicatorClassName: 'bg-success',
    },
    {
        status: 'isolated',
        label: 'Pelanggan diisolir',
        indicatorClassName: 'bg-warning',
    },
    {
        status: 'pending',
        label: 'Menunggu pemasangan',
        indicatorClassName: 'bg-info',
    },
    {
        status: 'terminated',
        label: 'Pelanggan berhenti',
        indicatorClassName: 'bg-destructive',
    },
];

const illustrativeTeams = [
    {
        name: 'Tim Billing',
        initials: 'TB',
        focus: 'Ketepatan verifikasi',
        score: 94,
        avatarClassName: 'bg-primary/15 text-primary',
    },
    {
        name: 'Tim Lapangan',
        initials: 'TL',
        focus: 'Penyelesaian instalasi',
        score: 88,
        avatarClassName: 'bg-info/15 text-info',
    },
    {
        name: 'Tim Dukungan',
        initials: 'TD',
        focus: 'Respons pelanggan',
        score: 82,
        avatarClassName: 'bg-success/15 text-success',
    },
];

export default function ProgressActivityPanel({
    customerCounts,
}: {
    customerCounts: CustomerCounts;
}) {
    const customerTotal = statusDetails.reduce(
        (total, item) => total + customerCounts[item.status],
        0,
    );

    return (
        <article
            className="min-w-0 rounded-2xl border border-white/40 bg-card/65 p-4 shadow-sm backdrop-blur-md transition-[transform,box-shadow] duration-200 motion-safe:focus-within:-translate-y-1 motion-safe:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none sm:p-5 dark:border-white/10"
            aria-labelledby="progress-activity-title"
        >
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
                    <Activity className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h3
                        id="progress-activity-title"
                        className="font-semibold tracking-tight"
                    >
                        Progres & aktivitas
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Komposisi operasional pelanggan real-time.
                    </p>
                </div>
            </div>

            <ul
                className="mt-5 grid gap-4"
                aria-label="Progres status pelanggan"
            >
                {statusDetails.map((item) => {
                    const count = customerCounts[item.status];
                    const percentage =
                        customerTotal > 0
                            ? Math.round((count / customerTotal) * 100)
                            : 0;

                    return (
                        <li key={item.status} className="grid gap-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                                    <span
                                        className={cn(
                                            'size-2 shrink-0 rounded-full',
                                            item.indicatorClassName,
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </span>
                                <span className="shrink-0 font-medium tabular-nums">
                                    {formatNumber(count)} ·{' '}
                                    {formatNumber(percentage)}%
                                </span>
                            </div>
                            <div
                                className="h-2 overflow-hidden rounded-full bg-muted/80"
                                role="progressbar"
                                aria-label={`${item.label}: ${formatNumber(percentage)} persen`}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={percentage}
                            >
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
                                        item.indicatorClassName,
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-info/15 bg-info/5 p-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                    <Activity className="size-4" aria-hidden="true" />
                    <span
                        className={cn(
                            'absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card',
                            customerCounts.network_error > 0
                                ? 'bg-warning'
                                : 'bg-success',
                        )}
                        aria-hidden="true"
                    />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Aktivitas router</p>
                    <p className="text-xs text-muted-foreground">
                        {customerCounts.network_error > 0
                            ? `${formatNumber(customerCounts.network_error)} pelanggan perlu sinkronisasi ulang.`
                            : 'Tidak ada galat router yang perlu ditangani.'}
                    </p>
                </div>
            </div>

            <section
                className="mt-5 border-t border-border/60 pt-5"
                aria-labelledby="illustrative-leaderboard-title"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Trophy
                            className="size-4 text-warning"
                            aria-hidden="true"
                        />
                        <h4
                            id="illustrative-leaderboard-title"
                            className="text-sm font-semibold"
                        >
                            Skor tim
                        </h4>
                    </div>
                    <span className="rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                        Contoh
                    </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    Ilustrasi papan skor, bukan data pengguna langsung.
                </p>
                <ol className="mt-3 grid gap-2.5">
                    {illustrativeTeams.map((team, index) => (
                        <li
                            key={team.name}
                            className="flex min-w-0 items-center gap-3 rounded-xl bg-background/40 p-2.5"
                            aria-label={`Peringkat ${index + 1}, ${team.name}, ${team.score} poin`}
                        >
                            <span className="w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">
                                {index + 1}
                            </span>
                            <Avatar className="size-9 ring-2 ring-background">
                                <AvatarFallback
                                    className={cn(
                                        'text-xs font-semibold',
                                        team.avatarClassName,
                                    )}
                                >
                                    {team.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {team.name}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {team.focus}
                                </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular-nums">
                                {team.score}
                            </span>
                        </li>
                    ))}
                </ol>
            </section>
        </article>
    );
}
