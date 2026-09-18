<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

```
<title>Buat Booking - RentGo</title>

<style>
    body {
        font-family: Arial, sans-serif;
        background: #f5f6f8;
        margin: 0;
        padding: 30px;
    }

    .container {
        max-width: 800px;
        margin: auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 10px;
    }

    h1 {
        margin-top: 0;
    }

    .section {
        margin-bottom: 25px;
    }

    label {
        display: block;
        margin-bottom: 6px;
        font-weight: bold;
    }

    input,
    textarea,
    select {
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 6px;
    }

    textarea {
        min-height: 100px;
        resize: vertical;
    }

    .vehicle-info {
        padding: 15px;
        background: #f1f5f9;
        border-radius: 8px;
    }

    .vehicle-info p {
        margin: 7px 0;
    }

    .error {
        background: #fee2e2;
        color: #991b1b;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
    }

    .actions {
        display: flex;
        gap: 10px;
        margin-top: 25px;
    }

    button,
    .back {
        display: inline-block;
        padding: 11px 18px;
        border-radius: 6px;
        text-decoration: none;
        border: none;
        cursor: pointer;
    }

    button {
        background: #2563eb;
        color: white;
    }

    .back {
        background: #e5e7eb;
        color: #111827;
    }
</style>
```

</head>

<body>

<div class="container">

```
<h1>Buat Booking</h1>

@if ($errors->any())
    <div class="error">
        <strong>Terjadi kesalahan:</strong>

        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

@if ($vehicle)

    <div class="section">
        <h2>Kendaraan yang Dipilih</h2>

        <div class="vehicle-info">

            <p>
                <strong>Nama:</strong>
                {{ $vehicle->name }}
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
                <strong>Lokasi:</strong>
                {{ $vehicle->pickup_location ?? '-' }}
            </p>

            <p>
                <strong>Status:</strong>
                {{ $vehicle->status }}
            </p>

        </div>
    </div>

    <form
        action="{{ route('bookings.store') }}"
        method="POST"
    >

        @csrf

        <input
            type="hidden"
            name="vehicle_id"
            value="{{ $vehicle->id }}"
        >

        <div class="section">

            <h2>Periode Sewa</h2>

            <div>
                <label for="rental_start">
                    Tanggal Mulai
                </label>

                <input
                    type="date"
                    id="rental_start"
                    name="rental_start"
                    value="{{ old('rental_start', $rentalStart) }}"
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
                    value="{{ old('rental_end', $rentalEnd) }}"
                    min="{{ now()->toDateString() }}"
                    required
                >
            </div>

        </div>

        <div class="section">

            <h2>Metode Pengambilan</h2>

            <label for="fulfillment_type">
                Pilih Metode
            </label>

            <select
                id="fulfillment_type"
                name="fulfillment_type"
                required
            >
                <option value="">
                    -- Pilih Metode --
                </option>

                <option
                    value="self_pickup"
                    {{ old('fulfillment_type') === 'self_pickup' ? 'selected' : '' }}
                >
                    Self Pickup
                </option>

                <option
                    value="delivery"
                    {{ old('fulfillment_type') === 'delivery' ? 'selected' : '' }}
                >
                    Delivery
                </option>
            </select>

        </div>

        <div class="section">

            <label for="pickup_location">
                Lokasi Pickup
            </label>

            <input
                type="text"
                id="pickup_location"
                name="pickup_location"
                value="{{ old('pickup_location', $vehicle->pickup_location) }}"
                maxlength="255"
            >

        </div>

        <div class="section">

            <label for="delivery_address">
                Alamat Pengantaran
            </label>

            <textarea
                id="delivery_address"
                name="delivery_address"
                maxlength="1000"
            >{{ old('delivery_address') }}</textarea>

            <small>
                Wajib diisi jika memilih Delivery.
            </small>

        </div>

        <div class="section">

            <label for="customer_note">
                Catatan
            </label>

            <textarea
                id="customer_note"
                name="customer_note"
                maxlength="1000"
            >{{ old('customer_note') }}</textarea>

        </div>

        <div class="actions">

            <button type="submit">
                Buat Booking
            </button>

            <a
                href="{{ route('vehicles.show', $vehicle) }}"
                class="back"
            >
                Kembali
            </a>

        </div>

    </form>

@else

    <div class="error">
        Kendaraan belum dipilih.
    </div>

    <a
        href="{{ route('vehicles.index') }}"
        class="back"
    >
        Pilih Kendaraan
    </a>

@endif
```

</div>

</body>
</html>
