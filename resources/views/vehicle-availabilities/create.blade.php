<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Ketersediaan</title>
</head>
<body>

```
<h1>Tambah Ketersediaan Kendaraan</h1>

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

<form
    action="{{ route('vehicle-availabilities.store') }}"
    method="POST"
>
    @csrf

    <div>
        <label>Kendaraan</label><br>

        <select name="vehicle_id" required>
            <option value="">
                -- Pilih Kendaraan --
            </option>

            @foreach ($vehicles as $vehicle)
                <option
                    value="{{ $vehicle->id }}"
                    {{ old('vehicle_id') == $vehicle->id ? 'selected' : '' }}
                >
                    {{ $vehicle->name }}
                    -
                    {{ $vehicle->license_plate }}
                </option>
            @endforeach
        </select>
    </div>

    <br>

    <div>
        <label>Tanggal Mulai</label><br>

        <input
            type="date"
            name="start_date"
            value="{{ old('start_date') }}"
            required
        >
    </div>

    <br>

    <div>
        <label>Tanggal Selesai</label><br>

        <input
            type="date"
            name="end_date"
            value="{{ old('end_date') }}"
            required
        >
    </div>

    <br>

    <div>
        <label>Status</label><br>

        <select name="status" required>
            <option value="">
                -- Pilih Status --
            </option>

            <option
                value="available"
                {{ old('status') === 'available' ? 'selected' : '' }}
            >
                Available
            </option>

            <option
                value="unavailable"
                {{ old('status') === 'unavailable' ? 'selected' : '' }}
            >
                Unavailable
            </option>

            <option
                value="maintenance"
                {{ old('status') === 'maintenance' ? 'selected' : '' }}
            >
                Maintenance
            </option>
        </select>
    </div>

    <br>

    <div>
        <label>Catatan</label><br>

        <textarea
            name="notes"
            rows="5"
        >{{ old('notes') }}</textarea>
    </div>

    <br>

    <button type="submit">
        Simpan
    </button>

    <a href="{{ route('vehicle-availabilities.index') }}">
        Batal
    </a>

</form>
```

</body>
</html>
