<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    /**
     * User dapat melihat daftar notification miliknya.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * User hanya dapat melihat notification miliknya sendiri.
     */
    public function view(
        User $user,
        Notification $notification
    ): bool {
        return $notification->user_id === $user->id;
    }

    /**
     * Notification dibuat oleh system/service,
     * bukan langsung oleh user melalui CRUD.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * User tidak mengubah notification secara langsung.
     */
    public function update(
        User $user,
        Notification $notification
    ): bool {
        return false;
    }

    /**
     * User hanya dapat menghapus notification miliknya sendiri.
     */
    public function delete(
        User $user,
        Notification $notification
    ): bool {
        return $notification->user_id === $user->id;
    }

    /**
     * Menandai notification sebagai sudah dibaca.
     */
    public function markAsRead(
        User $user,
        Notification $notification
    ): bool {
        return $notification->user_id === $user->id;
    }

    /**
     * Menandai seluruh notification milik user
     * sebagai sudah dibaca.
     */
    public function markAllAsRead(User $user): bool
    {
        return true;
    }
}