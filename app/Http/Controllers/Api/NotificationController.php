<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Notifikasi user.
 */
class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => collect($notifications->items())->map(fn($n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'message'    => $n->message,
                'data'       => $n->data,
                'is_read'    => (bool) $n->read_at,
                'created_at' => $n->created_at?->toISOString(),
            ])->values()->all(),
            'unread_count' => Notification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
            ],
        ]);
    }

    /**
     * POST /api/notifications/read-all
     * Tandai semua notifikasi sebagai dibaca.
     */
    public function readAll(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi telah ditandai dibaca.']);
    }

    /**
     * PUT /api/notifications/{id}/read
     * Tandai satu notifikasi sebagai dibaca.
     */
    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->update(['read_at' => now()]);
        return response()->json(['message' => 'Notifikasi ditandai dibaca.']);
    }
}
