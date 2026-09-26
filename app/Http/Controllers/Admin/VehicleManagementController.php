<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\AgentProfile;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Services\VehicleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * CRUD & Verifikasi Kendaraan khusus Portal Admin.
 *
 * Controller ini TERPISAH dari controller mitra, sehingga admin
 * memiliki alur sendiri: dapat melihat seluruh armada, memilih
 * mitra pemilik saat membuat unit, serta menyetujui / menolak
 * unit yang berstatus pending_review (BR-02).
 */
class VehicleManagementController extends Controller
{
    public function __construct(
        private VehicleService $vehicleService
    ) {}

    /**
     * Katalog seluruh armada dari semua mitra.
     */
    public function index(Request $request): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);

        $vehicles = Vehicle::with([
            'agentProfile.user',
            'vehicleCategory',
            'photos',
            'prices',
            'documents',
        ])->latest()->paginate(20);

        $categories = VehicleCategory::where('is_active', true)->orderBy('name')->get();

        $formattedVehicles = collect($vehicles->items())
            ->map(fn($v) => $this->mapVehicle($v))
            ->values()
            ->all();

        return \Inertia\Inertia::render('Admin/Vehicles', [
            'vehicles' => $formattedVehicles,
            'categories' => $categories,
            'pagination' => $vehicles,
        ]);
    }

    /**
     * Form tambah unit — admin dapat memilih mitra pemilik.
     */
    public function create(Request $request): \Inertia\Response
    {
        $this->authorize('create', Vehicle::class);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        $mitras = AgentProfile::with('user')
            ->where('is_active', true)
            ->orderBy('agency_name')
            ->get();

        return \Inertia\Inertia::render('Admin/CreateVehicle', [
            'categories' => $categories,
            'mitras' => $mitras,
        ]);
    }

    /**
     * Simpan unit baru atas nama mitra tertentu.
     */
    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        $this->authorize('create', Vehicle::class);

        $this->vehicleService->create(
            $request->validated(),
            $request->user(),
            $request
        );

        return redirect()
            ->route('admin.vehicles')
            ->with('success', 'Kendaraan berhasil didaftarkan.');
    }

    /**
     * Form edit unit (admin dapat mengubah unit mitra manapun).
     */
    public function edit(Request $request, Vehicle $vehicle): \Inertia\Response
    {
        $this->authorize('update', $vehicle);

        $vehicle->load(['vehicleCategory', 'photos', 'prices', 'documents', 'agentProfile.user']);

        $categories = VehicleCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        $mitras = AgentProfile::with('user')
            ->where('is_active', true)
            ->orderBy('agency_name')
            ->get();

        return \Inertia\Inertia::render('Admin/EditVehicle', [
            'vehicle' => $this->mapVehicle($vehicle),
            'categories' => $categories,
            'mitras' => $mitras,
        ]);
    }

    /**
     * Perbarui data unit.
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
            ->route('admin.vehicles')
            ->with('success', 'Kendaraan berhasil diperbarui.');
    }

    /**
     * Hapus unit.
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
     * Admin menyetujui / menolak unit (PRD §8.3, BR-02).
     */
    public function verify(Request $request, Vehicle $vehicle): RedirectResponse
    {
        $this->authorize('verify', $vehicle);

        $validated = $request->validate([
            'decision' => ['required', 'string', 'in:approved,rejected'],
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

        // Redirect eksplisit ke katalog admin (bukan back() yang bergantung
        // pada header Referer) agar Inertia selalu memuat ulang props dari
        // halaman yang benar dan status terbaru langsung terlihat.
        return redirect()
            ->route('admin.vehicles')
            ->with('success', $message);
    }

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

    /**
     * Normalisasi data kendaraan untuk dikonsumsi React.
     */
    private function mapVehicle(Vehicle $v): array
    {
        $photo = $v->photos->first()?->file_path
            ? '/storage/' . $v->photos->first()->file_path
            : null;

        $price = $v->prices->first()?->price_per_day ?? 350000;

        return array_merge($v->toArray(), [
            'price_per_day' => (float) $price,
            'img' => $photo,
            'documents' => $v->documents->map(fn ($document) => array_merge($document->toArray(), [
                'url' => '/storage/' . $document->file_path,
            ]))->values()->all(),
            'stnk' => $this->mapDocument($v, 'stnk'),
            'bpkb' => $this->mapDocument($v, 'bpkb'),
            'category_name' => $v->vehicleCategory?->name,
            'agent_name' => $v->agentProfile?->agency_name
                ?? $v->agentProfile?->user?->name
                ?? 'Mitra RentGo',
        ]);
    }
}
