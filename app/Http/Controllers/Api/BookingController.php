<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Booking — CRUD pesanan sewa untuk mobile customer.
 */
class BookingController extends Controller
{
    /**
     * GET /api/bookings
     * Daftar pesanan milik customer yang login.
     */
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::where('customer_id', $request->user()->id)
            ->with(['items.vehicle.photos', 'agentProfile', 'payment'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => collect($bookings->items())->map(fn($b) => $this->formatBooking($b))->values()->all(),
            'pagination' => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'total'        => $bookings->total(),
            ],
        ]);
    }

    /**
     * GET /api/bookings/{id}
     * Detail pesanan.
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403, 'Bukan pesanan Anda.');

        $booking->load([
            'items.vehicle.photos',
            'agentProfile.user',
            'payment',
            'rentalCheckout',
            'rentalCheckin',
            'rentalDamages',
        ]);

        return response()->json(['data' => $this->formatBookingDetail($booking)]);
    }

    /**
     * POST /api/bookings
     * Buat pesanan baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id'         => ['required', 'integer', 'exists:vehicles,id'],
            'rental_start'       => ['required', 'date', 'after_or_equal:today'],
            'rental_end'         => ['required', 'date', 'after:rental_start'],
            'fulfillment_type'   => ['required', 'in:pickup,delivery'],
            'delivery_address'   => ['required_if:fulfillment_type,delivery', 'nullable', 'string', 'max:500'],
            'delivery_latitude'  => ['nullable', 'numeric'],
            'delivery_longitude' => ['nullable', 'numeric'],
            'pickup_location'    => ['nullable', 'string', 'max:300'],
            'customer_note'      => ['nullable', 'string', 'max:500'],
        ]);

        $vehicle = Vehicle::with(['prices', 'agentProfile'])->findOrFail($validated['vehicle_id']);

        abort_if($vehicle->status !== 'available', 422, 'Kendaraan tidak tersedia.');
        abort_unless($vehicle->agentProfile?->is_active && $vehicle->agentProfile->onboarding_status === 'approved', 422, 'Mitra tidak aktif.');

        // Hitung durasi & harga
        $start    = \Carbon\Carbon::parse($validated['rental_start']);
        $end      = \Carbon\Carbon::parse($validated['rental_end']);
        $days     = max(1, $start->diffInDays($end));
        $priceDay = (float) ($vehicle->prices->first()?->price_per_day ?? $vehicle->price_per_day ?? 0);

        $rentalAmount  = $priceDay * $days;
        $deliveryFee   = $validated['fulfillment_type'] === 'delivery' ? 50000 : 0;
        $serviceFee    = round($rentalAmount * 0.05); // 5% platform fee
        $depositAmount = $priceDay; // 1 hari sebagai deposit
        $totalAmount   = $rentalAmount + $deliveryFee + $serviceFee + $depositAmount;

        $booking = Booking::create([
            'customer_id'        => $request->user()->id,
            'agent_profile_id'   => $vehicle->agentProfile->id,
            'booking_number'     => 'BK-' . strtoupper(uniqid()),
            'rental_start'       => $start,
            'rental_end'         => $end,
            'fulfillment_type'   => $validated['fulfillment_type'],
            'pickup_location'    => $validated['pickup_location'] ?? $vehicle->agentProfile->address,
            'delivery_address'   => $validated['delivery_address'] ?? null,
            'delivery_latitude'  => $validated['delivery_latitude'] ?? null,
            'delivery_longitude' => $validated['delivery_longitude'] ?? null,
            'rental_amount'      => $rentalAmount,
            'delivery_fee'       => $deliveryFee,
            'service_fee'        => $serviceFee,
            'deposit_amount'     => $depositAmount,
            'total_amount'       => $totalAmount,
            'status'             => 'pending_confirmation',
            'customer_note'      => $validated['customer_note'] ?? null,
            'payment_deadline'   => now()->addHours(24),
        ]);

        BookingItem::create([
            'booking_id'  => $booking->id,
            'vehicle_id'  => $vehicle->id,
            'quantity'    => 1,
            'price_per_day' => $priceDay,
            'days'        => $days,
            'subtotal'    => $rentalAmount,
        ]);

        $booking->load(['items.vehicle.photos', 'agentProfile']);

        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data'    => $this->formatBooking($booking),
        ], 201);
    }

    /**
     * POST /api/bookings/{id}/cancel
     * Batalkan pesanan.
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 403);

        $cancelable = ['pending_confirmation', 'confirmed', 'pending_payment'];
        abort_unless(in_array($booking->status, $cancelable), 422, 'Pesanan tidak dapat dibatalkan pada status ini.');

        $booking->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.']);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    private function formatBooking(Booking $b): array
    {
        return [
            'id'             => $b->id,
            'booking_number' => $b->booking_number,
            'status'         => $b->status,
            'rental_start'   => $b->rental_start?->toDateString(),
            'rental_end'     => $b->rental_end?->toDateString(),
            'total_amount'   => (float) $b->total_amount,
            'fulfillment_type' => $b->fulfillment_type,
            'payment_deadline' => $b->payment_deadline?->toISOString(),
            'agent_name'     => $b->agentProfile?->agency_name,
            'vehicle'        => $b->items->first() ? [
                'id'    => $b->items->first()->vehicle?->id,
                'name'  => $b->items->first()->vehicle?->name
                    ?: trim(($b->items->first()->vehicle?->brand ?? '') . ' ' . ($b->items->first()->vehicle?->model ?? '')),
                'photo' => $b->items->first()->vehicle?->photos->first()?->file_path
                    ? asset('storage/' . $b->items->first()->vehicle->photos->first()->file_path)
                    : null,
            ] : null,
            'created_at' => $b->created_at?->toISOString(),
        ];
    }

    private function formatBookingDetail(Booking $b): array
    {
        $base = $this->formatBooking($b);
        $base['rental_amount']   = (float) $b->rental_amount;
        $base['delivery_fee']    = (float) $b->delivery_fee;
        $base['service_fee']     = (float) $b->service_fee;
        $base['deposit_amount']  = (float) $b->deposit_amount;
        $base['pickup_location'] = $b->pickup_location;
        $base['delivery_address']= $b->delivery_address;
        $base['customer_note']   = $b->customer_note;
        $base['agent_note']      = $b->agent_note;
        $base['payment']         = $b->payment ? [
            'id'             => $b->payment->id,
            'payment_number' => $b->payment->payment_number,
            'payment_method' => $b->payment->payment_method,
            'amount'         => (float) $b->payment->amount,
            'status'         => $b->payment->status,
            'paid_at'        => $b->payment->paid_at?->toISOString(),
        ] : null;
        $base['agent'] = $b->agentProfile ? [
            'id'          => $b->agentProfile->id,
            'name'        => $b->agentProfile->agency_name,
            'phone'       => $b->agentProfile->phone,
            'city'        => $b->agentProfile->city,
            'logo'        => $b->agentProfile->logo ? asset('storage/' . $b->agentProfile->logo) : null,
        ] : null;
        return $base;
    }
}
