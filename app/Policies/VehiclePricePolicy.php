<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VehiclePrice;

class VehiclePricePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'mitra']);
    }

    public function view(
        User $user,
        VehiclePrice $vehiclePrice
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $vehiclePrice->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'mitra']);
    }

    public function update(
        User $user,
        VehiclePrice $vehiclePrice
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $vehiclePrice->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function delete(
        User $user,
        VehiclePrice $vehiclePrice
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $vehiclePrice->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }
}