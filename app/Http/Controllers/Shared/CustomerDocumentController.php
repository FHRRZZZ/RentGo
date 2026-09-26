<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreCustomerDocumentRequest;
use App\Http\Requests\UpdateCustomerDocumentRequest;
use App\Http\Requests\VerifyCustomerDocumentRequest;
use Illuminate\Support\Facades\Storage;
use App\Models\CustomerDocument;
use App\Models\CustomerProfile;
use App\Services\CustomerDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CustomerDocumentController extends Controller
{
    public function __construct(
        private CustomerDocumentService $customerDocumentService
    ) {}

    /**
     * Menampilkan daftar dokumen.
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', CustomerDocument::class);

        $query = CustomerDocument::with([
            'customerProfile.user',
        ])->latest();

        // Customer hanya melihat dokumennya sendiri.
        if ($request->user()->hasRole('customer')) {
            $query->whereHas('customerProfile', function ($profileQuery) use ($request) {
                $profileQuery->where('user_id', $request->user()->id);
            });
        }

        $documents = $query->paginate(10);

        return view(
            'customer-documents.index',
            compact('documents')
        );
    }

    /**
     * Menampilkan form upload dokumen.
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

            return view(
                'customer-documents.create',
                compact('customerProfile')
            );
        }

        // Admin dapat memilih customer profile.
        $customerProfiles = CustomerProfile::with('user')
            ->latest()
            ->get();

        return view(
            'customer-documents.create',
            compact('customerProfiles')
        );
    }

    /**
     * Menyimpan dokumen baru.
     */
    public function store(
        StoreCustomerDocumentRequest $request
    ): RedirectResponse {
        $this->authorize('create', CustomerDocument::class);

        $data = $request->validated();

        $customerProfile = CustomerProfile::findOrFail(
            $data['customer_profile_id']
        );

        // Customer hanya boleh upload dokumen miliknya sendiri.
        if ($request->user()->hasRole('customer')) {
            abort_unless(
                $customerProfile->user_id === $request->user()->id,
                403
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
                'Dokumen customer berhasil diunggah dan menunggu verifikasi.'
            );
    }

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

        $message = $data['status'] === 'approved'
            ? 'Dokumen customer berhasil disetujui.'
            : 'Dokumen customer berhasil ditolak.';

        return redirect()
            ->route('customer-documents.show', $customerDocument)
        ->with('success', $message);
}

    /**
     * Menampilkan detail dokumen.
     */
    public function show(
        CustomerDocument $customerDocument
    ): View {
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

    /**
     * Menampilkan form edit dokumen.
     */
    public function edit(
        CustomerDocument $customerDocument
    ): View {
        $this->authorize('update', $customerDocument);

        $customerDocument->load('customerProfile.user');

        return view(
            'customer-documents.edit',
            compact('customerDocument')
        );
    }

    /**
     * Memperbarui dokumen.
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
                'Dokumen customer berhasil diperbarui dan menunggu verifikasi ulang.'
            );
    }

    public function file(CustomerDocument $customerDocument)
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
            'File dokumen tidak ditemukan.'
        );

        return $disk->response(
            $customerDocument->file_path
        );
    }

    /**
     * Menghapus dokumen.
     */
    public function destroy(
        CustomerDocument $customerDocument
    ): RedirectResponse {
        $this->authorize('delete', $customerDocument);

        $this->customerDocumentService->delete(
            $customerDocument
        );

        return redirect()
            ->route('customer-documents.index')
            ->with(
                'success',
                'Dokumen customer berhasil dihapus.'
            );
    }
}