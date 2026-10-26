<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Header keamanan dasar untuk semua respons (admin, halaman publik, webhook). Halaman tagihan
 * publik memakai signed URL tanpa masa berlaku, sehingga URL lengkapnya tidak boleh ikut
 * terkirim sebagai Referer ke situs lain dan halamannya tidak boleh dibingkai situs lain.
 *
 * Content Security Policy (audit R-5) dipasang di sini dan dikonfigurasi di config/security.php.
 */
class AddSecurityHeaders
{
    public const array HEADERS = [
        'X-Frame-Options' => 'DENY',
        'X-Content-Type-Options' => 'nosniff',
        'Referrer-Policy' => 'same-origin',
    ];

    /**
     * Sumber aset server dev Vite. Memakai scheme-source `http:` dan bukan daftar host karena
     * grammar host-source CSP tidak mengenal alamat IPv6 literal: Vite menyajikan aset di
     * `http://[::1]:5173`, dan sumber seperti `http://[::1]:*` dianggap tidak valid lalu
     * diabaikan browser sehingga CSS dan modul JS ikut terblokir. Hanya dipakai di luar
     * production; production tetap `'self'` + nonce.
     */
    private const string DEV_ASSET_SOURCE = 'http:';

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach (self::HEADERS as $name => $value) {
            $response->headers->set($name, $value, replace: false);
        }

        $this->applyContentSecurityPolicy($response);

        return $response;
    }

    /**
     * Satu kebijakan untuk admin dan halaman publik. `style-src` mengizinkan inline karena
     * Recharts dan beberapa komponen UI memasang style inline. Skrip inline (tema di
     * app.blade.php, polling QRIS di halaman tagihan publik) dan tag Vite/Inertia dibolehkan
     * lewat nonce per request (lihat AppServiceProvider::configureContentSecurityPolicy).
     * Di luar production, host dev Vite diizinkan agar HMR (WebSocket + modul) tetap jalan.
     */
    private function applyContentSecurityPolicy(Response $response): void
    {
        if (! config('security.csp.enabled')) {
            return;
        }

        $directives = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            'img-src '.$this->styleAndAssetSources("'self' data:"),
            'font-src '.$this->styleAndAssetSources("'self' data:"),
            'style-src '.$this->styleAndAssetSources("'self' 'unsafe-inline'"),
            'script-src '.$this->scriptSources(),
            'connect-src '.$this->connectSources(),
        ];

        $header = config('security.csp.report_only')
            ? 'Content-Security-Policy-Report-Only'
            : 'Content-Security-Policy';

        $response->headers->set($header, implode('; ', $directives), replace: false);
    }

    /**
     * Di production aset dibundel same-origin sehingga `'self'` cukup. Di dev, CSS, font, dan
     * gambar disajikan server dev Vite dari origin lain sehingga perlu diizinkan.
     */
    private function styleAndAssetSources(string $base): string
    {
        return app()->isProduction()
            ? $base
            : $base.' '.self::DEV_ASSET_SOURCE;
    }

    private function scriptSources(): string
    {
        $nonce = Vite::cspNonce();
        $nonceSource = $nonce === null ? '' : " 'nonce-{$nonce}'";

        // Production: hanya 'self' + nonce (built asset eksternal, tanpa unsafe-inline/eval).
        // Dev: server Vite + 'unsafe-eval' untuk runtime HMR.
        return app()->isProduction()
            ? "'self'".$nonceSource
            : "'self'".$nonceSource." 'unsafe-eval' ".self::DEV_ASSET_SOURCE;
    }

    private function connectSources(): string
    {
        // HMR memakai WebSocket; sumber `ws`/`wss` perlu diizinkan di luar production.
        return app()->isProduction()
            ? "'self'"
            : "'self' ".self::DEV_ASSET_SOURCE.' ws: wss:';
    }
}
