<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessDisputeRequest extends FormRequest
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
                    'investigating',
                    'resolved',
                    'rejected',
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

            'resolution_party' => [
                'nullable',
                Rule::in([
                    'customer',
                    'mitra',
                    'both',
                    'none',
                ]),
            ],

            'refund_amount' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' =>
                'Status sengketa wajib dipilih.',

            'status.in' =>
                'Status sengketa tidak valid.',

            'assigned_to.exists' =>
                'Admin yang ditugaskan tidak ditemukan.',

            'resolution.max' =>
                'Resolusi maksimal 5000 karakter.',

            'resolution_party.in' =>
                'Pihak yang menerima keputusan tidak valid.',

            'refund_amount.numeric' =>
                'Jumlah refund harus berupa angka.',

            'refund_amount.min' =>
                'Jumlah refund tidak boleh kurang dari 0.',

            'notes.max' =>
                'Catatan maksimal 2000 karakter.',
        ];
    }
}