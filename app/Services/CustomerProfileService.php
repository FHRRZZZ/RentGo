<?php

namespace App\Services;

use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CustomerProfileService
{
    /**
     * Membuat customer profile untuk user yang sedang login.
     */
    public function create(User $user, array $data): CustomerProfile
    {
        return DB::transaction(function () use ($user, $data) {
            return CustomerProfile::create([
                'user_id' => $user->id,
                'phone' => $data['phone'] ?? null,
                'identity_number' => $data['identity_number'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'province' => $data['province'] ?? null,
                'profile_photo_path' => $data['profile_photo_path'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);
        });
    }

    /**
     * Memperbarui customer profile.
     */
    public function update(
        CustomerProfile $customerProfile,
        array $data
    ): CustomerProfile {
        return DB::transaction(function () use ($customerProfile, $data) {
            // Hanya perbarui field yang benar-benar dikirim, agar request
            // parsial tidak mengosongkan data yang sudah tersimpan dan
            // tidak menonaktifkan akun secara tak sengaja (is_active).
            $fillable = [
                'phone',
                'identity_number',
                'date_of_birth',
                'address',
                'city',
                'province',
                'profile_photo_path',
                'is_active',
            ];

            $updates = array_filter(
                $data,
                fn ($key) => in_array($key, $fillable, true),
                ARRAY_FILTER_USE_KEY
            );

            if (!empty($updates)) {
                $customerProfile->update($updates);
            }

            return $customerProfile->refresh();
        });
    }

    /**
     * Menghapus customer profile.
     */
    public function delete(CustomerProfile $customerProfile): void
    {
        DB::transaction(function () use ($customerProfile) {
            $customerProfile->delete();
        });
    }
}
