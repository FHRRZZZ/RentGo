<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehiclePhoto;
use App\Services\ComplianceService;
use App\Services\VehicleService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * CRUD Kendaraan khusus Portal Mitra (Agent).
 *
 * Controller ini TERPISAH dari controller admin, sehingga
 * logika & tampilan mitra tidak lagi bercampur dengan admin.
 * Logika bisnis tetap didelegasikan ke VehicleService.
 */
class VehicleManagementController extends Controller
{
    public function __construct(
        private VehicleService $vehicleService,
        private ComplianceService $complianceService
    ) {}

    /**
     * Daftar armada milik mitra yang sedang login.
     */
    public function index(Request $request): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);

        $agentProfile = $request->user()->agentProfile;
        abort_unless($agentProfile, 403, 'Profil mitra belum terdaftar.');

        $vehicles = Vehicle::with(['vehicleCategory', 'photos', 'prices', 'documents'])
            ->where('agent_profile_id', $agentProfile->id)
            ->latest()
            ->paginate(15);

        $categories = VehicleCategory::where('is_active', true)->orderBy('name')->get();

        $formattedVehicles = collect($vehicles->items())
            ->map(fn($v) => $this->mapVehicle($v))
            ->values()
            ->all();

        return \Inertia\Inertia::render('Agent/Vehicles', [
            'vehicles' => $formattedVehicles,
            'categories' => $categories,
            'agentProfile' => $agentProfile,
            'pagination' => $vehicles,
            'compliance' => $this->complianceService->agentStatus($agentProfile),
        ]);
    }

    /**
     * Form tambah unit baru.
     */
    public function create(Request $request): \Inertia\Response
    {
        $this->authorize('create', Vehicle::class);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return \Inertia\Inertia::render('Agent/CreateVehicle', [
            'categories' => $categories,
            'agentProfile' => $request->user()->agentProfile,
        ]);
    }

    /**
     * Simpan unit baru — otomatis milik mitra yang login.
     */
    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $this->authorize('create', Vehicle::class);

        $agentProfile = $request->user()->agentProfile;
        abort_unless($agentProfile, 403, 'Profil mitra belum terdaftar.');

        // ATURAN: Mitra wajib melengkapi data usaha & dokumen legal
        // sebelum dapat mengajukan unit armada.
        $compliance = $this->complianceService->agentStatus($agentProfile);

        if (!$compliance['complete']) {
            throw ValidationException::withMessages([
                'compliance' => 'Anda belum dapat mengajukan unit armada. '
                    . implode(' ', $compliance['messages']),
            ]);
        }

        $data = $request->validated();
        $data['agent_profile_id'] = $agentProfile->id;

        $this->vehicleService->create($data, $request->user(), $request);

        return redirect()
            ->route('mitra.vehicles')
            ->with('success', 'Kendaraan berhasil didaftarkan dan menunggu verifikasi admin.');
    }

    /**
     * Form edit unit.
     */
    public function edit(Request $request, Vehicle $vehicle): \Inertia\Response
    {
        $this->authorize('update', $vehicle);

        $vehicle->load(['vehicleCategory', 'photos', 'prices', 'documents']);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return \Inertia\Inertia::render('Agent/EditVehicle', [
            'vehicle' => $this->mapVehicle($vehicle),
            'categories' => $categories,
        ]);
    }

    /**
     * Perbarui data unit milik mitra.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        $this->vehicleService->update(
            $vehicle,
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('mitra.vehicles')
            ->with('success', 'Kendaraan berhasil diperbarui.');
    }

    /**
     * Hapus unit milik mitra.
     */
    public function destroy(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('delete', $vehicle);

        if ($vehicle->bookingItems()->exists()) {
            return back()->with(
                'error',
                'Kendaraan tidak dapat dihapus karena sudah digunakan dalam booking.'
            );
        }

        $this->vehicleService->delete($vehicle, $request->user(), $request);

        return redirect()
            ->back()
            ->with('success', 'Kendaraan berhasil dihapus.');
    }

    /**
     * Hapus satu foto/media milik unit (tanpa menghapus unitnya).
     */
    public function destroyPhoto(Request $request, Vehicle $vehicle, VehiclePhoto $photo): RedirectResponse
    {
        $this->authorize('update', $vehicle);

        // Pastikan media benar-benar milik unit ini (cegah hapus foto unit lain).
        abort_unless($photo->vehicle_id === $vehicle->id, 404, 'Media tidak ditemukan pada unit ini.');

        if ($photo->file_path) {
            Storage::disk('public')->delete($photo->file_path);
        }

        $photo->delete();

        return back()->with('success', 'Foto unit berhasil dihapus.');
    }

    /**
     * Normalisasi data kendaraan untuk dikonsumsi React.
     */
    /**
     * Ambil dokumen legal (STNK/BPKB) unit dalam bentuk siap konsumsi React,
     * lengkap dengan URL file agar UI dapat mendeteksi dokumen yang tersimpan.
     */
    private function mapDocument(Vehicle $v, string $type): ?array
    {
        $document = $v->documents->firstWhere('document_type', $type);

        if (!$document) {
            return null;
        }

        return array_merge($document->toArray(), [
            'url' => $document->file_path ? '/storage/' . $document->file_path : null,
        ]);
    }

    private function mapVehicle(Vehicle $v): array
    {
        $photo = $v->photos->first()?->file_path
            ? '/storage/' . $v->photos->first()->file_path
            : null;

        $price = $v->prices->first()?->price_per_day ?? 350000;

        return array_merge($v->toArray(), [
            'price_per_day' => (float) $price,
            'img' => $photo,
            'photos' => $v->photos->map(fn ($media) => array_merge($media->toArray(), [
                'url' => '/storage/' . $media->file_path,
            ]))->values()->all(),
            'documents' => $v->documents->map(fn ($document) => array_merge($document->toArray(), [
                'url' => '/storage/' . $document->file_path,
            ]))->values()->all(),
            'stnk' => $this->mapDocument($v, 'stnk'),
            'bpkb' => $this->mapDocument($v, 'bpkb'),
            'category_name' => $v->vehicleCategory?->name,
        ]);
    }
}
