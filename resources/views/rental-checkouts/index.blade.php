<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Checkout Kendaraan - RentGo</title>
</head>
<body>
    <h1>Data Checkout Kendaraan</h1>

    @if(session('success'))
        <div style="color: green;">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div style="color: red;">
            {{ session('error') }}
        </div>
    @endif

    <p>
        <a href="{{ route('dashboard') }}">Dashboard</a>
    </p>

    @if(auth()->user()->hasRole('mitra'))
        <p>
            <a href="{{ route('rental-checkouts.create') }}">
                Catat Checkout Baru
            </a>
        </p>
    @endif

    @if($checkouts->count())
        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Kendaraan</th>
                    <th>Waktu Checkout</th>
                    <th>Kondisi</th>
                    <th>Konfirmasi Customer</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody>
                @foreach($checkouts as $checkout)
                    <tr>
                        <td>
                            {{ $checkouts->firstItem() + $loop->index }}
                        </td>

                        <td>
                            {{ $checkout->booking?->booking_number ?? '-' }}
                        </td>

                        <td>
                            {{ $checkout->booking?->customer?->name ?? '-' }}
                        </td>

                        <td>
                            {{ $checkout->vehicle?->name ?? '-' }}
                        </td>

                        <td>
                            {{ $checkout->checkout_at?->format('d-m-Y H:i') ?? '-' }}
                        </td>

                        <td>
                            {{ \Illuminate\Support\Str::limit(
                                $checkout->vehicle_condition,
                                80
                            ) }}
                        </td>

                        <td>
                            @if($checkout->customer_confirmed)
                                <span style="color: green;">
                                    Sudah dikonfirmasi
                                </span>
                            @else
                                <span style="color: red;">
                                    Belum dikonfirmasi
                                </span>
                            @endif
                        </td>

                        <td>
                            <a href="{{ route(
                                'rental-checkouts.show',
                                $checkout
                            ) }}">
                                Detail
                            </a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            {{ $checkouts->links() }}
        </div>
    @else
        <p>Belum ada data checkout kendaraan.</p>
    @endif
</body>
</html>