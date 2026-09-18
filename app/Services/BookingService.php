<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingItem;
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

class BookingService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
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

        return DB::transaction(function () use (
            $booking,
            $agent,
            $status,
            $agentNote,
            $request,
        ) {
            $booking->update([
                'status' => $status,
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

                'delivery_address' =>
                    $data['delivery_address']
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

                'delivery_address' =>
                    $data['delivery_address']
                    ?? null,

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