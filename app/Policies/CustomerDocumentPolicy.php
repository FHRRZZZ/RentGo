<?php

namespace App\Policies;

use App\Models\CustomerDocument;
use App\Models\User;

class CustomerDocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    public function view(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerDocument->customerProfile?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    public function update(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerDocument->customerProfile?->user_id === $user->id;
    }

    public function delete(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $customerDocument->customerProfile?->user_id === $user->id;
    }

    public function verify(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        return $user->hasRole('admin');
    }

    public function restore(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        return false;
    }

    public function forceDelete(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        return false;
    }
}