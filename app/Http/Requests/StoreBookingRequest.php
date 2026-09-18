<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('customer') ?? false;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'rental_start' => [
                'required',
                'date',
                'after_or_equal:today',
            ],

            'rental_end' => [
                'required',
                'date',
                'after:rental_start',
            ],

            'fulfillment_type' => [
                'required',
                'in:self_pickup,delivery',
            ],

            'pickup_location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'delivery_address' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'customer_notes' => [
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
                $this->fulfillment_type === 'delivery' &&
                blank($this->delivery_address)
            ) {
                $validator->errors()->add(
                    'delivery_address',
                    'Alamat pengantaran wajib diisi untuk metode delivery.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' =>
                'Kendaraan wajib dipilih.',

            'vehicle_id.exists' =>
                'Kendaraan tidak ditemukan.',

            'rental_start.required' =>
                'Tanggal mulai sewa wajib diisi.',

            'rental_start.date' =>
                'Tanggal mulai sewa tidak valid.',

            'rental_start.after_or_equal' =>
                'Tanggal mulai sewa tidak boleh sebelum hari ini.',

            'rental_end.required' =>
                'Tanggal selesai sewa wajib diisi.',

            'rental_end.date' =>
                'Tanggal selesai sewa tidak valid.',

            'rental_end.after' =>
                'Tanggal selesai harus setelah tanggal mulai.',

            'fulfillment_type.required' =>
                'Metode pengambilan kendaraan wajib dipilih.',

            'fulfillment_type.in' =>
                'Metode pengambilan tidak valid.',

            'pickup_location.max' =>
                'Lokasi pickup maksimal 255 karakter.',

            'delivery_address.max' =>
                'Alamat pengantaran maksimal 1000 karakter.',

            'customer_notes.max' =>
                'Catatan maksimal 1000 karakter.',
        ];
    }
}