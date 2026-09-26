<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

/**
 * BookingController khusus Customer (penyewa).
 *
 * Berisi aksi yang dilakukan customer: membuat pesanan, melihat pesanan
 * miliknya, memperbarui, dan membatalkan pesanannya.
 */
class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Index — Daftar Pesanan Saya
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Booking::class);

        $user  = Auth::user();
        $query = Booking::query()
            ->with([
                'customer',
                'agentProfile.user',
                'items.vehicle.photos',
                'payments',
            ])
            ->where('customer_id', $user->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(15)->withQueryString();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($bookings);
        }

        return \Inertia\Inertia::render('Orders/Index', [
            'bookings' => $bookings->items(),
            'pagination' => $bookings,
            'auth' => ['user' => $user],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Form
    |--------------------------------------------------------------------------
    */

    public function create(Request $request): View
    {
        $this->authorize('create', Booking::class);

        $vehicle = null;

        if ($request->filled('vehicle_id')) {
            $vehicle = Vehicle::query()
                ->with([
                    'agentProfile',
                    'vehicleCategory',
                    'photos',
                    'prices',
                ])
                ->where('status', 'available')
                ->findOrFail($request->integer('vehicle_id'));
        }

        return view('bookings.create', [
            'vehicle' => $vehicle,
            'rentalStart' => $request->input('rental_start'),
            'rentalEnd' => $request->input('rental_end'),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store Booking
    |--------------------------------------------------------------------------
    */

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $this->authorize('create', Booking::class);

        $booking = $this->bookingService->create(
            Auth::user(),
            $request->validated(),
            $request
        );

        // Setelah memesan, customer langsung diarahkan memilih metode
        // pembayaran (COD / QRIS / Transfer Bank).
        return redirect()
            ->route('payments.create', $booking)
            ->with(
                'success',
                'Booking berhasil dibuat. Silakan pilih metode pembayaran.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show Booking
    |--------------------------------------------------------------------------
    */

    public function show(Booking $booking): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load([
            'items.vehicle.photos',
            'agentProfile.user',
            'customer',
            'payments',
            'rentalCheckout',
            'rentalCheckin',
            'rentalDamages',
            'transaction',
            'reviews',
            'disputes',
            'cancellations',
        ]);

        if (request()->wantsJson() && !request()->header('X-Inertia')) {
            return response()->json($booking);
        }

        return \Inertia\Inertia::render('Booking/Show', [
            'booking' => $booking,
            'bookingNumber' => $booking->booking_number,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Edit / Update Booking
    |--------------------------------------------------------------------------
    */

    public function edit(Booking $booking): View
    {
        $this->authorize('update', $booking);

        return view('bookings.edit', compact('booking'));
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        $validated = $request->validate([
            'rental_start' => ['required', 'date'],
            'rental_end' => ['required', 'date', 'after:rental_start'],
            'fulfillment_type' => ['required', 'string'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'delivery_address' => ['nullable', 'string'],
            'customer_note' => ['nullable', 'string'],
        ]);

        $this->bookingService->update(
            $booking,
            Auth::user(),
            $validated,
            $request
        );

        return redirect()
            ->route('bookings.show', $booking)
            ->with('success', 'Booking berhasil diperbarui.');
    }

    /*
    |--------------------------------------------------------------------------
    | Cancel Booking
    |--------------------------------------------------------------------------
    */

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
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
    | Delete Booking
    |--------------------------------------------------------------------------
    */

    public function destroy(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorize('delete', $booking);

        $this->bookingService->delete(
            $booking,
            Auth::user(),
            $request
        );

        return redirect()
            ->route('vehicles.search')
            ->with('success', 'Booking berhasil dihapus.');
    }
}
