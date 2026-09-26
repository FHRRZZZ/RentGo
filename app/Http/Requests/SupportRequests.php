<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| Domain SUPPORT
|--------------------------------------------------------------------------
| Request: StoreReviewRequest, ModerateReviewRequest, ProcessReviewRequest,
| StoreComplaintRequest, ProcessComplaintRequest,
| StoreDisputeRequest, ProcessDisputeRequest.
*/

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('customer') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.integer' => 'ID booking harus berupa angka.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'rating.required' => 'Rating wajib diberikan.',
            'rating.integer' => 'Rating harus berupa angka.',
            'rating.min' => 'Rating minimal 1.',
            'rating.max' => 'Rating maksimal 5.',
            'review.string' => 'Review harus berupa teks.',
            'review.max' => 'Review maksimal 5000 karakter.',
        ];
    }
}

class ModerateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['published', 'hidden', 'rejected'])],
            'moderation_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status moderasi wajib dipilih.',
            'status.in' => 'Status moderasi tidak valid.',
            'moderation_note.string' => 'Catatan moderasi harus berupa teks.',
            'moderation_note.max' => 'Catatan moderasi maksimal 2000 karakter.',
        ];
    }
}

class ProcessReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['published', 'hidden', 'rejected'])],
            'moderation_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status review wajib dipilih.',
            'status.in' => 'Status review tidak valid.',
            'moderation_note.max' => 'Catatan moderasi maksimal 2000 karakter.',
        ];
    }
}

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['customer', 'mitra']) ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'reported_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'category' => ['nullable', Rule::in([
                'vehicle',
                'booking',
                'payment',
                'pickup',
                'return',
                'agent',
                'customer',
                'other',
            ])],
            'priority' => ['nullable', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'reported_user_id.exists' => 'User yang dilaporkan tidak ditemukan.',
            'subject.required' => 'Subjek complaint wajib diisi.',
            'subject.max' => 'Subjek complaint maksimal 255 karakter.',
            'description.required' => 'Deskripsi complaint wajib diisi.',
            'description.max' => 'Deskripsi complaint maksimal 10.000 karakter.',
            'category.in' => 'Kategori complaint tidak valid.',
            'priority.in' => 'Prioritas complaint tidak valid.',
            'attachments.array' => 'Lampiran harus berupa kumpulan file.',
            'attachments.max' => 'Maksimal 5 file dapat dilampirkan.',
            'attachments.*.image' => 'Setiap lampiran harus berupa gambar.',
            'attachments.*.mimes' => 'Format gambar yang diperbolehkan: JPG, JPEG, PNG, atau WEBP.',
            'attachments.*.max' => 'Ukuran setiap gambar maksimal 5 MB.',
        ];
    }
}

class ProcessComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['in_review', 'resolved', 'rejected', 'closed'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'resolution' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status pengaduan wajib dipilih.',
            'status.in' => 'Status pengaduan tidak valid.',
            'assigned_to.exists' => 'Admin yang ditugaskan tidak ditemukan.',
            'resolution.max' => 'Resolusi maksimal 5000 karakter.',
        ];
    }
}

class StoreDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['customer', 'mitra']) ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'respondent_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', Rule::in([
                'vehicle',
                'booking',
                'payment',
                'service',
                'mitra',
                'customer',
                'other',
            ])],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'respondent_id.exists' => 'User yang dilaporkan tidak ditemukan.',
            'subject.required' => 'Subjek sengketa wajib diisi.',
            'subject.max' => 'Subjek maksimal 255 karakter.',
            'description.required' => 'Deskripsi sengketa wajib diisi.',
            'description.max' => 'Deskripsi maksimal 5000 karakter.',
            'category.required' => 'Kategori sengketa wajib dipilih.',
            'category.in' => 'Kategori sengketa tidak valid.',
            'attachments.array' => 'Lampiran harus berupa file.',
            'attachments.max' => 'Maksimal 5 lampiran.',
            'attachments.*.image' => 'Lampiran harus berupa gambar.',
            'attachments.*.mimes' => 'Format gambar harus JPG, JPEG, PNG, atau WEBP.',
            'attachments.*.max' => 'Ukuran setiap lampiran maksimal 5 MB.',
        ];
    }
}

class ProcessDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['investigating', 'resolved', 'rejected'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'resolution' => ['nullable', 'string', 'max:5000'],
            'resolution_party' => ['nullable', Rule::in(['customer', 'mitra', 'both', 'none'])],
            'refund_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status sengketa wajib dipilih.',
            'status.in' => 'Status sengketa tidak valid.',
            'assigned_to.exists' => 'Admin yang ditugaskan tidak ditemukan.',
            'resolution.max' => 'Resolusi maksimal 5000 karakter.',
            'resolution_party.in' => 'Pihak yang menerima keputusan tidak valid.',
            'refund_amount.numeric' => 'Jumlah refund harus berupa angka.',
            'refund_amount.min' => 'Jumlah refund tidak boleh kurang dari 0.',
            'notes.max' => 'Catatan maksimal 2000 karakter.',
        ];
    }
}
