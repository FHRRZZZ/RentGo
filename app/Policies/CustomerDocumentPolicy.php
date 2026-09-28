<?php

namespace App\Policies;

use App\Models\CustomerDocument;
use App\Models\User;

class CustomerDocumentPolicy
{
    /*
    |--------------------------------------------------------------------------
    | Helper
    |--------------------------------------------------------------------------
    */

    /**
     * Menentukan apakah user adalah pemilik dokumen ini.
     *
     * Digunakan untuk mencegah customer mengakses dokumen customer lain
     * (PRD §24 — Data Privacy).
     */
    private function ownsDocument(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        return $customerDocument->customerProfile?->user_id === $user->id;
    }

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    */

    /**
     * Admin melihat semua dokumen.
     * Customer hanya melihat daftar (dibatasi lebih lanjut di Controller/Query).
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    /**
     * Admin dapat melihat semua dokumen.
     * Customer hanya dapat melihat dokumen miliknya sendiri (PRD §24).
     */
    public function view(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $this->ownsDocument($user, $customerDocument);
    }

    /**
     * Admin dan customer dapat membuat dokumen baru.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'customer']);
    }

    /**
     * Admin dapat mengedit semua dokumen.
     * Customer hanya dapat mengedit dokumen miliknya sendiri.
     */
    public function update(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $this->ownsDocument($user, $customerDocument);
    }

    /**
     * Admin dapat menghapus semua dokumen.
     * Customer hanya dapat menghapus dokumen miliknya sendiri.
     */
    public function delete(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('customer')
            && $this->ownsDocument($user, $customerDocument);
    }

    /**
     * Hanya admin yang dapat memverifikasi dokumen (PRD §23).
     */
    public function verify(
        User $user,
        CustomerDocument $customerDocument
    ): bool {
        return $user->hasRole('admin');
    }
}