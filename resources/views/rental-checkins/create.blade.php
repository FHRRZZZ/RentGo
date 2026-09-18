<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Return Kendaraan - RentGo</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            color: #1f2937;
        }

        .container {
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
        }

        h1 {
            margin-bottom: 5px;
        }

        .subtitle {
            color: #6b7280;
            margin-bottom: 25px;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,.05);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
        }

        .full {
            grid-column: 1 / -1;
        }

        label {
            font-size: 14px;
            font-weight: 600;
        }

        input,
        textarea,
        select {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-family: inherit;
            font-size: 14px;
        }

        textarea {
            min-height: 120px;
            resize: vertical;
        }

        input[type="checkbox"] {
            width: auto;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .info {
            padding: 14px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .label {
            display: block;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .value {
            font-weight: 600;
        }

        .equipment-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 8px;
        }

        .equipment-item {
            display: flex;
            gap: 8px;
            align-items: center;
            padding: 10px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .confirmation {
            padding: 15px;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 8px;
        }

        .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .btn {
            display: inline-block;
            padding: 11px 18px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .errors {
            background: #fee2e2;
            color: #991b1b;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .errors ul {
            margin: 0;
            padding-left: 20px;
        }

        .warning {
            padding: 15px;
            background: #fef3c7;
            color: #92400e;
            border-radius: 8px;
        }

        @media (max-width: 700px) {
            .grid,
            .info-grid,
            .equipment-list {
                grid-template-columns: 1fr;
            }

            .container {
                margin-top: 20px;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Return Kendaraan</h1>

    <p class="subtitle">
        Catat kondisi kendaraan setelah dikembalikan oleh customer.
    </p>

    @if($errors->any())
        <div class="errors">
            <strong>Terdapat kesalahan:</strong>

            <ul>
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if(!$booking)

        <div class="card">
            <div class="warning">
                Silakan buka halaman booking dengan status
                <strong>ongoing</strong> untuk melakukan check-in kendaraan.
            </div>
        </div>

    @else

        <div class="card">

            <h2>Informasi Booking</h2>

            <div class="info-grid">

                <div class="info">
                    <span class="label">Nomor Booking</span>
                    <span class="value">
                        {{ $booking->booking_number }}
                    </span>
                </div>

                <div class="info">
                    <span class="label">Customer</span>
                    <span class="value">
                        {{ $booking->customer?->name ?? '-' }}
                    </span>
                </div>

                <div class="info">
                    <span class="label">Tanggal Mulai</span>
                    <span class="value">
                        {{ $booking->rental_start?->format('d M Y H:i') ?? '-' }}
                    </span>
                </div>

                <div class="info">
                    <span class="label">Rencana Selesai</span>
                    <span class="value">
                        {{ $booking->rental_end?->format('d M Y H:i') ?? '-' }}
                    </span>
                </div>

            </div>

        </div>

        <form
            action="{{ route('rental-checkins.store') }}"
            method="POST"
            enctype="multipart/form-data"
        >

            @csrf

            <input
                type="hidden"
                name="booking_id"
                value="{{ $booking->id }}"
            >

            <div class="card">

                <h2>Kendaraan</h2>

                <div class="form-group">
                    <label for="vehicle_id">
                        Kendaraan *
                    </label>

                    <select
                        name="vehicle_id"
                        id="vehicle_id"
                        required
                    >

                        <option value="">
                            -- Pilih Kendaraan --
                        </option>

                        @foreach($booking->items as $item)

                            <option
                                value="{{ $item->vehicle_id }}"
                                @selected(old('vehicle_id') == $item->vehicle_id)
                            >
                                {{ $item->vehicle?->name ?? 'Kendaraan #' . $item->vehicle_id }}
                            </option>

                        @endforeach

                    </select>
                </div>

            </div>

            <div class="card">

                <h2>Data Pengembalian</h2>

                <div class="grid">

                    <div class="form-group">
                        <label for="checkin_at">
                            Waktu Check-in *
                        </label>

                        <input
                            type="datetime-local"
                            name="checkin_at"
                            id="checkin_at"
                            value="{{ old('checkin_at', now()->format('Y-m-d\TH:i')) }}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="odometer">
                            Odometer Akhir *
                        </label>

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

                    <div class="form-group">
                        <label for="fuel_level">
                            Level Bahan Bakar (%) *
                        </label>

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

                    <div class="form-group">
                        <label for="photos">
                            Foto Kendaraan
                        </label>

                        <input
                            type="file"
                            name="photos[]"
                            id="photos"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                        >

                        <small>
                            Maksimal 5 MB per foto.
                        </small>
                    </div>

                    <div class="form-group full">

                        <label for="vehicle_condition">
                            Kondisi Kendaraan *
                        </label>

                        <textarea
                            name="vehicle_condition"
                            id="vehicle_condition"
                            required
                            placeholder="Contoh: Kendaraan kembali dalam kondisi baik. Tidak ditemukan kerusakan baru."
                        >{{ old('vehicle_condition') }}</textarea>

                    </div>

                </div>

            </div>

            <div class="card">

                <h2>Perlengkapan Kendaraan</h2>

                <div class="equipment-list">

                    @php
                        $equipmentOptions = [
                            'STNK',
                            'Kunci kendaraan',
                            'Helm',
                            'Ban serep',
                            'Dongkrak',
                            'Tool kit',
                            'Spion',
                            'Dokumen kendaraan',
                        ];

                        $oldEquipment = old('equipment', []);
                    @endphp

                    @foreach($equipmentOptions as $equipment)

                        <label class="equipment-item">

                            <input
                                type="checkbox"
                                name="equipment[]"
                                value="{{ $equipment }}"
                                @checked(in_array($equipment, $oldEquipment))
                            >

                            {{ $equipment }}

                        </label>

                    @endforeach

                </div>

            </div>

            <div class="card">

                <div class="form-group">

                    <label for="notes">
                        Catatan
                    </label>

                    <textarea
                        name="notes"
                        id="notes"
                        placeholder="Catatan tambahan mengenai pengembalian kendaraan..."
                    >{{ old('notes') }}</textarea>

                </div>

            </div>

            <div class="card">

                <div class="confirmation">

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
                            @checked(old('customer_confirmed'))
                            required
                        >

                        Customer telah mengonfirmasi kondisi kendaraan
                        saat pengembalian.
                    </label>

                </div>

                <div class="actions">

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        Simpan Check-in
                    </button>

                    <a
                        href="{{ route('bookings.show', $booking) }}"
                        class="btn btn-secondary"
                    >
                        Batal
                    </a>

                </div>

            </div>

        </form>

    @endif

</div>

</body>
</html>