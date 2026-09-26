<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            Notification::class
        );

        $query = Notification::query()
            ->where('user_id', Auth::id())
            ->latest();

        if ($request->filled('status')) {
            if ($request->status === 'unread') {
                $query->whereNull('read_at');
            }

            if ($request->status === 'read') {
                $query->whereNotNull('read_at');
            }
        }

        $notifications = $query
            ->paginate(15)
            ->withQueryString();

        $unreadCount = $this->notificationService
            ->unreadCount(Auth::user());

        return view(
            'notifications.index',
            compact(
                'notifications',
                'unreadCount'
            )
        );
    }

    public function show(
        Notification $notification
    ): View {
        $this->authorize(
            'view',
            $notification
        );

        return view(
            'notifications.show',
            compact('notification')
        );
    }

    public function markAsRead(
        Notification $notification
    ): RedirectResponse {
        $this->authorize(
            'markAsRead',
            $notification
        );

        $this->notificationService->markAsRead(
            $notification,
            Auth::user()
        );

        return redirect()
            ->route('notifications.index')
            ->with(
                'success',
                'Notifikasi telah ditandai sudah dibaca.'
            );
    }

    public function markAllAsRead(): RedirectResponse
    {
        $this->authorize(
            'markAllAsRead',
            Notification::class
        );

        $this->notificationService
            ->markAllAsRead(Auth::user());

        return redirect()
            ->route('notifications.index')
            ->with(
                'success',
                'Semua notifikasi telah ditandai sudah dibaca.'
            );
    }

    public function destroy(
        Notification $notification
    ): RedirectResponse {
        $this->authorize(
            'delete',
            $notification
        );

        $this->notificationService->delete(
            $notification,
            Auth::user()
        );

        return redirect()
            ->route('notifications.index')
            ->with(
                'success',
                'Notifikasi berhasil dihapus.'
            );
    }
}