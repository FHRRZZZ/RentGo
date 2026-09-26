<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| Domain BOOKING & SERAH TERIMA
|--------------------------------------------------------------------------
| Request: StoreBookingRequest, ConfirmBookingRequest,
| StoreRentalCheckoutRequest, StoreRentalCheckinRequest,
| StoreRentalDamageRequest.
*/

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'rental_start' => ['required', 'date', 'after_or_equal:today'],
            'rental_end' => ['required', 'date', 'after:rental_start'],
            'fulfillment_type' => ['required', 'in:self_pickup,delivery'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            // Titik presisi metode "Ambil Sendiri" (dipilih customer di peta).
            'pickup_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'pickup_landmark' => ['nullable', 'string', 'max:255'],
            'delivery_address' => ['nullable', 'string', 'max:1000'],
            // Titik presisi alamat pengantaran (dipilih customer di peta).
            'delivery_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'delivery_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'delivery_landmark' => ['nullable', 'string', 'max:255'],
            'customer_notes' => ['nullable', 'string', 'max:1000'],
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
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'rental_start.required' => 'Tanggal mulai sewa wajib diisi.',
            'rental_start.date' => 'Tanggal mulai sewa tidak valid.',
            'rental_start.after_or_equal' => 'Tanggal mulai sewa tidak boleh sebelum hari ini.',
            'rental_end.required' => 'Tanggal selesai sewa wajib diisi.',
            'rental_end.date' => 'Tanggal selesai sewa tidak valid.',
            'rental_end.after' => 'Tanggal selesai harus setelah tanggal mulai.',
            'fulfillment_type.required' => 'Metode pengambilan kendaraan wajib dipilih.',
            'fulfillment_type.in' => 'Metode pengambilan tidak valid.',
            'pickup_location.max' => 'Lokasi pickup maksimal 255 karakter.',
            'pickup_latitude.numeric' => 'Koordinat titik ambil tidak valid.',
            'pickup_latitude.between' => 'Koordinat titik ambil di luar jangkauan.',
            'pickup_longitude.numeric' => 'Koordinat titik ambil tidak valid.',
            'pickup_longitude.between' => 'Koordinat titik ambil di luar jangkauan.',
            'pickup_landmark.max' => 'Patokan lokasi maksimal 255 karakter.',
            'delivery_address.max' => 'Alamat pengantaran maksimal 1000 karakter.',
            'delivery_latitude.numeric' => 'Koordinat alamat antar tidak valid.',
            'delivery_latitude.between' => 'Koordinat alamat antar di luar jangkauan.',
            'delivery_longitude.numeric' => 'Koordinat alamat antar tidak valid.',
            'delivery_longitude.between' => 'Koordinat alamat antar di luar jangkauan.',
            'delivery_landmark.max' => 'Patokan alamat maksimal 255 karakter.',
            'customer_notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['confirmed', 'rejected'])],
            'agent_note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status booking wajib dipilih.',
            'status.in' => 'Status booking tidak valid.',
            'agent_note.string' => 'Catatan harus berupa teks.',
            'agent_note.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

class VerifyBookingPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_id.exists' => 'Data pembayaran tidak ditemukan.',
            'notes.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}

class StoreRentalCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'checkout_at' => ['required', 'date'],
            'vehicle_condition' => ['required', 'string', 'max:5000'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'odometer' => ['required', 'numeric', 'min:0'],
            'fuel_level' => ['required', 'numeric', 'min:0', 'max:100'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'customer_confirmed' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'checkout_at.required' => 'Waktu checkout wajib diisi.',
            'checkout_at.date' => 'Waktu checkout tidak valid.',
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

class StoreRentalCheckinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'checkin_at' => ['required', 'date'],
            'vehicle_condition' => ['required', 'string', 'max:5000'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'odometer' => ['required', 'numeric', 'min:0'],
            'fuel_level' => ['required', 'numeric', 'min:0', 'max:100'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'customer_confirmed' => ['required', 'boolean'],
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

class StoreRentalDamageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('mitra') ?? false;
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'rental_checkin_id' => ['required', 'integer', 'exists:rental_checkins,id'],
            'description' => ['required', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:255'],
            'severity' => ['required', 'in:minor,moderate,major'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'repair_cost' => ['required', 'numeric', 'min:0'],
            'customer_charge' => ['required', 'numeric', 'min:0'],
            'deducted_from_deposit' => ['required', 'boolean'],
            'status' => ['required', 'in:reported,confirmed,resolved,rejected'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'rental_checkin_id.required' => 'Data check-in wajib dipilih.',
            'rental_checkin_id.exists' => 'Data check-in tidak ditemukan.',
            'description.required' => 'Deskripsi kerusakan wajib diisi.',
            'description.max' => 'Deskripsi kerusakan maksimal 5000 karakter.',
            'severity.required' => 'Tingkat kerusakan wajib dipilih.',
            'severity.in' => 'Tingkat kerusakan tidak valid.',
            'photos.*.image' => 'File foto harus berupa gambar.',
            'photos.*.max' => 'Ukuran setiap foto maksimal 5 MB.',
            'repair_cost.required' => 'Biaya perbaikan wajib diisi.',
            'customer_charge.required' => 'Biaya yang dibebankan kepada customer wajib diisi.',
            'deducted_from_deposit.required' => 'Status potongan deposit wajib dipilih.',
            'status.required' => 'Status kerusakan wajib dipilih.',
            'status.in' => 'Status kerusakan tidak valid.',
        ];
    }
}
