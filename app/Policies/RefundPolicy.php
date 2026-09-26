<?php

namespace App\Policies;

use App\Models\Refund;
use App\Models\User;

class RefundPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    public function view(User $user, Refund $refund): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('customer')) {
            return $refund->booking?->customer_id === $user->id;
        }

        if ($user->hasRole('mitra')) {
            return $refund->booking?->agentProfile?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function process(User $user, Refund $refund): bool
    {
        return $user->hasRole('admin')
            && in_array(
                $refund->status,
                ['pending', 'processing'],
                true
            );
    }
}