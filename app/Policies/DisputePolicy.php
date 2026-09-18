<?php

namespace App\Policies;

use App\Models\Dispute;
use App\Models\User;

class DisputePolicy
{
    /**
     * Siapa yang boleh melihat daftar dispute.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    /**
     * Siapa yang boleh melihat detail dispute.
     */
    public function view(User $user, Dispute $dispute): bool
    {
        // Admin dapat melihat semua dispute.
        if ($user->hasRole('admin')) {
            return true;
        }

        // Pengaju dispute dapat melihat dispute miliknya.
        if ($dispute->initiator_id === $user->id) {
            return true;
        }

        // Pihak yang dilaporkan dapat melihat dispute.
        if ($dispute->respondent_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Customer dan mitra dapat membuat dispute.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            'customer',
            'mitra',
        ]);
    }

    /**
     * Hanya admin yang dapat memproses dispute.
     */
    public function process(User $user, Dispute $dispute): bool
    {
        return $user->hasRole('admin')
            && in_array(
                $dispute->status,
                [
                    'pending',
                    'investigating',
                ],
                true
            );
    }

    /**
     * Hanya admin yang dapat menghapus dispute.
     */
    public function delete(User $user, Dispute $dispute): bool
    {
        return $user->hasRole('admin');
    }
}