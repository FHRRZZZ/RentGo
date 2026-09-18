<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Detail Booking - RentGo</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            color: #1f2937;
        }

        .container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            gap: 15px;
        }

        h1 {
            margin: 0;
            font-size: 28px;
        }

        h2 {
            margin-top: 0;
            font-size: 20px;
        }

        .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
            font-size: 13px;
            margin-bottom: 5px;
        }

        .value {
            font-weight: 600;
        }

        .status {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
        }

        .status-pending_payment {
            background: #fef3c7;
            color: #92400e;
        }

        .status-paid,
        .status-waiting_agent_confirmation {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-confirmed {
            background: #dcfce7;
            color: #166534;
        }

        .status-rejected,
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-ongoing {
            background: #e0e7ff;
            color: #3730a3;
        }

        .status-returned,
        .status-completed {
            background: #d1fae5;
            color: #065f46;
        }

        .vehicle {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 15px;
        }

        .vehicle:last-child {
            margin-bottom: 0;
        }

        .vehicle-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .price {
            font-size: 18px;
            font-weight: 700;
        }

        .message {
            padding: 14px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .message-success {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .message-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .message-warning {
            background: #fff7ed;
            color: #9a3412;
            border: 1px solid #fed7aa;
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
        }

        select,
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #ffffff;
        }

        textarea {
            min-height: 110px;
            resize: vertical;
        }

        .error {
            color: #dc2626;
            font-size: 13px;
            margin-top: 6px;
        }

        .btn {
            display: inline-block;
            border: none;
            border-radius: 8px;
            padding: 11px 18px;
            text-decoration: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        .btn-primary {
            background: #2563eb;
            color: #ffffff;
        }

        .btn-secondary {
            background: #e5e7eb;
            color: #374151;
        }

        .btn:hover {
            opacity: 0.9;
        }

        .payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .payment-row:last-child {
            border-bottom: none;
        }

        .total {
            display: flex;
            justify-content: space-between;
            font-size: 20px;
            font-weight: 700;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
        }

        .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        @media (max-width: 700px) {
            .grid {
                grid-template-columns: 1fr;
            }

            .header {
                align-items: flex-start;
                flex-direction: column;
            }

            .payment-row,
            .total {
                gap: 15px;
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>

<body>

<div class="container">

    {{-- HEADER --}}
    <div class="header">
        <div>
            <h1>Detail Booking</h1>

            <p style="margin: 6px 0 0; color: #6b7280;">
                {{ $booking->booking_number }}
            </p>
        </div>

        <span class="status status-{{ $booking->status }}">
            {{ ucwords(str_replace('_', ' ', $booking->status)) }}
        </span>
    </div>


    {{-- FLASH MESSAGE --}}
    @if (session('success'))
        <div class="message message-success">
            {{ session('success') }}
        </div>
    @endif

    @if (session('error'))
        <div class="message message-error">
            {{ session('error') }}
        </div>
    @endif


    {{-- ERROR VALIDATION --}}
    @if ($errors->any())
        <div class="message message-error">
            <strong>Terjadi kesalahan:</strong>

            <ul style="margin-bottom: 0;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif


    {{-- INFORMASI BOOKING --}}
    <div class="card">
        <h2>Informasi Booking</h2>

        <div class="grid">

            <div class="info">
                <span class="label">Nomor Booking</span>
                <span class="value">
                    {{ $booking->booking_number }}
                </span>
            </div>

            <div class="info">
                <span class="label">Status</span>
                <span class="value">
                    {{ ucwords(str_replace('_', ' ', $booking->status)) }}
                </span>
            </div>

            <div class="info">
                <span class="label">Mulai Rental</span>
                <span class="value">
                    {{ $booking->rental_start?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">Selesai Rental</span>
                <span class="value">
                    {{ $booking->rental_end?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">Metode Pengambilan</span>
                <span class="value">
                    {{ $booking->fulfillment_type === 'delivery'
                        ? 'Delivery'
                        : 'Self Pickup' }}
                </span>
            </div>

            <div class="info">
                <span class="label">Tanggal Booking</span>
                <span class="value">
                    {{ $booking->created_at?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

        </div>

        @if ($booking->pickup_location)
            <div style="margin-top: 15px;">
                <span class="label">Lokasi Pickup</span>
                <div>
                    {{ $booking->pickup_location }}
                </div>
            </div>
        @endif

        @if ($booking->delivery_address)
            <div style="margin-top: 15px;">
                <span class="label">Alamat Delivery</span>
                <div>
                    {{ $booking->delivery_address }}
                </div>
            </div>
        @endif

        @if ($booking->customer_note)
            <div style="margin-top: 15px;">
                <span class="label">Catatan Customer</span>
                <div>
                    {{ $booking->customer_note }}
                </div>
            </div>
        @endif

        @if ($booking->agent_note)
            <div style="margin-top: 15px;">
                <span class="label">Catatan Mitra</span>
                <div>
                    {{ $booking->agent_note }}
                </div>
            </div>
        @endif
    </div>


    {{-- CUSTOMER --}}
    @if ($booking->customer)
        <div class="card">
            <h2>Informasi Customer</h2>

            <div class="grid">

                <div class="info">
                    <span class="label">Nama</span>
                    <span class="value">
                        {{ $booking->customer->name }}
                    </span>
                </div>

                <div class="info">
                    <span class="label">Email</span>
                    <span class="value">
                        {{ $booking->customer->email }}
                    </span>
                </div>

            </div>
        </div>
    @endif


    {{-- MITRA --}}
    @if ($booking->agentProfile)
        <div class="card">
            <h2>Informasi Mitra</h2>

            <div class="grid">

                <div class="info">
                    <span class="label">Nama Agency</span>
                    <span class="value">
                        {{ $booking->agentProfile->agency_name ?? '-' }}
                    </span>
                </div>

                <div class="info">
                    <span class="label">Kota</span>
                    <span class="value">
                        {{ $booking->agentProfile->city ?? '-' }}
                    </span>
                </div>

            </div>
        </div>
    @endif


    {{-- KENDARAAN --}}
    <div class="card">
        <h2>Kendaraan</h2>

        @forelse ($booking->items as $item)

            <div class="vehicle">

                <div class="vehicle-title">
                    {{ $item->vehicle?->name ?? 'Kendaraan' }}
                </div>

                <div style="color: #6b7280; margin-bottom: 12px;">
                    {{ $item->vehicle?->brand ?? '-' }}
                    {{ $item->vehicle?->model ?? '' }}
                </div>

                <div class="grid">

                    <div class="info">
                        <span class="label">Tanggal Rental</span>
                        <span class="value">
                            {{ $item->rental_start?->format('d M Y') ?? '-' }}
                            -
                            {{ $item->rental_end?->format('d M Y') ?? '-' }}
                        </span>
                    </div>

                    <div class="info">
                        <span class="label">Jumlah Hari</span>
                        <span class="value">
                            {{ $item->days }} hari
                        </span>
                    </div>

                    <div class="info">
                        <span class="label">Harga / Hari</span>
                        <span class="value">
                            Rp {{ number_format($item->price_per_day, 0, ',', '.') }}
                        </span>
                    </div>

                    <div class="info">
                        <span class="label">Subtotal</span>
                        <span class="price">
                            Rp {{ number_format($item->amount, 0, ',', '.') }}
                        </span>
                    </div>

                </div>

            </div>

        @empty

            <p style="color: #6b7280;">
                Tidak ada kendaraan dalam booking ini.
            </p>

        @endforelse
    </div>


    {{-- RINGKASAN HARGA --}}
    <div class="card">
        <h2>Ringkasan Pembayaran</h2>

        <div class="payment-row">
            <span>Rental</span>
            <strong>
                Rp {{ number_format($booking->rental_amount, 0, ',', '.') }}
            </strong>
        </div>

        <div class="payment-row">
            <span>Delivery</span>
            <strong>
                Rp {{ number_format($booking->delivery_fee, 0, ',', '.') }}
            </strong>
        </div>

        <div class="payment-row">
            <span>Service Fee</span>
            <strong>
                Rp {{ number_format($booking->service_fee, 0, ',', '.') }}
            </strong>
        </div>

        <div class="payment-row">
            <span>Biaya Tambahan</span>
            <strong>
                Rp {{ number_format($booking->additional_fee, 0, ',', '.') }}
            </strong>
        </div>

        <div class="payment-row">
            <span>Deposit</span>
            <strong>
                Rp {{ number_format($booking->deposit_amount, 0, ',', '.') }}
            </strong>
        </div>

        <div class="total">
            <span>Total</span>

            <span>
                Rp {{ number_format($booking->total_amount, 0, ',', '.') }}
            </span>
        </div>
    </div>


    {{-- PAYMENT --}}
    @if ($booking->payments->count())
        <div class="card">
            <h2>Pembayaran</h2>

            @foreach ($booking->payments as $payment)

                <div class="payment-row">

                    <div>
                        <strong>
                            {{ $payment->payment_number }}
                        </strong>

                        <div style="
                            color: #6b7280;
                            font-size: 13px;
                            margin-top: 5px;
                        ">
                            {{ strtoupper($payment->payment_method) }}
                        </div>
                    </div>

                    <div style="text-align: right;">

                        <strong>
                            Rp {{ number_format($payment->amount, 0, ',', '.') }}
                        </strong>

                        <div style="margin-top: 5px;">
                            <span class="status status-{{ $payment->status }}">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </div>

                    </div>

                </div>

            @endforeach
        </div>
    @endif


    {{-- KONFIRMASI MITRA --}}
    @if (
        auth()->user()->hasRole('mitra') &&
        $booking->status === 'waiting_agent_confirmation' &&
        $booking->agentProfile?->user_id === auth()->id()
    )

        <div class="card">

            <h2>Konfirmasi Booking</h2>

            <p style="color: #6b7280;">
                Booking ini sudah dibayar oleh customer dan
                menunggu konfirmasi dari Anda.
            </p>

            <div class="message message-warning">
                <strong>Perhatian</strong>

                <p style="margin-bottom: 0;">
                    Pastikan kendaraan tersedia pada tanggal rental
                    sebelum menerima booking.
                </p>
            </div>

            <form
                action="{{ route('bookings.confirm', $booking) }}"
                method="POST"
            >
                @csrf

                <div class="form-group">

                    <label for="status">
                        Keputusan
                    </label>

                    <select
                        id="status"
                        name="status"
                        required
                    >
                        <option value="">
                            -- Pilih Keputusan --
                        </option>

                        <option value="confirmed">
                            Terima Booking
                        </option>

                        <option value="rejected">
                            Tolak Booking
                        </option>
                    </select>

                    @error('status')
                        <div class="error">
                            {{ $message }}
                        </div>
                    @enderror

                </div>


                <div class="form-group">

                    <label for="agent_note">
                        Catatan Mitra
                    </label>

                    <textarea
                        id="agent_note"
                        name="agent_note"
                        placeholder="Contoh: Kendaraan tersedia dan siap digunakan."
                    >{{ old('agent_note') }}</textarea>

                    @error('agent_note')
                        <div class="error">
                            {{ $message }}
                        </div>
                    @enderror

                </div>


                <button
                    type="submit"
                    class="btn btn-primary"
                    onclick="
                        return confirm(
                            'Apakah Anda yakin dengan keputusan ini?'
                        );
                    "
                >
                    Simpan Keputusan
                </button>

            </form>

        </div>

    @endif


    {{-- RENTAL CHECKOUT --}}
@if ($booking->rentalCheckout)

    <div class="card">

        <h2>Checkout / Pickup Kendaraan</h2>

        <div class="grid">

            <div class="info">
                <span class="label">Waktu Checkout</span>
                <span class="value">
                    {{ $booking->rentalCheckout->checkout_at?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">Odometer</span>
                <span class="value">
                    {{ $booking->rentalCheckout->odometer }}
                </span>
            </div>

            <div class="info">
                <span class="label">Bahan Bakar</span>
                <span class="value">
                    {{ $booking->rentalCheckout->fuel_level }}%
                </span>
            </div>

            <div class="info">
                <span class="label">Konfirmasi Customer</span>
                <span class="value">
                    @if ($booking->rentalCheckout->customer_confirmed)
                        <span style="color: #166534;">
                            Sudah Dikonfirmasi
                        </span>
                    @else
                        <span style="color: #991b1b;">
                            Belum Dikonfirmasi
                        </span>
                    @endif
                </span>
            </div>

        </div>

        <div style="margin-top: 15px;">
            <span class="label">Kondisi Kendaraan</span>

            <div>
                {!! nl2br(e(
                    $booking->rentalCheckout->vehicle_condition
                )) !!}
            </div>
        </div>

        <div style="margin-top: 15px;">
            <a
                href="{{ route(
                    'rental-checkouts.show',
                    $booking->rentalCheckout
                ) }}"
                class="btn btn-primary"
            >
                Lihat Detail Checkout
            </a>
        </div>

    </div>

@endif

    {{-- RENTAL CHECK-IN / RETURN --}}
@if ($booking->rentalCheckin)

    <div class="card">

        <h2>Check-in / Return Kendaraan</h2>

        <div class="grid">

            <div class="info">
                <span class="label">
                    Waktu Check-in
                </span>

                <span class="value">
                    {{ $booking->rentalCheckin->checkin_at?->format('d M Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Odometer Akhir
                </span>

                <span class="value">
                    {{ number_format((float) $booking->rentalCheckin->odometer, 0, ',', '.') }}
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Bahan Bakar
                </span>

                <span class="value">
                    {{ $booking->rentalCheckin->fuel_level }}%
                </span>
            </div>

            <div class="info">
                <span class="label">
                    Status Pengembalian
                </span>

                <span class="value">

                    @if ($booking->rentalCheckin->is_late_return)

                        <span style="color: #991b1b;">
                            Terlambat
                        </span>

                    @else

                        <span style="color: #166534;">
                            Tepat Waktu
                        </span>

                    @endif

                </span>
            </div>

        </div>

        <div style="margin-top: 15px;">

            <span class="label">
                Biaya Keterlambatan
            </span>

            <strong>
                Rp
                {{ number_format(
                    (float) $booking->rentalCheckin->late_return_fee,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>

        </div>

        <div style="margin-top: 15px;">

            <span class="label">
                Kondisi Kendaraan
            </span>

            <div>
                {!! nl2br(
                    e($booking->rentalCheckin->vehicle_condition)
                ) !!}
            </div>

        </div>

        <div style="margin-top: 15px;">

            <a
                href="{{ route(
                    'rental-checkins.show',
                    $booking->rentalCheckin
                ) }}"
                class="btn btn-primary"
            >
                Lihat Detail Check-in
            </a>

        </div>

    </div>

@endif

    @if ($booking->rentalDamages->isNotEmpty())
    <div class="card">

        <h2>Kerusakan Kendaraan</h2>

        @foreach ($booking->rentalDamages as $damage)

            <div
                style="
                    padding: 15px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    margin-bottom: 10px;
                "
            >

                <strong>
                    {{ $damage->vehicle?->name ?? '-' }}
                </strong>

                <div style="margin-top: 8px;">
                    {{ $damage->description }}
                </div>

                <div style="margin-top: 8px;">
                    Tingkat:
                    <strong>
                        {{ ucfirst($damage->severity) }}
                    </strong>
                </div>

                <div style="margin-top: 8px;">
                    Biaya Customer:

                    <strong>
                        Rp
                        {{ number_format(
                            (float) $damage->customer_charge,
                            0,
                            ',',
                            '.'
                        ) }}
                    </strong>
                </div>

                <div style="margin-top: 10px;">
                    <a
                        href="{{ route(
                            'rental-damages.show',
                            $damage
                        ) }}"
                        class="btn btn-primary"
                    >
                        Lihat Detail
                    </a>
                </div>

            </div>

        @endforeach

    </div>
@endif

    

    @if ($booking->transaction)
    <div class="card">
        <h2>Transaksi</h2>

        <p>
            <strong>No. Transaksi:</strong>
            {{ $booking->transaction->transaction_number }}
        </p>

        <p>
            <strong>Total:</strong>
            Rp {{ number_format(
                (float) $booking->transaction->total_amount,
                0,
                ',',
                '.'
            ) }}
        </p>

        <p>
            <strong>Status:</strong>
            {{ ucfirst($booking->transaction->status) }}
        </p>

        <a
            href="{{ route(
                'transactions.show',
                $booking->transaction
            ) }}"
            class="btn btn-primary"
        >
            Lihat Transaksi
        </a>
    </div>
@elseif (
    auth()->user()->hasRole('mitra') &&
    $booking->status === 'returned' &&
    $booking->agentProfile?->user_id === auth()->id()
)
    <div class="card">
        <h2>Transaksi</h2>

        <p>
            Kendaraan sudah dikembalikan.
            Silakan buat transaksi akhir.
        </p>

        <a
            href="{{ route(
                'transactions.create',
                ['booking_id' => $booking->id]
            ) }}"
            class="btn btn-primary"
        >
            Buat Transaksi
        </a>
    </div>
@endif

@if (
    auth()->user()->hasRole('customer') &&
    $booking->status === 'completed'
)
    <div class="card">
        <h2>Review</h2>

        @if ($booking->review)
            <p>
                <strong>Rating:</strong>
                {{ $booking->review->rating }}/5
            </p>

            @if ($booking->review->review)
                <p>
                    {{ $booking->review->review }}
                </p>
            @endif

            <p>
                <strong>Status:</strong>
                {{ ucfirst($booking->review->status) }}
            </p>

            <a
                href="{{ route('reviews.show', $booking->review) }}"
                class="btn btn-primary"
            >
                Lihat Review
            </a>
        @else
            <a
                href="{{ route('reviews.create', [
                    'booking_id' => $booking->id
                ]) }}"
                class="btn btn-primary"
            >
                Berikan Review
            </a>
        @endif
    </div>
@endif

<div class="card">
    <h2>Pengaduan</h2>

    <p>
        Jika terdapat masalah terkait booking, kendaraan,
        pembayaran, atau pelayanan, Anda dapat membuat pengaduan.
    </p>

    <a
        href="{{ route('complaints.create', [
            'booking_id' => $booking->id
        ]) }}"
        class="btn btn-primary"
    >
        Buat Pengaduan
    </a>
</div>

@if (
    auth()->user()->hasAnyRole(['customer', 'mitra']) &&
    in_array($booking->status, [
        'confirmed',
        'ongoing',
        'returned',
        'completed',
        'cancelled',
        'rejected',
    ], true)
)
    <div class="card">

        <h2>Dispute / Sengketa</h2>

        <p>
            Jika terdapat sengketa terkait booking, kendaraan,
            pembayaran, atau pelayanan, Anda dapat mengajukan
            sengketa untuk ditangani oleh admin.
        </p>

        <a
            href="{{ route('disputes.create', [
                'booking_id' => $booking->id
            ]) }}"
            class="btn btn-primary"
        >
            Ajukan Sengketa
        </a>

    </div>
@endif

   {{-- ACTION --}}
<div class="card">

    <div class="actions">

        <a
            href="{{ url()->previous() }}"
            class="btn btn-secondary"
        >
            ← Kembali
        </a>

        {{-- CHECKOUT / PICKUP MITRA --}}
        @if (
            auth()->user()->hasRole('mitra') &&
            $booking->status === 'confirmed' &&
            $booking->agentProfile?->user_id === auth()->id() &&
            !$booking->rentalCheckout
        )
            <a
                href="{{ route(
                    'rental-checkouts.create',
                    ['booking_id' => $booking->id]
                ) }}"
                class="btn btn-primary"
            >
                Lakukan Checkout / Pickup
            </a>
        @endif

        @if (
    auth()->user()->hasRole('mitra') &&
    $booking->status === 'ongoing' &&
    $booking->agentProfile?->user_id === auth()->id() &&
    !$booking->rentalCheckin
)

    <a
        href="{{ route(
            'rental-checkins.create',
            ['booking_id' => $booking->id]
        ) }}"
        class="btn btn-primary"
    >
        Lakukan Check-in / Return
    </a>

@endif

        {{-- PEMBAYARAN CUSTOMER --}}
        @if (
            auth()->user()->hasRole('customer') &&
            $booking->status === 'pending_payment'
        )
            <a
                href="{{ route('payments.create', $booking) }}"
                class="btn btn-primary"
            >
                Bayar Booking
            </a>
        @endif

    </div>

</div>
</div>

</body>
</html>
