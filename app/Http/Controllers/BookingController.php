<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\ConfirmBookingRequest;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Index — Daftar Booking
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Booking::class);

        $user  = Auth::user();
        $query = Booking::query()
            ->with([
                'customer',
                'agentProfile',
                'items.vehicle',
                'payments',
            ])
            ->latest();

        // Admin melihat semua booking.
        // Mitra hanya melihat booking yang berkaitan dengan agentnya.
        // Customer hanya melihat booking miliknya.
        if ($user->hasRole('mitra')) {
            $agentProfileId = $user->agentProfile?->id;
            abort_unless($agentProfileId, 403);
            $query->where('agent_profile_id', $agentProfileId);
        } elseif ($user->hasRole('customer')) {
            $query->where('customer_id', $user->id);
        }

        // Filter opsional berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(15)->withQueryString();

        if (view()->exists('bookings.index')) {
            return view('bookings.index', compact('bookings'));
        }

        return response()->json($bookings);
    }

    /*
    |--------------------------------------------------------------------------
    | Confirm / Reject Booking
    |--------------------------------------------------------------------------
    | 10.27.7.4
    |--------------------------------------------------------------------------
    */

    public function confirm(
        ConfirmBookingRequest $request,
        Booking $booking
    ): RedirectResponse {
        $this->authorize(
            'confirm',
            $booking
        );

        $validated =
            $request->validated();

        $this->bookingService->confirmByAgent(
            $booking,
            Auth::user(),
            $validated['status'],
            $validated['agent_note'] ?? null,
            $request
        );

        if (
            $validated['status'] === 'rejected'
        ) {
            return redirect()
                ->route(
                    'bookings.show',
                    $booking
                )
                ->with(
                    'success',
                    'Booking berhasil ditolak. Refund akan diproses oleh admin.'
                );
        }

        return redirect()
            ->route(
                'bookings.show',
                $booking
            )
            ->with(
                'success',
                'Booking berhasil dikonfirmasi.'
            );
    }

    /**
     * Mitra menandai booking siap diambil / diantar.
     */
    public function readyForPickup(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $this->authorize('confirm', $booking);

        $this->bookingService->markReadyForPickup(
            $booking,
            Auth::user(),
            $request
        );

        return redirect()
            ->route('bookings.show', $booking)
            ->with('success', 'Status booking berhasil diubah menjadi siap diambil (ready for pickup).');
    }

    /**
     * Customer atau Admin membatalkan booking.
     */
    public function cancel(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->bookingService->cancel(
            $booking,
            Auth::user(),
            $validated['reason'] ?? null,
            $request
        );

        return redirect()
            ->route('bookings.show', $booking)
            ->with('success', 'Booking berhasil dibatalkan.');
    }

    /*
    |--------------------------------------------------------------------------
    | Create Form
    |--------------------------------------------------------------------------
    */

    public function create(
        Request $request
    ): View {
        $this->authorize(
            'create',
            Booking::class
        );

        $vehicle = null;

        if (
            $request->filled('vehicle_id')
        ) {
            $vehicle = Vehicle::query()
                ->with([
                    'agentProfile',
                    'vehicleCategory',
                    'photos',
                    'prices',
                ])
                ->where(
                    'status',
                    'available'
                )
                ->findOrFail(
                    $request->integer(
                        'vehicle_id'
                    )
                );
        }

        return view(
            'bookings.create',
            [
                'vehicle' =>
                    $vehicle,

                'rentalStart' =>
                    $request->input(
                        'rental_start'
                    ),

                'rentalEnd' =>
                    $request->input(
                        'rental_end'
                    ),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store Booking
    |--------------------------------------------------------------------------
    | 10.27.7.5
    |--------------------------------------------------------------------------
    */

    public function store(
        StoreBookingRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            Booking::class
        );

        $booking =
            $this->bookingService->create(
                Auth::user(),
                $request->validated(),
                $request
            );

        return redirect()
            ->route(
                'bookings.show',
                $booking
            )
            ->with(
                'success',
                'Booking berhasil dibuat. Silakan lanjutkan pembayaran.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show Booking
    |--------------------------------------------------------------------------
    */

    public function show(
        Booking $booking
    ): View {
        $this->authorize(
            'view',
            $booking
        );

        $booking->load([
            'items.vehicle',
            'agentProfile',
            'customer',
            'payments',
            'rentalCheckout',
            'rentalCheckin',
            'rentalDamage',
            'transaction',
            'review',
            'disputes',
        ]);

        return view(
            'bookings.show',
            compact('booking')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit Booking
    |--------------------------------------------------------------------------
    | 10.27.7.5
    |--------------------------------------------------------------------------
    */

    public function edit(
        Booking $booking
    ): View {
        $this->authorize(
            'update',
            $booking
        );

        return view(
            'bookings.edit',
            compact('booking')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Booking
    |--------------------------------------------------------------------------
    | 10.27.7.5
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $this->authorize(
            'update',
            $booking
        );

        /*
        |--------------------------------------------------------------------------
        | Validasi sederhana
        |--------------------------------------------------------------------------
        */

        $validated =
            $request->validate([
                'rental_start' =>
                    [
                        'required',
                        'date',
                    ],

                'rental_end' =>
                    [
                        'required',
                        'date',
                        'after:rental_start',
                    ],

                'fulfillment_type' =>
                    [
                        'required',
                        'string',
                    ],

                'pickup_location' =>
                    [
                        'nullable',
                        'string',
                        'max:255',
                    ],

                'delivery_address' =>
                    [
                        'nullable',
                        'string',
                    ],

                'customer_note' =>
                    [
                        'nullable',
                        'string',
                    ],
            ]);

        $this->bookingService->update(
            $booking,
            Auth::user(),
            $validated,
            $request
        );

        return redirect()
            ->route(
                'bookings.show',
                $booking
            )
            ->with(
                'success',
                'Booking berhasil diperbarui.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Booking
    |--------------------------------------------------------------------------
    | 10.27.7.5
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $this->authorize('delete', $booking);

        $this->bookingService->delete(
            $booking,
            Auth::user(),
            $request
        );

        return redirect()
            ->route('vehicles.search')
            ->with(
                'success',
                'Booking berhasil dihapus.'
            );
    }
}