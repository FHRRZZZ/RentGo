<?php

namespace App\Policies;

use App\Models\RentalCheckout;
use App\Models\User;

class RentalCheckoutPolicy
{
    /**
     * Melihat daftar checkout.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
        ]);
    }

    /**
     * Melihat detail checkout.
     */
    public function view(User $user, RentalCheckout $rentalCheckout): bool
    {
        // Admin dapat melihat semua checkout.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Mitra hanya dapat melihat checkout
        // dari kendaraan miliknya.
        if ($user->hasRole('mitra')) {
            return $rentalCheckout->vehicle?->agentProfile?->user_id === $user->id;
        }

        return false;
    }

    /**
     * Membuat checkout/pickup.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('mitra');
    }

    /**
     * Mengubah data checkout.
     */
    public function update(User $user, RentalCheckout $rentalCheckout): bool
    {
        // Admin dapat mengubah semua checkout.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Mitra hanya dapat mengubah checkout
        // kendaraan miliknya.
        if ($user->hasRole('mitra')) {
            return $rentalCheckout->vehicle?->agentProfile?->user_id === $user->id;
        }

        return false;
    }

    /**
     * Menghapus checkout.
     */
    public function delete(User $user, RentalCheckout $rentalCheckout): bool
    {
        return $user->hasRole('admin');
    }
}