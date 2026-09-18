<?php

namespace App\Services;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VehicleService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected NotificationTriggerService $notificationTriggerService
    ) {}

    /**
     * Membuat kendaraan baru.
     *
     * Kendaraan yang baru dibuat akan berstatus pending_review
     * dan menunggu verifikasi dari admin sebelum dapat tampil
     * di pencarian customer (BR-02, PRD §8.3).
     */
    public function create(
        array $data,
        User $user,
        Request $request
    ): Vehicle {
        return DB::transaction(function () use ($data, $user, $request) {
            $vehicle = Vehicle::create([
                'agent_profile_id'    => $data['agent_profile_id'] ?? null,
                'vehicle_category_id' => $data['vehicle_category_id'],
                'vehicle_type'        => $data['vehicle_type'],
                'name'                => $data['name'],
                'slug'                => $data['slug'] ?? Str::slug($data['name']),
                'brand'               => $data['brand']        ?? null,
                'model'               => $data['model']        ?? null,
                'year'                => $data['year']         ?? null,
                'license_plate'       => $data['license_plate'],
                'transmission'        => $data['transmission'] ?? null,
                'seat_capacity'       => $data['seat_capacity'] ?? null,
                'fuel_type'           => $data['fuel_type']    ?? null,
                'color'               => $data['color']        ?? null,
                'description'         => $data['description']  ?? null,
                'pickup_location'     => $data['pickup_location'] ?? null,
                'rental_requirements' => $data['rental_requirements'] ?? null,
                'status'              => 'pending_review',
            ]);

            // ================================================
            // Upload foto kendaraan jika ada
            // ================================================
            if (!empty($data['photos'])) {
                foreach ($data['photos'] as $photo) {
                    if ($photo instanceof UploadedFile) {
                        $path = $photo->store(
                            'vehicles/' . $vehicle->id . '/photos',
                            'public'
                        );

                        $vehicle->photos()->create([
                            'file_path' => $path,
                        ]);
                    }
                }
            }

            $this->auditLogService->created(
                $user,
                'vehicle',
                'Menambahkan kendaraan baru. Status: pending_review.',
                $vehicle,
                $vehicle->toArray(),
                $request
            );

            return $vehicle->refresh();
        });
    }

    /**
     * Memperbarui data kendaraan.
     *
     * Jika kendaraan sudah berstatus available dan ada
     * perubahan data, status dikembalikan ke pending_review
     * agar admin melakukan verifikasi ulang.
     */
    public function update(
        Vehicle $vehicle,
        array $data,
        User $user,
        Request $request
    ): Vehicle {
        return DB::transaction(function () use (
            $vehicle,
            $data,
            $user,
            $request
        ) {
            $oldValues = $vehicle->toArray();

            // Kendaraan yang sudah available perlu review ulang
            // jika ada perubahan data penting.
            $requiresReReview = in_array($vehicle->status, [
                'available',
                'rejected',
            ], true);

            $vehicle->update([
                'vehicle_category_id' =>
                    $data['vehicle_category_id']
                    ?? $vehicle->vehicle_category_id,

                'vehicle_type' =>
                    $data['vehicle_type']
                    ?? $vehicle->vehicle_type,

                'name' =>
                    $data['name']
                    ?? $vehicle->name,

                'slug' =>
                    $data['slug']
                    ?? ($data['name']
                        ? Str::slug($data['name'])
                        : $vehicle->slug),

                'brand' =>
                    $data['brand']
                    ?? $vehicle->brand,

                'model' =>
                    $data['model']
                    ?? $vehicle->model,

                'year' =>
                    $data['year']
                    ?? $vehicle->year,

                'license_plate' =>
                    $data['license_plate']
                    ?? $vehicle->license_plate,

                'transmission' =>
                    $data['transmission']
                    ?? $vehicle->transmission,

                'seat_capacity' =>
                    $data['seat_capacity']
                    ?? $vehicle->seat_capacity,

                'fuel_type' =>
                    $data['fuel_type']
                    ?? $vehicle->fuel_type,

                'color' =>
                    $data['color']
                    ?? $vehicle->color,

                'description' =>
                    $data['description']
                    ?? $vehicle->description,

                'pickup_location' =>
                    $data['pickup_location']
                    ?? $vehicle->pickup_location,

                'rental_requirements' =>
                    $data['rental_requirements']
                    ?? $vehicle->rental_requirements,

                'status' =>
                    $requiresReReview
                        ? 'pending_review'
                        : $vehicle->status,
            ]);

            $vehicle->refresh();

            $this->auditLogService->updated(
                $user,
                'vehicle',
                'Memperbarui data kendaraan.',
                $vehicle,
                $oldValues,
                $vehicle->toArray(),
                $request
            );

            return $vehicle;
        });
    }

    /**
     * Menghapus kendaraan.
     *
     * Kendaraan tidak boleh dihapus jika sudah digunakan dalam booking.
     * Pengecekan ini juga ada di controller, tapi service memiliki guard sendiri.
     */
    public function delete(
        Vehicle $vehicle,
        User $user,
        Request $request
    ): void {
        DB::transaction(function () use ($vehicle, $user, $request) {
            if ($vehicle->bookingItems()->exists()) {
                throw new \RuntimeException(
                    'Kendaraan tidak dapat dihapus karena sudah digunakan dalam booking.'
                );
            }

            $oldValues = $vehicle->toArray();

            // Hapus foto dari storage
            foreach ($vehicle->photos as $photo) {
                if ($photo->file_path) {
                    Storage::disk('public')->delete($photo->file_path);
                }
            }

            $vehicle->delete();

            $this->auditLogService->deleted(
                $user,
                'vehicle',
                'Menghapus kendaraan.',
                $vehicle,
                $oldValues,
                $request
            );
        });
    }

    /**
     * Admin memverifikasi kendaraan (approve / reject).
     *
     * PRD §8.3 & BR-02:
     * - Kendaraan harus berstatus pending_review.
     * - Jika disetujui → status menjadi available.
     * - Jika ditolak  → status menjadi rejected.
     * - Mitra mendapatkan notifikasi hasil verifikasi.
     */
    public function verify(
        Vehicle $vehicle,
        User $admin,
        string $decision,
        ?string $rejectionReason = null,
        ?Request $request = null
    ): Vehicle {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat memverifikasi kendaraan.'
            );
        }

        if ($vehicle->status !== 'pending_review') {
            throw new \RuntimeException(
                'Hanya kendaraan berstatus pending_review yang dapat diverifikasi.'
            );
        }

        if (!in_array($decision, ['approved', 'rejected'], true)) {
            throw new \InvalidArgumentException(
                'Keputusan verifikasi tidak valid. Gunakan approved atau rejected.'
            );
        }

        return DB::transaction(function () use (
            $vehicle,
            $admin,
            $decision,
            $rejectionReason,
            $request
        ) {
            $oldValues = $vehicle->toArray();

            $newStatus = $decision === 'approved'
                ? 'available'
                : 'rejected';

            $vehicle->update([
                'status' => $newStatus,
            ]);

            $vehicle->refresh();

            $description = $decision === 'approved'
                ? 'Admin menyetujui kendaraan. Status berubah menjadi available.'
                : 'Admin menolak kendaraan. Status berubah menjadi rejected.'
                    . ($rejectionReason ? ' Alasan: ' . $rejectionReason : '');

            $this->auditLogService->updated(
                $admin,
                'vehicle',
                $description,
                $vehicle,
                $oldValues,
                $vehicle->toArray(),
                $request
            );

            // Notifikasi ke mitra
            $this->notificationTriggerService->vehicleVerified(
                $vehicle,
                $decision
            );

            return $vehicle;
        });
    }
}