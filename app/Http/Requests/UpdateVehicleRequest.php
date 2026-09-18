<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicle = $this->route('vehicle');

        return [
            'vehicle_category_id' => [
                'required',
                'integer',
                'exists:vehicle_categories,id',
            ],

            'vehicle_type' => [
                'required',
                Rule::in(['car', 'motorcycle']),
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicles', 'slug')
                    ->ignore($vehicle),
            ],

            'brand' => [
                'nullable',
                'string',
                'max:255',
            ],

            'model' => [
                'nullable',
                'string',
                'max:255',
            ],

            'year' => [
                'nullable',
                'integer',
                'digits:4',
                'min:1900',
                'max:' . (date('Y') + 1),
            ],

            'license_plate' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicles', 'license_plate')
                    ->ignore($vehicle),
            ],

            'transmission' => [
                'nullable',
                'string',
                'max:255',
            ],

            'seat_capacity' => [
                'nullable',
                'integer',
                'min:1',
                'max:255',
            ],

            'fuel_type' => [
                'nullable',
                'string',
                'max:255',
            ],

            'color' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'pickup_location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'rental_requirements' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'draft',
                    'pending_review',
                    'available',
                    'booked',
                    'rented',
                    'maintenance',
                    'inactive',
                    'rejected',
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_category_id.required' =>
                'Kategori kendaraan wajib dipilih.',

            'vehicle_category_id.exists' =>
                'Kategori kendaraan tidak ditemukan.',

            'vehicle_type.required' =>
                'Jenis kendaraan wajib dipilih.',

            'vehicle_type.in' =>
                'Jenis kendaraan harus berupa mobil atau motor.',

            'name.required' =>
                'Nama kendaraan wajib diisi.',

            'slug.required' =>
                'Slug kendaraan wajib diisi.',

            'slug.unique' =>
                'Slug kendaraan sudah digunakan.',

            'year.integer' =>
                'Tahun kendaraan harus berupa angka.',

            'year.digits' =>
                'Tahun kendaraan harus terdiri dari 4 angka.',

            'license_plate.required' =>
                'Nomor polisi wajib diisi.',

            'license_plate.unique' =>
                'Nomor polisi sudah digunakan.',

            'seat_capacity.integer' =>
                'Kapasitas penumpang harus berupa angka.',

            'status.in' =>
                'Status kendaraan tidak valid.',
        ];
    }
}