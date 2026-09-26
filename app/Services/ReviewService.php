<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Customer membuat review.
     */
    public function create(
        Booking $booking,
        User $customer,
        int $rating,
        ?string $review = null,
        ?Request $request = null
    ): Review {
        if (!$customer->hasRole('customer')) {
            throw new \RuntimeException(
                'Hanya customer yang dapat membuat review.'
            );
        }

        $booking->loadMissing([
            'customer',
            'agentProfile',
            'items.vehicle',
        ]);

        if ($booking->customer_id !== $customer->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        if ($booking->status !== 'completed') {
            throw new \RuntimeException(
                'Review hanya dapat dibuat setelah transaksi selesai.'
            );
        }

        if ($rating < 1 || $rating > 5) {
            throw new \RuntimeException(
                'Rating harus berada antara 1 sampai 5.'
            );
        }

        if ($booking->items->isEmpty()) {
            throw new \RuntimeException(
                'Booking tidak memiliki kendaraan.'
            );
        }

        $existingReview = Review::where(
            'booking_id',
            $booking->id
        )
            ->where(
                'customer_id',
                $customer->id
            )
            ->first();

        if ($existingReview) {
            throw new \RuntimeException(
                'Booking ini sudah memiliki review.'
            );
        }

        $item = $booking->items->first();

        return DB::transaction(function () use (
            $booking,
            $customer,
            $item,
            $rating,
            $review,
            $request
        ) {
            $reviewData = Review::create([
                'booking_id' => $booking->id,
                'customer_id' => $customer->id,
                'agent_profile_id' =>
                    $booking->agent_profile_id,
                'vehicle_id' => $item->vehicle_id,
                'rating' => $rating,
                'review' => $review,
                'status' => 'pending',
                'published_at' => null,
                'moderation_note' => null,
                'moderated_by' => null,
            ]);

            // Audit log
            $this->auditLogService->created(
                $customer,
                'review',
                'Customer membuat review kendaraan.',
                $reviewData,
                $reviewData->toArray(),
                $request
            );

            // Notification ke mitra
            $this->notificationTriggerService
                ->reviewCreated($reviewData);

            return $reviewData->refresh();
        });
    }

    /**
     * Mitra membalas ulasan customer pada unit miliknya.
     *
     * Balasan bersifat publik (ditampilkan di halaman ulasan unit), sehingga
     * hanya boleh ditulis oleh mitra pemilik unit dan ulasan tidak boleh dalam
     * status yang disembunyikan admin.
     */
    public function reply(
        Review $review,
        User $agent,
        string $reply,
        ?Request $request = null
    ): Review {
        if (!$agent->hasRole('mitra')) {
            throw new \RuntimeException(
                'Hanya mitra yang dapat membalas ulasan.'
            );
        }

        $review->loadMissing('agentProfile');

        if ($review->agentProfile?->user_id !== $agent->id) {
            throw new \RuntimeException(
                'Anda tidak berhak membalas ulasan ini.'
            );
        }

        if ($review->status === 'hidden') {
            throw new \RuntimeException(
                'Ulasan ini disembunyikan admin dan tidak dapat dibalas.'
            );
        }

        return DB::transaction(function () use (
            $review,
            $agent,
            $reply,
            $request
        ) {
            $oldValues = $review->toArray();

            $review->update([
                'reply' => $reply,
                'replied_at' => now(),
            ]);

            $review->refresh();

            $this->auditLogService->updated(
                $agent,
                'review',
                'Mitra membalas ulasan customer.',
                $review,
                $oldValues,
                $review->toArray(),
                $request
            );

            return $review;
        });
    }

    /**
     * Admin melakukan moderation terhadap review.
     */
    public function moderate(
        Review $review,
        User $admin,
        string $status,
        ?string $moderationNote = null,
        ?Request $request = null
    ): Review {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat melakukan moderation review.'
            );
        }

        if (!in_array($status, [
            'published',
            'hidden',
            'rejected',
        ], true)) {
            throw new \RuntimeException(
                'Status moderation review tidak valid.'
            );
        }

        if ($review->status !== 'pending') {
            throw new \RuntimeException(
                'Review ini sudah dimoderasi.'
            );
        }

        return DB::transaction(function () use (
            $review,
            $admin,
            $status,
            $moderationNote,
            $request
        ) {
            $oldValues = $review->toArray();

            $review->update([
                'status' => $status,
                'published_at' =>
                    $status === 'published'
                        ? now()
                        : null,
                'moderation_note' => $moderationNote,
                'moderated_by' => $admin->id,
            ]);

            $review->refresh();

            $this->auditLogService->updated(
                $admin,
                'review',
                'Admin melakukan moderation review.',
                $review,
                $oldValues,
                $review->toArray(),
                $request
            );

            return $review;
        });
    }
}