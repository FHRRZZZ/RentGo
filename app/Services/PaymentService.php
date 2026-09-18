<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {
    }

    /**
     * Membuat payment untuk booking.
     *
     * 10.27.8.1 Audit Payment Create
     */
    public function create(
        User $customer,
        Booking $booking,
        array $data,
        ?UploadedFile $proofFile = null,
        ?Request $request = null
    ): Payment {
        return DB::transaction(function () use (
            $customer,
            $booking,
            $data,
            $proofFile,
            $request
        ) {
            if ($booking->customer_id !== $customer->id) {
                throw ValidationException::withMessages([
                    'booking_id' =>
                        'Anda tidak memiliki akses ke booking ini.',
                ]);
            }

            if ($booking->status !== 'pending_payment') {
                throw ValidationException::withMessages([
                    'booking_id' =>
                        'Booking ini tidak dapat dibayar pada status saat ini.',
                ]);
            }

            $existingPayment = $booking
                ->payments()
                ->whereIn('status', [
                    'pending',
                    'paid',
                ])
                ->exists();

            if ($existingPayment) {
                throw ValidationException::withMessages([
                    'booking_id' =>
                        'Booking ini sudah memiliki pembayaran aktif.',
                ]);
            }

            $amount = $booking->total_amount;

            $proofFilePath = null;

            if ($proofFile) {
                $proofFilePath = $proofFile->store(
                    "payment-proofs/{$booking->id}",
                    'private'
                );
            }

            $paymentNumber =
                $this->generatePaymentNumber();

            $status = $data['payment_method'] === 'cash'
                ? 'paid'
                : 'pending';

            $paidAt = $status === 'paid'
                ? now()
                : null;

            $payment = Payment::create([
                'booking_id' =>
                    $booking->id,

                'payment_number' =>
                    $paymentNumber,

                'payment_method' =>
                    $data['payment_method'],

                'amount' =>
                    $amount,

                'status' =>
                    $status,

                'proof_file_path' =>
                    $proofFilePath,

                'paid_at' =>
                    $paidAt,

                'verified_by' =>
                    null,

                'verified_at' =>
                    null,

                'notes' =>
                    $data['notes'] ?? null,
            ]);

            /*
             * Audit Log:
             * Customer membuat payment.
             */
            $this->auditLogService->created(
                $customer,
                'payment',
                'Membuat pembayaran baru.',
                $payment,
                $payment->toArray(),
                $request
            );

            /*
             * Cash langsung dianggap paid.
             */
            if ($status === 'paid') {
                $payment->booking()->update([
                    'status' =>
                        'waiting_agent_confirmation',
                ]);

                /*
                 * Notification:
                 * Customer + Mitra.
                 */
                $this->notificationTriggerService
                    ->paymentVerified($payment);
            }

            return $payment->refresh();
        });
    }

    /**
     * Verifikasi pembayaran oleh admin.
     *
     * 10.27.8.2 Audit Payment Status
     */
    public function verify(
        Payment $payment,
        User $admin,
        string $status,
        ?string $notes = null,
        ?Request $request = null
    ): Payment {
        return DB::transaction(function () use (
            $payment,
            $admin,
            $status,
            $notes,
            $request
        ) {
            if (!in_array(
                $status,
                [
                    'paid',
                    'failed',
                    'expired',
                    'cancelled',
                ],
                true
            )) {
                throw ValidationException::withMessages([
                    'status' =>
                        'Status pembayaran tidak valid.',
                ]);
            }

            if ($payment->status !== 'pending') {
                throw ValidationException::withMessages([
                    'status' =>
                        'Pembayaran ini sudah tidak menunggu verifikasi.',
                ]);
            }

            $oldValues =
                $payment->toArray();

            $payment->update([
                'status' =>
                    $status,

                'paid_at' =>
                    $status === 'paid'
                        ? now()
                        : null,

                'verified_by' =>
                    $admin->id,

                'verified_at' =>
                    now(),

                'notes' =>
                    $notes ?? $payment->notes,
            ]);

            /*
             * Payment berhasil.
             */
            if ($status === 'paid') {
                $payment->booking()->update([
                    'status' =>
                        'waiting_agent_confirmation',
                ]);

                $this->notificationTriggerService
                    ->paymentVerified($payment);
            }

            /*
             * Payment gagal / expired / cancelled.
             */
            if (in_array(
                $status,
                [
                    'failed',
                    'expired',
                    'cancelled',
                ],
                true
            )) {
                $payment->booking()->update([
                    'status' =>
                        'pending_payment',
                ]);

                $this->notificationTriggerService
                    ->paymentFailed(
                        $payment,
                        $status
                    );
            }

            $payment->refresh();

            /*
             * Audit Log:
             * Admin mengubah status payment.
             */
            $description = match ($status) {
                'paid' =>
                    'Admin memverifikasi pembayaran sebagai berhasil.',

                'failed' =>
                    'Admin menyatakan pembayaran gagal.',

                'expired' =>
                    'Admin menyatakan pembayaran telah kedaluwarsa.',

                'cancelled' =>
                    'Admin membatalkan pembayaran.',

                default =>
                    'Admin memperbarui status pembayaran.',
            };

            $this->auditLogService->updated(
                $admin,
                'payment',
                $description,
                $payment,
                $oldValues,
                $payment->toArray(),
                $request
            );

            return $payment;
        });
    }

    /**
     * Menghapus file bukti pembayaran.
     */
    public function deleteProof(
        Payment $payment
    ): void {
        if ($payment->proof_file_path) {
            Storage::disk('private')->delete(
                $payment->proof_file_path
            );
        }
    }

    /**
     * Generate nomor payment.
     */
    private function generatePaymentNumber(): string
    {
        do {
            $number =
                'PAY-'
                . now()->format('YmdHis')
                . '-'
                . random_int(100, 999);

        } while (
            Payment::where(
                'payment_number',
                $number
            )->exists()
        );

        return $number;
    }
}