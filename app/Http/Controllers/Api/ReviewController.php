<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Reviews — buat & lihat ulasan kendaraan.
 */
class ReviewController extends Controller
{
    /**
     * GET /api/vehicles/{vehicle}/reviews
     * Daftar ulasan untuk kendaraan tertentu.
     */
    public function index(Vehicle $vehicle): JsonResponse
    {
        $reviews = Review::where('vehicle_id', $vehicle->id)
            ->with('customer')
            ->whereNull('hidden_at')
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => collect($reviews->items())->map(fn($r) => [
                'id'           => $r->id,
                'rating'       => $r->rating,
                'comment'      => $r->comment,
                'customer_name'=> $r->customer?->name,
                'created_at'   => $r->created_at?->toISOString(),
            ])->values()->all(),
            'average_rating' => (float) round($reviews->avg('rating') ?? 0, 1),
            'total'          => $reviews->total(),
        ]);
    }

    /**
     * POST /api/reviews
     * Tulis ulasan setelah sewa selesai.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'comment'    => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = \App\Models\Booking::findOrFail($validated['booking_id']);
        abort_unless($booking->customer_id === $request->user()->id, 403);
        abort_unless($booking->status === 'completed', 422, 'Hanya bisa memberi ulasan setelah sewa selesai.');

        // Cek duplikasi
        $exists = Review::where('booking_id', $validated['booking_id'])
            ->where('customer_id', $request->user()->id)
            ->exists();
        abort_if($exists, 422, 'Anda sudah memberikan ulasan untuk pesanan ini.');

        $review = Review::create([
            'booking_id'       => $validated['booking_id'],
            'vehicle_id'       => $validated['vehicle_id'],
            'agent_profile_id' => $booking->agent_profile_id,
            'customer_id'      => $request->user()->id,
            'rating'           => $validated['rating'],
            'comment'          => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Ulasan berhasil dikirim. Terima kasih!',
            'data'    => [
                'id'      => $review->id,
                'rating'  => $review->rating,
                'comment' => $review->comment,
            ],
        ], 201);
    }
}
