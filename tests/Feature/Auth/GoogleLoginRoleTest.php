<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Regresi: login Google pernah membuat user TANPA role karena role
 * "customer" belum ada, sehingga form "Lengkapi Data" menolak menyimpan
 * (role bukan customer) dan data pengguna tidak masuk database.
 */
class GoogleLoginRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function fakeGoogleUser(string $id, string $email, string $name): void
    {
        $socialiteUser = (new SocialiteUser())->map([
            'id' => $id,
            'name' => $name,
            'email' => $email,
            'avatar' => 'https://example.com/avatar.png',
        ]);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);
        $provider->shouldReceive('stateless')->andReturnSelf();

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_role_customer_dibuat_dan_diberikan_walau_belum_di_seed(): void
    {
        // Sengaja TIDAK menjalankan RolePermissionSeeder, meniru kondisi
        // database saat bug ini terjadi: role "customer" belum ada.
        $this->assertFalse(Role::where('name', 'customer')->exists());

        $this->fakeGoogleUser('g-123', 'miqdad@example.com', 'Miqdad Fh');

        $this->get('/auth/google/callback')->assertRedirect();

        $user = User::where('email', 'miqdad@example.com')->first();

        $this->assertNotNull($user, 'User Google harus tercipta.');
        $this->assertTrue(
            $user->hasRole('customer'),
            'User baru dari Google wajib punya role customer.'
        );
        $this->assertTrue(
            Role::where('name', 'customer')->exists(),
            'Role customer harus dibuat otomatis bila belum ada.'
        );
    }

    public function test_user_lama_tanpa_role_dilengkapi_saat_login_ulang(): void
    {
        // User sudah tercipta lebih dulu tanpa role (kondisi akun Miqdad).
        $user = User::factory()->create([
            'email' => 'miqdad@example.com',
            'google_id' => 'g-999',
        ]);

        $this->assertSame(0, $user->roles()->count());

        $this->fakeGoogleUser('g-999', 'miqdad@example.com', 'Miqdad Fh');

        $this->get('/auth/google/callback')->assertRedirect();

        $this->assertTrue(
            $user->fresh()->hasRole('customer'),
            'User lama tanpa role harus dilengkapi otomatis.'
        );
    }

    public function test_user_yang_sudah_punya_role_tidak_diubah(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'google_id' => 'g-admin',
        ]);
        $admin->assignRole('admin');

        $this->fakeGoogleUser('g-admin', 'admin@example.com', 'Admin RentGo');

        $this->get('/auth/google/callback')->assertRedirect();

        $admin->refresh();

        $this->assertTrue($admin->hasRole('admin'));
        $this->assertFalse(
            $admin->hasRole('customer'),
            'Role admin tidak boleh ditimpa menjadi customer.'
        );
    }
}
