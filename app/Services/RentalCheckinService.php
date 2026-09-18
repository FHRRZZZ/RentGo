<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RentalCheckin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RentalCheckinService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {
    }

    public function create(
        Booking $booking,
        User $mitra,
        array $data,
        ?Request $request = null
    ): RentalCheckin {
        $booking->loadMissing([
            'agentProfile',
            'items.vehicle.agentProfile',
            'rentalCheckout',
        ]);

        // ==========================================
        // 1. Pastikan user adalah mitra
        // ==========================================
        if (!$mitra->hasRole('mitra')) {
            throw new \RuntimeException(
                'Hanya mitra yang dapat melakukan check-in kendaraan.'
            );
        }

        // ==========================================
        // 2. Pastikan booking milik mitra
        // ==========================================
        if ($booking->agentProfile?->user_id !== $mitra->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        // ==========================================
        // 3. Booking harus sedang berlangsung
        // ==========================================
        if ($booking->status !== 'ongoing') {
            throw new \RuntimeException(
                'Check-in hanya dapat dilakukan untuk booking yang sedang berlangsung.'
            );
        }

        // ==========================================
        // 4. Pastikan sudah ada checkout/pickup
        // ==========================================
        if (!$booking->rentalCheckout) {
            throw new \RuntimeException(
                'Booking ini belum memiliki data checkout/pickup.'
            );
        }

        // ==========================================
        // 5. Pastikan belum pernah check-in
        // ==========================================
        $existingCheckin = RentalCheckin::query()
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingCheckin) {
            throw new \RuntimeException(
                'Booking ini sudah memiliki data check-in.'
            );
        }

        // ==========================================
        // 6. Tentukan kendaraan dari booking
        // ==========================================
        $vehicleId = (int) $data['vehicle_id'];

        $bookingItem = $booking->items
            ->firstWhere('vehicle_id', $vehicleId);

        if (!$bookingItem) {
            throw new \RuntimeException(
                'Kendaraan tidak termasuk dalam booking ini.'
            );
        }

        $vehicle = $bookingItem->vehicle;

        if (!$vehicle) {
            throw new \RuntimeException(
                'Kendaraan tidak ditemukan.'
            );
        }

        // ==========================================
        // 7. Pastikan kendaraan milik mitra
        // ==========================================
        if ($vehicle->agentProfile?->user_id !== $mitra->id) {
            throw new \RuntimeException(
                'Kendaraan bukan milik mitra yang sedang login.'
            );
        }

        // ==========================================
        // 8. Validasi odometer
        // ==========================================
        $checkoutOdometer =
            (float) $booking->rentalCheckout->odometer;

        $checkinOdometer =
            (float) $data['odometer'];

        if ($checkinOdometer < $checkoutOdometer) {
            throw new \RuntimeException(
                'Odometer saat check-in tidak boleh lebih kecil dari odometer saat checkout.'
            );
        }

        // ==========================================
        // 9. Validasi waktu check-in
        // ==========================================
        $checkoutAt =
            $booking->rentalCheckout->checkout_at;

        $checkinAt =
            \Illuminate\Support\Carbon::parse(
                $data['checkin_at']
            );

        if ($checkinAt->lt($checkoutAt)) {
            throw new \RuntimeException(
                'Waktu check-in tidak boleh lebih awal dari waktu checkout.'
            );
        }

        // ==========================================
        // 10. Deteksi keterlambatan
        // ==========================================
        $rentalEnd =
            \Illuminate\Support\Carbon::parse(
                $booking->rental_end
            );

        $isLateReturn =
            $checkinAt->gt($rentalEnd);

        // ==========================================
        // 11. Hitung biaya keterlambatan
        // ==========================================
        $lateReturnFee = 0;

        if ($isLateReturn) {
            $lateMinutes =
                $rentalEnd->diffInMinutes(
                    $checkinAt
                );

            $lateDays = (int) ceil(
                $lateMinutes / (60 * 24)
            );

            $pricePerDay =
                (float) $bookingItem->price_per_day;

            $lateReturnFee =
                $lateDays * $pricePerDay;
        }

        // ==========================================
        // 12. Validasi konfirmasi customer
        // ==========================================
        if (!filter_var(
            $data['customer_confirmed'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        )) {
            throw new \RuntimeException(
                'Customer harus mengonfirmasi kondisi kendaraan sebelum check-in.'
            );
        }

        // ==========================================
        // 13. Simpan check-in
        // ==========================================
        return DB::transaction(function () use (
            $booking,
            $vehicleId,
            $data,
            $checkinAt,
            $isLateReturn,
            $lateReturnFee,
            $mitra,
            $request,
        ) {
            $photoPaths = [];

            $photos = $data['photos'] ?? [];

            foreach ($photos as $photo) {
                if ($photo instanceof UploadedFile) {
                    $photoPaths[] = $photo->store(
                        'rental-checkins/' . $booking->id,
                        'public'
                    );
                }
            }

            $checkin = RentalCheckin::create([
                'booking_id' =>
                    $booking->id,

                'vehicle_id' =>
                    $vehicleId,

                'checkin_at' =>
                    $checkinAt,

                'vehicle_condition' =>
                    $data['vehicle_condition'],

                'photos' =>
                    $photoPaths,

                'odometer' =>
                    $data['odometer'],

                'fuel_level' =>
                    $data['fuel_level'],

                'equipment' =>
                    $data['equipment'] ?? [],

                'notes' =>
                    $data['notes'] ?? null,

                'customer_confirmed' =>
                    true,

                'customer_confirmed_at' =>
                    now(),

                'is_late_return' =>
                    $isLateReturn,

                'late_return_fee' =>
                    $lateReturnFee,
            ]);

            // ==========================================
            // Audit Log Check-in
            // ==========================================
            $this->auditLogService->created(
                $mitra,
                'rental_checkin',
                'Mitra mencatat check-in kendaraan.',
                $checkin,
                $checkin->toArray(),
                $request
            );

            // ==========================================
            // Update status booking
            // ==========================================
            $oldBookingValues =
                $booking->toArray();

            $booking->update([
                'status' =>
                    'returned',
            ]);

            $booking->refresh();

            // ==========================================
            // Audit Log perubahan booking
            // ==========================================
            $this->auditLogService->updated(
                $mitra,
                'booking',
                'Status booking berubah dari ongoing menjadi returned karena check-in kendaraan.',
                $booking,
                $oldBookingValues,
                $booking->toArray(),
                $request
            );

            // ==========================================
            // Notification ke customer
            // ==========================================
            $this->notificationTriggerService
                ->rentalCheckinCreated($checkin);

            return $checkin->refresh();
        });
    }

    /**
     * Menghapus foto check-in dari storage.
     */
    public function deletePhotos(
        RentalCheckin $checkin
    ): void {
        $photos = $checkin->photos ?? [];

        foreach ($photos as $photo) {
            if (is_string($photo) && $photo !== '') {
                Storage::disk('public')->delete($photo);
            }
        }
    }
}