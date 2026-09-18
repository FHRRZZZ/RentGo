<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
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
        Review $review
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('customer')) {
            return $review->customer_id === $user->id;
        }

        if ($user->hasRole('mitra')) {
            return $review
                ->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function update(
        User $user,
        Review $review
    ): bool {
        return false;
    }

    public function delete(
        User $user,
        Review $review
    ): bool {
        return $user->hasRole('admin');
    }

    public function moderate(
        User $user,
        Review $review
    ): bool {
        return $user->hasRole('admin')
            && $review->status === 'pending';
    }
}