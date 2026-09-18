<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Harga Kendaraan</title>
</head>
<body>

<h1>Tambah Harga Kendaraan</h1>

@if ($errors->any()) <div> <strong>Terjadi kesalahan:</strong>

```
    <ul>
        @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
</div>
```

@endif

<form
    action="{{ route('vehicle-prices.store') }}"
    method="POST"
>
    @csrf

```
<div>
    <label for="vehicle_id">
        Kendaraan
    </label>

    <br>

    <select
        name="vehicle_id"
        id="vehicle_id"
        required
    >
        <option value="">
            -- Pilih Kendaraan --
        </option>

        @foreach ($vehicles as $vehicle)
            <option
                value="{{ $vehicle->id }}"
                {{ old('vehicle_id') == $vehicle->id ? 'selected' : '' }}
            >
                {{ $vehicle->name }}
                - {{ $vehicle->license_plate }}
            </option>
        @endforeach
    </select>
</div>

<br>

<div>
    <label for="price_per_day">
        Harga Sewa per Hari
    </label>

    <br>

    <input
        type="number"
        name="price_per_day"
        id="price_per_day"
        value="{{ old('price_per_day') }}"
        min="0"
        step="0.01"
        required
        placeholder="350000"
    >
</div>

<br>

<div>
    <label for="start_date">
        Tanggal Mulai
    </label>

    <br>

    <input
        type="date"
        name="start_date"
        id="start_date"
        value="{{ old('start_date') }}"
    >
</div>

<br>

<div>
    <label for="end_date">
        Tanggal Selesai
    </label>

    <br>

    <input
        type="date"
        name="end_date"
        id="end_date"
        value="{{ old('end_date') }}"
    >
</div>

<br>

<div>
    <label>
        <input
            type="checkbox"
            name="is_active"
            value="1"
            {{ old('is_active', true) ? 'checked' : '' }}
        >

        Aktif
    </label>
</div>

<br>

<button type="submit">
    Simpan Harga
</button>

<a href="{{ route('vehicle-prices.index') }}">
    Batal
</a>
```

</form>

</body>
</html>
