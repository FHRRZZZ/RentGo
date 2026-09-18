<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
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

            'rating' => [
                'required',
                'integer',
                'min:1',
                'max:5',
            ],

            'review' => [
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' =>
                'Booking wajib dipilih.',

            'booking_id.integer' =>
                'ID booking harus berupa angka.',

            'booking_id.exists' =>
                'Booking tidak ditemukan.',

            'rating.required' =>
                'Rating wajib diberikan.',

            'rating.integer' =>
                'Rating harus berupa angka.',

            'rating.min' =>
                'Rating minimal 1.',

            'rating.max' =>
                'Rating maksimal 5.',

            'review.string' =>
                'Review harus berupa teks.',

            'review.max' =>
                'Review maksimal 5000 karakter.',
        ];
    }
}