<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => [
                'nullable',
                Rule::in(['car', 'motorcycle']),
            ],

            'vehicle_category_id' => [
                'nullable',
                'integer',
                'exists:vehicle_categories,id',
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'rental_start' => [
                'nullable',
                'date',
            ],

            'rental_end' => [
                'nullable',
                'date',
                'after:rental_start',
            ],

            'min_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'max_price' => [
                'nullable',
                'numeric',
                'min:0',
                'gte:min_price',
            ],

            'transmission' => [
                'nullable',
                'string',
                'max:50',
            ],

            'seat_capacity' => [
                'nullable',
                'integer',
                'min:1',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_type.in' =>
                'Jenis kendaraan harus berupa car atau motorcycle.',

            'vehicle_category_id.exists' =>
                'Kategori kendaraan tidak ditemukan.',

            'rental_start.date' =>
                'Tanggal mulai sewa tidak valid.',

            'rental_end.date' =>
                'Tanggal selesai sewa tidak valid.',

            'rental_end.after' =>
                'Tanggal selesai harus setelah tanggal mulai.',

            'min_price.numeric' =>
                'Harga minimum harus berupa angka.',

            'min_price.min' =>
                'Harga minimum tidak boleh kurang dari 0.',

            'max_price.numeric' =>
                'Harga maksimum harus berupa angka.',

            'max_price.min' =>
                'Harga maksimum tidak boleh kurang dari 0.',

            'max_price.gte' =>
                'Harga maksimum harus lebih besar atau sama dengan harga minimum.',
        ];
    }
}