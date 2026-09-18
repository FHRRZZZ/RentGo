<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class NotificationService
{
    /**
     * Membuat notification untuk user.
     */
    public function create(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        string $channel = 'database'
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'channel' => $channel,
            'read_at' => null,
        ]);
    }

    /**
     * Mengambil notification milik user.
     */
    public function getForUser(
        User $user,
        int $perPage = 15
    ): LengthAwarePaginator {
        return Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Menandai satu notification sebagai sudah dibaca.
     */
    public function markAsRead(
        Notification $notification,
        User $user
    ): Notification {
        if ($notification->user_id !== $user->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke notification ini.'
            );
        }

        if ($notification->read_at === null) {
            $notification->update([
                'read_at' => now(),
            ]);
        }

        return $notification->refresh();
    }

    /**
     * Menandai seluruh notification user sebagai sudah dibaca.
     */
    public function markAllAsRead(
        User $user
    ): void {
        Notification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);
    }

    /**
     * Menghapus notification milik user.
     */
    public function delete(
        Notification $notification,
        User $user
    ): void {
        if ($notification->user_id !== $user->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke notification ini.'
            );
        }

        $notification->delete();
    }

    public function notify(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null
    ): Notification {
        return $this->create(
            $user,
            $type,
            $title,
            $message,
            $data,
            'database'
        );
    }

    /**
     * Menghitung notification yang belum dibaca.
     */
    public function unreadCount(
        User $user
    ): int {
        return Notification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }
}