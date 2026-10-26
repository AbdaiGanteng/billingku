<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\HealthCheckResult;
use App\Enums\CustomerStatus;
use App\Enums\HealthStatus;
use App\Enums\Permission;
use App\Enums\Role;
use App\Models\Customer;
use App\Services\Health\HealthChecker;
use App\Services\Reports\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ringkasan keuangan hanya untuk `reports.view`; role lain melihat jumlah pelanggan per status
 * dan pelanggan dengan galat router (tautan ke daftar pelanggan `network_error=1`). Indikator
 * kesehatan (pembayaran tertahan, pesan WA, job gagal) hanya untuk admin dan di-defer agar
 * query ringkasnya tidak menahan render dashboard.
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request, ReportService $reports, HealthChecker $health): Response
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'summary' => $user?->can(Permission::ReportsView->value) ? $reports->dashboardSummary()->toArray() : null,
            'customer_counts' => $user?->can('viewAny', Customer::class) ? $this->customerCounts() : null,
            'health' => $user?->hasRole(Role::Admin)
                ? Inertia::defer(fn (): array => $this->healthAlerts($health))
                : null,
        ]);
    }

    /**
     * Hanya pemeriksaan yang perlu ditindak (bukan OK/Dilewati) agar bagian ini kosong saat sehat.
     *
     * @return list<array{name: string, status: string, label: string, message: string}>
     */
    private function healthAlerts(HealthChecker $health): array
    {
        return array_values(array_map(
            fn (HealthCheckResult $result): array => [
                'name' => $result->name,
                'status' => $result->status->value,
                'label' => $result->status->label(),
                'message' => $result->message,
            ],
            array_filter(
                $health->summarize(),
                fn (HealthCheckResult $result): bool => in_array($result->status, [HealthStatus::Fail, HealthStatus::Warning], true),
            ),
        ));
    }

    /**
     * @return array<string, int>
     */
    private function customerCounts(): array
    {
        $counts = Customer::query()->toBase()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');
        $result = [];

        foreach (CustomerStatus::cases() as $status) {
            $result[$status->value] = (int) ($counts[$status->value] ?? 0);
        }

        $result['network_error'] = Customer::query()->hasNetworkError()->count();

        return $result;
    }
}
