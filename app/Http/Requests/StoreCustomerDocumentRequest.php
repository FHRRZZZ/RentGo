<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_profile_id' => [
                'required',
                'integer',
                'exists:customer_profiles,id',
            ],

            'document_type' => [
                'required',
                'string',
                'max:50',
            ],

            'document_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],

            'expires_at' => [
                'nullable',
                'date',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_profile_id.required' =>
                'Customer profile wajib dipilih.',

            'customer_profile_id.exists' =>
                'Customer profile tidak ditemukan.',

            'document_type.required' =>
                'Jenis dokumen wajib diisi.',

            'document_type.max' =>
                'Jenis dokumen maksimal 50 karakter.',

            'document_number.max' =>
                'Nomor dokumen maksimal 100 karakter.',

            'file.required' =>
                'File dokumen wajib diunggah.',

            'file.file' =>
                'File dokumen tidak valid.',

            'file.mimes' =>
                'Dokumen harus berupa JPG, JPEG, PNG, atau PDF.',

            'file.max' =>
                'Ukuran file maksimal 5 MB.',

            'expires_at.date' =>
                'Format tanggal kedaluwarsa tidak valid.',
        ];
    }
}