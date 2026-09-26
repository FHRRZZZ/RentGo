<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\ComplianceService;
use Illuminate\View\View;

/**
 * VehicleCatalogController — katalog armada untuk publik / customer.
 *
 * Dipakai halaman detail armada yang bisa diakses tanpa login.
 * CRUD kendaraan admin & mitra berada di controller terpisah:
 *  - Admin  → App\Http\Controllers\Admin\VehicleManagementController
 *  - Mitra  → App\Http\Controllers\Agent\VehicleManagementController
 */
class VehicleCatalogController extends Controller
{
    public function __construct(
        private ComplianceService $complianceService
    ) {}

    /**
     * Detail satu armada (halaman publik / customer).
     */
    public function show(Vehicle $vehicle): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('view', $vehicle);

        $vehicle->load([
            'agentProfile.user',
            'vehicleCategory',
            'photos',
            'documents',
            'availabilities',
            'prices',
            'reviews.customer',
        ]);

        if (request()->wantsJson() && !request()->header('X-Inertia')) {
            return response()->json($vehicle);
        }

        // Status kelengkapan dokumen customer (untuk gate pemesanan di UI).
        $authUser = request()->user();
        $compliance = $authUser && $authUser->hasRole('customer')
            ? $this->complianceService->customerStatus($authUser)
            : null;

        $bookedRanges = $vehicle->active_booked_ranges;
        $currentBooking = $vehicle->current_active_booking;

        return \Inertia\Inertia::render('Vehicle/Show', [
            'vehicle' => $vehicle,
            'agent' => $vehicle->agentProfile,
            'category' => $vehicle->vehicleCategory,
            'reviews' => $vehicle->reviews ?? [],
            'availabilities' => $vehicle->availabilities ?? [],
            'compliance' => $compliance,
            'bookedRanges' => $bookedRanges,
            'currentlyRented' => $currentBooking ? [
                'status' => $currentBooking->booking?->status,
                'start' => $currentBooking->rental_start ? $currentBooking->rental_start->format('d M Y') : null,
                'until' => $currentBooking->rental_end ? $currentBooking->rental_end->format('d M Y') : null,
            ] : null,
        ]);
    }
}
