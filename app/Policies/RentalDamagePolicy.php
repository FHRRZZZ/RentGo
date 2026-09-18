<?php

namespace App\Policies;

use App\Models\RentalDamage;
use App\Models\User;

class RentalDamagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
        ]);
    }

    public function view(
        User $user,
        RentalDamage $rentalDamage
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $rentalDamage
                ->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('mitra');
    }

    public function update(
        User $user,
        RentalDamage $rentalDamage
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $rentalDamage
                ->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function delete(
        User $user,
        RentalDamage $rentalDamage
    ): bool {
        return $user->hasRole('admin');
    }
}