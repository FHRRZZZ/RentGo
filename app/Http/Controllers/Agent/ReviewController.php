<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Ulasan pada sisi Mitra.
 *
 * Menampilkan ulasan yang masuk untuk unit milik mitra, beserta formulir
 * balasan publik. Moderasi tetap dilakukan admin (Admin\SupportController).
 */
class ReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function index(): \Inertia\Response
    {
        $user = Auth::user();
        $agentProfileId = $user->agentProfile?->id;

        $reviews = Review::query()
            ->with([
                'customer:id,name,avatar',
                'vehicle:id,name,brand,model',
                'booking:id,booking_number',
            ])
            ->where('agent_profile_id', $agentProfileId ?? 0)
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Review $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'review' => $r->review,
                'status' => $r->status,
                'reply' => $r->reply,
                'replied_at' => $r->replied_at?->toISOString(),
                'published_at' => $r->published_at?->toISOString(),
                'created_at' => $r->created_at?->toISOString(),
                'customer_name' => $r->customer?->name,
                'customer_avatar' => $r->customer?->avatar,
                'vehicle_name' => $r->vehicle?->name,
                'booking_number' => $r->booking?->booking_number,
            ])
            ->values()
            ->all();

        return Inertia::render('Agent/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    /**
     * Simpan balasan mitra atas ulasan customer.
     */
    public function reply(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $this->reviewService->reply(
                $review,
                Auth::user(),
                $validated['reply'],
                $request
            );
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Balasan ulasan berhasil disimpan.');
    }
}
