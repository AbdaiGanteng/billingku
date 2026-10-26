import { ChartNoAxesCombined, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import EmptyState from '@/components/empty-state';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber } from '@/lib/format';
import type { CustomerCounts, CustomerStatus } from '@/types';

const statusDetails: {
    status: CustomerStatus;
    label: string;
    color: string;
}[] = [
    { status: 'active', label: 'Aktif', color: 'var(--chart-1)' },
    { status: 'isolated', label: 'Isolir', color: 'var(--chart-2)' },
    { status: 'pending', label: 'Pending', color: 'var(--chart-3)' },
    { status: 'terminated', label: 'Berhenti', color: 'var(--chart-4)' },
];

const chartConfig = {
    percentage: {
        label: 'Porsi pelanggan',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

type StatusDatum = {
    status: CustomerStatus;
    label: string;
    customers: number;
    percentage: number;
    color: string;
};

export default function PerformanceAreaChart({
    customerCounts,
}: {
    customerCounts: CustomerCounts;
}) {
    const customerTotal = statusDetails.reduce(
        (total, item) => total + customerCounts[item.status],
        0,
    );
    const data: StatusDatum[] = statusDetails.map((item) => ({
        ...item,
        customers: customerCounts[item.status],
        percentage:
            customerTotal > 0
                ? Math.round(
                      (customerCounts[item.status] / customerTotal) * 100,
                  )
                : 0,
    }));
    const activePercentage =
        data.find((item) => item.status === 'active')?.percentage ?? 0;
    const accessibleSummary = data
        .map(
            (item) =>
                `${item.label} ${formatNumber(item.customers)} pelanggan, ${formatNumber(item.percentage)} persen`,
        )
        .join('; ');

    return (
        <article
            className="min-w-0 overflow-hidden rounded-2xl border border-white/40 bg-card/65 p-4 shadow-sm backdrop-blur-md transition-[transform,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background motion-safe:focus-within:-translate-y-1 motion-safe:hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none sm:p-5 dark:border-white/10"
            aria-labelledby="performance-chart-title"
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <TrendingUp className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3
                            id="performance-chart-title"
                            className="font-semibold tracking-tight"
                        >
                            Performa pelanggan
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Distribusi status pelanggan saat ini.
                        </p>
                    </div>
                </div>
                {customerTotal > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                        <span
                            className="size-1.5 rounded-full bg-success"
                            aria-hidden="true"
                        />
                        {formatNumber(activePercentage)}% aktif
                    </span>
                ) : null}
            </div>

            {customerTotal === 0 ? (
                <EmptyState
                    icon={ChartNoAxesCombined}
                    title="Belum ada data pelanggan"
                    description="Grafik akan tampil setelah pelanggan memiliki status."
                />
            ) : (
                <div className="mt-5 min-w-0">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-64 w-full min-w-0 sm:h-72 [&_.recharts-surface]:rounded-xl [&_.recharts-surface:focus-visible]:ring-2 [&_.recharts-surface:focus-visible]:ring-ring [&_.recharts-surface:focus-visible]:ring-offset-2 [&_.recharts-surface:focus-visible]:ring-offset-background"
                    >
                        <AreaChart
                            data={data}
                            accessibilityLayer
                            title={`Grafik persentase distribusi status dari ${formatNumber(customerTotal)} pelanggan`}
                            desc={`${accessibleSummary}.`}
                            margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="customer-status-gradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-percentage)"
                                        stopOpacity={0.38}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-percentage)"
                                        stopOpacity={0.03}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="4 4"
                            />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={8}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                width={38}
                                allowDecimals={false}
                                tickFormatter={(value: number) => `${value}%`}
                            />
                            <ChartTooltip
                                cursor={{
                                    stroke: 'var(--border)',
                                    strokeDasharray: '4 4',
                                }}
                                content={({ active, payload }) => {
                                    const datum = payload?.[0]?.payload as
                                        | StatusDatum
                                        | undefined;

                                    return active && datum ? (
                                        <div className="grid min-w-40 gap-1.5 rounded-xl border border-white/40 bg-background/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md dark:border-white/10">
                                            <div className="flex items-center gap-2 font-medium">
                                                <span
                                                    className="size-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            datum.color,
                                                    }}
                                                    aria-hidden="true"
                                                />
                                                {datum.label}
                                            </div>
                                            <div className="flex items-center justify-between gap-4 text-muted-foreground">
                                                <span>
                                                    {formatNumber(
                                                        datum.customers,
                                                    )}{' '}
                                                    pelanggan
                                                </span>
                                                <span className="font-medium text-foreground tabular-nums">
                                                    {formatNumber(
                                                        datum.percentage,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                    ) : null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                name="Porsi pelanggan"
                                stroke="var(--color-percentage)"
                                strokeWidth={3}
                                fill="url(#customer-status-gradient)"
                                dot={{
                                    r: 3,
                                    fill: 'var(--color-percentage)',
                                    strokeWidth: 0,
                                }}
                                activeDot={{
                                    r: 5,
                                    fill: 'var(--color-percentage)',
                                    stroke: 'var(--card)',
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            )}
        </article>
    );
}
