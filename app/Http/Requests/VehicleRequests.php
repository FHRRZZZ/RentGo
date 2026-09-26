<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/*
|--------------------------------------------------------------------------
| Domain UNIT (kendaraan)
|--------------------------------------------------------------------------
| Request: StoreVehicleRequest, UpdateVehicleRequest, VehicleSearchRequest,
| StoreVehicleCategoryRequest, UpdateVehicleCategoryRequest,
| StoreVehiclePriceRequest, UpdateVehiclePriceRequest,
| StoreVehicleAvailabilityRequest, UpdateVehicleAvailabilityRequest.
*/

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'agent_profile_id' => [
                Rule::requiredIf(fn() => $this->user()?->hasRole('admin')),
                'nullable',
                'integer',
                'exists:agent_profiles,id',
            ],
            'vehicle_category_id' => ['required', 'integer', 'exists:vehicle_categories,id'],
            'vehicle_type' => ['required', Rule::in(['car', 'motorcycle'])],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:vehicles,slug'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'digits:4', 'min:1900', 'max:' . (date('Y') + 1)],
            'license_plate' => ['required', 'string', 'max:255', 'unique:vehicles,license_plate'],
            'transmission' => ['nullable', 'string', 'max:255'],
            'seat_capacity' => ['nullable', 'integer', 'min:1', 'max:255'],
            'fuel_type' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'rental_requirements' => ['nullable', 'string'],
            'price_per_day' => ['nullable', 'numeric', 'min:0'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:51200'],
            // Dokumen legal kendaraan (STNK & BPKB).
            'stnk_number' => ['nullable', 'string', 'max:255'],
            'stnk_file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'bpkb_number' => ['nullable', 'string', 'max:255'],
            'bpkb_file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'status' => ['nullable', Rule::in([
                'draft',
                'pending_review',
                'available',
                'booked',
                'rented',
                'maintenance',
                'inactive',
                'rejected',
            ])],
        ];
    }

    public function messages(): array
    {
        return [
            'agent_profile_id.required' => 'Mitra wajib dipilih.',
            'agent_profile_id.exists' => 'Mitra tidak ditemukan.',
            'vehicle_category_id.required' => 'Kategori kendaraan wajib dipilih.',
            'vehicle_category_id.exists' => 'Kategori kendaraan tidak ditemukan.',
            'vehicle_type.required' => 'Jenis kendaraan wajib dipilih.',
            'vehicle_type.in' => 'Jenis kendaraan harus berupa mobil atau motor.',
            'name.required' => 'Nama kendaraan wajib diisi.',
            'slug.required' => 'Slug kendaraan wajib diisi.',
            'slug.unique' => 'Slug kendaraan sudah digunakan.',
            'year.integer' => 'Tahun kendaraan harus berupa angka.',
            'year.digits' => 'Tahun kendaraan harus terdiri dari 4 angka.',
            'license_plate.required' => 'Nomor polisi wajib diisi.',
            'license_plate.unique' => 'Nomor polisi sudah digunakan.',
            'seat_capacity.integer' => 'Kapasitas penumpang harus berupa angka.',
            'stnk_file.required' => 'Dokumen STNK wajib diunggah.',
            'stnk_file.mimes' => 'Dokumen STNK harus berupa gambar atau PDF.',
            'stnk_file.max' => 'Ukuran dokumen STNK maksimal 10 MB.',
            'bpkb_file.required' => 'Dokumen BPKB wajib diunggah.',
            'bpkb_file.mimes' => 'Dokumen BPKB harus berupa gambar atau PDF.',
            'bpkb_file.max' => 'Ukuran dokumen BPKB maksimal 10 MB.',
            'status.in' => 'Status kendaraan tidak valid.',
        ];
    }
}

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
            'agent_profile_id' => ['nullable', 'integer', 'exists:agent_profiles,id'],
            'vehicle_category_id' => ['required', 'integer', 'exists:vehicle_categories,id'],
            'vehicle_type' => ['required', Rule::in(['car', 'motorcycle'])],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('vehicles', 'slug')->ignore($vehicle)],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'integer', 'digits:4', 'min:1900', 'max:' . (date('Y') + 1)],
            'license_plate' => ['required', 'string', 'max:255', Rule::unique('vehicles', 'license_plate')->ignore($vehicle)],
            'transmission' => ['nullable', 'string', 'max:255'],
            'seat_capacity' => ['nullable', 'integer', 'min:1', 'max:255'],
            'fuel_type' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'rental_requirements' => ['nullable', 'string'],
            'price_per_day' => ['nullable', 'numeric', 'min:0'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:51200'],
            // Saat update, file hanya wajib bila belum pernah tersimpan.
            'stnk_number' => ['nullable', 'string', 'max:255'],
            'stnk_file' => [
                Rule::requiredIf(fn() => !$this->vehicleHasDocument('stnk')),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,pdf',
                'max:10240',
            ],
            'bpkb_number' => ['nullable', 'string', 'max:255'],
            'bpkb_file' => [
                Rule::requiredIf(fn() => !$this->vehicleHasDocument('bpkb')),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,pdf',
                'max:10240',
            ],
            'status' => ['nullable', Rule::in([
                'draft',
                'pending_review',
                'available',
                'booked',
                'rented',
                'maintenance',
                'inactive',
                'rejected',
            ])],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_category_id.required' => 'Kategori kendaraan wajib dipilih.',
            'vehicle_category_id.exists' => 'Kategori kendaraan tidak ditemukan.',
            'vehicle_type.required' => 'Jenis kendaraan wajib dipilih.',
            'vehicle_type.in' => 'Jenis kendaraan harus berupa mobil atau motor.',
            'name.required' => 'Nama kendaraan wajib diisi.',
            'slug.required' => 'Slug kendaraan wajib diisi.',
            'slug.unique' => 'Slug kendaraan sudah digunakan.',
            'year.integer' => 'Tahun kendaraan harus berupa angka.',
            'year.digits' => 'Tahun kendaraan harus terdiri dari 4 angka.',
            'license_plate.required' => 'Nomor polisi wajib diisi.',
            'license_plate.unique' => 'Nomor polisi sudah digunakan.',
            'seat_capacity.integer' => 'Kapasitas penumpang harus berupa angka.',
            'stnk_file.required' => 'Dokumen STNK wajib diunggah.',
            'stnk_file.mimes' => 'Dokumen STNK harus berupa gambar atau PDF.',
            'stnk_file.max' => 'Ukuran dokumen STNK maksimal 10 MB.',
            'bpkb_file.required' => 'Dokumen BPKB wajib diunggah.',
            'bpkb_file.mimes' => 'Dokumen BPKB harus berupa gambar atau PDF.',
            'bpkb_file.max' => 'Ukuran dokumen BPKB maksimal 10 MB.',
            'status.in' => 'Status kendaraan tidak valid.',
        ];
    }

    /** Cek apakah kendaraan sudah memiliki dokumen tertentu. */
    private function vehicleHasDocument(string $type): bool
    {
        $vehicle = $this->route('vehicle');

        if (!$vehicle) {
            return false;
        }

        return $vehicle->documents()
            ->where('document_type', $type)
            ->exists();
    }
}

class VehicleSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_type' => ['nullable', Rule::in(['car', 'motorcycle'])],
            'vehicle_category_id' => ['nullable', 'integer', 'exists:vehicle_categories,id'],
            'location' => ['nullable', 'string', 'max:255'],
            'rental_start' => ['nullable', 'date'],
            'rental_end' => ['nullable', 'date', 'after:rental_start'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'transmission' => ['nullable', 'string', 'max:50'],
            'seat_capacity' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_type.in' => 'Jenis kendaraan harus berupa car atau motorcycle.',
            'vehicle_category_id.exists' => 'Kategori kendaraan tidak ditemukan.',
            'rental_start.date' => 'Tanggal mulai sewa tidak valid.',
            'rental_end.date' => 'Tanggal selesai sewa tidak valid.',
            'rental_end.after' => 'Tanggal selesai harus setelah tanggal mulai.',
            'min_price.numeric' => 'Harga minimum harus berupa angka.',
            'min_price.min' => 'Harga minimum tidak boleh kurang dari 0.',
            'max_price.numeric' => 'Harga maksimum harus berupa angka.',
            'max_price.min' => 'Harga maksimum tidak boleh kurang dari 0.',
            'max_price.gte' => 'Harga maksimum harus lebih besar atau sama dengan harga minimum.',
        ];
    }
}

class StoreVehicleCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:vehicle_categories,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'slug.required' => 'Slug kategori wajib diisi.',
            'slug.unique' => 'Slug kategori sudah digunakan.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
        ];
    }
}

class UpdateVehicleCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $category = $this->route('vehicleCategory');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('vehicle_categories', 'slug')->ignore($category)],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi.',
            'slug.required' => 'Slug kategori wajib diisi.',
            'slug.unique' => 'Slug kategori sudah digunakan.',
            'is_active.boolean' => 'Status aktif harus berupa boolean.',
        ];
    }
}

class StoreVehiclePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'price_per_day.required' => 'Harga per hari wajib diisi.',
            'price_per_day.numeric' => 'Harga per hari harus berupa angka.',
            'price_per_day.min' => 'Harga per hari tidak boleh kurang dari 0.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}

class UpdateVehiclePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'price_per_day.required' => 'Harga per hari wajib diisi.',
            'price_per_day.numeric' => 'Harga per hari harus berupa angka.',
            'price_per_day.min' => 'Harga per hari tidak boleh kurang dari 0.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }
}

class StoreVehicleAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(['available', 'unavailable', 'maintenance'])],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'status.required' => 'Status ketersediaan wajib dipilih.',
            'status.in' => 'Status ketersediaan tidak valid.',
        ];
    }
}

class UpdateVehicleAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(['available', 'unavailable', 'maintenance'])],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'status.required' => 'Status ketersediaan wajib dipilih.',
            'status.in' => 'Status ketersediaan tidak valid.',
        ];
    }
}
