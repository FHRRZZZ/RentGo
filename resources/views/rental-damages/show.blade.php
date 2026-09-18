<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Detail Kerusakan - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            padding: 30px;
        }

        .container {
            max-width: 900px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 20px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .label {
            display: block;
            color: #666;
            font-size: 13px;
            margin-bottom: 5px;
        }

        .value {
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 5px 9px;
            background: #eee;
            border-radius: 5px;
        }

        .photo-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .photo-grid img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 8px;
        }

        .btn {
            display: inline-block;
            padding: 9px 13px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }

        @media (max-width: 700px) {
            .grid,
            .photo-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

<div class="container">

    @if(session('success'))
        <div class="card">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">

        <h1>Detail Kerusakan Kendaraan</h1>

        <div class="grid">

            <div>
                <span class="label">Booking</span>

                <span class="value">
                    {{ $rentalDamage->booking?->booking_number ?? '-' }}
                </span>
            </div>

            <div>
                <span class="label">Customer</span>

                <span class="value">
                    {{ $rentalDamage->booking?->customer?->name ?? '-' }}
                </span>
            </div>

            <div>
                <span class="label">Kendaraan</span>

                <span class="value">
                    {{ $rentalDamage->vehicle?->name ?? '-' }}
                </span>
            </div>

            <div>
                <span class="label">Nomor Polisi</span>

                <span class="value">
                    {{ $rentalDamage->vehicle?->license_plate ?? '-' }}
                </span>
            </div>

            <div>
                <span class="label">Tingkat Kerusakan</span>

                <span class="badge">
                    {{ ucfirst($rentalDamage->severity) }}
                </span>
            </div>

            <div>
                <span class="label">Status</span>

                <span class="badge">
                    {{ ucfirst($rentalDamage->status) }}
                </span>
            </div>

        </div>

    </div>

    <div class="card">

        <h2>Kerusakan</h2>

        <p>
            {!! nl2br(e($rentalDamage->description)) !!}
        </p>

        <p>
            <strong>Lokasi:</strong>
            {{ $rentalDamage->location ?? '-' }}
        </p>

        <p>
            <strong>Catatan:</strong>
            {!! nl2br(e($rentalDamage->notes ?? '-')) !!}
        </p>

    </div>

    <div class="card">

        <h2>Biaya</h2>

        <div class="grid">

            <div>
                <span class="label">
                    Biaya Perbaikan
                </span>

                <span class="value">
                    Rp
                    {{ number_format(
                        (float) $rentalDamage->repair_cost,
                        0,
                        ',',
                        '.'
                    ) }}
                </span>
            </div>

            <div>
                <span class="label">
                    Dibebankan ke Customer
                </span>

                <span class="value">
                    Rp
                    {{ number_format(
                        (float) $rentalDamage->customer_charge,
                        0,
                        ',',
                        '.'
                    ) }}
                </span>
            </div>

            <div>
                <span class="label">
                    Potong Deposit
                </span>

                <span class="value">
                    {{ $rentalDamage->deducted_from_deposit
                        ? 'Ya'
                        : 'Tidak' }}
                </span>
            </div>

        </div>

    </div>

    @if($rentalDamage->photos)

        <div class="card">

            <h2>Foto Kerusakan</h2>

            <div class="photo-grid">

                @foreach($rentalDamage->photos as $photo)

                    <img
                        src="{{ asset('storage/' . $photo) }}"
                        alt="Foto kerusakan"
                    >

                @endforeach

            </div>

        </div>

    @endif

    <div class="card">

        @if (
            auth()->user()->hasRole('mitra') &&
            $rentalCheckin->booking?->status === 'returned' &&
            $rentalCheckin->booking?->agentProfile?->user_id === auth()->id()
        )
            <a
            href="{{ route(
                'rental-damages.create',
                [
                    'booking_id' => $rentalCheckin->booking_id
                ]
            ) }}"
            class="btn btn-primary"
            >
            Catat Kerusakan
            </a>
        @endif

    <a
            href="{{ route('rental-damages.index') }}"
            class="btn"
        >
            Kembali
        </a>

        @if($rentalDamage->booking)

            <a
                href="{{ route(
                    'bookings.show',
                    $rentalDamage->booking
                ) }}"
                class="btn"
            >
                Lihat Booking
            </a>

        @endif

    </div>

</div>

</body>
</html>