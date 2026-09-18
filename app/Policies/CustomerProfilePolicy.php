<?php

namespace App\Policies;

use App\Models\CustomerProfile;
use App\Models\User;

class CustomerProfilePolicy
{
    /**
     * Admin dapat melihat seluruh customer profile.
     * Customer hanya dapat melihat profile miliknya sendiri.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    /**
     * Admin dapat melihat profile siapa saja.
     * Customer hanya dapat melihat profile miliknya sendiri.
     */
    public function view(User $user, CustomerProfile $customerProfile): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerProfile->user_id === $user->id;
    }

    /**
     * Customer dapat membuat profile untuk dirinya sendiri.
     * Admin juga dapat membuat profile.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    /**
     * Admin dapat mengubah semua profile.
     * Customer hanya dapat mengubah profile miliknya sendiri.
     */
    public function update(User $user, CustomerProfile $customerProfile): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerProfile->user_id === $user->id;
    }

    /**
     * Admin dapat menghapus profile.
     * Customer dapat menghapus profile miliknya sendiri.
     */
    public function delete(User $user, CustomerProfile $customerProfile): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerProfile->user_id === $user->id;
    }
}
