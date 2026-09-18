<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                Rule::in([
                    'confirmed',
                    'rejected',
                ]),
            ],

            'agent_note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status booking wajib dipilih.',
            'status.in' => 'Status booking tidak valid.',
            'agent_note.string' => 'Catatan harus berupa teks.',
            'agent_note.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}