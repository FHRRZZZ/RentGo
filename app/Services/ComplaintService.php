<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ComplaintService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected NotificationTriggerService $notificationTriggerService
    ) {
    }

    /**
     * Customer / Mitra membuat complaint.
     */
    public function create(
        ?Booking $booking,
        User $complainant,
        array $data,
        ?Request $request = null
    ): Complaint {
        /*
         * Hanya customer dan mitra yang dapat
         * membuat complaint.
         */
        if (!$complainant->hasAnyRole([
            'customer',
            'mitra',
        ])) {
            throw new \RuntimeException(
                'Hanya customer atau mitra yang dapat membuat complaint.'
            );
        }

        /*
         * Jika complaint berkaitan dengan booking,
         * pastikan user memiliki akses ke booking tersebut.
         */
        if ($booking) {
            $booking->loadMissing([
                'customer',
                'agentProfile',
            ]);

            if (
                $booking->customer_id !== $complainant->id
                &&
                $booking->agentProfile?->user_id !== $complainant->id
            ) {
                throw new \RuntimeException(
                    'Anda tidak memiliki akses ke booking ini.'
                );
            }
        }

        /*
         * User tidak boleh melaporkan dirinya sendiri.
         */
        $reportedUserId =
            $data['reported_user_id'] ?? null;

        if (
            $reportedUserId !== null
            &&
            (int) $reportedUserId === $complainant->id
        ) {
            throw new \RuntimeException(
                'Anda tidak dapat melaporkan diri sendiri.'
            );
        }

        return DB::transaction(function () use (
            $booking,
            $complainant,
            $data,
            $request
        ) {
            /*
             * ==================================================
             * UPLOAD ATTACHMENT
             * ==================================================
             */
            $attachmentPaths = [];

            $attachments =
                $data['attachments'] ?? [];

            foreach ($attachments as $attachment) {
                if ($attachment instanceof UploadedFile) {
                    $attachmentPaths[] =
                        $attachment->store(
                            'complaints'
                            . (
                                $booking
                                    ? '/' . $booking->id
                                    : ''
                            ),
                            'public'
                        );
                }
            }

            /*
             * ==================================================
             * CREATE COMPLAINT
             * ==================================================
             */
            $complaint = Complaint::create([
                'booking_id' =>
                    $booking?->id,

                'complainant_id' =>
                    $complainant->id,

                'reported_user_id' =>
                    $data['reported_user_id'] ?? null,

                'subject' =>
                    $data['subject'],

                'description' =>
                    $data['description'],

                'category' =>
                    $data['category'] ?? 'other',

                'attachments' =>
                    $attachmentPaths,

                'priority' =>
                    $data['priority'] ?? 'medium',

                'status' =>
                    'open',

                'assigned_to' =>
                    null,

                'resolved_at' =>
                    null,

                'resolution' =>
                    null,
            ]);

            /*
             * ==================================================
             * NOTIFICATION
             * ==================================================
             *
             * Admin mendapatkan notification bahwa
             * ada complaint baru.
             */
            $this->notificationTriggerService
                ->complaintCreated($complaint);

            /*
             * ==================================================
             * AUDIT LOG
             * ==================================================
             */
            $this->auditLogService->created(
                $complainant,
                'complaint',
                'User membuat complaint.',
                $complaint,
                $complaint->toArray(),
                $request
            );

            return $complaint->refresh();
        });
    }

    /**
     * Admin memproses complaint.
     */
    public function process(
        Complaint $complaint,
        User $admin,
        string $status,
        ?int $assignedTo = null,
        ?string $resolution = null,
        ?Request $request = null
    ): Complaint {
        /*
         * Hanya admin yang dapat memproses complaint.
         */
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat memproses complaint.'
            );
        }

        /*
         * Status yang diperbolehkan.
         */
        $allowedStatuses = [
            'in_review',
            'resolved',
            'rejected',
            'closed',
        ];

        if (!in_array(
            $status,
            $allowedStatuses,
            true
        )) {
            throw new \RuntimeException(
                'Status complaint tidak valid.'
            );
        }

        /*
         * Complaint yang sudah selesai tidak dapat
         * diproses kembali.
         */
        if (in_array(
            $complaint->status,
            [
                'resolved',
                'rejected',
                'closed',
            ],
            true
        )) {
            throw new \RuntimeException(
                'Complaint yang sudah selesai tidak dapat diproses kembali.'
            );
        }

        return DB::transaction(function () use (
            $complaint,
            $admin,
            $status,
            $assignedTo,
            $resolution,
            $request
        ) {
            /*
             * ==================================================
             * SIMPAN DATA LAMA
             * ==================================================
             */
            $oldValues =
                $complaint->toArray();

            /*
             * ==================================================
             * UPDATE COMPLAINT
             * ==================================================
             */
            $complaint->update([
                'status' =>
                    $status,

                'assigned_to' =>
                    $assignedTo ?? $admin->id,

                'resolved_at' =>
                    in_array(
                        $status,
                        [
                            'resolved',
                            'closed',
                        ],
                        true
                    )
                        ? now()
                        : null,

                'resolution' =>
                    $resolution,
            ]);

            /*
             * Refresh data setelah update.
             */
            $complaint->refresh();

            /*
             * ==================================================
             * AUDIT LOG
             * ==================================================
             */
            $description = match ($status) {
                'in_review' =>
                    'Admin mulai meninjau complaint.',

                'resolved' =>
                    'Admin menyelesaikan complaint.',

                'rejected' =>
                    'Admin menolak complaint.',

                'closed' =>
                    'Admin menutup complaint.',

                default =>
                    'Admin memproses complaint.',
            };

            $this->auditLogService->updated(
                $admin,
                'complaint',
                $description,
                $complaint,
                $oldValues,
                $complaint->toArray(),
                $request
            );

            /*
             * ==================================================
             * NOTIFICATION
             * ==================================================
             *
             * Complainant mendapatkan notification bahwa
             * complaint telah diproses oleh admin.
             */
            $this->notificationTriggerService
                ->complaintProcessed($complaint);

            return $complaint;
        });
    }
}