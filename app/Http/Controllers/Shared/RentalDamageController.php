<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreRentalDamageRequest;
use App\Models\Booking;
use App\Models\RentalCheckin;
use App\Models\RentalDamage;
use App\Services\RentalDamageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RentalDamageController extends Controller
{
    public function __construct(
        protected RentalDamageService $rentalDamageService
    ) {}

    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            RentalDamage::class
        );

        $query = RentalDamage::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
                'vehicle',
                'rentalCheckin',
            ])
            ->latest();

        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'vehicle.agentProfile',
                fn ($query) => $query->where(
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

        if ($request->filled('severity')) {
            $query->where(
                'severity',
                $request->severity
            );
        }

        $damages = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'rental-damages.index',
            compact('damages')
        );
    }

    public function create(Request $request): View
    {
        $this->authorize(
            'create',
            RentalDamage::class
        );

        $booking = null;
        $rentalCheckin = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::query()
                ->with([
                    'customer',
                    'agentProfile',
                    'items.vehicle',
                    'rentalCheckin',
                ])
                ->findOrFail(
                    $request->integer('booking_id')
                );

            if (
                $booking->agentProfile?->user_id
                !== Auth::id()
            ) {
                abort(403);
            }

            if ($booking->status !== 'returned') {
                abort(
                    422,
                    'Booking belum berstatus returned.'
                );
            }

            $rentalCheckin = $booking->rentalCheckin;

            if (!$rentalCheckin) {
                abort(
                    422,
                    'Booking belum memiliki data check-in.'
                );
            }
        }

        return view(
            'rental-damages.create',
            compact(
                'booking',
                'rentalCheckin'
            )
        );
    }

    public function store(
        StoreRentalDamageRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            RentalDamage::class
        );

        $validated = $request->validated();

        $booking = Booking::query()
            ->findOrFail(
                $validated['booking_id']
            );

        $rentalCheckin = RentalCheckin::query()
            ->findOrFail(
                $validated['rental_checkin_id']
            );

        $damage = $this->rentalDamageService->create(
            $booking,
            $rentalCheckin,
            Auth::user(),
            $validated,
            $request,
        );

        return redirect()
            ->route(
                'rental-damages.show',
                $damage
            )
            ->with(
                'success',
                'Data kerusakan kendaraan berhasil dicatat.'
            );
    }

    public function show(
        RentalDamage $rentalDamage
    ): View {
        $this->authorize(
            'view',
            $rentalDamage
        );

        $rentalDamage->load([
            'booking.customer',
            'booking.agentProfile',
            'booking.items.vehicle',
            'vehicle.agentProfile',
            'rentalCheckin',
        ]);

        return view(
            'rental-damages.show',
            compact('rentalDamage')
        );
    }
}