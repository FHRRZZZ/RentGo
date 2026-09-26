<?php

namespace App\Services;

use App\Models\VehiclePrice;

class VehiclePriceService
{
    public function create(array $data): VehiclePrice
    {
        return VehiclePrice::create([
            'vehicle_id' => $data['vehicle_id'],
            'price_per_day' => $data['price_per_day'],
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(
        VehiclePrice $vehiclePrice,
        array $data
    ): VehiclePrice {
        $vehiclePrice->update([
            'price_per_day' => $data['price_per_day'],
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'is_active' => $data['is_active'] ?? false,
        ]);

        return $vehiclePrice->refresh();
    }

    public function delete(VehiclePrice $vehiclePrice): void
    {
        $vehiclePrice->delete();
    }
}