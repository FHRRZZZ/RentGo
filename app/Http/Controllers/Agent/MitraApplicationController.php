<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreMitraApplicationRequest;
use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Services\AgentDocumentService;
use App\Services\AuditLogService;
use App\Services\ComplianceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * MitraApplicationController — pengajuan menjadi mitra (agent) oleh customer.
 *
 * Alur:
 *  1. Customer membuka halaman pengajuan (create).
 *  2. Customer mengisi data usaha + mengunggah KTP & NIB/Akta (store).
 *  3. Sistem membuat/ memperbarui AgentProfile dengan status
 *     "pending_verification" dan role customer dinaikkan menjadi mitra.
 *  4. Admin memverifikasi melalui AgentVerificationController.
 */
class MitraApplicationController extends Controller
{
    public function __construct(
        protected AgentDocumentService $agentDocumentService,
        protected ComplianceService $complianceService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Tampilkan halaman pengajuan mitra.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Admin tidak perlu mengajukan.
        if ($user->hasRole('admin')) {
            return redirect()->route('dashboard');
        }

        // Mitra yang sudah punya profil diarahkan ke dashboard mitra.
        if ($user->hasRole('mitra') && $user->agentProfile) {
            return redirect()
                ->route('mitra.dashboard')
                ->with('success', 'Anda sudah terdaftar sebagai mitra.');
        }

        $agentProfile = $user->agentProfile;
        $documents = $agentProfile
            ? $agentProfile->documents()->get(['document_type', 'status', 'rejection_reason'])
            : collect();

        return Inertia::render('Mitra/Apply', [
            'agentProfile' => $agentProfile,
            'documents' => $documents,
            'compliance' => $agentProfile
                ? $this->complianceService->agentStatus($agentProfile)
                : null,
        ]);
    }

    /**
     * Tampilkan konfirmasi setelah pengajuan berhasil dikirim.
     */
    public function submitted(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('dashboard');
        }

        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            return redirect()->route('mitra.apply.create');
        }

        return Inertia::render('Mitra/Submitted', [
            'agentProfile' => $agentProfile,
        ]);
    }

    /**
     * Simpan pengajuan mitra.
     */
    public function store(StoreMitraApplicationRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated, $request) {
            // 1. Buat / perbarui AgentProfile dengan status menunggu verifikasi.
            $agentProfile = AgentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $validated['phone'],
                    'agency_name' => $validated['agency_name'],
                    'owner_name' => $validated['owner_name'] ?? null,
                    'business_type' => $validated['business_type'] ?? null,
                    'address' => $validated['address'],
                    'city' => $validated['city'],
                    'province' => $validated['province'] ?? null,
                    // Titik presisi lokasi usaha dari peta (bila mitra memilih di peta).
                    'latitude' => $validated['latitude'] ?? $agentProfile?->latitude,
                    'longitude' => $validated['longitude'] ?? $agentProfile?->longitude,
                    'description' => $validated['description'] ?? null,
                    'bank_name' => $validated['bank_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'onboarding_status' => 'pending_verification',
                    'is_active' => false,
                ]
            );

            // 2. Unggah dokumen legal wajib.
            $this->agentDocumentService->store(
                $agentProfile,
                'ktp',
                $request->file('ktp_file'),
                $validated['ktp_number']
            );

            $this->agentDocumentService->store(
                $agentProfile,
                'nib',
                $request->file('nib_file'),
                $validated['nib_number']
            );

            // Role tetap customer sampai admin menyetujui pengajuan.

            // 3. Catat audit log.
            $this->auditLogService->created(
                $user,
                'agent_profile',
                'Customer mengajukan diri menjadi mitra RentGo.',
                $agentProfile,
                $agentProfile->toArray(),
                $request
            );
        });

        return redirect()
            ->route('mitra.apply.submitted')
            ->with(
                'success',
                'Pengajuan mitra berhasil dikirim. Mohon tunggu verifikasi dari admin RentGo.'
            );
    }
}
