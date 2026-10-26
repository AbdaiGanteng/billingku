<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Content Security Policy
    |--------------------------------------------------------------------------
    |
    | Header CSP dipasang oleh App\Http\Middleware\AddSecurityHeaders. Kebijakan
    | ini menyeimbangkan keamanan dengan kebutuhan Inertia/Vite dan grafik Recharts
    | yang memakai style inline. Matikan sementara lewat CSP_ENABLED=false jika ada
    | aset yang terblokir saat pengembangan.
    |
    */

    'csp' => [
        'enabled' => (bool) env('CSP_ENABLED', true),
        'report_only' => (bool) env('CSP_REPORT_ONLY', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | 2FA wajib untuk admin (audit R-5)
    |--------------------------------------------------------------------------
    |
    | Saat aktif, admin tanpa 2FA terkonfirmasi diarahkan ke halaman keamanan sampai
    | mengaktifkan 2FA. Default nonaktif agar admin pertama tidak terkunci sebelum
    | sempat menyiapkan 2FA; nyalakan setelah admin mengatur autentikatornya.
    |
    */

    'require_admin_two_factor' => (bool) env('REQUIRE_ADMIN_TWO_FACTOR', false),

    /*
    |--------------------------------------------------------------------------
    | Allowlist IP NAT ISP (audit S-3)
    |--------------------------------------------------------------------------
    |
    | Halaman publik (/isolir dan tagihan) dibatasi per IP. Pelanggan di balik satu
    | NAT ISP berbagi IP publik sehingga satu pelanggan sibuk bisa menghabiskan kuota
    | untuk seluruh pelanggan. IP di daftar ini dikecualikan dari batas tampilan
    | (view) halaman publik; batas anti-brute-force per kode pelanggan tetap berlaku.
    |
    | Isi dengan daftar IP dipisah koma lewat PUBLIC_RATE_LIMIT_ALLOWLIST.
    | Contoh: PUBLIC_RATE_LIMIT_ALLOWLIST="203.0.113.10,203.0.113.11"
    |
    */

    'public_rate_limit_allowlist' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('PUBLIC_RATE_LIMIT_ALLOWLIST', '')),
    ))),

];
