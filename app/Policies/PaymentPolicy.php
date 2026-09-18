<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /**
     * Melihat daftar payment.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    /**
     * Melihat detail payment.
     */
    public function view(
        User $user,
        Payment $payment
    ): bool {
        // Admin dapat melihat semua payment.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Customer hanya dapat melihat payment
        // dari booking miliknya.
        if ($user->hasRole('customer')) {
            return $payment->booking?->customer_id === $user->id;
        }

        // Mitra hanya dapat melihat payment
        // dari booking kendaraan milik mitra tersebut.
        if ($user->hasRole('mitra')) {
            return $payment->booking?->agentProfile?->user_id === $user->id;
        }

        return false;
    }

    /**
     * Membuat payment.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    /**
     * Mengubah payment.
     *
     * Untuk MVP payment tidak boleh diedit
     * setelah dibuat.
     */
    public function update(
        User $user,
        Payment $payment
    ): bool {
        return false;
    }

    /**
     * Menghapus payment.
     */
    public function delete(
        User $user,
        Payment $payment
    ): bool {
        return false;
    }

    /**
     * Verifikasi payment.
     */
    public function verify(
        User $user,
        Payment $payment
    ): bool {
        return $user->hasRole('admin');
    }

    /**
     * Restore payment.
     */
    public function restore(
        User $user,
        Payment $payment
    ): bool {
        return false;
    }

    /**
     * Force delete payment.
     */
    public function forceDelete(
        User $user,
        Payment $payment
    ): bool {
        return false;
    }
}
