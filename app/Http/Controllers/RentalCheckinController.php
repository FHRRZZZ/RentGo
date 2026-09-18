<?php

namespace App\Http\Controllers;
use App\Http\Requests\StoreRentalCheckinRequest;
use App\Models\Booking;
use App\Models\RentalCheckin;
use App\Services\RentalCheckinService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RentalCheckinController extends Controller
{
    public function __construct(
        protected RentalCheckinService $rentalCheckinService
    ) {}

    /**
     * Menampilkan daftar check-in.
     */
    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            RentalCheckin::class
        );

        $query = RentalCheckin::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
                'vehicle',
            ])
            ->latest('checkin_at');

        // Mitra hanya dapat melihat kendaraan miliknya.
        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'vehicle.agentProfile',
                fn ($query) => $query->where(
                    'user_id',
                    Auth::id()
                )
            );
        }

        // Filter status keterlambatan.
        if ($request->filled('late')) {
            $query->where(
                'is_late_return',
                $request->boolean('late')
            );
        }

        $checkins = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'rental-checkins.index',
            compact('checkins')
        );
    }

    /**
     * Menampilkan form check-in kendaraan.
     */
    public function create(Request $request): View
    {
        $this->authorize(
            'create',
            RentalCheckin::class
        );

        $booking = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::query()
                ->with([
                    'customer',
                    'agentProfile',
                    'items.vehicle',
                    'rentalCheckout',
                ])
                ->findOrFail(
                    $request->integer('booking_id')
                );

            // Booking harus milik mitra yang login.
            if (
                $booking->agentProfile?->user_id
                !== Auth::id()
            ) {
                abort(403);
            }

            // Check-in hanya untuk booking ongoing.
            if ($booking->status !== 'ongoing') {
                abort(
                    422,
                    'Booking belum dapat dilakukan check-in.'
                );
            }

            // Pastikan sudah checkout.
            if (!$booking->rentalCheckout) {
                abort(
                    422,
                    'Booking ini belum memiliki data checkout/pickup.'
                );
            }

            // Pastikan belum pernah check-in.
            if (
                RentalCheckin::query()
                    ->where('booking_id', $booking->id)
                    ->exists()
            ) {
                abort(
                    422,
                    'Booking ini sudah memiliki data check-in.'
                );
            }
        }

        return view(
            'rental-checkins.create',
            compact('booking')
        );
    }

    /**
     * Menyimpan data check-in kendaraan.
     */
    public function store(
        StoreRentalCheckinRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            RentalCheckin::class
        );

        $validated = $request->validated();

        $booking = Booking::query()
            ->findOrFail(
                $validated['booking_id']
            );

        $checkin = $this->rentalCheckinService->create(
            $booking,
            Auth::user(),
            $validated,
            $request
        );

        return redirect()
            ->route(
                'rental-checkins.show',
                $checkin
            )
            ->with(
                'success',
                'Check-in kendaraan berhasil dicatat. Booking sekarang berstatus returned.'
            );
    }

    /**
     * Menampilkan detail check-in.
     */
    public function show(
        RentalCheckin $rentalCheckin
    ): View {
        $this->authorize(
            'view',
            $rentalCheckin
        );

        $rentalCheckin->load([
            'booking.customer',
            'booking.agentProfile',
            'booking.items.vehicle',
            'booking.rentalCheckout',
            'vehicle.agentProfile',
        ]);

        return view(
            'rental-checkins.show',
            compact('rentalCheckin')
        );
    }
}