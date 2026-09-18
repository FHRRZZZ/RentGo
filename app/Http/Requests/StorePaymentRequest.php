<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('customer') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
            ],

            'payment_method' => [
                'required',
                Rule::in([
                    'cash',
                    'qris',
                ]),
            ],

            'proof_file' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            if (
                $this->payment_method === 'qris' &&
                !$this->hasFile('proof_file')
            ) {
                $validator->errors()->add(
                    'proof_file',
                    'Bukti pembayaran wajib diupload untuk pembayaran QRIS.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'booking_id.required' =>
                'Booking wajib dipilih.',

            'booking_id.exists' =>
                'Booking tidak ditemukan.',

            'payment_method.required' =>
                'Metode pembayaran wajib dipilih.',

            'payment_method.in' =>
                'Metode pembayaran harus Cash atau QRIS.',

            'proof_file.file' =>
                'Bukti pembayaran harus berupa file.',

            'proof_file.mimes' =>
                'Bukti pembayaran harus berupa JPG, JPEG, PNG, atau PDF.',

            'proof_file.max' =>
                'Ukuran bukti pembayaran maksimal 5 MB.',

            'notes.max' =>
                'Catatan maksimal 1000 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('booking_id')) {
            $this->merge([
                'booking_id' => (int) $this->booking_id,
            ]);
        }
    }
}
