<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ModerateReviewRequest;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Booking;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function index(
        Request $request
    ): View {
        $this->authorize(
            'viewAny',
            Review::class
        );

        $query = Review::query()
            ->with([
                'customer',
                'agentProfile',
                'vehicle',
                'moderator',
            ])
            ->latest();

        if (Auth::user()->hasRole('customer')) {
            $query->where(
                'customer_id',
                Auth::id()
            );
        }

        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'agentProfile',
                fn ($q) => $q->where(
                    'user_id',
                    Auth::id()
                )
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $reviews = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'reviews.index',
            compact('reviews')
        );
    }

    public function show(
        Review $review
    ): View {
        $this->authorize(
            'view',
            $review
        );

        $review->load([
            'booking',
            'customer',
            'agentProfile',
            'vehicle',
            'moderator',
        ]);

        return view(
            'reviews.show',
            compact('review')
        );
    }

    public function create(): View
    {
        $this->authorize(
            'create',
            Review::class
        );

        $bookings = Booking::query()
            ->where(
                'customer_id',
                Auth::id()
            )
            ->where(
                'status',
                'completed'
            )
            ->with([
                'agentProfile',
                'items.vehicle',
            ])
            ->latest()
            ->get();

        return view(
            'reviews.create',
            compact('bookings')
        );
    }

    public function store(
        StoreReviewRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            Review::class
        );

        $validated = $request->validated();

        $booking = Booking::findOrFail(
            $validated['booking_id']
        );

        $review = $this->reviewService->create(
            $booking,
            Auth::user(),
            $validated['rating'],
            $validated['review'] ?? null,
            $request
        );

        return redirect()
            ->route(
                'reviews.show',
                $review
            )
            ->with(
                'success',
                'Review berhasil dibuat dan menunggu moderasi.'
            );
    }

    public function moderate(
        ModerateReviewRequest $request,
        Review $review
    ): RedirectResponse {
        $this->authorize(
            'moderate',
            $review
        );

        $validated = $request->validated();

        $this->reviewService->moderate(
            $review,
            Auth::user(),
            $validated['status'],
            $validated['moderation_note'] ?? null,
            $request
        );

        return redirect()
            ->route(
                'reviews.show',
                $review
            )
            ->with(
                'success',
                'Review berhasil dimoderasi.'
            );
    }

    public function destroy(
        Review $review
    ): RedirectResponse {
        $this->authorize(
            'delete',
            $review
        );

        $review->delete();

        return redirect()
            ->route(
                'reviews.index'
            )
            ->with(
                'success',
                'Review berhasil dihapus.'
            );
    }
}