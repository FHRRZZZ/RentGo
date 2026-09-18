<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RefundService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {}

    public function createForRejectedBooking(
        Booking $booking,
        User $actor,
        ?Request $request = null
    ): Refund {
        if ($booking->status !== 'rejected') {
            throw new \RuntimeException(
                'Refund hanya dapat dibuat untuk booking yang ditolak.'
            );
        }

        $payment = $booking->payments()
            ->where('status', 'paid')
            ->latest()
            ->first();

        if (!$payment) {
            throw new \RuntimeException(
                'Tidak ditemukan pembayaran yang sudah dibayar.'
            );
        }

        $existingRefund = Refund::query()
            ->where('booking_id', $booking->id)
            ->whereIn('status', [
                'pending',
                'processing',
                'completed',
            ])
            ->first();

        if ($existingRefund) {
            return $existingRefund;
        }

        $refund = Refund::create([
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'refund_number' => 'REF-'
                . now()->format('YmdHis')
                . '-'
                . strtoupper(Str::random(6)),
            'amount' => $payment->amount,
            'reason' => 'Booking ditolak oleh mitra.',
            'status' => 'pending',
        ]);

        $this->auditLogService->created(
            $actor,
            'refund',
            'Membuat refund untuk booking yang ditolak.',
            $refund,
            $refund->toArray(),
            $request
        );

        return $refund;
    }

    public function createForCancelledBooking(
        Booking $booking,
        User $actor,
        ?string $reason = null,
        ?Request $request = null
    ): Refund {
        $payment = $booking->payments()
            ->where('status', 'paid')
            ->latest()
            ->first();

        if (!$payment) {
            throw new \RuntimeException(
                'Tidak ditemukan pembayaran yang sudah dibayar.'
            );
        }

        $existingRefund = Refund::query()
            ->where('booking_id', $booking->id)
            ->whereIn('status', [
                'pending',
                'processing',
                'completed',
            ])
            ->first();

        if ($existingRefund) {
            return $existingRefund;
        }

        $refund = Refund::create([
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'refund_number' => 'REF-'
                . now()->format('YmdHis')
                . '-'
                . strtoupper(Str::random(6)),
            'amount' => $payment->amount,
            'reason' => $reason ?? 'Booking dibatalkan oleh customer.',
            'status' => 'pending',
        ]);

        $this->auditLogService->created(
            $actor,
            'refund',
            'Membuat refund untuk booking yang dibatalkan.',
            $refund,
            $refund->toArray(),
            $request
        );

        return $refund;
    }

    public function process(
        Refund $refund,
        User $admin,
        string $status,
        ?string $notes = null,
        ?Request $request = null
    ): Refund {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat memproses refund.'
            );
        }

        if (!in_array(
            $status,
            [
                'processing',
                'completed',
                'failed',
                'cancelled',
            ],
            true
        )) {
            throw new \InvalidArgumentException(
                'Status refund tidak valid.'
            );
        }

        if (!in_array(
            $refund->status,
            [
                'pending',
                'processing',
            ],
            true
        )) {
            throw new \RuntimeException(
                'Refund ini sudah tidak dapat diproses.'
            );
        }

        $oldValues = $refund->toArray();

        $refund->update([
            'status' => $status,
            'processed_by' => $admin->id,
            'notes' => $notes,
            'refunded_at' =>
                $status === 'completed'
                    ? now()
                    : null,
        ]);

        $refund->refresh();

        /*
        |--------------------------------------------------------------------------
        | Notification - Refund Processed
        |--------------------------------------------------------------------------
        */

        if ($status === 'completed') {
            $this->notificationTriggerService
                ->refundProcessed($refund);
        }

        /*
        |--------------------------------------------------------------------------
        | Audit Log - Refund Updated
        |--------------------------------------------------------------------------
        */

        $description = match ($status) {
            'processing' =>
                'Admin memproses refund.',

            'completed' =>
                'Admin menyelesaikan refund.',

            'failed' =>
                'Admin menyatakan refund gagal.',

            'cancelled' =>
                'Admin membatalkan refund.',

            default =>
                'Admin memperbarui status refund.',
        };

        $this->auditLogService->updated(
            $admin,
            'refund',
            $description,
            $refund,
            $oldValues,
            $refund->toArray(),
            $request
        );

        return $refund;
    }
}