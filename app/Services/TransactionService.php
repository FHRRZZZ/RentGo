<?php

namespace App\Services;
use App\Services\AuditLogService;
use App\Services\NotificationTriggerService;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\RentalDamage;
use App\Models\Transaction;
use App\Models\TransactionCommission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionService
{
    public function __construct(
        private AuditLogService $auditLogService,
        private NotificationTriggerService $notificationTriggerService,
    ) {}
    
    /**
     * Persentase komisi default RentGo.
     */
    protected float $commissionPercentage = 10.00;

    public function create(
        Booking $booking,
        User $actor,
        ?string $notes = null,
        ?Request $request = null
    ): Transaction {
        if (!$actor->hasAnyRole(['admin', 'mitra'])) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses untuk membuat transaksi.'
            );
        }

        $booking->loadMissing([
            'items',
            'agentProfile',
            'customer',
            'rentalCheckin',
            'rentalDamages',
            'transaction',
        ]);

        if ($booking->transaction) {
            return $booking->transaction;
        }

        if ($booking->status !== 'returned') {
            throw new \RuntimeException(
                'Transaksi hanya dapat dibuat setelah kendaraan dikembalikan.'
            );
        }

        if (!$booking->rentalCheckin) {
            throw new \RuntimeException(
                'Data check-in / return belum tersedia.'
            );
        }

        if (
            $actor->hasRole('mitra') &&
            $booking->agentProfile?->user_id !== $actor->id
        ) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        $item = $booking->items->first();

        if (!$item) {
            throw new \RuntimeException(
                'Booking tidak memiliki kendaraan.'
            );
        }

        /*
         * Nilai utama transaksi.
         */
        $rentalAmount = (float) $booking->rental_amount;
        $deliveryFee = (float) $booking->delivery_fee;
        $serviceFee = (float) $booking->service_fee;

        /*
         * Late return.
         */
        $lateFee = (float) (
            $booking->rentalCheckin->late_return_fee ?? 0
        );

        /*
         * Damage yang dipotong dari deposit.
         */
        $deductionAmount = (float) $booking
            ->rentalDamages
            ->where('deducted_from_deposit', true)
            ->sum('customer_charge');

        /*
         * Damage yang tidak dipotong dari deposit
         * dianggap sebagai additional charge.
         */
        $additionalDamageCharge = (float) $booking
            ->rentalDamages
            ->where('deducted_from_deposit', false)
            ->sum('customer_charge');

        $additionalFee = $lateFee + $additionalDamageCharge;

        /*
         * Deposit customer.
         */
        $depositAmount = (float) $booking->deposit_amount;

        /*
         * Deposit tidak boleh dipotong melebihi nilai deposit.
         */
        $deductionAmount = min(
            $deductionAmount,
            $depositAmount
        );

        /*
         * Sisa deposit yang dikembalikan ke customer.
         */
        $refundAmount = max(
            0,
            $depositAmount - $deductionAmount
        );

        /*
         * Total transaksi.
         *
         * Deposit dikurangi deduction karena bagian
         * deposit yang digunakan untuk damage tidak
         * dikembalikan ke customer.
         */
        $totalAmount =
            $rentalAmount
            + $deliveryFee
            + $serviceFee
            + $additionalFee
            + $depositAmount
            - $deductionAmount;

        return DB::transaction(function () use (
            $booking,
            $actor,
            $rentalAmount,
            $deliveryFee,
            $serviceFee,
            $additionalFee,
            $depositAmount,
            $deductionAmount,
            $refundAmount,
            $totalAmount,
            $notes,
            $request,
        ) {
            $transaction = Transaction::create([
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
                'agent_profile_id' => $booking->agent_profile_id,

                'transaction_number' =>
                    'TRX-'
                    . now()->format('YmdHis')
                    . '-'
                    . strtoupper(Str::random(6)),

                'rental_amount' => $rentalAmount,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'additional_fee' => $additionalFee,

                'deposit_amount' => $depositAmount,
                'deduction_amount' => $deductionAmount,
                'refund_amount' => $refundAmount,

                'total_amount' => $totalAmount,

                'status' => 'pending',

                'notes' => $notes,
            ]);

            $this->auditLogService->created(
                $actor,
                'transaction',
                'Transaksi dibuat setelah kendaraan dikembalikan.',
                $transaction,
                $transaction->toArray(),
                $request
            );

            /*
             * Buat commission.
             */
            $this->createCommission(
                $transaction,
                $booking
            );

            return $transaction->refresh();
        });
    }

    /**
     * Membuat commission berdasarkan nilai rental.
     *
     * Deposit dan delivery tidak dihitung sebagai
     * dasar commission.
     */
    protected function createCommission(
        Transaction $transaction,
        Booking $booking
    ): TransactionCommission {
        $commissionBase = (float) $transaction->rental_amount;

        $commissionPercentage =
            $this->commissionPercentage;

        $commissionAmount =
            $commissionBase
            * ($commissionPercentage / 100);

        $netAmount =
            $commissionBase
            - $commissionAmount;

        return TransactionCommission::create([
            'transaction_id' => $transaction->id,
            'agent_profile_id' => $booking->agent_profile_id,

            'commission_base' => $commissionBase,

            'commission_percentage' =>
                $commissionPercentage,

            'commission_amount' =>
                $commissionAmount,

            'net_amount' =>
                $netAmount,

            'status' => 'calculated',

            'calculated_at' => now(),
        ]);
    }

    /**
     * Menyelesaikan transaksi.
     */
    public function complete(
        Transaction $transaction,
        User $admin,
        ?Request $request = null
    ): Transaction {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat menyelesaikan transaksi.'
            );
        }

        if ($transaction->status !== 'pending') {
            throw new \RuntimeException(
                'Transaksi ini tidak dapat diselesaikan.'
            );
        }

        return DB::transaction(function () use ($transaction, $admin, $request) {
            $oldTransactionValues = $transaction->toArray();

            $transaction->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            $transaction->refresh();

            $this->auditLogService->updated(
                $admin,
                'transaction',
                'Admin menyelesaikan transaksi.',
                $transaction,
                $oldTransactionValues,
                $transaction->toArray(),
                $request
            );

            // Ubah status booking menjadi completed
            if ($transaction->booking) {
                $booking = $transaction->booking;
                $oldBookingValues = $booking->toArray();

                $booking->update(['status' => 'completed']);
                $booking->refresh();

                $this->auditLogService->updated(
                    $admin,
                    'booking',
                    'Status booking berubah dari returned menjadi completed karena transaksi diselesaikan.',
                    $booking,
                    $oldBookingValues,
                    $booking->toArray(),
                    $request
                );

                // Buat rekaman refund deposit jika ada sisa deposit
                if ((float) $transaction->refund_amount > 0) {
                    $payment = $booking->payments()
                        ->where('status', 'paid')
                        ->latest()
                        ->first();

                    if ($payment) {
                        \App\Models\Refund::firstOrCreate(
                            [
                                'booking_id' => $transaction->booking_id,
                                'reason'     => 'Pengembalian sisa deposit sewa.',
                            ],
                            [
                                'payment_id'    => $payment->id,
                                'refund_number' => 'REF-DEP-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(6)),
                                'amount'        => $transaction->refund_amount,
                                'status'        => 'pending',
                            ]
                        );
                    }
                }
            }

            // Notifikasi ke customer dan mitra bahwa transaksi selesai
            $this->notificationTriggerService->transactionCompleted($transaction);

            return $transaction->refresh();
        });
    }
}