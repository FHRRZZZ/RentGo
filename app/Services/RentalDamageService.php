<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RentalCheckin;
use App\Models\RentalDamage;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\NotificationTriggerService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RentalDamageService
{
    public function __construct(
        protected NotificationTriggerService $notificationTriggerService,
        protected AuditLogService $auditLogService
    ) {
    }

    public function create(
        Booking $booking,
        RentalCheckin $rentalCheckin,
        User $mitra,
        array $data,
        ?Request $request = null
    ): RentalDamage {
        $booking->loadMissing([
            'agentProfile',
            'items.vehicle.agentProfile',
        ]);

        $rentalCheckin->loadMissing([
            'booking',
            'vehicle.agentProfile',
        ]);

        if (!$mitra->hasRole('mitra')) {
            throw new \RuntimeException(
                'Hanya mitra yang dapat mencatat kerusakan kendaraan.'
            );
        }

        if (
            $booking->agentProfile?->user_id
            !== $mitra->id
        ) {
            throw new \RuntimeException(
                'Anda tidak memiliki akses ke booking ini.'
            );
        }

        if ($booking->status !== 'returned') {
            throw new \RuntimeException(
                'Kerusakan hanya dapat dicatat setelah kendaraan dikembalikan.'
            );
        }

        if (
            $rentalCheckin->booking_id
            !== $booking->id
        ) {
            throw new \RuntimeException(
                'Data check-in tidak sesuai dengan booking.'
            );
        }

        $vehicleId = (int) $data['vehicle_id'];

        if (
            $rentalCheckin->vehicle_id
            !== $vehicleId
        ) {
            throw new \RuntimeException(
                'Kendaraan tidak sesuai dengan data check-in.'
            );
        }

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

        if (
            $vehicle->agentProfile?->user_id
            !== $mitra->id
        ) {
            throw new \RuntimeException(
                'Kendaraan bukan milik mitra yang sedang login.'
            );
        }

        $repairCost = (float) $data['repair_cost'];
        $customerCharge = (float) $data['customer_charge'];

        if ($customerCharge > $repairCost) {
            throw new \RuntimeException(
                'Biaya yang dibebankan kepada customer tidak boleh lebih besar dari biaya perbaikan.'
            );
        }

        return DB::transaction(function () use (
            $booking,
            $rentalCheckin,
            $mitra,
            $data,
            $repairCost,
            $customerCharge,
            $request,
        ) {
            $photoPaths = [];

            $photos = $data['photos'] ?? [];

            foreach ($photos as $photo) {
                if ($photo instanceof UploadedFile) {
                    $photoPaths[] = $photo->store(
                        'rental-damages/' . $booking->id,
                        'public'
                    );
                }
            }

            $damage = RentalDamage::create([
                'booking_id' => $booking->id,
                'vehicle_id' => $rentalCheckin->vehicle_id,
                'rental_checkin_id' => $rentalCheckin->id,
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'severity' => $data['severity'],
                'photos' => $photoPaths,
                'repair_cost' => $repairCost,
                'customer_charge' => $customerCharge,
                'deducted_from_deposit' =>
                    (bool) $data['deducted_from_deposit'],
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
            ]);

            // Audit log
            $this->auditLogService->created(
                $mitra,
                'rental_damage',
                'Mitra mencatat kerusakan kendaraan.',
                $damage,
                $damage->toArray(),
                $request,
            );

            // Notification ke customer
            $this->notificationTriggerService
                ->rentalDamageCreated($damage);

            return $damage->refresh();
        });
    }

    public function deletePhotos(
        RentalDamage $damage
    ): void {
        $photos = $damage->photos ?? [];

        foreach ($photos as $photo) {
            if (is_string($photo) && $photo !== '') {
                Storage::disk('public')->delete($photo);
            }
        }
    }
}