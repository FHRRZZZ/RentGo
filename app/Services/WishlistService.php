<?php

namespace App\Services;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class WishlistService
{
    /**
     * Mengambil daftar wishlist customer.
     */
    public function getWishlist(User $user): Collection
    {
        return Wishlist::with(['vehicle.photos', 'vehicle.prices', 'vehicle.category'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    /**
     * Menambahkan kendaraan ke wishlist.
     */
    public function add(User $user, int $vehicleId): Wishlist
    {
        $vehicle = Vehicle::findOrFail($vehicleId);

        $exists = Wishlist::where('user_id', $user->id)
            ->where('vehicle_id', $vehicle->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'vehicle_id' => 'Kendaraan ini sudah ada dalam wishlist Anda.',
            ]);
        }

        return Wishlist::create([
            'user_id' => $user->id,
            'vehicle_id' => $vehicle->id,
        ]);
    }

    /**
     * Menghapus kendaraan dari wishlist.
     */
    public function remove(User $user, Wishlist $wishlist): bool
    {
        if ($wishlist->user_id !== $user->id) {
            throw new \RuntimeException('Anda tidak berhak menghapus wishlist ini.');
        }

        return $wishlist->delete();
    }
}
