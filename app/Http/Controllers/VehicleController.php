<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\AgentProfile;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Services\VehicleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class VehicleController extends Controller
{
    public function __construct(
        private VehicleService $vehicleService
    ) {
    }

    public function index(Request $request): View
{
    $this->authorize('viewAny', Vehicle::class);

    $query = Vehicle::with([
        'agentProfile',
        'vehicleCategory',
    ])
        ->latest();

    if ($request->user()->hasRole('mitra')) {
        $agentProfileId = $request->user()->agentProfile?->id;

        abort_unless($agentProfileId, 403);

        $query->where(
            'agent_profile_id',
            $agentProfileId
        );
    }

    $vehicles = $query->paginate(10);

    return view('vehicles.index', compact('vehicles'));
}

    public function create(Request $request): View
    {
        $this->authorize('create', Vehicle::class);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        $mitras = AgentProfile::where('is_active', true)
            ->orderBy('agency_name')
            ->get();

        return view('vehicles.create', compact(
            'categories',
            'mitras'
        ));
    }

    public function store(
        StoreVehicleRequest $request
    ): RedirectResponse {
        $this->authorize('create', Vehicle::class);

        $data = $request->validated();

        /*
         * Jika yang membuat kendaraan adalah mitra,
         * paksa kendaraan menjadi milik mitra yang sedang login.
         */
        if ($request->user()->hasRole('mitra')) {
            $agentProfile = $request->user()->agentProfile;

            abort_unless($agentProfile, 403);

            $data['agent_profile_id'] = $agentProfile->id;
        }

        $this->vehicleService->create(
            $data,
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicles.index')
            ->with(
                'success',
                'Kendaraan berhasil ditambahkan.'
            );
    }

    public function show(Vehicle $vehicle): View
    {
        $this->authorize('view', $vehicle);

        $vehicle->load([
            'agentProfile',
            'vehicleCategory',
            'photos',
            'documents',
            'availabilities',
            'prices',
        ]);

        return view(
            'vehicles.show',
            compact('vehicle')
        );
    }

    public function edit(Vehicle $vehicle): View
    {
        $this->authorize('update', $vehicle);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return view('vehicles.edit', compact(
            'vehicle',
            'categories'
        ));
    }

    public function update(
        UpdateVehicleRequest $request,
        Vehicle $vehicle
    ): RedirectResponse {
        $this->authorize('update', $vehicle);

        $this->vehicleService->update(
            $vehicle,
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicles.index')
            ->with(
                'success',
                'Kendaraan berhasil diperbarui.'
            );
    }

    public function destroy(
        Request $request,
        Vehicle $vehicle
    ): RedirectResponse {
        $this->authorize('delete', $vehicle);

        /*
         * Kendaraan yang sudah memiliki data transaksi
         * sebaiknya tidak dihapus sembarangan.
         */
        if ($vehicle->bookingItems()->exists()) {
            return back()->with(
                'error',
                'Kendaraan tidak dapat dihapus karena sudah digunakan dalam booking.'
            );
        }

        $this->vehicleService->delete(
            $vehicle,
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicles.index')
            ->with(
                'success',
                'Kendaraan berhasil dihapus.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Vehicle — Admin Approve / Reject
    |--------------------------------------------------------------------------
    | PRD §8.3 — Vehicle Verification Flow
    | BR-02 — Kendaraan tidak muncul sebelum disetujui
    |--------------------------------------------------------------------------
    */

    public function verify(
        Request $request,
        Vehicle $vehicle
    ): RedirectResponse {
        $this->authorize('verify', $vehicle);

        $validated = $request->validate([
            'decision' => [
                'required',
                'string',
                'in:approved,rejected',
            ],
            'rejection_reason' => [
                'nullable',
                'string',
                'max:500',
                'required_if:decision,rejected',
            ],
        ]);

        $this->vehicleService->verify(
            $vehicle,
            $request->user(),
            $validated['decision'],
            $validated['rejection_reason'] ?? null,
            $request
        );

        $message = $validated['decision'] === 'approved'
            ? 'Kendaraan berhasil disetujui dan kini tersedia untuk customer.'
            : 'Kendaraan berhasil ditolak. Mitra akan diberitahu.';

        return redirect()
            ->route('vehicles.show', $vehicle)
            ->with('success', $message);
    }
}