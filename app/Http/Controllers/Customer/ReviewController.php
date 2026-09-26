<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Halaman ulasan milik Customer.
 *
 * Menampilkan ulasan yang pernah ditulis beserta balasan mitra, serta daftar
 * pesanan selesai yang belum diulas agar customer bisa langsung menilai.
 */
class ReviewController extends Controller
{
    public function index(): \Inertia\Response
    {
        $user = Auth::user();

        $reviews = Review::query()
            ->with([
                'vehicle:id,name,brand,model',
                'agentProfile:id,agency_name',
                'booking:id,booking_number',
            ])
            ->where('customer_id', $user->id)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn(Review $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'review' => $r->review,
                'status' => $r->status,
                'reply' => $r->reply,
                'replied_at' => $r->replied_at?->toISOString(),
                'published_at' => $r->published_at?->toISOString(),
                'created_at' => $r->created_at?->toISOString(),
                'vehicle_name' => $r->vehicle?->name,
                'agency_name' => $r->agentProfile?->agency_name,
                'booking_number' => $r->booking?->booking_number,
            ])
            ->values()
            ->all();

        // Pesanan selesai yang belum pernah diulas → tombol "Beri Ulasan".
        $reviewedBookingIds = Review::query()
            ->where('customer_id', $user->id)
            ->pluck('booking_id')
            ->all();

        $pendingBookings = Booking::query()
            ->with(['items.vehicle:id,name,brand,model,vehicle_type'])
            ->where('customer_id', $user->id)
            ->whereIn('status', ['completed', 'returned'])
            ->whereNotIn('id', $reviewedBookingIds)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn(Booking $b) => [
                'id' => $b->id,
                'booking_number' => $b->booking_number,
                'vehicle_name' => $b->items->first()?->vehicle?->name
                    ?: 'Kendaraan',
                'rental_end' => $b->rental_end?->toDateString(),
            ])
            ->values()
            ->all();

        return Inertia::render('Reviews/Index', [
            'reviews' => $reviews,
            'pendingBookings' => $pendingBookings,
        ]);
    }

    /**
     * Simpan ulasan customer untuk sebuah pesanan.
     *
     * Validasi kelayakan (status selesai, belum pernah diulas, kepemilikan)
     * tetap dijalankan ReviewService agar konsisten dengan aturan lama.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['required', 'string', 'max:1000'],
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        try {
            app(\App\Services\ReviewService::class)->create(
                $booking,
                Auth::user(),
                (int) $validated['rating'],
                $validated['review'],
                $request
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('reviews.mine')
            ->with('success', 'Ulasan terkirim. Terima kasih atas masukannya!');
    }
}
