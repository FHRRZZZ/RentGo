<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([
            'admin',
            'mitra',
        ]) ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
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
            'booking_id.required' =>
                'Booking wajib dipilih.',

            'booking_id.exists' =>
                'Booking tidak ditemukan.',

            'notes.max' =>
                'Catatan maksimal 2000 karakter.',
        ];
    }
}