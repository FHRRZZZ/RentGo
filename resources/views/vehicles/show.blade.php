<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Kendaraan</title>
</head>
<body>

    <h1>Detail Kendaraan</h1>

    <p>
        <strong>Nama:</strong>
        {{ $vehicle->name }}
    </p>

    <p>
        <strong>Slug:</strong>
        {{ $vehicle->slug }}
    </p>

    <p>
        <strong>Jenis:</strong>
        {{ $vehicle->vehicle_type === 'car' ? 'Mobil' : 'Motor' }}
    </p>

    <p>
        <strong>Merek:</strong>
        {{ $vehicle->brand ?? '-' }}
    </p>

    <p>
        <strong>Model:</strong>
        {{ $vehicle->model ?? '-' }}
    </p>

    <p>
        <strong>Tahun:</strong>
        {{ $vehicle->year ?? '-' }}
    </p>

    <p>
        <strong>Nomor Polisi:</strong>
        {{ $vehicle->license_plate }}
    </p>

    <p>
        <strong>Kategori:</strong>
        {{ $vehicle->vehicleCategory?->name ?? '-' }}
    </p>

    <p>
        <strong>Mitra:</strong>
        {{ $vehicle->agentProfile?->agency_name ?? '-' }}
    </p>

    <p>
        <strong>Transmisi:</strong>
        {{ $vehicle->transmission ?? '-' }}
    </p>

    <p>
        <strong>Kapasitas Kursi:</strong>
        {{ $vehicle->seat_capacity ?? '-' }}
    </p>

    <p>
        <strong>Bahan Bakar:</strong>
        {{ $vehicle->fuel_type ?? '-' }}
    </p>

    <p>
        <strong>Warna:</strong>
        {{ $vehicle->color ?? '-' }}
    </p>

    <p>
        <strong>Lokasi Pengambilan:</strong>
        {{ $vehicle->pickup_location ?? '-' }}
    </p>

    <p>
        <strong>Status:</strong>
        {{ $vehicle->status }}
    </p>

    <p>
        <strong>Deskripsi:</strong><br>
        {{ $vehicle->description ?? '-' }}
    </p>

    <p>
        <strong>Syarat Rental:</strong><br>
        {{ $vehicle->rental_requirements ?? '-' }}
    </p>

    <hr>

@if($vehicle->status === 'available')
    <h2>Booking Kendaraan</h2>

    <form action="{{ route('bookings.create') }}" method="GET">

        <input
            type="hidden"
            name="vehicle_id"
            value="{{ $vehicle->id }}"
        >

        <div>
            <label for="rental_start">
                Tanggal Mulai
            </label>

            <input
                type="date"
                id="rental_start"
                name="rental_start"
                min="{{ now()->toDateString() }}"
                required
            >
        </div>

        <br>

        <div>
            <label for="rental_end">
                Tanggal Selesai
            </label>

            <input
                type="date"
                id="rental_end"
                name="rental_end"
                min="{{ now()->toDateString() }}"
                required
            >
        </div>

        <br>

        <button type="submit">
            Pesan Sekarang
        </button>

    </form>
@endif

<hr>

<a href="{{ route('vehicles.edit', $vehicle) }}">
    Edit
</a>

|

<a href="{{ route('vehicles.index') }}">
    Kembali
</a>

</body>
</html>