<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Http\Middleware\EnsureAdminTwoFactorEnabled;
use App\Models\User;

/**
 * Menandai 2FA sebagai sudah dikonfirmasi (sesuai Features::twoFactorAuthentication(confirm: true)).
 */
function confirmTwoFactor(User $user): User
{
    $user->forceFill([
        'two_factor_secret' => encrypt('rahasia'),
        'two_factor_recovery_codes' => encrypt('[]'),
        'two_factor_confirmed_at' => now(),
    ])->save();

    return $user;
}

beforeEach(function () {
    config()->set('security.require_admin_two_factor', true);
});

it('mengarahkan admin tanpa 2FA ke halaman keamanan', function () {
    $this->actingAs(userWithRole(Role::Admin))
        ->get(route('dashboard'))
        ->assertRedirect(route('security.edit'))
        ->assertSessionHas('status', EnsureAdminTwoFactorEnabled::MESSAGE);
});

it('mengizinkan admin tanpa 2FA membuka jalur pengaktifan 2FA tanpa dialihkan ke pesan 2FA', function (string $path) {
    $response = $this->actingAs(userWithRole(Role::Admin))->get($path);

    // Jalur ini boleh dialihkan ke konfirmasi kata sandi, tetapi tidak boleh ke pesan 2FA.
    expect($response->getSession()->get('status'))
        ->not->toBe(EnsureAdminTwoFactorEnabled::MESSAGE);
})->with([
    'halaman keamanan' => '/settings/security',
    'tampilan' => '/settings/appearance',
    'endpoint Fortify 2FA' => '/user/confirmed-password-status',
]);

it('tidak mengarahkan admin yang sudah mengaktifkan 2FA', function () {
    $admin = confirmTwoFactor(userWithRole(Role::Admin));

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk();
});

it('tidak mengarahkan kasir dan teknisi meski belum mengaktifkan 2FA', function (Role $role) {
    $this->actingAs(userWithRole($role))
        ->get(route('dashboard'))
        ->assertOk();
})->with([Role::Kasir, Role::Teknisi]);

it('tidak memaksa 2FA saat fitur dimatikan', function () {
    config()->set('security.require_admin_two_factor', false);

    $this->actingAs(userWithRole(Role::Admin))
        ->get(route('dashboard'))
        ->assertOk();
});

it('membalas 403 untuk permintaan JSON admin tanpa 2FA', function () {
    $this->actingAs(userWithRole(Role::Admin))
        ->getJson(route('dashboard'))
        ->assertForbidden();
});
