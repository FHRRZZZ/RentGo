<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Dispute;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;

class DashboardService
{
    /**
     * Mengambil seluruh data statistik untuk Admin Dashboard.
     */
    public function getAdminData(): array
    {
        $stats = [
            'total_customers' => User::role('customer')->count(),
            'total_mitras'    => User::role('mitra')->count(),
            'active_agents'   => AgentProfile::where('is_active', true)
                ->where('onboarding_status', 'approved')
                ->count(),
            'pending_agents'  => AgentProfile::where('onboarding_status', 'pending_verification')
                ->count(),
            'total_vehicles'  => Vehicle::count(),
            'total_bookings'  => Booking::count(),
            'today_bookings'  => Booking::whereDate('created_at', today())->count(),
            'completed_transactions' => Transaction::where('status', 'completed')->count(),
            'gmv'             => (float) Transaction::where('status', 'completed')->sum('total_amount'),
            'total_commission'=> (float) \App\Models\TransactionCommission::where('status', 'calculated')->sum('commission_amount'),
            'open_complaints' => Complaint::whereIn('status', ['submitted', 'in_review'])->count(),
            'open_disputes'   => Dispute::whereIn('status', ['open', 'under_review'])->count(),
            'pending_payouts' => \App\Models\AgentPayout::where('status', 'pending')->count(),
            'pending_refunds' => \App\Models\Refund::where('status', 'pending')->count(),
        ];

        $recentBookings = Booking::with(['customer', 'agentProfile', 'items.vehicle'])
            ->latest()
            ->limit(10)
            ->get();

        $pendingVehicles = Vehicle::with(['agentProfile'])
            ->where('status', 'pending_review')
            ->latest()
            ->limit(10)
            ->get();

        // Seluruh armada untuk tab "Katalog & Armada" di dashboard admin.
        // Sebelumnya dashboard hanya menerima unit pending_review sehingga
        // tabel katalog kosong begitu tidak ada unit yang menunggu review.
        $vehicles = Vehicle::with([
            'agentProfile.user',
            'vehicleCategory',
            'photos',
            'prices',
        ])
            ->latest()
            ->get()
            ->map(fn (Vehicle $v) => $this->mapVehicle($v))
            ->values()
            ->all();

        $activeDisputes = Dispute::with(['booking', 'initiator'])
            ->whereIn('status', ['open', 'under_review'])
            ->latest()
            ->limit(10)
            ->get();

        $users = User::with(['roles', 'agentProfile.documents', 'customerProfile'])
            ->latest()
            ->get()
            ->map(function (User $user) {
                $role = $user->roles->first()?->name ?? 'customer';
                $agentProfile = $user->agentProfile;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'phone' => $agentProfile?->phone ?? $user->customerProfile?->phone,
                    'city' => $agentProfile?->city ?? $user->customerProfile?->city,
                    'agency_name' => $agentProfile?->agency_name,
                    'created_at' => $user->created_at?->toISOString(),
                    'verified' => $agentProfile?->onboarding_status === 'approved',
                    'onboarding_status' => $agentProfile?->onboarding_status,
                    'agent_profile_id' => $agentProfile?->id,
                    'agent_documents' => $agentProfile?->documents->map(fn ($document) => [
                        'id' => $document->id,
                        'document_type' => $document->document_type,
                        'document_number' => $document->document_number,
                        'status' => $document->status,
                        'rejection_reason' => $document->rejection_reason,
                        'file_url' => $document->file_path
                            ? url('/admin/agents/documents/' . $document->id . '/file')
                            : null,
                    ])->values() ?? [],
                ];
            })
            ->values();

        return compact('stats', 'recentBookings', 'pendingVehicles', 'activeDisputes', 'users', 'vehicles');
    }

    /**
     * Normalisasi data kendaraan agar seragam dengan halaman Katalog Armada
     * (dipakai tabel armada di dashboard admin).
     */
    private function mapVehicle(Vehicle $v): array
    {
        $photo = $v->photos->first()?->file_path
            ? '/storage/' . $v->photos->first()->file_path
            : null;

        $price = $v->prices->first()?->price_per_day ?? 0;

        return array_merge($v->toArray(), [
            'price_per_day' => (float) $price,
            'img' => $photo,
            'category_name' => $v->vehicleCategory?->name,
            'agent_name' => $v->agentProfile?->agency_name
                ?? $v->agentProfile?->user?->name
                ?? 'Mitra RentGo',
        ]);
    }

    /**
     * Mengambil data statistik untuk Mitra Dashboard.
     */
    public function getMitraData(User $user): array
    {
        $agentProfile = $user->agentProfile;
        abort_unless($agentProfile, 403, 'Profil mitra tidak ditemukan.');

        $agentProfileId = $agentProfile->id;

        $stats = [
            'total_vehicles'   => Vehicle::where('agent_profile_id', $agentProfileId)->count(),
            'active_vehicles'  => Vehicle::where('agent_profile_id', $agentProfileId)
                ->where('status', 'available')
                ->count(),
            'pending_vehicles' => Vehicle::where('agent_profile_id', $agentProfileId)
                ->where('status', 'pending_review')
                ->count(),
            'total_bookings'   => Booking::where('agent_profile_id', $agentProfileId)->count(),
            'active_bookings'  => Booking::where('agent_profile_id', $agentProfileId)
                ->whereIn('status', ['confirmed', 'ready_for_pickup', 'ongoing'])
                ->count(),
            'monthly_revenue'  => (float) Transaction::where('agent_profile_id', $agentProfileId)
                ->where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->whereYear('completed_at', now()->year)
                ->sum('rental_amount'),
            'total_commission_deducted' => (float) \App\Models\TransactionCommission::where('agent_profile_id', $agentProfileId)
                ->sum('commission_amount'),
            'pending_payout'   => (float) \App\Models\AgentPayout::where('agent_profile_id', $agentProfileId)
                ->where('status', 'pending')
                ->sum('amount'),
        ];

        $pendingConfirmations = Booking::with(['customer', 'items.vehicle'])
            ->where('agent_profile_id', $agentProfileId)
            ->where('status', 'waiting_agent_confirmation')
            ->latest()
            ->limit(10)
            ->get();

        $activeBookings = Booking::with(['customer', 'items.vehicle'])
            ->where('agent_profile_id', $agentProfileId)
            ->whereIn('status', ['confirmed', 'ready_for_pickup', 'ongoing'])
            ->latest()
            ->limit(10)
            ->get();

        return compact('stats', 'agentProfile', 'pendingConfirmations', 'activeBookings');
    }

    /**
     * Mengambil data statistik untuk Customer Dashboard.
     */
    public function getCustomerData(User $user): array
    {
        $stats = [
            'active_bookings'    => Booking::where('customer_id', $user->id)
                ->whereIn('status', [
                    'pending',
                    'pending_payment',
                    'waiting_payment',
                    'waiting_agent_confirmation',
                    'confirmed',
                    'ready_for_pickup',
                    'ongoing',
                ])->count(),
            'completed_bookings' => Booking::where('customer_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'total_bookings'     => Booking::where('customer_id', $user->id)->count(),
        ];

        $activeBookings = Booking::with(['agentProfile', 'items.vehicle', 'payments'])
            ->where('customer_id', $user->id)
            ->whereIn('status', [
                'pending',
                'pending_payment',
                'waiting_payment',
                'waiting_agent_confirmation',
                'confirmed',
                'ready_for_pickup',
                'ongoing',
            ])
            ->latest()
            ->limit(5)
            ->get();

        $recentBookings = Booking::with(['agentProfile', 'items.vehicle'])
            ->where('customer_id', $user->id)
            ->whereIn('status', ['completed', 'cancelled', 'rejected', 'expired'])
            ->latest()
            ->limit(5)
            ->get();

        $availableVehicles = Vehicle::with(['agentProfile.user', 'vehicleCategory', 'photos', 'prices'])
            ->where('status', 'available')
            ->latest()
            ->limit(8)
            ->get()
            ->map(function ($v) {
                $price = $v->prices->where('is_active', true)->first()?->price_per_day
                    ?? $v->prices->first()?->price_per_day
                    ?? 350000;

                $photo = $v->photos->first()?->file_path;
                if ($photo && !str_starts_with($photo, 'http') && !str_starts_with($photo, '/storage/')) {
                    $photo = '/storage/' . $photo;
                }

                return [
                    'id' => $v->id,
                    'name' => $v->name ?: trim(($v->brand ?? '') . ' ' . ($v->model ?? '')),
                    'brand' => $v->brand,
                    'model' => $v->model,
                    'vehicle_type' => $v->vehicle_type ?? 'car',
                    'category' => $v->vehicleCategory?->name ?? ($v->vehicle_type === 'motorcycle' ? 'Motor' : 'Mobil'),
                    'transmission' => ucfirst($v->transmission ?? 'Matic'),
                    'seat_capacity' => $v->seat_capacity ?? ($v->vehicle_type === 'motorcycle' ? 2 : 5),
                    'fuel_type' => ucfirst($v->fuel_type ?? 'Bensin'),
                    'price_per_day' => (float) $price,
                    'city' => $v->agentProfile?->city ?? $v->pickup_location ?? 'Indonesia',
                    'pickup_location' => $v->pickup_location ?? $v->agentProfile?->address ?? 'Pool Utama',
                    'img' => $photo,
                    'status' => $v->status,
                    'mitra_name' => $v->agentProfile?->agency_name ?? $v->agentProfile?->user?->name ?? 'Mitra RentGo',
                ];
            })
            ->values();

        return compact('stats', 'activeBookings', 'recentBookings', 'availableVehicles');
    }
}
