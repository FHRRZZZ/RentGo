<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Check-in - RentGo</title>

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
            max-width: 1000px;
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
            gap: 15px;
        }

        .info {
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .label {
            display: block;
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 6px;
        }

        .value {
            font-weight: 600;
        }

        .badge {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .condition {
            white-space: pre-line;
            line-height: 1.6;
        }

        .equipment {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .equipment-item {
            background: #f3f4f6;
            padding: 7px 10px;
            border-radius: 6px;
            font-size: 13px;
        }

        .photos {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        .photos img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
        }

        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .alert-success {
            background: #dcfce7;
            color: #166534;
        }

        .alert-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .amount {
            font-size: 20px;
            font-weight: 700;
        }

        .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-block;
            padding: 11px 18px;
            border-radius: 8px;
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

        @media (max-width: 700px) {
            .grid,
            .photos {
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

    <h1>Detail Rental Check-in</h1>

    <p class="subtitle">
        Informasi pengembalian kendaraan.
    </p>

    @if(session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    @if($rentalCheckin->is_late_return)

        <div class="alert alert-warning">
            <strong>Pengembalian terlambat.</strong>

            Kendaraan dikembalikan melewati waktu rental yang telah ditentukan.
        </div>

    @endif

    <div class="card">

        <h2>Informasi Check-in</h2>

        <div class="grid">

            <div class="info">
                <span class="label">
                    Nomor Booking
                </span>

                <span class="value">
                    {{ $rentalCheckin->booking?->booking_number ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Kendaraan
                </span>

                <span class="value">
                    {{ $rentalCheckin->vehicle?->name ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Customer
                </span>

                <span class="value">
                    {{ $rentalCheckin->booking?->customer?->name ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Waktu Check-in
                </span>

                <span class="value">
                    {{ $rentalCheckin->checkin_at?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Odometer Akhir
                </span>

                <span class="value">
                    {{ number_format((float) $rentalCheckin->odometer, 0, ',', '.') }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Bahan Bakar
                </span>

                <span class="value">
                    {{ $rentalCheckin->fuel_level }}%
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Status Pengembalian
                </span>

                <span class="value">

                    @if($rentalCheckin->is_late_return)

                        <span class="badge badge-danger">
                            Terlambat
                        </span>

                    @else

                        <span class="badge badge-success">
                            Tepat Waktu
                        </span>

                    @endif

                </span>
            </div>

            <div class="info">
                <span class="label">
                    Konfirmasi Customer
                </span>

                <span class="value">

                    @if($rentalCheckin->customer_confirmed)

                        <span class="badge badge-success">
                            Sudah Dikonfirmasi
                        </span>

                    @else

                        <span class="badge badge-danger">
                            Belum Dikonfirmasi
                        </span>

                    @endif

                </span>
            </div>

        </div>

    </div>

    <div class="card">

        <h2>Biaya Keterlambatan</h2>

        <div class="amount">
            Rp {{ number_format((float) $rentalCheckin->late_return_fee, 0, ',', '.') }}
        </div>

        @if($rentalCheckin->is_late_return)
            <p>
                Biaya ini akan diperhitungkan dalam penyelesaian transaksi.
            </p>
        @else
            <p>
                Tidak terdapat biaya keterlambatan.
            </p>
        @endif

    </div>

    <div class="card">

        <h2>Kondisi Kendaraan</h2>

        <div class="condition">
            {{ $rentalCheckin->vehicle_condition }}
        </div>

    </div>

    <div class="card">

        <h2>Perlengkapan</h2>

        @if(!empty($rentalCheckin->equipment))

            <div class="equipment">

                @foreach($rentalCheckin->equipment as $equipment)

                    <span class="equipment-item">
                        {{ $equipment }}
                    </span>

                @endforeach

            </div>

        @else

            <p>
                Tidak ada data perlengkapan.
            </p>

        @endif

    </div>

    @if(!empty($rentalCheckin->photos))

        <div class="card">

            <h2>Foto Kendaraan</h2>

            <div class="photos">

                @foreach($rentalCheckin->photos as $photo)

                    <img
                        src="{{ asset('storage/' . $photo) }}"
                        alt="Foto kendaraan saat check-in"
                    >

                @endforeach

            </div>

        </div>

    @endif

    @if($rentalCheckin->notes)

        <div class="card">

            <h2>Catatan</h2>

            <div class="condition">
                {{ $rentalCheckin->notes }}
            </div>

        </div>

    @endif

    <div class="card">

        <div class="actions">

            @if($rentalCheckin->booking)

                <a
                    href="{{ route('bookings.show', $rentalCheckin->booking) }}"
                    class="btn btn-primary"
                >
                    Lihat Booking
                </a>

            @endif

            <a
                href="{{ route('rental-checkins.index') }}"
                class="btn btn-secondary"
            >
                Kembali ke Check-in
            </a>

        </div>

    </div>

</div>

</body>
</html>