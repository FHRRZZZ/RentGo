<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VehicleCategory;

class VehicleCategoryPolicy
{
    /**
     * Melihat daftar kategori.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Melihat detail kategori.
     */
    public function view(User $user, VehicleCategory $vehicleCategory): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Membuat kategori baru.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Mengubah kategori.
     */
    public function update(User $user, VehicleCategory $vehicleCategory): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Menghapus kategori.
     */
    public function delete(User $user, VehicleCategory $vehicleCategory): bool
    {
        return $user->hasRole('admin');
    }
}