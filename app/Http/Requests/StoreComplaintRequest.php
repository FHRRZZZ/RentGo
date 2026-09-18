<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([
            'customer',
            'mitra',
        ]) ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => [
                'nullable',
                'integer',
                'exists:bookings,id',
            ],

            'reported_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'subject' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'required',
                'string',
                'max:10000',
            ],

            'category' => [
                'nullable',
                Rule::in([
                    'vehicle',
                    'booking',
                    'payment',
                    'pickup',
                    'return',
                    'agent',
                    'customer',
                    'other',
                ]),
            ],

            'priority' => [
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ]),
            ],

            'attachments' => [
                'nullable',
                'array',
                'max:5',
            ],

            'attachments.*' => [
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.exists' =>
                'Booking tidak ditemukan.',

            'reported_user_id.exists' =>
                'User yang dilaporkan tidak ditemukan.',

            'subject.required' =>
                'Subjek complaint wajib diisi.',

            'subject.max' =>
                'Subjek complaint maksimal 255 karakter.',

            'description.required' =>
                'Deskripsi complaint wajib diisi.',

            'description.max' =>
                'Deskripsi complaint maksimal 10.000 karakter.',

            'category.in' =>
                'Kategori complaint tidak valid.',

            'priority.in' =>
                'Prioritas complaint tidak valid.',

            'attachments.array' =>
                'Lampiran harus berupa kumpulan file.',

            'attachments.max' =>
                'Maksimal 5 file dapat dilampirkan.',

            'attachments.*.image' =>
                'Setiap lampiran harus berupa gambar.',

            'attachments.*.mimes' =>
                'Format gambar yang diperbolehkan: JPG, JPEG, PNG, atau WEBP.',

            'attachments.*.max' =>
                'Ukuran setiap gambar maksimal 5 MB.',
        ];
    }
}