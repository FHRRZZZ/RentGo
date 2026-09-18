<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout Kendaraan - RentGo</title>
</head>
<body>
    <h1>Checkout / Pickup Kendaraan</h1>

    <p>
        <a href="{{ route('rental-checkouts.index') }}">
            Kembali ke Daftar Checkout
        </a>
    </p>

    @if($errors->any())
        <div style="color: red;">
            <strong>Terdapat kesalahan:</strong>

            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if($booking)
        <h2>Informasi Booking</h2>

        <table border="1" cellpadding="8" cellspacing="0">
            <tr>
                <th>Nomor Booking</th>
                <td>{{ $booking->booking_number }}</td>
            </tr>

            <tr>
                <th>Customer</th>
                <td>{{ $booking->customer?->name ?? '-' }}</td>
            </tr>

            <tr>
                <th>Status</th>
                <td>{{ $booking->status }}</td>
            </tr>

            <tr>
                <th>Periode Rental</th>
                <td>
                    {{ $booking->rental_start?->format('d-m-Y H:i') }}
                    -
                    {{ $booking->rental_end?->format('d-m-Y H:i') }}
                </td>
            </tr>
        </table>

        <br>

        <form
            action="{{ route('rental-checkouts.store') }}"
            method="POST"
            enctype="multipart/form-data"
        >
            @csrf

            <input
                type="hidden"
                name="booking_id"
                value="{{ $booking->id }}"
            >

            <div>
                <label for="vehicle_id">
                    Kendaraan
                </label>
                <br>

                <select name="vehicle_id" id="vehicle_id" required>
                    <option value="">-- Pilih Kendaraan --</option>

                    @foreach($booking->items as $item)
                        <option
                            value="{{ $item->vehicle_id }}"
                            {{ old('vehicle_id') == $item->vehicle_id
                                ? 'selected'
                                : '' }}
                        >
                            {{ $item->vehicle?->name ?? '-' }}
                            -
                            {{ $item->vehicle?->license_plate ?? '-' }}
                        </option>
                    @endforeach
                </select>
            </div>

            <br>

            <div>
                <label for="checkout_at">
                    Waktu Checkout
                </label>
                <br>

                <input
                    type="datetime-local"
                    name="checkout_at"
                    id="checkout_at"
                    value="{{ old(
                        'checkout_at',
                        now()->format('Y-m-d\TH:i')
                    ) }}"
                    required
                >
            </div>

            <br>

            <div>
                <label for="vehicle_condition">
                    Kondisi Kendaraan
                </label>
                <br>

                <textarea
                    name="vehicle_condition"
                    id="vehicle_condition"
                    rows="5"
                    cols="60"
                    required
                >{{ old('vehicle_condition') }}</textarea>
            </div>

            <br>

            <div>
                <label for="photos">
                    Foto Kondisi Kendaraan
                </label>
                <br>

                <input
                    type="file"
                    name="photos[]"
                    id="photos"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                >

                <small>
                    Format JPG, JPEG, PNG, atau WEBP. Maksimal 5 MB per foto.
                </small>
            </div>

            <br>

            <div>
                <label for="odometer">
                    Odometer
                </label>
                <br>

                <input
                    type="number"
                    name="odometer"
                    id="odometer"
                    min="0"
                    step="0.01"
                    value="{{ old('odometer') }}"
                    required
                >
            </div>

            <br>

            <div>
                <label for="fuel_level">
                    Level Bahan Bakar (%)
                </label>
                <br>

                <input
                    type="number"
                    name="fuel_level"
                    id="fuel_level"
                    min="0"
                    max="100"
                    step="0.01"
                    value="{{ old('fuel_level') }}"
                    required
                >
            </div>

            <br>

            <fieldset>
                <legend>Perlengkapan Kendaraan</legend>

                @php
                    $oldEquipment = old('equipment', []);
                @endphp

                @foreach([
                    'STNK',
                    'Helm',
                    'Kunci kendaraan',
                    'Jas hujan',
                    'Ban serep',
                    'Dongkrak',
                    'Kotak P3K'
                ] as $equipment)
                    <label>
                        <input
                            type="checkbox"
                            name="equipment[]"
                            value="{{ $equipment }}"
                            {{ in_array(
                                $equipment,
                                $oldEquipment,
                                true
                            ) ? 'checked' : '' }}
                        >

                        {{ $equipment }}
                    </label>

                    <br>
                @endforeach
            </fieldset>

            <br>

            <div>
                <label for="notes">
                    Catatan Tambahan
                </label>
                <br>

                <textarea
                    name="notes"
                    id="notes"
                    rows="4"
                    cols="60"
                >{{ old('notes') }}</textarea>
            </div>

            <br>

            <div>
                <label>
                    <input
                        type="hidden"
                        name="customer_confirmed"
                        value="0"
                    >

                    <input
                        type="checkbox"
                        name="customer_confirmed"
                        value="1"
                        required
                    >

                    Customer telah memeriksa dan menyetujui kondisi kendaraan.
                </label>
            </div>

            <br>

            <button type="submit">
                Simpan Checkout
            </button>
        </form>
    @else
        <p>
            Pilih booking yang sudah berstatus
            <strong>confirmed</strong> terlebih dahulu.
        </p>

        <p>
            Gunakan URL seperti:

            <code>
                /rental-checkouts/create?booking_id=1
            </code>
        </p>
    @endif
</body>
</html>