<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Ketersediaan</title>
</head>
<body>

```
<h1>Detail Ketersediaan Kendaraan</h1>

<p>
    <strong>Kendaraan:</strong>
    {{ $vehicleAvailability->vehicle?->name ?? '-' }}
</p>

<p>
    <strong>Nomor Polisi:</strong>
    {{ $vehicleAvailability->vehicle?->license_plate ?? '-' }}
</p>

<p>
    <strong>Mitra:</strong>
    {{ $vehicleAvailability->vehicle?->agentProfile?->agency_name ?? '-' }}
</p>

<p>
    <strong>Tanggal Mulai:</strong>
    {{ $vehicleAvailability->start_date?->format('d-m-Y') }}
</p>

<p>
    <strong>Tanggal Selesai:</strong>
    {{ $vehicleAvailability->end_date?->format('d-m-Y') }}
</p>

<p>
    <strong>Status:</strong>
    {{ $vehicleAvailability->status }}
</p>

<p>
    <strong>Catatan:</strong><br>
    {{ $vehicleAvailability->notes ?? '-' }}
</p>

<hr>

<a href="{{ route('vehicle-availabilities.edit', $vehicleAvailability) }}">
    Edit
</a>

|

<a href="{{ route('vehicle-availabilities.index') }}">
    Kembali
</a>
```

</body>
</html>
