<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\AgentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * API Katalog Kendaraan — publik, tidak perlu login.
 */
class VehicleController extends Controller
{
    /**
     * GET /api/vehicles
     * Daftar kendaraan tersedia dengan filter & search.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::with([
            'agentProfile',
            'vehicleCategory',
            'photos',
            'prices',
        ])->where('status', 'available');

        // Pencarian by keyword
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                  ->orWhere('brand', 'like', "%{$q}%")
                  ->orWhere('model', 'like', "%{$q}%");
            });
        }

        // Filter kota
        if ($request->filled('city')) {
            $query->whereHas('agentProfile', fn($q) => $q->where('city', 'like', '%' . $request->city . '%'));
        }

        // Filter tipe (car/motorcycle)
        if ($request->filled('type')) {
            $query->where('vehicle_type', $request->type);
        }

        // Filter kategori
        if ($request->filled('category_id')) {
            $query->where('vehicle_category_id', $request->category_id);
        }

        // Filter harga
        if ($request->filled('min_price')) {
            $query->whereHas('prices', fn($q) => $q->where('price_per_day', '>=', $request->min_price));
        }
        if ($request->filled('max_price')) {
            $query->whereHas('prices', fn($q) => $q->where('price_per_day', '<=', $request->max_price));
        }

        // Transmisi
        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        // Urutkan
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_asc'  => $query->orderBy('price_per_day'),
            'price_desc' => $query->orderByDesc('price_per_day'),
            'rating'     => $query->orderByDesc('rating'),
            default      => $query->latest(),
        };

        $perPage = min((int) $request->get('per_page', 15), 50);
        $vehicles = $query->paginate($perPage);

        return response()->json([
            'data'       => $vehicles->items() ? array_map([$this, 'formatVehicle'], $vehicles->items()) : [],
            'pagination' => [
                'current_page' => $vehicles->currentPage(),
                'last_page'    => $vehicles->lastPage(),
                'per_page'     => $vehicles->perPage(),
                'total'        => $vehicles->total(),
            ],
        ]);
    }

    /**
     * GET /api/vehicles/{id}
     * Detail satu kendaraan.
     */
    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load([
            'agentProfile.user',
            'vehicleCategory',
            'photos',
            'prices',
            'reviews.customer',
            'features',
        ]);

        return response()->json([
            'data' => $this->formatVehicleDetail($vehicle),
        ]);
    }

    /**
     * GET /api/vehicles/featured
     * Kendaraan unggulan untuk homepage.
     */
    public function featured(Request $request): JsonResponse
    {
        $type = $request->get('type', 'all');

        $query = Vehicle::with(['agentProfile', 'vehicleCategory', 'photos', 'prices'])
            ->where('status', 'available')
            ->latest()
            ->limit(10);

        if ($type === 'car') {
            $query->whereIn('vehicle_type', ['car', 'mobil', 'suv', 'minivan']);
        } elseif ($type === 'motorcycle') {
            $query->whereIn('vehicle_type', ['motorcycle', 'motor', 'scooter']);
        }

        $vehicles = $query->get()->map(fn($v) => $this->formatVehicle($v))->values();

        return response()->json(['data' => $vehicles]);
    }

    /**
     * GET /api/cities
     * Daftar kota yang punya mitra aktif.
     */
    public function cities(): JsonResponse
    {
        $cities = AgentProfile::where('onboarding_status', 'approved')
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->pluck('city')
            ->unique()
            ->values();

        return response()->json(['data' => $cities]);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    private function formatVehicle(Vehicle $v): array
    {
        $price = $v->prices->first()?->price_per_day ?? $v->price_per_day ?? 0;
        $photo = $v->photos->first()?->file_path
            ? asset('storage/' . $v->photos->first()->file_path)
            : null;

        return [
            'id'           => $v->id,
            'name'         => $v->name ?: trim(($v->brand ?? '') . ' ' . ($v->model ?? '')),
            'brand'        => $v->brand,
            'model'        => $v->model,
            'year'         => $v->year,
            'vehicle_type' => $v->vehicle_type,
            'category'     => $v->vehicleCategory?->name,
            'transmission' => $v->transmission,
            'fuel_type'    => $v->fuel_type,
            'seat_capacity'=> $v->seat_capacity,
            'price_per_day'=> (float) $price,
            'rating'       => (float) ($v->rating ?? 0),
            'city'         => $v->agentProfile?->city ?? $v->pickup_location,
            'photo'        => $photo,
            'agent_id'     => $v->agentProfile?->id,
            'agent_name'   => $v->agentProfile?->agency_name,
            'status'       => $v->status,
        ];
    }

    private function formatVehicleDetail(Vehicle $v): array
    {
        $base = $this->formatVehicle($v);

        $base['photos'] = $v->photos->map(fn($p) => [
            'id'  => $p->id,
            'url' => asset('storage/' . $p->file_path),
        ])->values()->all();

        $base['prices'] = $v->prices->map(fn($p) => [
            'duration_type' => $p->duration_type ?? 'daily',
            'price'         => (float) $p->price_per_day,
        ])->values()->all();

        $base['description']   = $v->description;
        $base['plate_number']  = $v->plate_number;
        $base['color']         = $v->color;
        $base['pickup_location'] = $v->pickup_location;

        $base['agent'] = $v->agentProfile ? [
            'id'          => $v->agentProfile->id,
            'name'        => $v->agentProfile->agency_name,
            'owner_name'  => $v->agentProfile->owner_name,
            'phone'       => $v->agentProfile->phone,
            'city'        => $v->agentProfile->city,
            'province'    => $v->agentProfile->province,
            'logo'        => $v->agentProfile->logo ? asset('storage/' . $v->agentProfile->logo) : null,
            'latitude'    => $v->agentProfile->latitude,
            'longitude'   => $v->agentProfile->longitude,
            'description' => $v->agentProfile->description,
        ] : null;

        $base['reviews'] = $v->reviews?->map(fn($r) => [
            'id'         => $r->id,
            'rating'     => $r->rating,
            'comment'    => $r->comment,
            'customer'   => $r->customer?->name,
            'created_at' => $r->created_at?->toISOString(),
        ])->values()->all() ?? [];

        $base['features'] = $v->features?->pluck('name')->values()->all() ?? [];

        return $base;
    }
}
