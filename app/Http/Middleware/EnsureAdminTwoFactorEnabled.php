<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\Role;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Memaksa admin mengaktifkan 2FA sebelum memakai aplikasi (audit R-5), hanya jika
 * REQUIRE_ADMIN_TWO_FACTOR aktif. Admin tanpa 2FA terkonfirmasi diarahkan ke halaman keamanan;
 * endpoint yang dibutuhkan untuk mengaktifkan 2FA, konfirmasi kata sandi, dan keluar tetap
 * diizinkan agar admin tidak terkunci dari aplikasinya sendiri.
 */
class EnsureAdminTwoFactorEnabled
{
    public const string MESSAGE = 'Sebagai admin, Anda wajib mengaktifkan autentikasi dua faktor sebelum melanjutkan.';

    /**
     * Jalur yang tetap boleh diakses selama 2FA belum aktif (prefix path, tanpa query string).
     *
     * @var list<string>
     */
    private const array ALLOWED_PATH_PREFIXES = [
        'settings/security',
        'settings/password',
        'settings/appearance',
        'user/',
        'logout',
        'login',
        '.well-known/passkey-endpoints',
    ];

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! (bool) config('security.require_admin_two_factor')) {
            return $next($request);
        }

        $user = $request->user();

        if (! $user instanceof User
            || ! $user->hasRole(Role::Admin)
            || $user->hasEnabledTwoFactorAuthentication()
            || $this->isAllowedPath($request)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(Response::HTTP_FORBIDDEN, self::MESSAGE);
        }

        return redirect()->route('security.edit')->with('status', self::MESSAGE);
    }

    private function isAllowedPath(Request $request): bool
    {
        $path = $request->path();

        foreach (self::ALLOWED_PATH_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, rtrim($prefix, '/').'/')) {
                return true;
            }
        }

        return false;
    }
}
