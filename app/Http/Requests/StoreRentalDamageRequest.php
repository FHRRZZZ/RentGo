<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalDamageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'required',
                'integer',
                'exists:bookings,id',
            ],

            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'rental_checkin_id' => [
                'required',
                'integer',
                'exists:rental_checkins,id',
            ],

            'description' => [
                'required',
                'string',
                'max:5000',
            ],

            'location' => [
                'nullable',
                'string',
                'max:255',
            ],

            'severity' => [
                'required',
                'in:minor,moderate,major',
            ],

            'photos' => [
                'nullable',
                'array',
            ],

            'photos.*' => [
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'repair_cost' => [
                'required',
                'numeric',
                'min:0',
            ],

            'customer_charge' => [
                'required',
                'numeric',
                'min:0',
            ],

            'deducted_from_deposit' => [
                'required',
                'boolean',
            ],

            'status' => [
                'required',
                'in:reported,confirmed,resolved,rejected',
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

            'vehicle_id.required' =>
                'Kendaraan wajib dipilih.',

            'vehicle_id.exists' =>
                'Kendaraan tidak ditemukan.',

            'rental_checkin_id.required' =>
                'Data check-in wajib dipilih.',

            'rental_checkin_id.exists' =>
                'Data check-in tidak ditemukan.',

            'description.required' =>
                'Deskripsi kerusakan wajib diisi.',

            'description.max' =>
                'Deskripsi kerusakan maksimal 5000 karakter.',

            'severity.required' =>
                'Tingkat kerusakan wajib dipilih.',

            'severity.in' =>
                'Tingkat kerusakan tidak valid.',

            'photos.*.image' =>
                'File foto harus berupa gambar.',

            'photos.*.max' =>
                'Ukuran setiap foto maksimal 5 MB.',

            'repair_cost.required' =>
                'Biaya perbaikan wajib diisi.',

            'customer_charge.required' =>
                'Biaya yang dibebankan kepada customer wajib diisi.',

            'deducted_from_deposit.required' =>
                'Status potongan deposit wajib dipilih.',

            'status.required' =>
                'Status kerusakan wajib dipilih.',

            'status.in' =>
                'Status kerusakan tidak valid.',
        ];
    }
}