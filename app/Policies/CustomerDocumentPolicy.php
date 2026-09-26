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

        $ownerId = $customerDocument->customerProfile?->user_id;

        // Pemilik dokumen (customer) selalu boleh melihat dokumennya sendiri.
        if ($user->hasRole('customer') && $ownerId === $user->id) {
            return true;
        }

        /*
         * Mitra boleh melihat dokumen penyewa HANYA bila penyewa tersebut
         * benar-benar pernah memesan unit miliknya. Ini membatasi akses demi
         * keamanan unit: mitra dapat memverifikasi identitas penyewa, tetapi
         * tidak bisa melihat data customer lain di luar pesanannya.
         */
        if ($user->hasRole('mitra')) {
            $agentProfileId = $user->agentProfile?->id;

            if (!$agentProfileId || !$ownerId) {
                return false;
            }

            return \App\Models\Booking::query()
                ->where('customer_id', $ownerId)
                ->where('agent_profile_id', $agentProfileId)
                ->exists();
        }

        return false;
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