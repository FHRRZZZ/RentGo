<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| Domain CUSTOMER & MITRA
|--------------------------------------------------------------------------
| Request: StoreCustomerProfileRequest, UpdateCustomerProfileRequest,
| StoreCustomerDocumentRequest, UpdateCustomerDocumentRequest,
| VerifyCustomerDocumentRequest, StoreMitraApplicationRequest,
| ProfileUpdateRequest, StoreWishlistRequest.
*/

class StoreCustomerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'phone' => ['required', 'string', 'max:20'],
            'identity_number' => ['nullable', 'string', 'max:50', 'unique:customer_profiles,identity_number'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'profile_photo_path' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'identity_number.unique' => 'Nomor identitas sudah digunakan.',
            'date_of_birth.date' => 'Format tanggal lahir tidak valid.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'city.max' => 'Nama kota maksimal 100 karakter.',
            'province.max' => 'Nama provinsi maksimal 100 karakter.',
        ];
    }
}

class UpdateCustomerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $customerProfile = $this->route('customerProfile');

        return [
            'phone' => ['required', 'string', 'max:20'],
            'identity_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('customer_profiles', 'identity_number')->ignore($customerProfile?->id),
            ],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'profile_photo_path' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'identity_number.unique' => 'Nomor identitas sudah digunakan.',
            'date_of_birth.date' => 'Format tanggal lahir tidak valid.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'city.max' => 'Nama kota maksimal 100 karakter.',
            'province.max' => 'Nama provinsi maksimal 100 karakter.',
        ];
    }
}

class StoreCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_profile_id' => ['required', 'integer', 'exists:customer_profiles,id'],
            'document_type' => ['required', 'string', 'max:50'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'expires_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_profile_id.required' => 'Customer profile wajib dipilih.',
            'customer_profile_id.exists' => 'Customer profile tidak ditemukan.',
            'document_type.required' => 'Jenis dokumen wajib diisi.',
            'document_type.max' => 'Jenis dokumen maksimal 50 karakter.',
            'document_number.max' => 'Nomor dokumen maksimal 100 karakter.',
            'file.required' => 'File dokumen wajib diunggah.',
            'file.file' => 'File dokumen tidak valid.',
            'file.mimes' => 'Dokumen harus berupa JPG, JPEG, PNG, atau PDF.',
            'file.max' => 'Ukuran file maksimal 5 MB.',
            'expires_at.date' => 'Format tanggal kedaluwarsa tidak valid.',
        ];
    }
}

class UpdateCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', 'max:50'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'expires_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_type.required' => 'Jenis dokumen wajib diisi.',
            'document_type.max' => 'Jenis dokumen maksimal 50 karakter.',
            'document_number.max' => 'Nomor dokumen maksimal 100 karakter.',
            'file.file' => 'File dokumen tidak valid.',
            'file.mimes' => 'Dokumen harus berupa JPG, JPEG, PNG, atau PDF.',
            'file.max' => 'Ukuran file maksimal 5 MB.',
            'expires_at.date' => 'Format tanggal kedaluwarsa tidak valid.',
        ];
    }
}

class VerifyCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'rejection_reason' => ['nullable', 'string', 'max:500', 'required_if:status,rejected'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status verifikasi wajib dipilih.',
            'status.in' => 'Status verifikasi harus approved atau rejected.',
            'rejection_reason.required_if' => 'Alasan penolakan wajib diisi jika dokumen ditolak.',
            'rejection_reason.max' => 'Alasan penolakan maksimal 500 karakter.',
        ];
    }
}

/**
 * Validasi pengajuan menjadi mitra oleh customer.
 */
class StoreMitraApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agency_name' => ['required', 'string', 'max:255'],
            'owner_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'business_type' => ['nullable', 'string', 'max:100'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            // Koordinat presisi lokasi usaha dari peta (opsional namun disarankan).
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'description' => ['nullable', 'string', 'max:1000'],
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_name' => ['required', 'string', 'max:255'],
            'ktp_number' => ['required', 'string', 'max:50'],
            'ktp_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'nib_number' => ['required', 'string', 'max:100'],
            'nib_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'agency_name.required' => 'Nama agensi / usaha wajib diisi.',
            'owner_name.required' => 'Nama pemilik / penanggung jawab wajib diisi.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'address.required' => 'Alamat usaha wajib diisi.',
            'city.required' => 'Kota operasional wajib diisi.',
            'latitude.numeric' => 'Koordinat latitude tidak valid.',
            'latitude.between' => 'Koordinat latitude harus antara -90 dan 90.',
            'longitude.numeric' => 'Koordinat longitude tidak valid.',
            'longitude.between' => 'Koordinat longitude harus antara -180 dan 180.',
            'bank_name.required' => 'Nama bank wajib diisi.',
            'bank_account_number.required' => 'Nomor rekening wajib diisi.',
            'bank_account_number.max' => 'Nomor rekening maksimal 50 karakter.',
            'bank_account_name.required' => 'Nama pemilik rekening wajib diisi.',
            'ktp_number.required' => 'Nomor KTP wajib diisi.',
            'ktp_file.required' => 'Foto KTP wajib diunggah.',
            'ktp_file.mimes' => 'KTP harus berupa JPG, JPEG, PNG, atau PDF.',
            'ktp_file.max' => 'Ukuran file KTP maksimal 5 MB.',
            'nib_number.required' => 'Nomor NIB / Akta Usaha wajib diisi.',
            'nib_file.required' => 'Dokumen NIB / Akta Usaha wajib diunggah.',
            'nib_file.mimes' => 'NIB harus berupa JPG, JPEG, PNG, atau PDF.',
            'nib_file.max' => 'Ukuran file NIB maksimal 5 MB.',
        ];
    }
}

class ProfileUpdateRequest extends FormRequest
{
    /**
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(\App\Models\User::class)->ignore($this->user()->id)],
            // Data pribadi penyewa (customer_profiles).
            'phone' => ['nullable', 'string', 'max:20'],
            'identity_number' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            // Data verifikasi sewa (SIM & kontak darurat) dari tab
            // "Dokumen Sewa (KTP & SIM)".
            'sim_type' => ['nullable', 'string', 'max:50'],
            'emergency_name' => ['nullable', 'string', 'max:100'],
            'emergency_relation' => ['nullable', 'string', 'max:50'],
            'emergency_phone' => ['nullable', 'string', 'max:20'],
            // Dokumen sewa dari tab "Dokumen Sewa (KTP & SIM)".
            'ktp_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'sim_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
            'sim_number' => ['nullable', 'string', 'max:100'],
            'sim_expires_at' => ['nullable', 'date'],
            'document_notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}

class StoreWishlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('customer') ?? false;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
        ];
    }
}
