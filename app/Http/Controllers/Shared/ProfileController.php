<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\CustomerDocument;
use App\Models\CustomerProfile;
use App\Services\ComplianceService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private ComplianceService $complianceService
    ) {}

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $customerProfile = $user->hasRole('customer')
            ? $user->customerProfile
            : null;

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'role' => $user->roles->first()?->name,
            // Status kelengkapan versi server (sumber kebenaran yang sama
            // dipakai BookingService). Dipakai form dokumen sewa supaya bar
            // "Kelengkapan" tidak lagi menampilkan 100% padahal dokumen
            // masih menunggu verifikasi admin sehingga pesanan ditolak.
            'compliance' => $customerProfile
                ? $this->complianceService->customerStatus($user)
                : null,
            // Data pribadi penyewa ditampilkan & disimpan dari tab
            // "Informasi Akun" (customer_profiles).
            'customerProfile' => $customerProfile,
            // Dokumen KTP & SIM yang sudah tersimpan, supaya form
            // "Dokumen Sewa" bisa memuat ulang isian & preview file
            // setelah pengguna keluar-masuk halaman.
            'customerDocuments' => $customerProfile
                ? $customerProfile->documents()
                    ->get(['id', 'document_type', 'document_number', 'status', 'expires_at'])
                    ->map(fn (CustomerDocument $document) => [
                        'id' => $document->id,
                        'document_type' => $document->document_type,
                        'document_number' => $document->document_number,
                        'status' => $document->status,
                        'expires_at' => optional($document->expires_at)->toDateString(),
                        'file_url' => route('customer-documents.file', $document),
                    ])
                    ->values()
                : [],
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * Untuk customer, sekaligus menyimpan data pribadi penyewa
     * (customer_profiles) bila field-nya dikirim dari form.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill($request->safe()->only(['name', 'email', 'phone']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Data profil yang boleh diisi customer (selaras dengan
        // StoreCustomerProfileRequest / UpdateCustomerProfileRequest).
        //
        // Hanya field yang BENAR-BENAR dikirim dari form yang diambil,
        // agar request parsial (mis. hanya dari tab "Dokumen Sewa", atau
        // hanya name/email) tidak menimpa data lain menjadi null.
        $profileFields = [
            'phone',
            'identity_number',
            'sim_type',
            'emergency_name',
            'emergency_relation',
            'emergency_phone',
            'date_of_birth',
            'address',
            'city',
            'province',
        ];

        $profileData = collect($request->safe()->only($profileFields))
            ->filter(fn ($value, $key) => $request->has($key))
            ->all();

        $profile = null;

        if ($user->hasRole('customer') && !empty($profileData)) {
            $profile = $user->customerProfile()->firstOrNew([]);

            // Nomor identitas tidak boleh dipakai customer lain.
            $identityNumber = $profileData['identity_number'] ?? null;

            if (!blank($identityNumber)) {
                $duplicate = CustomerProfile::where('identity_number', $identityNumber)
                    ->when($profile->exists, fn ($query) => $query->whereKeyNot($profile->id))
                    ->exists();

                if ($duplicate) {
                    throw ValidationException::withMessages([
                        'identity_number' => 'Nomor identitas sudah digunakan.',
                    ]);
                }
            }

            $profile->fill(array_merge($profileData, [
                'user_id' => $user->id,
            ]));

            $profile->save();
        }

        // Dokumen sewa (KTP & SIM) disimpan terpisah — cukup saat profil
        // customer sudah ada, terlepas dari ada tidaknya data teks di atas.
        if ($user->hasRole('customer')) {
            $profile = $profile ?? $user->customerProfile()->firstOrNew([]);

            if (!$profile->exists) {
                $profile->user_id = $user->id;
                $profile->save();
            }

            $this->syncCustomerDocuments($request, $profile);
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Simpan / perbarui dokumen sewa (KTP & SIM) milik customer.
     *
     * File dikirim bersama form dokumen sewa dalam satu request
     * multipart: ktp_file, sim_file, sim_number, sim_expires_at.
     */
    private function syncCustomerDocuments(
        Request $request,
        CustomerProfile $profile
    ): void {
        $documents = [
            'ktp' => [
                'file' => $request->file('ktp_file'),
                'number' => $profile->identity_number,
                'expires_at' => null,
            ],
            'sim' => [
                'file' => $request->file('sim_file'),
                'number' => $request->input('sim_number'),
                'expires_at' => $request->input('sim_expires_at'),
            ],
        ];

        foreach ($documents as $type => $payload) {
            /** @var UploadedFile|null $file */
            $file = $payload['file'];

            $existing = $profile->documents()
                ->where('document_type', $type)
                ->first();

            // Tanpa file baru: tetap perbarui nomor / masa berlaku bila
            // ada, dan buat baris baru hanya jika sudah ada file tersimpan.
            if (!$file instanceof UploadedFile) {
                if (!$existing) {
                    continue;
                }

                $existing->update([
                    'document_number' => $payload['number'] ?: $existing->document_number,
                    'expires_at' => $payload['expires_at'] ?: $existing->expires_at,
                ]);

                continue;
            }

            $filePath = $file->store(
                "customer-documents/{$profile->id}",
                'private'
            );

            if ($existing) {
                $oldFilePath = $existing->file_path;

                // Dokumen yang diubah wajib diverifikasi ulang.
                $existing->update([
                    'document_number' => $payload['number'] ?: $existing->document_number,
                    'file_path' => $filePath,
                    'expires_at' => $payload['expires_at'] ?: $existing->expires_at,
                    'status' => 'pending',
                    'verified_at' => null,
                    'verified_by' => null,
                    'rejection_reason' => null,
                ]);

                if ($oldFilePath) {
                    Storage::disk('private')->delete($oldFilePath);
                }

                continue;
            }

            CustomerDocument::create([
                'customer_profile_id' => $profile->id,
                'document_type' => $type,
                'document_number' => $payload['number'],
                'file_path' => $filePath,
                'status' => 'pending',
                'expires_at' => $payload['expires_at'],
            ]);
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
