<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">

```
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Catat Kerusakan - RentGo</title>

<style>
    body {
        font-family: Arial, sans-serif;
        background: #f5f6f8;
        padding: 30px;
    }

    .container {
        max-width: 800px;
        margin: auto;
    }

    .card {
        background: white;
        padding: 25px;
        border-radius: 12px;
    }

    .form-group {
        margin-bottom: 18px;
    }

    label {
        display: block;
        margin-bottom: 7px;
        font-weight: bold;
    }

    input,
    textarea,
    select {
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
    }

    textarea {
        min-height: 100px;
    }

    .btn {
        padding: 10px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }

    .btn-primary {
        background: #2563eb;
        color: white;
    }

    .error {
        color: #dc2626;
        margin-bottom: 15px;
    }

    .info {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }
</style>
```

</head>

<body>

<div class="container">

```
<div class="card">

    <h1>Catat Kerusakan Kendaraan</h1>

    @if ($errors->any())
        <div class="error">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if ($booking)

        <div class="info">
            <strong>Booking:</strong>
            {{ $booking->booking_number }}

            <br>

            <strong>Customer:</strong>
            {{ $booking->customer?->name ?? '-' }}

            <br>

            <strong>Check-in:</strong>
            {{ $rentalCheckin?->checkin_at?->format('d M Y H:i') ?? '-' }}
        </div>

        <form
            action="{{ route('rental-damages.store') }}"
            method="POST"
            enctype="multipart/form-data"
        >
            @csrf

            <input
                type="hidden"
                name="booking_id"
                value="{{ $booking->id }}"
            >

            <input
                type="hidden"
                name="rental_checkin_id"
                value="{{ $rentalCheckin->id }}"
            >

            <div class="form-group">
                <label for="vehicle_id">
                    Kendaraan
                </label>

                <select
                    name="vehicle_id"
                    id="vehicle_id"
                    required
                >

                    @foreach($booking->items as $item)

                        <option
                            value="{{ $item->vehicle_id }}"
                            @selected(
                                $item->vehicle_id
                                == $rentalCheckin->vehicle_id
                            )
                        >
                            {{ $item->vehicle?->name ?? '-' }}
                            -
                            {{ $item->vehicle?->license_plate ?? '-' }}
                        </option>

                    @endforeach

                </select>
            </div>

            <div class="form-group">
                <label for="description">
                    Deskripsi Kerusakan
                </label>

                <textarea
                    name="description"
                    id="description"
                    required
                >{{ old('description') }}</textarea>
            </div>

            <div class="form-group">
                <label for="location">
                    Lokasi Kerusakan
                </label>

                <input
                    type="text"
                    name="location"
                    id="location"
                    value="{{ old('location') }}"
                    placeholder="Contoh: Pintu kanan depan"
                >
            </div>

            <div class="form-group">
                <label for="severity">
                    Tingkat Kerusakan
                </label>

                <select
                    name="severity"
                    id="severity"
                    required
                >
                    <option value="">
                        Pilih
                    </option>

                    <option
                        value="minor"
                        @selected(old('severity') === 'minor')
                    >
                        Minor
                    </option>

                    <option
                        value="moderate"
                        @selected(old('severity') === 'moderate')
                    >
                        Moderate
                    </option>

                    <option
                        value="major"
                        @selected(old('severity') === 'major')
                    >
                        Major
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label for="photos">
                    Foto Kerusakan
                </label>

                <input
                    type="file"
                    name="photos[]"
                    id="photos"
                    multiple
                    accept="image/*"
                >
            </div>

            <div class="form-group">
                <label for="repair_cost">
                    Estimasi Biaya Perbaikan
                </label>

                <input
                    type="number"
                    name="repair_cost"
                    id="repair_cost"
                    min="0"
                    step="0.01"
                    value="{{ old('repair_cost', 0) }}"
                    required
                >
            </div>

            <div class="form-group">
                <label for="customer_charge">
                    Biaya Dibebankan ke Customer
                </label>

                <input
                    type="number"
                    name="customer_charge"
                    id="customer_charge"
                    min="0"
                    step="0.01"
                    value="{{ old('customer_charge', 0) }}"
                    required
                >
            </div>

            <div class="form-group">

                <input
                    type="hidden"
                    name="deducted_from_deposit"
                    value="0"
                >

                <label>
                    <input
                        type="checkbox"
                        name="deducted_from_deposit"
                        value="1"
                        style="width:auto"
                        @checked(old('deducted_from_deposit') == '1')
                    >

                    Potong dari deposit customer
                </label>

            </div>

            <div class="form-group">
                <label for="status">
                    Status
                </label>

                <select
                    name="status"
                    id="status"
                    required
                >
                    <option value="reported"
                        @selected(old('status', 'reported') === 'reported')
                    >
                        Reported
                    </option>

                    <option value="confirmed"
                        @selected(old('status') === 'confirmed')
                    >
                        Confirmed
                    </option>

                    <option value="resolved"
                        @selected(old('status') === 'resolved')
                    >
                        Resolved
                    </option>

                    <option value="rejected"
                        @selected(old('status') === 'rejected')
                    >
                        Rejected
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label for="notes">
                    Catatan
                </label>

                <textarea
                    name="notes"
                    id="notes"
                >{{ old('notes') }}</textarea>
            </div>

            <button
                type="submit"
                class="btn btn-primary"
            >
                Simpan Kerusakan
            </button>

        </form>

    @else

        <p>
            Silakan buka halaman ini dari booking yang
            sudah berstatus returned.
        </p>

    @endif

</div>
```

</div>

</body>
</html>
