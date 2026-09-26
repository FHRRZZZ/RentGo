<?php

namespace App\Policies;

use App\Models\RentalCheckin;
use App\Models\User;

class RentalCheckinPolicy
{
    /**
     * Menentukan siapa yang boleh melihat daftar check-in.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
        ]);
    }

    /**
     * Menentukan siapa yang boleh melihat detail check-in.
     */
    public function view(
        User $user,
        RentalCheckin $rentalCheckin
    ): bool {
        // Admin dapat melihat semua check-in.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Mitra hanya dapat melihat check-in kendaraan miliknya.
        if ($user->hasRole('mitra')) {
            return $rentalCheckin
                ->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    /**
     * Hanya mitra yang dapat melakukan check-in kendaraan.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('mitra');
    }

    /**
     * Menentukan siapa yang boleh mengubah data check-in.
     */
    public function update(
        User $user,
        RentalCheckin $rentalCheckin
    ): bool {
        // Admin dapat mengubah semua data check-in.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Mitra hanya dapat mengubah check-in kendaraannya sendiri.
        if ($user->hasRole('mitra')) {
            return $rentalCheckin
                ->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    /**
     * Hanya admin yang dapat menghapus data check-in.
     */
    public function delete(
        User $user,
        RentalCheckin $rentalCheckin
    ): bool {
        return $user->hasRole('admin');
    }
}