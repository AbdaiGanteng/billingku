<?php

declare(strict_types=1);

use App\Enums\Role;
use Illuminate\Testing\TestResponse;

it('mengirim header keamanan di halaman admin, halaman publik, dan webhook', function (Closure $request) {
    /** @var TestResponse $response */
    $response = $request($this);

    $response->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Referrer-Policy', 'same-origin');
})->with([
    'dashboard admin' => fn ($test) => $test->actingAs(userWithRole(Role::Admin))->get(route('dashboard')),
    'halaman isolir publik' => fn ($test) => $test->get(route('isolation.show')),
    'webhook Midtrans' => fn ($test) => $test->postJson('/webhooks/payments/midtrans', []),
]);

it('memasang Content Security Policy yang membatasi sumber default dan membingkai', function () {
    config()->set('security.csp.enabled', true);
    config()->set('security.csp.report_only', false);

    $csp = $this->actingAs(userWithRole(Role::Admin))
        ->get(route('dashboard'))
        ->headers->get('Content-Security-Policy');

    expect($csp)->not->toBeNull()
        ->and($csp)->toContain("default-src 'self'")
        ->and($csp)->toContain("frame-ancestors 'none'")
        ->and($csp)->toContain("object-src 'none'");
});

it('memakai header report-only saat dikonfigurasi', function () {
    config()->set('security.csp.enabled', true);
    config()->set('security.csp.report_only', true);

    $response = $this->actingAs(userWithRole(Role::Admin))->get(route('dashboard'));

    $response->assertHeader('Content-Security-Policy-Report-Only');
    expect($response->headers->get('Content-Security-Policy'))->toBeNull();
});

it('tidak memasang Content Security Policy saat dimatikan', function () {
    config()->set('security.csp.enabled', false);

    $response = $this->actingAs(userWithRole(Role::Admin))->get(route('dashboard'));

    expect($response->headers->get('Content-Security-Policy'))->toBeNull()
        ->and($response->headers->get('Content-Security-Policy-Report-Only'))->toBeNull();
});
