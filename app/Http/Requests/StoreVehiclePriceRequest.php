<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehiclePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'price_per_day' => [
                'required',
                'numeric',
                'min:0',
            ],

            'start_date' => [
                'nullable',
                'date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
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
            'vehicle_id.required' =>
                'Kendaraan wajib dipilih.',

            'vehicle_id.exists' =>
                'Kendaraan tidak ditemukan.',

            'price_per_day.required' =>
                'Harga per hari wajib diisi.',

            'price_per_day.numeric' =>
                'Harga per hari harus berupa angka.',

            'price_per_day.min' =>
                'Harga per hari tidak boleh kurang dari 0.',

            'start_date.date' =>
                'Tanggal mulai tidak valid.',

            'end_date.date' =>
                'Tanggal selesai tidak valid.',

            'end_date.after_or_equal' =>
                'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}