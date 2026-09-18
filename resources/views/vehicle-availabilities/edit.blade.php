<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Ketersediaan</title>
</head>
<body>

```
<h1>Edit Ketersediaan Kendaraan</h1>

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
    action="{{ route('vehicle-availabilities.update', $vehicleAvailability) }}"
    method="POST"
>
    @csrf
    @method('PUT')

    <p>
        <strong>Kendaraan:</strong>
        {{ $vehicleAvailability->vehicle?->name ?? '-' }}
    </p>

    <div>
        <label>Tanggal Mulai</label><br>

        <input
            type="date"
            name="start_date"
            value="{{ old(
                'start_date',
                $vehicleAvailability->start_date?->format('Y-m-d')
            ) }}"
            required
        >
    </div>

    <br>

    <div>
        <label>Tanggal Selesai</label><br>

        <input
            type="date"
            name="end_date"
            value="{{ old(
                'end_date',
                $vehicleAvailability->end_date?->format('Y-m-d')
            ) }}"
            required
        >
    </div>

    <br>

    <div>
        <label>Status</label><br>

        <select name="status" required>

            <option
                value="available"
                {{ old('status', $vehicleAvailability->status) === 'available' ? 'selected' : '' }}
            >
                Available
            </option>

            <option
                value="unavailable"
                {{ old('status', $vehicleAvailability->status) === 'unavailable' ? 'selected' : '' }}
            >
                Unavailable
            </option>

            <option
                value="maintenance"
                {{ old('status', $vehicleAvailability->status) === 'maintenance' ? 'selected' : '' }}
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
        >{{ old('notes', $vehicleAvailability->notes) }}</textarea>
    </div>

    <br>

    <button type="submit">
        Simpan Perubahan
    </button>

    <a href="{{ route('vehicle-availabilities.index') }}">
        Batal
    </a>

</form>
```

</body>
</html>
