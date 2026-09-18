<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDisputeRequest extends FormRequest
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

            'respondent_id' => [
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
                'max:5000',
            ],

            'category' => [
                'required',
                Rule::in([
                    'vehicle',
                    'booking',
                    'payment',
                    'service',
                    'mitra',
                    'customer',
                    'other',
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

            'respondent_id.exists' =>
                'User yang dilaporkan tidak ditemukan.',

            'subject.required' =>
                'Subjek sengketa wajib diisi.',

            'subject.max' =>
                'Subjek maksimal 255 karakter.',

            'description.required' =>
                'Deskripsi sengketa wajib diisi.',

            'description.max' =>
                'Deskripsi maksimal 5000 karakter.',

            'category.required' =>
                'Kategori sengketa wajib dipilih.',

            'category.in' =>
                'Kategori sengketa tidak valid.',

            'attachments.array' =>
                'Lampiran harus berupa file.',

            'attachments.max' =>
                'Maksimal 5 lampiran.',

            'attachments.*.image' =>
                'Lampiran harus berupa gambar.',

            'attachments.*.mimes' =>
                'Format gambar harus JPG, JPEG, PNG, atau WEBP.',

            'attachments.*.max' =>
                'Ukuran setiap lampiran maksimal 5 MB.',
        ];
    }
}