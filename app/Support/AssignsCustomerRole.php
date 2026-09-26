<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

/**
 * Pemberian role "customer" default untuk pengguna baru.
 *
 * Kenapa tidak langsung `$user->assignRole('customer')`?
 * Spatie melempar RoleDoesNotExist bila role belum pernah di-seed. Di
 * GoogleAuthController exception itu tertangkap catch sehingga user
 * tercipta TANPA role — akibatnya form "Lengkapi Data" menolak menyimpan
 * (role bukan customer) dan data pengguna tidak pernah masuk database.
 *
 * Trait ini memastikan role tersedia lebih dulu, tidak menimpa user yang
 * sudah punya role, dan tidak pernah membuat seluruh proses auth gagal.
 */
trait AssignsCustomerRole
{
    protected function assignDefaultCustomerRole(User $user): void
    {
        if (! method_exists($user, 'assignRole')) {
            return;
        }

        // Jangan sentuh user yang sudah punya role (admin / mitra / customer).
        if ($user->roles()->exists()) {
            return;
        }

        try {
            if (! Role::where('name', 'customer')->where('guard_name', 'web')->exists()) {
                Role::create(['name' => 'customer', 'guard_name' => 'web']);
            }

            $user->assignRole('customer');
        } catch (\Throwable $e) {
            // Login/registrasi tetap lanjut, tapi jangan hilang senyap:
            // catat ke log supaya bisa ditelusuri.
            Log::error('Gagal memberi role customer: ' . $e->getMessage(), [
                'user_id' => $user->id,
            ]);
        }
    }
}
