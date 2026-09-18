<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VehicleAvailability;

class VehicleAvailabilityPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'mitra']);
    }

    public function view(
        User $user,
        VehicleAvailability $availability
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $availability->vehicle
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
        VehicleAvailability $availability
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $availability->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function delete(
        User $user,
        VehicleAvailability $availability
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $availability->vehicle
                ?->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }
}