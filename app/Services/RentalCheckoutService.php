<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RentalCheckout;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RentalCheckoutService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {
    }

    /**
     * Membuat proses checkout/pickup kendaraan.
     */
    public function create(
        Booking $booking,
        User $mitra,
        array $data,
        ?Request $request = null
    ): RentalCheckout {
        $booking->loadMissing([
            'agentProfile',
            'items.vehicle.agentProfile',
        ]);

        // =========================================================
        // 1. Pastikan user adalah mitra
        // =========================================================
        if (!$mitra->hasRole('mitra')) {
            throw new \RuntimeException(
                'Hanya mitra yang dapat melakukan checkout kendaraan.'
            );
        }

        // =========================================================
        // 2. Pastikan booking milik mitra
        // =========================================================
        if ($booking->agentProfile?->user_id !== $mitra->id) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        // =========================================================
        // 3. Booking harus sudah dikonfirmasi atau siap diambil
        // =========================================================
        if (!in_array($booking->status, ['confirmed', 'ready_for_pickup'], true)) {
            throw new \RuntimeException(
                'Checkout hanya dapat dilakukan untuk booking yang sudah dikonfirmasi atau siap diambil.'
            );
        }

        // =========================================================
        // 3b. Pembayaran harus sudah masuk / disetujui mitra
        // =========================================================
        app(BookingService::class)->assertPaymentSettled($booking);

        // =========================================================
        // 4. Pastikan kendaraan termasuk dalam booking
        // =========================================================
        $vehicleId = (int) $data['vehicle_id'];

        $bookingItem = $booking->items
            ->firstWhere('vehicle_id', $vehicleId);

        if (!$bookingItem) {
            throw new \RuntimeException(
                'Kendaraan tidak termasuk dalam booking ini.'
            );
        }

        // =========================================================
        // 5. Pastikan kendaraan benar-benar milik mitra
        // =========================================================
        $vehicle = $bookingItem->vehicle;

        if (!$vehicle) {
            throw new \RuntimeException(
                'Kendaraan tidak ditemukan.'
            );
        }

        if ($vehicle->agentProfile?->user_id !== $mitra->id) {
            throw new \RuntimeException(
                'Kendaraan bukan milik mitra yang sedang login.'
            );
        }

        // =========================================================
        // 6. Jangan izinkan checkout dua kali
        // =========================================================
        $existingCheckout = RentalCheckout::query()
            ->where('booking_id', $booking->id)
            ->first();

        if ($existingCheckout) {
            throw new \RuntimeException(
                'Booking ini sudah memiliki data checkout.'
            );
        }

        // =========================================================
        // 7. Customer harus melakukan konfirmasi
        // =========================================================
        if (!filter_var(
            $data['customer_confirmed'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        )) {
            throw new \RuntimeException(
                'Customer harus mengonfirmasi kondisi kendaraan sebelum checkout.'
            );
        }

        return DB::transaction(function () use (
            $booking,
            $vehicleId,
            $data,
            $mitra,
            $request,
        ) {
            // =====================================================
            // 8. Upload foto kondisi kendaraan
            // =====================================================
            $photoPaths = [];

            $photos = $data['photos'] ?? [];

            foreach ($photos as $photo) {
                if ($photo instanceof UploadedFile) {
                    $photoPaths[] = $photo->store(
                        'rental-checkouts/' . $booking->id,
                        'public'
                    );
                }
            }

            // =====================================================
            // 9. Buat data checkout
            // =====================================================
            $checkout = RentalCheckout::create([
                'booking_id' =>
                    $booking->id,

                'vehicle_id' =>
                    $vehicleId,

                'checkout_at' =>
                    $data['checkout_at'],

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
            ]);

            // =====================================================
            // Audit Log Checkout
            // =====================================================
            $this->auditLogService->created(
                $mitra,
                'rental_checkout',
                'Mitra mencatat checkout kendaraan.',
                $checkout,
                $checkout->toArray(),
                $request
            );

            // =====================================================
            // 10. Ubah status booking menjadi ongoing
            // =====================================================
            $oldBookingValues =
                $booking->toArray();

            $booking->update([
                'status' =>
                    'ongoing',
            ]);

            $booking->refresh();

            // =====================================================
            // Audit Log perubahan status booking
            // =====================================================
            $this->auditLogService->updated(
                $mitra,
                'booking',
                'Status booking berubah dari confirmed menjadi ongoing karena checkout kendaraan.',
                $booking,
                $oldBookingValues,
                $booking->toArray(),
                $request
            );

            // =====================================================
            // Notification ke customer
            // =====================================================
            $this->notificationTriggerService
                ->rentalCheckoutCreated($checkout);

            return $checkout->refresh();
        });
    }

    /**
     * Menghapus foto checkout dari storage.
     */
    public function deletePhotos(
        RentalCheckout $checkout
    ): void {
        $photos = $checkout->photos ?? [];

        foreach ($photos as $photo) {
            if (is_string($photo) && $photo !== '') {
                Storage::disk('public')->delete($photo);
            }
        }
    }
}