<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProcessAgentPayoutRequest extends FormRequest
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
                    'processing',
                    'paid',
                    'failed',
                    'cancelled',
                ]),
            ],

            'payout_method' => [
                'required',
                Rule::in([
                    'bank_transfer',
                    'cash',
                ]),
            ],

            'account_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'account_number' => [
                'nullable',
                'string',
                'max:100',
            ],
            'bank_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'bank_name.max' => 'Nama bank maksimal 255 karakter.',

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
                'Status payout wajib dipilih.',

            'status.in' =>
                'Status payout tidak valid.',

            'payout_method.required' =>
                'Metode payout wajib dipilih.',

            'payout_method.in' =>
                'Metode payout tidak valid.',

            'account_name.max' =>
                'Nama rekening maksimal 255 karakter.',

            'account_number.max' =>
                'Nomor rekening maksimal 100 karakter.',

            'notes.max' =>
                'Catatan maksimal 2000 karakter.',
        ];
    }
}