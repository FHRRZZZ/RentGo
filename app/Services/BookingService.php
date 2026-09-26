<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Payment;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Constants\BookingStatus;
use App\Services\NotificationTriggerService;
use App\Services\RefundService;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;

class BookingService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService,
        protected ComplianceService $complianceService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Confirm Booking By Agent
    |--------------------------------------------------------------------------
    */

    public function confirmByAgent(
        Booking $booking,
        User $agent,
        string $status,
        ?string $agentNote = null,
        ?Request $request = null
    ): Booking {
        if (!$agent->hasRole('mitra')) {
            throw new \RuntimeException(
                'Hanya mitra yang dapat mengonfirmasi booking.'
            );
        }

        $booking->loadMissing([
            'agentProfile',
            'payments',
        ]);

        if ($booking->agentProfile?->user_id !== $agent->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        if ($booking->status !== 'waiting_agent_confirmation') {
            throw new \RuntimeException(
                'Booking ini tidak sedang menunggu konfirmasi mitra.'
            );
        }

        if (!in_array($status, ['confirmed', 'rejected'], true)) {
            throw new \InvalidArgumentException(
                'Status konfirmasi booking tidak valid.'
            );
        }

        /*
         * Mitra hanya boleh mengonfirmasi pesanan setelah pembayaran
         * benar-benar masuk (diverifikasi mitra untuk QRIS/transfer bank,
         * atau ditandai lunas saat serah terima untuk COD).
         */
        if ($status === 'confirmed') {
            $this->assertPaymentSettled($booking);
        }

        /*
         * Alur disederhanakan: konfirmasi mitra langsung membawa pesanan ke
         * tahap "Berjalan" (ongoing). Mitra tidak perlu langkah serah terima
         * terpisah, sehingga progress tracker langsung berpindah dari
         * Konfirmasi ke Berjalan begitu tombol Konfirmasi Pesanan ditekan.
         */
        $newStatus = $status === 'confirmed'
            ? BookingStatus::ONGOING
            : $status;

        return DB::transaction(function () use (
            $booking,
            $agent,
            $status,
            $newStatus,
            $agentNote,
            $request,
        ) {
            $booking->update([
                'status' => $newStatus,
                'agent_note' => $agentNote,
            ]);

            if ($status === 'confirmed') {
                $this->notificationTriggerService
                    ->bookingConfirmed($booking);
            }

            if ($status === 'rejected') {
                $this->notificationTriggerService
                    ->bookingRejected($booking);
            }

            if ($status === 'rejected') {
                $hasPaidPayment = $booking->payments()
                    ->where('status', 'paid')
                    ->exists();

                if ($hasPaidPayment) {
                    $refundService = app(RefundService::class);

                    $refundService->createForRejectedBooking(
                        $booking->refresh(),
                        $agent,
                        $request
                    );
                }
            }

            return $booking->refresh();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Approve / Reject Payment By Agent (Mitra)
    |--------------------------------------------------------------------------
    */

    /**
     * Mitra memverifikasi pembayaran customer (cek mutasi/bukti bayar).
     *
     * Karena untuk QRIS & transfer bank pembayaran masuk ke rekening mitra,
     * mitra-lah yang memutuskan pembayaran valid atau tidak.
     */
    public function approvePayment(
        Booking $booking,
        Payment $payment,
        User $agent,
        ?string $notes = null,
        ?Request $request = null
    ): Payment {
        $this->assertAgentOwnsBooking($booking, $agent);
        $this->assertPaymentBelongsToBooking($payment, $booking);

        if (!$payment->isPending()) {
            throw new \RuntimeException('Pembayaran ini sudah tidak menunggu verifikasi.');
        }

        if ($payment->requiresProof() && !$payment->hasProof()) {
            throw new \RuntimeException('Customer belum mengunggah bukti pembayaran.');
        }

        return DB::transaction(function () use ($booking, $payment, $agent, $notes, $request) {
            $oldValues = $payment->toArray();

            $payment->update([
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
                'verified_by' => $agent->id,
                'verified_at' => now(),
                'notes' => $notes ?? $payment->notes,
            ]);

            $payment->refresh();

            $this->auditLogService->updated(
                $agent,
                'payment',
                'Mitra memverifikasi pembayaran customer sebagai berhasil (dana masuk).',
                $payment,
                $oldValues,
                $payment->toArray(),
                $request
            );

            /*
             * Pesanan diteruskan ke antrean konfirmasi mitra.
             */
            if ($booking->status === BookingStatus::WAITING_PAYMENT) {
                $oldBookingValues = $booking->toArray();

                $booking->update([
                    'status' => BookingStatus::WAITING_AGENT_CONFIRMATION,
                ]);

                $booking->refresh();

                $this->auditLogService->updated(
                    $agent,
                    'booking',
                    'Pembayaran customer diverifikasi mitra, booking menunggu konfirmasi mitra.',
                    $booking,
                    $oldBookingValues,
                    $booking->toArray(),
                    $request
                );
            }

            $this->notificationTriggerService->paymentVerified($payment);

            return $payment;
        });
    }

    /**
     * Mitra menolak pembayaran customer (dana tidak masuk / bukti tidak valid).
     */
    public function rejectPayment(
        Booking $booking,
        Payment $payment,
        User $agent,
        ?string $notes = null,
        ?Request $request = null
    ): Payment {
        $this->assertAgentOwnsBooking($booking, $agent);
        $this->assertPaymentBelongsToBooking($payment, $booking);

        if (!$payment->isPending()) {
            throw new \RuntimeException('Pembayaran ini sudah tidak menunggu verifikasi.');
        }

        return DB::transaction(function () use ($booking, $payment, $agent, $notes, $request) {
            $oldValues = $payment->toArray();

            $payment->update([
                'status' => 'failed',
                'paid_at' => null,
                'verified_by' => $agent->id,
                'verified_at' => now(),
                'notes' => $notes ?? $payment->notes,
            ]);

            $payment->refresh();

            $this->auditLogService->updated(
                $agent,
                'payment',
                'Mitra menolak pembayaran customer. Alasan: ' . ($notes ?? 'tidak disebutkan'),
                $payment,
                $oldValues,
                $payment->toArray(),
                $request
            );

            /*
             * Booking kembali menunggu pembayaran customer.
             */
            if (in_array($booking->status, [
                BookingStatus::WAITING_PAYMENT,
                BookingStatus::WAITING_AGENT_CONFIRMATION,
            ], true)) {
                $oldBookingValues = $booking->toArray();

                $booking->update([
                    'status' => BookingStatus::WAITING_PAYMENT,
                ]);

                $booking->refresh();

                $this->auditLogService->updated(
                    $agent,
                    'booking',
                    'Pembayaran ditolak mitra, booking kembali menunggu pembayaran.',
                    $booking,
                    $oldBookingValues,
                    $booking->toArray(),
                    $request
                );
            }

            $this->notificationTriggerService->paymentFailed($payment, 'failed');

            return $payment;
        });
    }

    /**
     * Pastikan user adalah mitra pemilik booking.
     */
    protected function assertAgentOwnsBooking(Booking $booking, User $agent): void
    {
        if (!$agent->hasRole('mitra')) {
            throw new \RuntimeException('Hanya mitra yang dapat memverifikasi pembayaran booking ini.');
        }

        $booking->loadMissing('agentProfile');

        if ($booking->agentProfile?->user_id !== $agent->id) {
            throw new \RuntimeException('Anda tidak memiliki akses ke booking ini.');
        }
    }

    /**
     * Pastikan payment memang milik booking tersebut.
     */
    protected function assertPaymentBelongsToBooking(Payment $payment, Booking $booking): void
    {
        if ((int) $payment->booking_id !== (int) $booking->id) {
            throw new \RuntimeException('Pembayaran tidak terkait dengan booking ini.');
        }
    }

    /**
     * Pastikan pembayaran booking sudah benar-benar masuk (lunas).
     *
     * Aturan RentGo: unit baru boleh dikonfirmasi/diserahkan oleh mitra
     * setelah pembayaran diverifikasi (QRIS & transfer bank) atau dibayar
     * tunai saat serah terima (COD).
     *
     * @throws ValidationException
     */
    public function assertPaymentSettled(Booking $booking): void
    {
        $payments = $booking->relationLoaded('payments')
            ? $booking->payments
            : $booking->payments()->get();

        if ($payments->isEmpty()) {
            throw ValidationException::withMessages([
                'payment' => 'Customer belum membuat pembayaran untuk pesanan ini.',
            ]);
        }

        $settled = $payments->contains(
            fn (Payment $payment) => $payment->isSettled()
        );

        if (!$settled) {
            $awaiting = $payments->contains(
                fn (Payment $payment) => $payment->awaitingVerification()
            );

            throw ValidationException::withMessages([
                'payment' => $awaiting
                    ? 'Bukti pembayaran customer belum Anda setujui. Periksa mutasi/bukti bayar lalu setujui pembayaran sebelum memproses unit.'
                    : 'Pembayaran customer belum masuk. Setujui pembayaran terlebih dahulu sebelum memproses unit.',
            ]);
        }
    }

    /**
     * Mitra menandai kendaraan siap diambil / diantar (READY_FOR_PICKUP).
     */
    public function markReadyForPickup(
        Booking $booking,
        User $agent,
        ?Request $request = null
    ): Booking {
        if (!$agent->hasRole('mitra')) {
            throw new \RuntimeException('Hanya mitra yang dapat memperbarui status siap diambil.');
        }

        $booking->loadMissing('agentProfile');

        if ($booking->agentProfile?->user_id !== $agent->id) {
            throw new \RuntimeException('Anda tidak memiliki akses ke booking ini.');
        }

        if ($booking->status !== BookingStatus::CONFIRMED) {
            throw new \RuntimeException('Booking harus berstatus confirmed sebelum dapat ditandai ready for pickup.');
        }

        /*
         * Unit baru boleh disiapkan/diserahkan setelah pembayaran lunas.
         */
        $this->assertPaymentSettled($booking);

        return DB::transaction(function () use ($booking, $agent, $request) {
            $oldValues = $booking->toArray();

            $booking->update([
                'status' => BookingStatus::READY_FOR_PICKUP,
            ]);

            $booking->refresh();

            $this->auditLogService->updated(
                $agent,
                'booking',
                'Mitra menandai unit kendaraan siap diambil/diantar (ready for pickup).',
                $booking,
                $oldValues,
                $booking->toArray(),
                $request
            );

            return $booking;
        });
    }

    /**
     * Mitra menyelesaikan pesanan setelah kendaraan dikembalikan (RETURNED).
     *
     * Alur disederhanakan: mitra cukup menekan "Selesaikan Pesanan" pada tahap
     * Dikembalikan. Transaksi sewa dibuat otomatis (bila belum ada) lalu
     * langsung ditutup, sehingga status booking menjadi COMPLETED.
     */
    public function completeByAgent(
        Booking $booking,
        User $agent,
        ?Request $request = null
    ): Booking {
        if (!$agent->hasRole('mitra')) {
            throw new \RuntimeException('Hanya mitra yang dapat menyelesaikan pesanan.');
        }

        $booking->loadMissing([
            'agentProfile',
            'items',
            'rentalCheckin',
            'rentalDamages',
            'transaction',
            'payments',
        ]);

        if ($booking->agentProfile?->user_id !== $agent->id) {
            throw new \RuntimeException('Anda tidak memiliki akses ke booking ini.');
        }

        if ($booking->status !== BookingStatus::RETURNED) {
            throw new \RuntimeException(
                'Pesanan hanya dapat diselesaikan setelah kendaraan dikembalikan.'
            );
        }

        /*
         * Transaksi sewa wajib ada sebelum ditutup. Bila mitra belum membuatnya,
         * buat otomatis lewat TransactionService (hanya boleh saat status returned).
         */
        $transactionService = app(TransactionService::class);
        $transaction = $booking->transaction
            ?: $transactionService->create($booking, $agent, null, $request);

        return DB::transaction(function () use (
            $booking,
            $transaction,
            $agent,
            $transactionService,
            $request,
        ) {
            $oldBookingValues = $booking->toArray();

            /*
             * Tutup transaksi. Bila masih pending, mitra berperan sebagai
             * aktor penyelesai (alih-alih admin) sehingga lewati guard admin
             * pada TransactionService::complete dengan meniru efeknya di sini.
             */
            if ($transaction->status === 'pending') {
                $oldTransactionValues = $transaction->toArray();

                $transaction->update([
                    'status'       => 'completed',
                    'completed_at' => now(),
                ]);
                $transaction->refresh();

                $this->auditLogService->updated(
                    $agent,
                    'transaction',
                    'Mitra menyelesaikan transaksi sewa.',
                    $transaction,
                    $oldTransactionValues,
                    $transaction->toArray(),
                    $request
                );

                // Buat rekaman refund deposit jika ada sisa deposit.
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

            $booking->update(['status' => BookingStatus::COMPLETED]);
            $booking->refresh();

            $this->auditLogService->updated(
                $agent,
                'booking',
                'Mitra menyelesaikan pesanan: status booking berubah dari returned menjadi completed.',
                $booking,
                $oldBookingValues,
                $booking->toArray(),
                $request
            );

            $this->notificationTriggerService->transactionCompleted($transaction);

            return $booking;
        });
    }

    /**
     * Customer atau Admin membatalkan booking (CANCELLED / REFUND_PENDING).
     */
    public function cancel(
        Booking $booking,
        User $user,
        ?string $reason = null,
        ?Request $request = null
    ): Booking {
        $booking->loadMissing(['payments', 'agentProfile']);

        // Hak akses: customer pemilik booking atau admin
        $isCustomer = $user->hasRole('customer') && $booking->customer_id === $user->id;
        $isAdmin = $user->hasRole('admin');

        if (!$isCustomer && !$isAdmin) {
            throw new \RuntimeException('Anda tidak memiliki akses untuk membatalkan booking ini.');
        }

        // Hanya boleh dibatalkan jika belum diserahkan (ongoing, returned, completed)
        if (in_array($booking->status, [
            BookingStatus::ONGOING,
            BookingStatus::RETURNED,
            BookingStatus::COMPLETED,
            BookingStatus::CANCELLED,
            BookingStatus::REJECTED,
            BookingStatus::EXPIRED,
        ], true)) {
            throw new \RuntimeException('Booking pada status saat ini tidak dapat dibatalkan.');
        }

        return DB::transaction(function () use ($booking, $user, $reason, $request) {
            $oldValues = $booking->toArray();

            $hasPaidPayment = $booking->payments()
                ->where('status', 'paid')
                ->exists();

            $newStatus = $hasPaidPayment
                ? BookingStatus::REFUND_PENDING
                : BookingStatus::CANCELLED;

            $booking->update([
                'status' => $newStatus,
                'customer_note' => $reason ? ($booking->customer_note . " [Dibatalkan: {$reason}]") : $booking->customer_note,
            ]);

            $booking->refresh();

            $this->auditLogService->updated(
                $user,
                'booking',
                'Booking dibatalkan. Alasan: ' . ($reason ?? 'Tidak ada alasan.'),
                $booking,
                $oldValues,
                $booking->toArray(),
                $request
            );

            // Jika sudah ada pembayaran lunas, buat refund otomatis
            if ($hasPaidPayment) {
                $refundService = app(RefundService::class);
                $refundService->createForCancelledBooking(
                    $booking,
                    $user,
                    $reason,
                    $request
                );
            }

            return $booking;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Create Booking
    |--------------------------------------------------------------------------
    */

    public function create(
        User $customer,
        array $data,
        Request $request
    ): Booking {
        // ==========================================
        // ATURAN: Customer wajib melengkapi data & dokumen (KTP, SIM)
        // sebelum dapat memesan kendaraan.
        // ==========================================
        $compliance = $this->complianceService->customerStatus($customer);

        if (!$compliance['complete']) {
            throw ValidationException::withMessages([
                'compliance' => 'Anda belum dapat memesan kendaraan. '
                    . implode(' ', $compliance['messages']),
            ]);
        }

        return DB::transaction(function () use (
            $customer,
            $data,
            $request
        ) {
            $vehicle = Vehicle::query()
                ->lockForUpdate()
                ->findOrFail(
                    $data['vehicle_id']
                );

            if ($vehicle->status !== 'available') {
                throw ValidationException::withMessages([
                    'vehicle_id' =>
                        'Kendaraan tidak tersedia.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Check Vehicle Availability
            |--------------------------------------------------------------------------
            */

            $hasBlockedAvailability =
                $vehicle
                    ->availabilities()
                    ->whereIn('status', [
                        'unavailable',
                        'maintenance',
                    ])
                    ->whereDate(
                        'start_date',
                        '<=',
                        $data['rental_end']
                    )
                    ->whereDate(
                        'end_date',
                        '>=',
                        $data['rental_start']
                    )
                    ->exists();

            if ($hasBlockedAvailability) {
                throw ValidationException::withMessages([
                    'vehicle_id' =>
                        'Kendaraan tidak tersedia pada periode tersebut.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Check Existing Booking
            |--------------------------------------------------------------------------
            */

            $hasExistingBooking =
                BookingItem::query()
                    ->where(
                        'vehicle_id',
                        $vehicle->id
                    )
                    ->whereHas(
                        'booking',
                        function ($query) {
                            $query->whereNotIn(
                                'status',
                                [
                                    'rejected',
                                    'cancelled',
                                    'completed',
                                ]
                            );
                        }
                    )
                    ->where(
                        'rental_start',
                        '<=',
                        $data['rental_end']
                    )
                    ->where(
                        'rental_end',
                        '>=',
                        $data['rental_start']
                    )
                    ->exists();

            if ($hasExistingBooking) {
                throw ValidationException::withMessages([
                    'vehicle_id' =>
                        'Kendaraan sudah dibooking pada periode tersebut.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Get Vehicle Price
            |--------------------------------------------------------------------------
            */

            $price = $vehicle
                ->prices()
                ->where(
                    'is_active',
                    true
                )
                ->where(function ($query) use ($data) {
                    $query
                        ->whereNull('start_date')
                        ->orWhereDate(
                            'start_date',
                            '<=',
                            $data['rental_start']
                        );
                })
                ->where(function ($query) use ($data) {
                    $query
                        ->whereNull('end_date')
                        ->orWhereDate(
                            'end_date',
                            '>=',
                            $data['rental_start']
                        );
                })
                ->latest('start_date')
                ->first();

            if (!$price) {
                throw ValidationException::withMessages([
                    'vehicle_id' =>
                        'Harga kendaraan tidak tersedia untuk periode tersebut.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Calculate Rental
            |--------------------------------------------------------------------------
            */

            $rentalStart = Carbon::parse(
                $data['rental_start']
            );

            $rentalEnd = Carbon::parse(
                $data['rental_end']
            );

            $rentalDays = max(
                1,
                $rentalStart->diffInDays(
                    $rentalEnd
                )
            );

            $pricePerDay =
                (float) $price->price_per_day;

            $rentalAmount =
                $pricePerDay * $rentalDays;

            $deliveryFee = ($data['fulfillment_type'] === 'delivery') ? 50000 : 0;
            $serviceFee = 10000;
            $additionalFee = 0;
            $depositAmount = 200000;

            $totalAmount =
                $rentalAmount +
                $deliveryFee +
                $serviceFee +
                $additionalFee +
                $depositAmount;

            $paymentDeadline = now()->addHours(2);

            /*
            |--------------------------------------------------------------------------
            | Generate Booking Number
            |--------------------------------------------------------------------------
            */

            $bookingNumber =
                $this->generateBookingNumber();

            /*
            |--------------------------------------------------------------------------
            | Create Booking
            |--------------------------------------------------------------------------
            */

            $booking = Booking::create([
                'customer_id' =>
                    $customer->id,

                'agent_profile_id' =>
                    $vehicle->agent_profile_id,

                'booking_number' =>
                    $bookingNumber,

                'rental_start' =>
                    $data['rental_start'],

                'rental_end' =>
                    $data['rental_end'],

                'payment_deadline' =>
                    $paymentDeadline,

                'fulfillment_type' =>
                    $data['fulfillment_type'],

                'pickup_location' =>
                    $data['pickup_location']
                    ?? null,

                // Titik presisi lokasi ambil (dipilih customer di peta).
                'pickup_latitude' =>
                    $data['pickup_latitude']
                    ?? null,

                'pickup_longitude' =>
                    $data['pickup_longitude']
                    ?? null,

                'pickup_landmark' =>
                    $data['pickup_landmark']
                    ?? null,

                'delivery_address' =>
                    $data['delivery_address']
                    ?? null,

                // Titik presisi alamat pengantaran (dipilih customer di peta).
                'delivery_latitude' =>
                    $data['delivery_latitude']
                    ?? null,

                'delivery_longitude' =>
                    $data['delivery_longitude']
                    ?? null,

                'delivery_landmark' =>
                    $data['delivery_landmark']
                    ?? null,

                'rental_amount' =>
                    $rentalAmount,

                'delivery_fee' =>
                    $deliveryFee,

                'service_fee' =>
                    $serviceFee,

                'additional_fee' =>
                    $additionalFee,

                'deposit_amount' =>
                    $depositAmount,

                'total_amount' =>
                    $totalAmount,

                'status' =>
                    BookingStatus::WAITING_PAYMENT,

                'customer_note' =>
                    $data['customer_note']
                    ?? $data['customer_notes']
                    ?? null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Create Booking Item
            |--------------------------------------------------------------------------
            */

            BookingItem::create([
                'booking_id' =>
                    $booking->id,

                'vehicle_id' =>
                    $vehicle->id,

                'rental_start' =>
                    $data['rental_start'],

                'rental_end' =>
                    $data['rental_end'],

                'rental_days' =>
                    $rentalDays,

                'price_per_day' =>
                    $pricePerDay,

                'rental_amount' =>
                    $rentalAmount,

                'notes' =>
                    null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Audit Log - Booking Created
            |--------------------------------------------------------------------------
            */

            $this->auditLogService->created(
                $customer,
                'booking',
                'Customer membuat booking baru.',
                $booking,
                $booking->toArray(),
                $request
            );
            $this->notificationTriggerService
                ->bookingCreated($booking);

            return $booking->refresh();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Update Booking
    |--------------------------------------------------------------------------
    |
    | 10.27.7.2
    | Audit Booking Update
    |
    */

    public function update(
        Booking $booking,
        User $user,
        array $data,
        Request $request
    ): Booking {
        return DB::transaction(function () use (
            $booking,
            $user,
            $data,
            $request
        ) {
            /*
            |--------------------------------------------------------------------------
            | Simpan data lama
            |--------------------------------------------------------------------------
            */

            $oldValues =
                $booking->toArray();

            /*
            |--------------------------------------------------------------------------
            | Update Booking
            |--------------------------------------------------------------------------
            */

            $booking->update([
                'rental_start' =>
                    $data['rental_start']
                    ?? $booking->rental_start,

                'rental_end' =>
                    $data['rental_end']
                    ?? $booking->rental_end,

                'fulfillment_type' =>
                    $data['fulfillment_type']
                    ?? $booking->fulfillment_type,

                'pickup_location' =>
                    $data['pickup_location']
                    ?? null,

                'pickup_latitude' =>
                    $data['pickup_latitude']
                    ?? $booking->pickup_latitude,

                'pickup_longitude' =>
                    $data['pickup_longitude']
                    ?? $booking->pickup_longitude,

                'pickup_landmark' =>
                    $data['pickup_landmark']
                    ?? $booking->pickup_landmark,

                'delivery_address' =>
                    $data['delivery_address']
                    ?? null,

                'delivery_latitude' =>
                    $data['delivery_latitude']
                    ?? $booking->delivery_latitude,

                'delivery_longitude' =>
                    $data['delivery_longitude']
                    ?? $booking->delivery_longitude,

                'delivery_landmark' =>
                    $data['delivery_landmark']
                    ?? $booking->delivery_landmark,

                'customer_note' =>
                    $data['customer_note']
                    ?? null,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Refresh Booking
            |--------------------------------------------------------------------------
            */

            $booking->refresh();

            /*
            |--------------------------------------------------------------------------
            | Audit Log - Booking Updated
            |--------------------------------------------------------------------------
            */

            $this->auditLogService->updated(
                $user,
                'booking',
                'Mengubah data booking.',
                $booking,
                $oldValues,
                $booking->toArray(),
                $request
            );

            return $booking;
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Booking
    |--------------------------------------------------------------------------
    |
    | 10.27.7.3
    | Audit Booking Delete
    |
    */

    public function delete(
        Booking $booking,
        User $user,
        Request $request
    ): void {
        DB::transaction(function () use (
            $booking,
            $user,
            $request
        ) {
            /*
            |--------------------------------------------------------------------------
            | Pastikan booking masih boleh dihapus
            |--------------------------------------------------------------------------
            */

            if (
                !in_array(
                    $booking->status,
                    [
                        'pending_payment',
                        'cancelled',
                        'rejected',
                    ],
                    true
                )
            ) {
                throw new \RuntimeException(
                    'Booking yang sudah diproses tidak dapat dihapus.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Simpan data lama sebelum delete
            |--------------------------------------------------------------------------
            */

            $oldValues =
                $booking->toArray();

            /*
            |--------------------------------------------------------------------------
            | Delete Booking
            |--------------------------------------------------------------------------
            */

            $booking->delete();

            /*
            |--------------------------------------------------------------------------
            | Audit Log - Booking Deleted
            |--------------------------------------------------------------------------
            */

            $this->auditLogService->deleted(
                $user,
                'booking',
                'Menghapus booking.',
                $booking,
                $oldValues,
                $request
            );
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Booking Number
    |--------------------------------------------------------------------------
    */

    protected function generateBookingNumber(): string
    {
        do {
            $number =
                'RG-' .
                now()->format('YmdHis') .
                '-' .
                strtoupper(
                    Str::random(5)
                );
        } while (
            Booking::where(
                'booking_number',
                $number
            )->exists()
        );

        return $number;
    }
}
