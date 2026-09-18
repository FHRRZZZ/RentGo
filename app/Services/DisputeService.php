<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Dispute;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DisputeService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Membuat dispute baru.
     */
    public function create(
        User $initiator,
        array $data,
        array $attachments = []
    ): Dispute {
        if (!$initiator->hasAnyRole([
            'customer',
            'mitra',
        ])) {
            throw new \RuntimeException(
                'Hanya customer atau mitra yang dapat membuat dispute.'
            );
        }

        $booking = null;

        if (!empty($data['booking_id'])) {
            $booking = Booking::query()
                ->with([
                    'agentProfile',
                    'customer',
                ])
                ->findOrFail($data['booking_id']);

            $isCustomerOwner =
                $booking->customer_id === $initiator->id;

            $isMitraOwner =
                $booking->agentProfile?->user_id === $initiator->id;

            if (!$isCustomerOwner && !$isMitraOwner) {
                throw new \RuntimeException(
                    'Anda tidak memiliki akses ke booking ini.'
                );
            }
        }

        $respondentId = $data['respondent_id'] ?? null;

        if ($booking && !$respondentId) {
            if ($initiator->hasRole('customer')) {
                $respondentId = $booking->agentProfile?->user_id;
            } elseif ($initiator->hasRole('mitra')) {
                $respondentId = $booking->customer_id;
            }
        }

        if ($respondentId === $initiator->id) {
            throw new \RuntimeException(
                'Anda tidak dapat membuat dispute terhadap diri sendiri.'
            );
        }

        $attachmentPaths = [];

        foreach ($attachments as $attachment) {
            if (!$attachment instanceof UploadedFile) {
                continue;
            }

            $attachmentPaths[] = $attachment->store(
                'disputes',
                'public'
            );
        }

        $dispute = Dispute::create([
            'booking_id' => $booking?->id,
            'initiator_id' => $initiator->id,
            'respondent_id' => $respondentId,
            'subject' => $data['subject'],
            'description' => $data['description'],
            'category' => $data['category'],
            'attachments' => $attachmentPaths ?: null,
            'status' => 'pending',
            'resolution' => null,
            'resolution_party' => null,
            'refund_amount' => 0,
            'resolved_at' => null,
            'notes' => null,
        ]);

        $admins = User::role('admin')->get();

        foreach ($admins as $admin) {
            $this->notificationService->create(
                $admin,
                'new_dispute',
                'Dispute Baru',
                'Ada dispute baru yang perlu ditangani oleh admin.',
                [
                    'dispute_id' => $dispute->id,
                    'booking_id' => $dispute->booking_id,
                    'subject' => $dispute->subject,
                    'category' => $dispute->category,
                    'initiator_id' => $dispute->initiator_id,
                ]
            );
        }

        return $dispute;
    }

    /**
     * Memproses dispute oleh admin.
     */
    public function process(
        Dispute $dispute,
        User $admin,
        string $status,
        ?int $assignedTo = null,
        ?string $resolution = null,
        ?string $resolutionParty = null,
        float $refundAmount = 0,
        ?string $notes = null
    ): Dispute {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat memproses dispute.'
            );
        }

        if (
            !in_array(
                $dispute->status,
                ['pending', 'investigating'],
                true
            )
        ) {
            throw new \RuntimeException(
                'Dispute ini sudah tidak dapat diproses.'
            );
        }

        if (
            !in_array(
                $status,
                ['investigating', 'resolved', 'rejected'],
                true
            )
        ) {
            throw new \InvalidArgumentException(
                'Status dispute tidak valid.'
            );
        }

        /*
         * Refund tidak boleh negatif.
         */
        if ($refundAmount < 0) {
            throw new \InvalidArgumentException(
                'Jumlah refund tidak boleh negatif.'
            );
        }

        /*
         * Jika status resolved, resolusi sebaiknya diisi.
         */
        if (
            $status === 'resolved' &&
            blank($resolution)
        ) {
            throw new \InvalidArgumentException(
                'Resolusi wajib diisi ketika dispute diselesaikan.'
            );
        }

        /*
         * Jika tidak ada refund, pihak resolusi boleh none/null.
         */
        if (
            $resolutionParty !== null &&
            !in_array(
                $resolutionParty,
                [
                    'customer',
                    'mitra',
                    'both',
                    'none',
                ],
                true
            )
        ) {
            throw new \InvalidArgumentException(
                'Pihak resolusi tidak valid.'
            );
        }

        $resolvedAt = in_array(
            $status,
            ['resolved', 'rejected'],
            true
        )
            ? now()
            : null;

        $dispute->update([
            'status' => $status,
            'assigned_to' => $assignedTo,
            'resolution' => $resolution,
            'resolution_party' => $resolutionParty,
            'refund_amount' => $refundAmount,
            'resolved_at' => $resolvedAt,
            'notes' => $notes,
        ]);

        $dispute->loadMissing([
            'initiator',
            'respondent',
        ]);

        $recipients = collect([
            $dispute->initiator,
            $dispute->respondent,
        ])
            ->filter()
            ->unique('id');

        foreach ($recipients as $recipient) {
            if ($status === 'investigating') {
                $this->notificationService->create(
                    $recipient,
                    'dispute_investigating',
                    'Dispute Sedang Diproses',
                    'Dispute "'
                        . $dispute->subject
                        . '" sedang diproses oleh admin.',
                    [
                        'dispute_id' => $dispute->id,
                        'booking_id' => $dispute->booking_id,
                        'status' => $dispute->status,
                    ]
                );
            }

            if ($status === 'resolved') {
                $this->notificationService->create(
                    $recipient,
                    'dispute_resolved',
                    'Dispute Diselesaikan',
                    'Dispute "'
                        . $dispute->subject
                        . '" telah diselesaikan oleh admin.',
                    [
                        'dispute_id' => $dispute->id,
                        'booking_id' => $dispute->booking_id,
                        'status' => $dispute->status,
                        'resolution' => $dispute->resolution,
                        'resolution_party' => $dispute->resolution_party,
                        'refund_amount' => (float) $dispute->refund_amount,
                    ]
                );
            }

            if ($status === 'rejected') {
                $this->notificationService->create(
                    $recipient,
                    'dispute_rejected',
                    'Dispute Ditolak',
                    'Dispute "'
                        . $dispute->subject
                        . '" telah ditolak oleh admin.',
                    [
                        'dispute_id' => $dispute->id,
                        'booking_id' => $dispute->booking_id,
                        'status' => $dispute->status,
                        'resolution' => $dispute->resolution,
                        'notes' => $dispute->notes,
                    ]
                );
            }
        }

        return $dispute->refresh();
    }

    /**
     * Menghapus file attachment dispute.
     */
    public function deleteAttachments(Dispute $dispute): void
    {
        if (empty($dispute->attachments)) {
            return;
        }

        foreach ($dispute->attachments as $path) {
            Storage::disk('public')->delete($path);
        }

        $dispute->update([
            'attachments' => null,
        ]);
    }
}