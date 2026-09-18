<?php

namespace App\Services;

use App\Models\VehicleCategory;

class VehicleCategoryService
{
    public function create(array $data): VehicleCategory
    {
        return VehicleCategory::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function update(
        VehicleCategory $vehicleCategory,
        array $data
    ): VehicleCategory {
        $vehicleCategory->update([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $vehicleCategory->refresh();
    }

    public function delete(VehicleCategory $vehicleCategory): void
    {
        $vehicleCategory->delete();
    }
}