<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessComplaintRequest extends FormRequest
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
                    'in_review',
                    'resolved',
                    'rejected',
                    'closed',
                ]),
            ],

            'assigned_to' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'resolution' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' =>
                'Status pengaduan wajib dipilih.',

            'status.in' =>
                'Status pengaduan tidak valid.',

            'assigned_to.exists' =>
                'Admin yang ditugaskan tidak ditemukan.',

            'resolution.max' =>
                'Resolusi maksimal 5000 karakter.',
        ];
    }
}