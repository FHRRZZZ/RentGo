<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Harga Kendaraan</title>
</head>
<body>

<h1>Detail Harga Kendaraan</h1>

@if (session('success')) <div>
{{ session('success') }} </div>
@endif

<hr>

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

<h2>Informasi Harga</h2>

<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Harga per Hari</th>
        <td>
            Rp {{ number_format($vehiclePrice->price_per_day, 0, ',', '.') }}
        </td>
    </tr>

```
<tr>
    <th>Tanggal Mulai</th>
    <td>
        {{ $vehiclePrice->start_date?->format('d-m-Y') ?? 'Tidak terbatas' }}
    </td>
</tr>

<tr>
    <th>Tanggal Selesai</th>
    <td>
        {{ $vehiclePrice->end_date?->format('d-m-Y') ?? 'Tidak terbatas' }}
    </td>
</tr>

<tr>
    <th>Status</th>
    <td>
        @if ($vehiclePrice->is_active)
            Aktif
        @else
            Tidak Aktif
        @endif
    </td>
</tr>

<tr>
    <th>Dibuat</th>
    <td>
        {{ $vehiclePrice->created_at?->format('d-m-Y H:i') ?? '-' }}
    </td>
</tr>

<tr>
    <th>Diperbarui</th>
    <td>
        {{ $vehiclePrice->updated_at?->format('d-m-Y H:i') ?? '-' }}
    </td>
</tr>
```

</table>

<br>

@can('update', $vehiclePrice) <a href="{{ route('vehicle-prices.edit', $vehiclePrice) }}">
Edit </a>
@endif

  |  

<a href="{{ route('vehicle-prices.index') }}">
    Kembali
</a>

</body>
</html>
