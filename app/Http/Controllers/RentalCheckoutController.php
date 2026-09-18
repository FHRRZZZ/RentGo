<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalCheckoutRequest;
use App\Models\Booking;
use App\Models\RentalCheckout;
use App\Models\User;
use App\Services\RentalCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RentalCheckoutController extends Controller
{
    public function __construct(
        protected RentalCheckoutService $rentalCheckoutService
    ) {}

    /**
     * Menampilkan daftar checkout.
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', RentalCheckout::class);

        $query = RentalCheckout::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
                'vehicle',
            ])
            ->latest('checkout_at');

        // Mitra hanya melihat checkout kendaraan miliknya.
        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'vehicle.agentProfile',
                fn ($query) => $query->where(
                    'user_id',
                    Auth::id()
                )
            );
        }

        $checkouts = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'rental-checkouts.index',
            compact('checkouts')
        );
    }

    /**
     * Menampilkan form checkout.
     */
    public function create(Request $request): View
    {
        $this->authorize('create', RentalCheckout::class);

        $booking = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::query()
                ->with([
                    'customer',
                    'agentProfile',
                    'items.vehicle',
                ])
                ->findOrFail(
                    $request->integer('booking_id')
                );

            // Pastikan booking memang milik mitra yang login.
            if (
                $booking->agentProfile?->user_id
                !== Auth::id()
            ) {
                abort(403);
            }

            // Checkout hanya untuk booking confirmed.
            if ($booking->status !== 'confirmed') {
                abort(
                    422,
                    'Booking belum dapat dilakukan checkout.'
                );
            }

            // Jangan tampilkan booking yang sudah checkout.
            if (
                RentalCheckout::query()
                    ->where('booking_id', $booking->id)
                    ->exists()
            ) {
                abort(
                    422,
                    'Booking ini sudah memiliki data checkout.'
                );
            }
        }

        return view(
            'rental-checkouts.create',
            compact('booking')
        );
    }

    /**
     * Menyimpan proses checkout.
     */
    public function store(
        StoreRentalCheckoutRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            RentalCheckout::class
        );

        $validated = $request->validated();

        $booking = Booking::query()
            ->findOrFail($validated['booking_id']);

        $checkout = $this->rentalCheckoutService->create(
            $booking,
            Auth::user(),
            $validated,
            $request
        );

        return redirect()
            ->route(
                'rental-checkouts.show',
                $checkout
            )
            ->with(
                'success',
                'Checkout kendaraan berhasil dicatat. Booking sekarang berstatus ongoing.'
            );
    }

    /**
     * Menampilkan detail checkout.
     */
    public function show(
        RentalCheckout $rentalCheckout
    ): View {
        $this->authorize(
            'view',
            $rentalCheckout
        );

        $rentalCheckout->load([
            'booking.customer',
            'booking.agentProfile',
            'booking.items.vehicle',
            'vehicle.agentProfile',
        ]);

        return view(
            'rental-checkouts.show',
            compact('rentalCheckout')
        );
    }
}