<?php

namespace App\Http\Controllers;

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
): View {
    $filters = $request->validated();

    $vehicles = collect();

    if (
        !empty($filters['rental_start']) &&
        !empty($filters['rental_end'])
    ) {
        $vehicles = $this->vehicleSearchService->search($filters);
    }

    $categories = VehicleCategory::query()
        ->where('is_active', true)
        ->orderBy('name')
        ->get();

    return view(
        'vehicles.search',
        compact(
            'vehicles',
            'categories',
            'filters'
        )
    );
}
}