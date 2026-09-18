<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Harga Kendaraan</title>
</head>
<body>

<h1>Edit Harga Kendaraan</h1>

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

<h2>Informasi Kendaraan</h2>

<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Nama Kendaraan</th>
        <td>
            {{ $vehiclePrice->vehicle?->name ?? '-' }}
        </td>
    </tr>

```
<tr>
    <th>Plat Nomor</th>
    <td>
        {{ $vehiclePrice->vehicle?->license_plate ?? '-' }}
    </td>
</tr>

<tr>
    <th>Mitra</th>
    <td>
        {{ $vehiclePrice->vehicle?->agentProfile?->agency_name ?? '-' }}
    </td>
</tr>
```

</table>

<br>

<form
    action="{{ route('vehicle-prices.update', $vehiclePrice) }}"
    method="POST"
>
    @csrf
    @method('PUT')

```
<div>
    <label for="price_per_day">
        Harga Sewa per Hari
    </label>

    <br>

    <input
        type="number"
        name="price_per_day"
        id="price_per_day"
        value="{{ old('price_per_day', $vehiclePrice->price_per_day) }}"
        min="0"
        step="0.01"
        required
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
        value="{{ old('start_date', $vehiclePrice->start_date?->format('Y-m-d')) }}"
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
        value="{{ old('end_date', $vehiclePrice->end_date?->format('Y-m-d')) }}"
    >
</div>

<br>

<div>
    <label>
        <input
            type="checkbox"
            name="is_active"
            value="1"
            {{ old('is_active', $vehiclePrice->is_active) ? 'checked' : '' }}
        >

        Aktif
    </label>
</div>

<br>

<button type="submit">
    Simpan Perubahan
</button>

<a href="{{ route('vehicle-prices.show', $vehiclePrice) }}">
    Batal
</a>
```

</form>

</body>
</html>
