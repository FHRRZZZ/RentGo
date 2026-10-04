<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Dashboard & Profil Mitra — khusus user dengan role 'mitra'.
 */
class AgentController extends Controller
{
    /**
     * GET /api/agent/dashboard
     * Ringkasan dashboard mitra.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403, 'Profil mitra tidak ditemukan.');

        $today = now()->startOfDay();

        $stats = [
            'total_vehicles'        => $agent->vehicles()->count(),
            'active_vehicles'       => $agent->vehicles()->where('status', 'available')->count(),
            'pending_bookings'      => Booking::where('agent_profile_id', $agent->id)->where('status', 'pending_confirmation')->count(),
            'active_rentals'        => Booking::where('agent_profile_id', $agent->id)->where('status', 'ongoing')->count(),
            'revenue_this_month'    => (float) \App\Models\Transaction::where('agent_profile_id', $agent->id)
                ->where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->whereYear('completed_at', now()->year)
                ->sum('total_amount'),
            'pending_review_payments' => Booking::where('agent_profile_id', $agent->id)
                ->whereHas('payment', fn($q) => $q->where('status', 'awaiting_verification'))
                ->count(),
        ];

        // 5 pesanan terbaru
        $recentBookings = Booking::where('agent_profile_id', $agent->id)
            ->with(['items.vehicle.photos', 'customer'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'id'             => $b->id,
                'booking_number' => $b->booking_number,
                'status'         => $b->status,
                'customer_name'  => $b->customer?->name,
                'vehicle_name'   => $b->items->first()?->vehicle?->name
                    ?: trim(($b->items->first()?->vehicle?->brand ?? '') . ' ' . ($b->items->first()?->vehicle?->model ?? '')),
                'rental_start'   => $b->rental_start?->toDateString(),
                'rental_end'     => $b->rental_end?->toDateString(),
                'total_amount'   => (float) $b->total_amount,
                'created_at'     => $b->created_at?->toISOString(),
            ])->values()->all();

        return response()->json([
            'data' => [
                'agent'           => [
                    'id'               => $agent->id,
                    'agency_name'      => $agent->agency_name,
                    'is_active'        => $agent->is_active,
                    'onboarding_status'=> $agent->onboarding_status,
                    'logo'             => $agent->logo ? asset('storage/' . $agent->logo) : null,
                ],
                'stats'           => $stats,
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }

    /**
     * GET /api/agent/bookings
     * Daftar pesanan masuk untuk mitra.
     */
    public function bookings(Request $request): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403);

        $query = Booking::where('agent_profile_id', $agent->id)
            ->with(['items.vehicle.photos', 'customer', 'payment'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(15);

        return response()->json([
            'data' => collect($bookings->items())->map(fn($b) => [
                'id'             => $b->id,
                'booking_number' => $b->booking_number,
                'status'         => $b->status,
                'customer_name'  => $b->customer?->name,
                'vehicle_name'   => $b->items->first()?->vehicle?->name
                    ?: trim(($b->items->first()?->vehicle?->brand ?? '') . ' ' . ($b->items->first()?->vehicle?->model ?? '')),
                'vehicle_photo'  => $b->items->first()?->vehicle?->photos->first()?->file_path
                    ? asset('storage/' . $b->items->first()->vehicle->photos->first()->file_path)
                    : null,
                'rental_start'   => $b->rental_start?->toDateString(),
                'rental_end'     => $b->rental_end?->toDateString(),
                'total_amount'   => (float) $b->total_amount,
                'fulfillment_type' => $b->fulfillment_type,
                'payment_status' => $b->payment?->status,
                'created_at'     => $b->created_at?->toISOString(),
            ])->values()->all(),
            'pagination' => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'total'        => $bookings->total(),
            ],
        ]);
    }

    /**
     * POST /api/agent/bookings/{id}/confirm
     * Konfirmasi pesanan dari customer.
     */
    public function confirmBooking(Request $request, Booking $booking): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent && $booking->agent_profile_id === $agent->id, 403);
        abort_unless($booking->status === 'pending_confirmation', 422, 'Pesanan tidak bisa dikonfirmasi.');

        $booking->update(['status' => 'confirmed']);

        return response()->json(['message' => 'Pesanan berhasil dikonfirmasi.']);
    }

    /**
     * POST /api/agent/bookings/{id}/reject
     * Tolak pesanan dari customer.
     */
    public function rejectBooking(Request $request, Booking $booking): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent && $booking->agent_profile_id === $agent->id, 403);
        abort_unless($booking->status === 'pending_confirmation', 422, 'Pesanan tidak bisa ditolak.');

        $request->validate([
            'reason' => ['nullable', 'string', 'max:300'],
        ]);

        $booking->update([
            'status'     => 'rejected',
            'agent_note' => $request->reason,
        ]);

        return response()->json(['message' => 'Pesanan berhasil ditolak.']);
    }

    /**
     * POST /api/agent/bookings/{id}/approve-payment
     * Setujui bukti bayar customer.
     */
    public function approvePayment(Request $request, Booking $booking): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent && $booking->agent_profile_id === $agent->id, 403);

        $payment = $booking->payment;
        abort_unless($payment && $payment->status === 'awaiting_verification', 422, 'Tidak ada bukti bayar yang menunggu verifikasi.');

        $payment->update([
            'status'      => 'paid',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'paid_at'     => now(),
        ]);

        $booking->update(['status' => 'ongoing']);

        return response()->json(['message' => 'Pembayaran dikonfirmasi. Pesanan berstatus berjalan.']);
    }

    /**
     * GET /api/agent/vehicles
     * Daftar kendaraan milik mitra.
     */
    public function vehicles(Request $request): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403);

        $vehicles = Vehicle::where('agent_profile_id', $agent->id)
            ->with(['vehicleCategory', 'photos', 'prices'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => collect($vehicles->items())->map(fn($v) => [
                'id'           => $v->id,
                'name'         => $v->name ?: trim(($v->brand ?? '') . ' ' . ($v->model ?? '')),
                'brand'        => $v->brand,
                'model'        => $v->model,
                'year'         => $v->year,
                'vehicle_type' => $v->vehicle_type,
                'status'       => $v->status,
                'price_per_day'=> (float) ($v->prices->first()?->price_per_day ?? $v->price_per_day ?? 0),
                'photo'        => $v->photos->first()?->file_path
                    ? asset('storage/' . $v->photos->first()->file_path)
                    : null,
            ])->values()->all(),
            'pagination' => [
                'current_page' => $vehicles->currentPage(),
                'last_page'    => $vehicles->lastPage(),
                'total'        => $vehicles->total(),
            ],
        ]);
    }

    /**
     * GET /api/agent/marketing-tax
     * Riwayat pajak pemasaran mitra.
     */
    public function marketingTax(Request $request): JsonResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403);

        $taxes = $agent->marketingTaxes()->latest('billing_year')->latest('billing_month')->get()->map(fn($t) => [
            'id'                   => $t->id,
            'tax_number'           => $t->tax_number,
            'billing_period_label' => $t->billing_period_label,
            'billing_year'         => $t->billing_year,
            'billing_month'        => $t->billing_month,
            'amount'               => (float) $t->amount,
            'status'               => $t->status,
            'status_label'         => $t->status_label,
            'due_date'             => $t->due_date?->toDateString(),
            'is_overdue'           => $t->isOverdue(),
            'has_proof'            => (bool) $t->proof_file_path,
            'paid_at'              => $t->paid_at?->toISOString(),
        ])->values()->all();

        $openTax = collect($taxes)->whereIn('status', ['unpaid', 'overdue'])->first();

        return response()->json([
            'data' => [
                'taxes'    => $taxes,
                'open_tax' => $openTax,
                'agent'    => [
                    'is_active' => $agent->is_active,
                ],
            ],
        ]);
    }
}
