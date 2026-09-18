<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Kendaraan</title>
</head>
<body>

    <h1>Tambah Kendaraan</h1>

    @if ($errors->any())
        <div>
            <strong>Terjadi kesalahan:</strong>

            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('vehicles.store') }}" method="POST">
        @csrf

        {{-- Admin memilih Mitra --}}
        @if (auth()->user()->hasRole('admin'))

            <div>
                <label>Mitra</label><br>

                <select name="agent_profile_id" required>
                    <option value="">-- Pilih Mitra --</option>

                    @foreach ($mitras as $mitra)
                        <option
                            value="{{ $mitra->id }}"
                            {{ old('agent_profile_id') == $mitra->id ? 'selected' : '' }}
                        >
                            {{ $mitra->agency_name ?? 'Mitra #' . $mitra->id }}
                        </option>
                    @endforeach
                </select>
            </div>

            <br>

        @endif

        <div>
            <label>Kategori Kendaraan</label><br>

            <select name="vehicle_category_id" required>
                <option value="">-- Pilih Kategori --</option>

                @foreach ($categories as $category)
                    <option
                        value="{{ $category->id }}"
                        {{ old('vehicle_category_id') == $category->id ? 'selected' : '' }}
                    >
                        {{ $category->name }}
                    </option>
                @endforeach
            </select>
        </div>

        <br>

        <div>
            <label>Jenis Kendaraan</label><br>

            <select name="vehicle_type" required>
                <option value="">-- Pilih Jenis --</option>

                <option
                    value="car"
                    {{ old('vehicle_type') === 'car' ? 'selected' : '' }}
                >
                    Mobil
                </option>

                <option
                    value="motorcycle"
                    {{ old('vehicle_type') === 'motorcycle' ? 'selected' : '' }}
                >
                    Motor
                </option>
            </select>
        </div>

        <br>

        <div>
            <label>Nama Kendaraan</label><br>

            <input
                type="text"
                name="name"
                value="{{ old('name') }}"
                required
            >
        </div>

        <br>

        <div>
            <label>Slug</label><br>

            <input
                type="text"
                name="slug"
                value="{{ old('slug') }}"
                required
            >
        </div>

        <br>

        <div>
            <label>Merek</label><br>

            <input
                type="text"
                name="brand"
                value="{{ old('brand') }}"
            >
        </div>

        <br>

        <div>
            <label>Model</label><br>

            <input
                type="text"
                name="model"
                value="{{ old('model') }}"
            >
        </div>

        <br>

        <div>
            <label>Tahun</label><br>

            <input
                type="number"
                name="year"
                value="{{ old('year') }}"
                min="1900"
                max="{{ date('Y') + 1 }}"
            >
        </div>

        <br>

        <div>
            <label>Nomor Polisi</label><br>

            <input
                type="text"
                name="license_plate"
                value="{{ old('license_plate') }}"
                required
            >
        </div>

        <br>

        <div>
            <label>Transmisi</label><br>

            <input
                type="text"
                name="transmission"
                value="{{ old('transmission') }}"
                placeholder="Manual / Automatic"
            >
        </div>

        <br>

        <div>
            <label>Kapasitas Kursi</label><br>

            <input
                type="number"
                name="seat_capacity"
                value="{{ old('seat_capacity') }}"
                min="1"
            >
        </div>

        <br>

        <div>
            <label>Jenis Bahan Bakar</label><br>

            <input
                type="text"
                name="fuel_type"
                value="{{ old('fuel_type') }}"
            >
        </div>

        <br>

        <div>
            <label>Warna</label><br>

            <input
                type="text"
                name="color"
                value="{{ old('color') }}"
            >
        </div>

        <br>

        <div>
            <label>Lokasi Pengambilan</label><br>

            <input
                type="text"
                name="pickup_location"
                value="{{ old('pickup_location') }}"
            >
        </div>

        <br>

        <div>
            <label>Deskripsi</label><br>

            <textarea
                name="description"
                rows="5"
            >{{ old('description') }}</textarea>
        </div>

        <br>

        <div>
            <label>Syarat Rental</label><br>

            <textarea
                name="rental_requirements"
                rows="5"
            >{{ old('rental_requirements') }}</textarea>
        </div>

        <br>

        <button type="submit">
            Simpan Kendaraan
        </button>

        <a href="{{ route('vehicles.index') }}">
            Batal
        </a>

    </form>

</body>
</html>