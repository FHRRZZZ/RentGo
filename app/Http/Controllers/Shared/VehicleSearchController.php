<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\VehicleSearchRequest;
use App\Models\VehicleCategory;
use App\Services\VehicleSearchService;
use Illuminate\View\View;

class VehicleSearchController extends Controller
{
    public function __construct(
        private VehicleSearchService $vehicleSearchService
    ) {}

    public function index(
        VehicleSearchRequest $request
    ): \Inertia\Response|\Illuminate\View\View|\Illuminate\Http\JsonResponse {
        $filters = $request->validated();

        if (
            !empty($filters['rental_start']) &&
            !empty($filters['rental_end'])
        ) {
            $vehicles = $this->vehicleSearchService->search($filters);
        } else {
            $query = \App\Models\Vehicle::query()
                // 'category' + 'availabilities' dipakai agar data unit lengkap
                // dikirim ke halaman (Unit/MappingUnit & Vehicle/Show).
                ->with(['agentProfile.user', 'vehicleCategory', 'category', 'photos', 'prices', 'availabilities'])
                ->where('status', 'available');

            if ($request->filled('tipe') && !in_array($request->string('tipe')->toString(), ['all', 'semua'], true)) {
                $type = $request->string('tipe')->toString() === 'motor' ? 'motorcycle' : 'car';
                $query->where('vehicle_type', $type);
            }

            if ($request->filled('q')) {
                $q = $request->string('q')->toString();
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'like', "%{$q}%")
                        ->orWhere('brand', 'like', "%{$q}%")
                        ->orWhere('model', 'like', "%{$q}%");
                });
            }

            if ($request->filled('kota') && $request->string('kota')->toString() !== 'Semua Kota') {
                $city = $request->string('kota')->toString();
                $query->where(function ($sub) use ($city) {
                    $sub->where('pickup_location', 'like', "%{$city}%")
                        ->orWhereHas('agentProfile', fn ($agent) => $agent->where('city', 'like', "%{$city}%"));
                });
            }

            if ($request->filled('vehicle_category_id')) {
                $query->where('vehicle_category_id', $request->integer('vehicle_category_id'));
            }

            if ($request->filled('min_price') || $request->filled('max_price')) {
                $query->whereHas('prices', function ($priceQuery) use ($request) {
                    $priceQuery->where('is_active', true)
                        ->when($request->filled('min_price'), fn ($q) => $q->where('price_per_day', '>=', $request->input('min_price')))
                        ->when($request->filled('max_price'), fn ($q) => $q->where('price_per_day', '<=', $request->input('max_price')));
                });
            }

            $vehicles = $query->latest()->get();

            // Harga aktif per unit (prices[0] tidak dijamin harga termurah/aktif).
            $vehicles->each(function (\App\Models\Vehicle $vehicle) {
                $activePrice = $vehicle->prices
                    ->where('is_active', true)
                    ->sortBy('price_per_day')
                    ->first()
                    ?? $vehicle->prices->sortBy('price_per_day')->first();

                $vehicle->search_price = $activePrice?->price_per_day;

                // Sertakan koordinat presisi milik mitra penyedia (bila ada)
                // agar pin peta menampilkan lokasi usaha mitra yang sebenarnya.
                $vehicle->agent_latitude = $vehicle->agentProfile?->latitude;
                $vehicle->agent_longitude = $vehicle->agentProfile?->longitude;
            });
        }

        $categories = VehicleCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(compact('vehicles', 'categories', 'filters'));
        }

        return \Inertia\Inertia::render('Unit/MappingUnit', [
            'units' => $vehicles,
            'categories' => $categories,
            'search' => [
                'tipe' => $request->string('tipe', 'all')->toString(),
                'q' => $request->string('q')->toString(),
                'kota' => $request->string('kota', 'Semua Kota')->toString(),
                'layanan' => $request->string('layanan', 'lepas-kunci')->toString(),
                'tanggal' => $request->string('rental_start')->toString() ?: $request->string('tanggal')->toString(),
                'durasi' => $request->string('durasi', '1 Hari')->toString(),
            ],
        ]);
    }
}