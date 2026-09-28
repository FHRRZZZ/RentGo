<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerDocumentRequest;
use App\Http\Requests\UpdateCustomerDocumentRequest;
use App\Http\Requests\VerifyCustomerDocumentRequest;
use App\Models\CustomerDocument;
use App\Models\CustomerProfile;
use App\Services\CustomerDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class CustomerDocumentController extends Controller
{
    public function __construct(
        private CustomerDocumentService $customerDocumentService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    */

    /**
     * Menampilkan daftar dokumen.
     *
     * - Admin   : melihat semua dokumen.
     * - Customer: hanya dokumen miliknya sendiri (PRD §24).
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', CustomerDocument::class);

        $query = CustomerDocument::with(['customerProfile.user'])->latest();

        if ($request->user()->hasRole('customer')) {
            $query->forUser($request->user()->id);
        }

        $documents = $query->paginate(10);

        return view('customer-documents.index', compact('documents'));
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    /**
     * Menampilkan form upload dokumen.
     *
     * - Customer yang belum memiliki profile diarahkan untuk membuat profile
     *   terlebih dahulu (PRD §23).
     * - Admin dapat memilih customer profile dari daftar.
     */
    public function create(Request $request): View|RedirectResponse
    {
        $this->authorize('create', CustomerDocument::class);

        if ($request->user()->hasRole('customer')) {
            $customerProfile = CustomerProfile::where(
                'user_id',
                $request->user()->id
            )->first();

            if (!$customerProfile) {
                return redirect()
                    ->route('customer-profiles.create')
                    ->with(
                        'error',
                        'Silakan lengkapi customer profile terlebih dahulu.'
                    );
            }

            return view('customer-documents.create', compact('customerProfile'));
        }

        // Admin dapat memilih customer profile manapun.
        $customerProfiles = CustomerProfile::with('user')
            ->latest()
            ->get();

        return view('customer-documents.create', compact('customerProfiles'));
    }

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    /**
     * Menyimpan dokumen yang baru diunggah.
     *
     * Customer hanya boleh mengunggah dokumen miliknya sendiri (PRD §24, BR-12).
     */
    public function store(
        StoreCustomerDocumentRequest $request
    ): RedirectResponse {
        $this->authorize('create', CustomerDocument::class);

        $data = $request->validated();

        $customerProfile = CustomerProfile::findOrFail(
            $data['customer_profile_id']
        );

        // Customer hanya boleh upload dokumen untuk profile miliknya sendiri.
        if ($request->user()->hasRole('customer')) {
            abort_unless(
                $customerProfile->user_id === $request->user()->id,
                403,
                'Anda tidak memiliki akses ke customer profile ini.'
            );
        }

        $document = $this->customerDocumentService->create(
            $customerProfile->id,
            $data,
            $request->file('file')
        );

        return redirect()
            ->route('customer-documents.show', $document)
            ->with(
                'success',
                'Dokumen berhasil diunggah dan menunggu verifikasi.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    /**
     * Menampilkan detail dokumen.
     *
     * Akses dibatasi oleh CustomerDocumentPolicy (PRD §24).
     */
    public function show(CustomerDocument $customerDocument): View
    {
        $this->authorize('view', $customerDocument);

        $customerDocument->load([
            'customerProfile.user',
            'verifier',
        ]);

        return view(
            'customer-documents.show',
            compact('customerDocument')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit & Update
    |--------------------------------------------------------------------------
    */

    /**
     * Menampilkan form edit dokumen.
     */
    public function edit(CustomerDocument $customerDocument): View
    {
        $this->authorize('update', $customerDocument);

        $customerDocument->load('customerProfile.user');

        return view(
            'customer-documents.edit',
            compact('customerDocument')
        );
    }

    /**
     * Memperbarui dokumen.
     *
     * Status dokumen dikembalikan ke PENDING agar diverifikasi ulang (PRD §23).
     */
    public function update(
        UpdateCustomerDocumentRequest $request,
        CustomerDocument $customerDocument
    ): RedirectResponse {
        $this->authorize('update', $customerDocument);

        $this->customerDocumentService->update(
            $customerDocument,
            $request->validated(),
            $request->file('file')
        );

        return redirect()
            ->route('customer-documents.show', $customerDocument)
            ->with(
                'success',
                'Dokumen berhasil diperbarui dan menunggu verifikasi ulang.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify (Admin)
    |--------------------------------------------------------------------------
    */

    /**
     * Verifikasi dokumen oleh admin (approve / reject).
     *
     * PRD §23 — Identity Verification Flow.
     */
    public function verify(
        VerifyCustomerDocumentRequest $request,
        CustomerDocument $customerDocument
    ): RedirectResponse {
        $this->authorize('verify', $customerDocument);

        $data = $request->validated();

        $this->customerDocumentService->verify(
            $customerDocument,
            $request->user(),
            $data['status'],
            $data['rejection_reason'] ?? null
        );

        $message = $data['status'] === CustomerDocument::STATUS_APPROVED
            ? 'Dokumen berhasil disetujui.'
            : 'Dokumen berhasil ditolak.';

        return redirect()
            ->route('customer-documents.show', $customerDocument)
            ->with('success', $message);
    }

    /*
    |--------------------------------------------------------------------------
    | File — Private Serving (PRD §24, BR-12)
    |--------------------------------------------------------------------------
    */

    /**
     * Melayani file dokumen dari private storage.
     *
     * Hanya dapat diakses oleh pengguna yang diizinkan oleh
     * CustomerDocumentPolicy::view(). File tidak pernah diekspos sebagai
     * public URL (PRD §24 — Data Privacy).
     */
    public function file(CustomerDocument $customerDocument): Response
    {
        $this->authorize('view', $customerDocument);

        abort_unless(
            $customerDocument->file_path,
            404,
            'File dokumen tidak ditemukan.'
        );

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('private');

        abort_unless(
            $disk->exists($customerDocument->file_path),
            404,
            'File dokumen tidak ditemukan di storage.'
        );

        return $disk->response($customerDocument->file_path);
    }

    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    */

    /**
     * Menghapus dokumen beserta file-nya dari storage.
     */
    public function destroy(
        CustomerDocument $customerDocument
    ): RedirectResponse {
        $this->authorize('delete', $customerDocument);

        $this->customerDocumentService->delete($customerDocument);

        return redirect()
            ->route('customer-documents.index')
            ->with('success', 'Dokumen berhasil dihapus.');
    }
}