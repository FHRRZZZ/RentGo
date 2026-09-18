<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    public function view(
        User $user,
        Complaint $complaint
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('customer')) {
            return $complaint->complainant_id === $user->id
                || $complaint->reported_user_id === $user->id;
        }

        if ($user->hasRole('mitra')) {
            return $complaint->complainant_id === $user->id
                || $complaint->reported_user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            'customer',
            'mitra',
        ]);
    }

    public function update(
        User $user,
        Complaint $complaint
    ): bool {
        return false;
    }

    public function delete(
        User $user,
        Complaint $complaint
    ): bool {
        return $user->hasRole('admin');
    }

    public function process(
        User $user,
        Complaint $complaint
    ): bool {
        return $user->hasRole('admin')
            && !in_array(
                $complaint->status,
                [
                    'resolved',
                    'rejected',
                    'closed',
                ],
                true
            );
    }
}