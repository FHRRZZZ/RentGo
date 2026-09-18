<?php

namespace App\Services;

use App\Models\User;
use App\Models\VehicleAvailability;
use Illuminate\Http\Request;

class VehicleAvailabilityService
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function create(
        array $data,
        User $user,
        Request $request
    ): VehicleAvailability {
        $availability = VehicleAvailability::create([
            'vehicle_id' => $data['vehicle_id'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        $this->auditLogService->created(
            $user,
            'vehicle_availability',
            'Menambahkan jadwal availability kendaraan.',
            $availability,
            $availability->toArray(),
            $request
        );

        return $availability;
    }

    public function update(
        VehicleAvailability $availability,
        array $data,
        User $user,
        Request $request
    ): VehicleAvailability {
        $oldValues = $availability->toArray();
        $availability->update([
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        $availability->refresh();
    $this->auditLogService->updated(
        $user,
        'vehicle_availability',
        'Mengubah jadwal availability kendaraan.',
        $availability,
        $oldValues,
        $availability->toArray(),
        $request
        );

        return $availability;
    }

    public function delete(
        VehicleAvailability $availability,
        User $user,
        Request $request
    ): void {
        $oldValues = $availability->toArray();
        $availability->delete();
        $this->auditLogService->deleted(
            $user,
            'vehicle_availability',
            'Menghapus jadwal availability kendaraan.',
            $availability,
            $oldValues,
            $request
        );
    }
}