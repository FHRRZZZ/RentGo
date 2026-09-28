<?php

namespace App\Services;

use App\Constants\BookingStatus;
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

        $activeDisputes = Dispute::with(['booking', 'initiator'])
            ->whereIn('status', ['open', 'under_review'])
            ->latest()
            ->limit(10)
            ->get();

        return compact('stats', 'recentBookings', 'pendingVehicles', 'activeDisputes');
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
                ->whereIn('status', BookingStatus::activeStatuses())->count(),
            'completed_bookings' => Booking::where('customer_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'total_bookings'     => Booking::where('customer_id', $user->id)->count(),
        ];

        $activeBookings = Booking::with(['agentProfile', 'items.vehicle', 'payments'])
            ->where('customer_id', $user->id)
            ->whereIn('status', BookingStatus::activeStatuses())
            ->latest()
            ->limit(5)
            ->get();

        $recentBookings = Booking::with(['agentProfile', 'items.vehicle'])
            ->where('customer_id', $user->id)
            ->whereIn('status', ['completed', 'cancelled', 'rejected', 'expired'])
            ->latest()
            ->limit(5)
            ->get();

        return compact('stats', 'activeBookings', 'recentBookings');
    }
}
