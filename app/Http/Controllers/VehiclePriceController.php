<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehiclePriceRequest;
use App\Http\Requests\UpdateVehiclePriceRequest;
use App\Models\Vehicle;
use App\Models\VehiclePrice;
use App\Services\VehiclePriceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class VehiclePriceController extends Controller
{
    public function __construct(
        private VehiclePriceService $vehiclePriceService
    ) {
    }

    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            VehiclePrice::class
        );

        $query = VehiclePrice::with('vehicle')
            ->latest();

        /*
         * Mitra hanya melihat harga kendaraan miliknya.
         */
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

        $vehiclePrices = $query->paginate(10);

        return view(
            'vehicle-prices.index',
            compact('vehiclePrices')
        );
    }

    public function create(Request $request): View
    {
        $this->authorize(
            'create',
            VehiclePrice::class
        );

        $query = Vehicle::query()
            ->where('status', '!=', 'inactive')
            ->orderBy('name');

        /*
         * Mitra hanya dapat memilih kendaraan miliknya.
         */
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
            'vehicle-prices.create',
            compact('vehicles')
        );
    }

    public function store(
        StoreVehiclePriceRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            VehiclePrice::class
        );

        $data = $request->validated();

        /*
         * Jika mitra membuat harga,
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

        $this->vehiclePriceService->create(
            $data
        );

        return redirect()
            ->route('vehicle-prices.index')
            ->with(
                'success',
                'Harga kendaraan berhasil ditambahkan.'
            );
    }

    public function show(
        VehiclePrice $vehiclePrice
    ): View {
        $this->authorize(
            'view',
            $vehiclePrice
        );

        $vehiclePrice->load('vehicle');

        return view(
            'vehicle-prices.show',
            compact('vehiclePrice')
        );
    }

    public function edit(
        VehiclePrice $vehiclePrice
    ): View {
        $this->authorize(
            'update',
            $vehiclePrice
        );

        $vehiclePrice->load('vehicle');

        $query = Vehicle::query()
            ->where('status', '!=', 'inactive')
            ->orderBy('name');

        /*
         * Mitra hanya dapat memilih kendaraan miliknya.
         */
        if (request()->user()->hasRole('mitra')) {
            $agentProfileId = request()->user()
                ->agentProfile?->id;

            abort_unless($agentProfileId, 403);

            $query->where(
                'agent_profile_id',
                $agentProfileId
            );
        }

        $vehicles = $query->get();

        return view(
            'vehicle-prices.edit',
            compact(
                'vehiclePrice',
                'vehicles'
            )
        );
    }

    public function update(
        UpdateVehiclePriceRequest $request,
        VehiclePrice $vehiclePrice
    ): RedirectResponse {
        $this->authorize(
            'update',
            $vehiclePrice
        );

        $this->vehiclePriceService->update(
            $vehiclePrice,
            $request->validated()
        );

        return redirect()
            ->route('vehicle-prices.index')
            ->with(
                'success',
                'Harga kendaraan berhasil diperbarui.'
            );
    }

    public function destroy(
        VehiclePrice $vehiclePrice
    ): RedirectResponse {
        $this->authorize(
            'delete',
            $vehiclePrice
        );

        $this->vehiclePriceService->delete(
            $vehiclePrice
        );

        return redirect()
            ->route('vehicle-prices.index')
            ->with(
                'success',
                'Harga kendaraan berhasil dihapus.'
            );
    }
}