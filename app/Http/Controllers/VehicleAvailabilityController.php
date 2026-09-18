<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleAvailabilityRequest;
use App\Http\Requests\UpdateVehicleAvailabilityRequest;
use App\Models\Vehicle;
use App\Models\VehicleAvailability;
use App\Services\VehicleAvailabilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class VehicleAvailabilityController extends Controller
{
    public function __construct(
        private VehicleAvailabilityService $vehicleAvailabilityService
    ) {
    }

    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            VehicleAvailability::class
        );

        $query = VehicleAvailability::with('vehicle')
            ->latest('start_date');

        // Mitra hanya melihat availability kendaraan miliknya
        if ($request->user()->hasRole('mitra')) {
            $agentProfileId = $request->user()
                ->agentProfile?->id;

            abort_unless($agentProfileId, 403);

            $query->whereHas('vehicle', function ($vehicleQuery) use (
                $agentProfileId
            ) {
                $vehicleQuery->where(
                    'agent_profile_id',
                    $agentProfileId
                );
            });
        }

        $availabilities = $query->paginate(10);

        return view(
            'vehicle-availabilities.index',
            compact('availabilities')
        );
    }

    public function create(Request $request): View
    {
        $this->authorize(
            'create',
            VehicleAvailability::class
        );

        $query = Vehicle::query()
            ->where('status', '!=', 'inactive')
            ->orderBy('name');

        // Mitra hanya dapat memilih kendaraan miliknya
        if ($request->user()->hasRole('mitra')) {
            $agentProfileId = $request->user()
                ->agentProfile?->id;

            abort_unless($agentProfileId, 403);

            $query->where(
                'agent_profile_id',
                $agentProfileId
            );
        }

        $vehicles = $query->get();

        return view(
            'vehicle-availabilities.create',
            compact('vehicles')
        );
    }

    public function store(
        StoreVehicleAvailabilityRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            VehicleAvailability::class
        );

        $data = $request->validated();

        /*
         * Jika mitra membuat availability,
         * pastikan kendaraan memang miliknya.
         */
        if ($request->user()->hasRole('mitra')) {
            $agentProfileId = $request->user()
                ->agentProfile?->id;

            abort_unless($agentProfileId, 403);

            $vehicle = Vehicle::findOrFail(
                $data['vehicle_id']
            );

            abort_unless(
                $vehicle->agent_profile_id === $agentProfileId,
                403
            );
        }

        $this->vehicleAvailabilityService->create(
            $data,
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicle-availabilities.index')
            ->with(
                'success',
                'Availability kendaraan berhasil ditambahkan.'
            );
    }

    public function show(
        VehicleAvailability $vehicleAvailability
    ): View {
        $this->authorize(
            'view',
            $vehicleAvailability
        );

        $vehicleAvailability->load('vehicle');

        return view(
            'vehicle-availabilities.show',
            compact('vehicleAvailability')
        );
    }

    public function edit(
        VehicleAvailability $vehicleAvailability
    ): View {
        $this->authorize(
            'update',
            $vehicleAvailability
        );

        $vehicleAvailability->load('vehicle');

        $vehicles = Vehicle::query()
            ->where('status', '!=', 'inactive')
            ->orderBy('name')
            ->get();

        return view(
            'vehicle-availabilities.edit',
            compact(
                'vehicleAvailability',
                'vehicles'
            )
        );
    }

    public function update(
        UpdateVehicleAvailabilityRequest $request,
        VehicleAvailability $vehicleAvailability
    ): RedirectResponse {
        $this->authorize(
            'update',
            $vehicleAvailability
        );

        $this->vehicleAvailabilityService->update(
            $vehicleAvailability,
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicle-availabilities.index')
            ->with(
                'success',
                'Availability kendaraan berhasil diperbarui.'
            );
    }

    public function destroy(
        Request $request,
        VehicleAvailability $vehicleAvailability
    ): RedirectResponse {
        $this->authorize(
            'delete',
            $vehicleAvailability
        );

        $this->vehicleAvailabilityService->delete(
            $vehicleAvailability,
            $request->user(),
            $request
        );

        return redirect()
            ->route('vehicle-availabilities.index')
            ->with(
                'success',
                'Availability kendaraan berhasil dihapus.'
            );
    }
}