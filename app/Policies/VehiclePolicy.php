<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    /**
     * Admin dapat melihat semua kendaraan.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole('admin', 'mitra');
    }

    /**
     * Admin dapat melihat kendaraan apa pun.
     * Mitra hanya dapat melihat kendaraan miliknya sendiri.
     * Customer (dan guest) dapat melihat kendaraan yang sudah tayang
     * (berstatus available) karena halaman detail bersifat publik.
     */
    public function view(?User $user, Vehicle $vehicle): bool
    {
        if ($user && $user->hasRole('admin')) {
            return true;
        }

        if ($user && $user->hasRole('mitra')) {
            // Mitra dapat melihat kendaraan miliknya sendiri (apa pun statusnya),
            // atau kendaraan publik yang sudah tayang.
            return $vehicle->agent_profile_id === $user->agentProfile?->id
                || $vehicle->status === 'available';
        }

        // Customer yang login maupun tamu (guest) hanya boleh melihat
        // kendaraan yang sudah disetujui admin dan tayang publik.
        return $vehicle->status === 'available';
    }

    /**
     * Admin dan Mitra aktif yang telah diverifikasi dapat membuat kendaraan.
     */
    public function create(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            $agentProfile = $user->agentProfile;
            return $agentProfile
                && $agentProfile->onboarding_status === 'approved'
                && $agentProfile->is_active;
        }

        return false;
    }

    /**
     * Admin dapat mengubah semua kendaraan.
     * Mitra hanya dapat mengubah kendaraan miliknya sendiri.
     */
    public function update(User $user, Vehicle $vehicle): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $vehicle->agent_profile_id ===
                $user->agentProfile?->id;
        }

        return false;
    }

    /**
     * Admin dapat menghapus semua kendaraan.
     * Mitra hanya dapat menghapus kendaraan miliknya sendiri.
     */
    public function delete(User $user, Vehicle $vehicle): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $vehicle->agent_profile_id ===
                $user->agentProfile?->id;
        }

        return false;
    }

    /**
     * Hanya Admin yang dapat melakukan verifikasi kendaraan.
     */
    public function verify(User $user, Vehicle $vehicle): bool
    {
        return $user->hasRole('admin');
    }
}