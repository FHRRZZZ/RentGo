<?php

namespace App\Policies;

use App\Models\AgentPayout;
use App\Models\User;

class AgentPayoutPolicy
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
        AgentPayout $payout
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $payout
                ->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function process(
        User $user,
        AgentPayout $payout
    ): bool {
        return $user->hasRole('admin')
            && in_array(
                $payout->status,
                ['pending', 'processing'],
                true
            );
    }
}