<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreCustomerProfileRequest;
use App\Http\Requests\UpdateCustomerProfileRequest;
use App\Models\CustomerProfile;
use App\Services\CustomerProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CustomerProfileController extends Controller
{
    public function __construct(
        private CustomerProfileService $customerProfileService
    ) {}

    /**
     * Menampilkan daftar customer profile.
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', CustomerProfile::class);

        $query = CustomerProfile::with('user')
            ->latest();

        // Customer hanya dapat melihat profile miliknya sendiri.
        if ($request->user()->hasRole('customer')) {
            $query->where('user_id', $request->user()->id);
        }

        $profiles = $query->paginate(10);

        return view('customer-profiles.index', compact('profiles'));
    }

    /**
     * Menampilkan form pembuatan customer profile.
     */
    public function create(Request $request): View|RedirectResponse
    {
        $this->authorize('create', CustomerProfile::class);

        // Customer hanya boleh memiliki satu profile.
        if ($request->user()->hasRole('customer')) {
            $existingProfile = CustomerProfile::where(
                'user_id',
                $request->user()->id
            )->first();

            if ($existingProfile) {
                return redirect()
                    ->route('customer-profiles.show', $existingProfile)
                    ->with('error', 'Anda sudah memiliki customer profile.');
            }
        }

        return view('customer-profiles.create');
    }

    /**
     * Menyimpan customer profile baru.
     */
    public function store(
        StoreCustomerProfileRequest $request
    ): RedirectResponse {
        $this->authorize('create', CustomerProfile::class);

        $user = $request->user();

        // Customer tidak boleh memiliki lebih dari satu profile.
        if ($user->hasRole('customer')) {
            $existingProfile = CustomerProfile::where(
                'user_id',
                $user->id
            )->first();

            if ($existingProfile) {
                return redirect()
                    ->route('customer-profiles.show', $existingProfile)
                    ->with('error', 'Anda sudah memiliki customer profile.');
            }
        }

        $profile = $this->customerProfileService->create(
            $user,
            $request->validated()
        );

        return redirect()
            ->route('customer-profiles.show', $profile)
            ->with('success', 'Customer profile berhasil dibuat.');
    }

    /**
     * Menampilkan detail customer profile.
     */
    public function show(CustomerProfile $customerProfile): View
    {
        $this->authorize('view', $customerProfile);

        $customerProfile->load([
            'user',
            'documents',
        ]);

        return view(
            'customer-profiles.show',
            compact('customerProfile')
        );
    }

    /**
     * Menampilkan form edit customer profile.
     */
    public function edit(CustomerProfile $customerProfile): View
    {
        $this->authorize('update', $customerProfile);

        $customerProfile->load('user');

        return view(
            'customer-profiles.edit',
            compact('customerProfile')
        );
    }

    /**
     * Memperbarui customer profile.
     */
    public function update(
        UpdateCustomerProfileRequest $request,
        CustomerProfile $customerProfile
    ): RedirectResponse {
        $this->authorize('update', $customerProfile);

        $this->customerProfileService->update(
            $customerProfile,
            $request->validated()
        );

        return redirect()
            ->route('customer-profiles.show', $customerProfile)
            ->with('success', 'Customer profile berhasil diperbarui.');
    }

    /**
     * Menghapus customer profile.
     */
    public function destroy(
        CustomerProfile $customerProfile
    ): RedirectResponse {
        $this->authorize('delete', $customerProfile);

        $this->customerProfileService->delete($customerProfile);

        return redirect()
            ->route('customer-profiles.index')
            ->with('success', 'Customer profile berhasil dihapus.');
    }
}
