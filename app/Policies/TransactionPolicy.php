<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    public function view(User $user, Transaction $transaction): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('customer')) {
            return $transaction->customer_id === $user->id;
        }

        if ($user->hasRole('mitra')) {
            return $transaction
                ->agentProfile
                ?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
        ]);
    }

    public function update(User $user, Transaction $transaction): bool
    {
        return $user->hasRole('admin');
    }

    public function delete(User $user, Transaction $transaction): bool
    {
        return $user->hasRole('admin');
    }
}