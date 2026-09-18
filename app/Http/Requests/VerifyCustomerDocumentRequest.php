<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyCustomerDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    'approved',
                    'rejected',
                ]),
            ],

            'rejection_reason' => [
                'nullable',
                'string',
                'max:500',
                'required_if:status,rejected',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' =>
                'Status verifikasi wajib dipilih.',

            'status.in' =>
                'Status verifikasi harus approved atau rejected.',

            'rejection_reason.required_if' =>
                'Alasan penolakan wajib diisi jika dokumen ditolak.',

            'rejection_reason.max' =>
                'Alasan penolakan maksimal 500 karakter.',
        ];
    }
}