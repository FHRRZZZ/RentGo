<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Checkout - RentGo</title>
</head>
<body>
    <h1>Detail Checkout Kendaraan</h1>

    @if(session('success'))
        <div style="color: green;">
            {{ session('success') }}
        </div>
    @endif

    <p>
        <a href="{{ route('rental-checkouts.index') }}">
            Kembali ke Daftar Checkout
        </a>
    </p>

    <h2>Informasi Checkout</h2>

    <table border="1" cellpadding="8" cellspacing="0">
        <tr>
            <th>Nomor Booking</th>
            <td>
                {{ $rentalCheckout->booking?->booking_number ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Customer</th>
            <td>
                {{ $rentalCheckout->booking?->customer?->name ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Kendaraan</th>
            <td>
                {{ $rentalCheckout->vehicle?->name ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Nomor Polisi</th>
            <td>
                {{ $rentalCheckout->vehicle?->license_plate ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Waktu Checkout</th>
            <td>
                {{ $rentalCheckout->checkout_at?->format('d-m-Y H:i') ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Status Booking</th>
            <td>
                {{ $rentalCheckout->booking?->status ?? '-' }}
            </td>
        </tr>

        <tr>
            <th>Odometer</th>
            <td>
                {{ $rentalCheckout->odometer }}
            </td>
        </tr>

        <tr>
            <th>Level Bahan Bakar</th>
            <td>
                {{ $rentalCheckout->fuel_level }}%
            </td>
        </tr>

        <tr>
            <th>Konfirmasi Customer</th>
            <td>
                @if($rentalCheckout->customer_confirmed)
                    <span style="color: green;">
                        Sudah dikonfirmasi
                    </span>

                    <br>

                    {{ $rentalCheckout->customer_confirmed_at?->format(
                        'd-m-Y H:i'
                    ) }}
                @else
                    <span style="color: red;">
                        Belum dikonfirmasi
                    </span>
                @endif
            </td>
        </tr>
    </table>

    <h2>Kondisi Kendaraan</h2>

    <p>
        {!! nl2br(e($rentalCheckout->vehicle_condition)) !!}
    </p>

    <h2>Perlengkapan</h2>

    @if(!empty($rentalCheckout->equipment))
        <ul>
            @foreach($rentalCheckout->equipment as $equipment)
                <li>{{ $equipment }}</li>
            @endforeach
        </ul>
    @else
        <p>Tidak ada data perlengkapan.</p>
    @endif

    <h2>Catatan</h2>

    <p>
        {!! nl2br(e($rentalCheckout->notes ?? '-')) !!}
    </p>

    <h2>Foto Kondisi Kendaraan</h2>

    @if(!empty($rentalCheckout->photos))
        <div>
            @foreach($rentalCheckout->photos as $photo)
                <div style="display: inline-block; margin: 10px;">
                    <img
                        src="{{ asset('storage/' . $photo) }}"
                        alt="Foto kondisi kendaraan"
                        width="220"
                    >
                </div>
            @endforeach
        </div>
    @else
        <p>Belum ada foto checkout.</p>
    @endif
</body>
</html>