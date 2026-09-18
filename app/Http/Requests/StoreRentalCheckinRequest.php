<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentalCheckinRequest extends FormRequest
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

            'checkin_at' => [
                'required',
                'date',
            ],

            'vehicle_condition' => [
                'required',
                'string',
                'max:5000',
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

            'odometer' => [
                'required',
                'numeric',
                'min:0',
            ],

            'fuel_level' => [
                'required',
                'numeric',
                'min:0',
                'max:100',
            ],

            'equipment' => [
                'nullable',
                'array',
            ],

            'equipment.*' => [
                'string',
                'max:255',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'customer_confirmed' => [
                'required',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',

            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',

            'checkin_at.required' => 'Waktu check-in wajib diisi.',
            'checkin_at.date' => 'Waktu check-in tidak valid.',

            'vehicle_condition.required' => 'Kondisi kendaraan wajib diisi.',
            'vehicle_condition.max' => 'Kondisi kendaraan maksimal 5000 karakter.',

            'photos.array' => 'Foto kendaraan harus berupa kumpulan file.',
            'photos.*.image' => 'File foto harus berupa gambar.',
            'photos.*.mimes' => 'Foto harus berformat JPG, JPEG, PNG, atau WEBP.',
            'photos.*.max' => 'Ukuran setiap foto maksimal 5 MB.',

            'odometer.required' => 'Odometer wajib diisi.',
            'odometer.numeric' => 'Odometer harus berupa angka.',
            'odometer.min' => 'Odometer tidak boleh kurang dari 0.',

            'fuel_level.required' => 'Level bahan bakar wajib diisi.',
            'fuel_level.numeric' => 'Level bahan bakar harus berupa angka.',
            'fuel_level.min' => 'Level bahan bakar minimal 0%.',
            'fuel_level.max' => 'Level bahan bakar maksimal 100%.',

            'equipment.array' => 'Perlengkapan kendaraan harus berupa daftar.',
            'equipment.*.string' => 'Nama perlengkapan harus berupa teks.',
            'equipment.*.max' => 'Nama perlengkapan maksimal 255 karakter.',

            'notes.max' => 'Catatan maksimal 2000 karakter.',

            'customer_confirmed.required' => 'Konfirmasi customer wajib diisi.',
            'customer_confirmed.boolean' => 'Konfirmasi customer tidak valid.',
        ];
    }
}