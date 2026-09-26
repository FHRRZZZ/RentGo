<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreVehicleCategoryRequest;
use App\Http\Requests\UpdateVehicleCategoryRequest;
use App\Models\VehicleCategory;
use App\Services\VehicleCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class VehicleCategoryController extends Controller
{
    public function __construct(
        private VehicleCategoryService $vehicleCategoryService
    ) {
    }

    public function index(): View
    {
        $this->authorize('viewAny', VehicleCategory::class);

        $categories = VehicleCategory::latest()->paginate(10);

        return view('vehicle-categories.index', compact('categories'));
    }

    public function create(): View
    {
        $this->authorize('create', VehicleCategory::class);

        return view('vehicle-categories.create');
    }

    public function store(
        StoreVehicleCategoryRequest $request
    ): RedirectResponse {
        $this->authorize('create', VehicleCategory::class);

        $this->vehicleCategoryService->create(
            $request->validated()
        );

        return redirect()
            ->route('vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil ditambahkan.');
    }

    public function show(VehicleCategory $vehicleCategory): View
    {
        $this->authorize('view', $vehicleCategory);

        return view(
            'vehicle-categories.show',
            compact('vehicleCategory')
        );
    }

    public function edit(VehicleCategory $vehicleCategory): View
    {
        $this->authorize('update', $vehicleCategory);

        return view(
            'vehicle-categories.edit',
            compact('vehicleCategory')
        );
    }

    public function update(
        UpdateVehicleCategoryRequest $request,
        VehicleCategory $vehicleCategory
    ): RedirectResponse {
        $this->authorize('update', $vehicleCategory);

        $this->vehicleCategoryService->update(
            $vehicleCategory,
            $request->validated()
        );

        return redirect()
            ->route('vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil diperbarui.');
    }

    public function destroy(
        VehicleCategory $vehicleCategory
    ): RedirectResponse {
        $this->authorize('delete', $vehicleCategory);

        if ($vehicleCategory->vehicles()->exists()) {
            return back()->with(
                'error',
                'Kategori tidak dapat dihapus karena masih digunakan oleh kendaraan.'
            );
        }

        $this->vehicleCategoryService->delete(
            $vehicleCategory
        );

        return redirect()
            ->route('vehicle-categories.index')
            ->with('success', 'Kategori kendaraan berhasil dihapus.');
    }
}