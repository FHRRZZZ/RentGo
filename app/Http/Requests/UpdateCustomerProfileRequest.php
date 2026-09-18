<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'phone' => [
                'required',
                'string',
                'max:20',
            ],

            'identity_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('customer_profiles', 'identity_number')
                    ->ignore($customerProfile?->id),
            ],

            'date_of_birth' => [
                'nullable',
                'date',
            ],

            'address' => [
                'nullable',
                'string',
                'max:500',
            ],

            'city' => [
                'nullable',
                'string',
                'max:100',
            ],

            'province' => [
                'nullable',
                'string',
                'max:100',
            ],

            'profile_photo_path' => [
                'nullable',
                'string',
                'max:255',
            ],

            'is_active' => [
                'nullable',
                'boolean',
            ],
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
