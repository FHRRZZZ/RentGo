<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Detail Refund {{ $refund->refund_number }} - RentGo
    </title>

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
            width: min(1000px, 94%);
            margin: 30px auto;
        }

        .header {
            margin-bottom: 25px;
        }

        h1,
        h2 {
            margin-top: 0;
        }

        .card {
            background: white;
            padding: 22px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, .05);
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .item {
            padding: 12px;
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

        .amount {
            font-size: 24px;
            font-weight: 700;
        }

        .status {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-processing {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-completed {
            background: #dcfce7;
            color: #166534;
        }

        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-cancelled {
            background: #e5e7eb;
            color: #374151;
        }

        .success {
            padding: 14px 16px;
            margin-bottom: 20px;
            background: #dcfce7;
            color: #166534;
            border-radius: 8px;
        }

        .error {
            padding: 14px 16px;
            margin-bottom: 20px;
            background: #fee2e2;
            color: #991b1b;
            border-radius: 8px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-weight: 600;
        }

        select,
        textarea {
            width: 100%;
            padding: 11px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-family: inherit;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .button {
            display: inline-block;
            padding: 10px 16px;
            border-radius: 8px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .button-primary {
            background: #2563eb;
            color: white;
        }

        .button-secondary {
            background: #6b7280;
            color: white;
        }

        .button-success {
            background: #16a34a;
            color: white;
        }

        .vehicle {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
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
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">

        <h1>
            Detail Refund
        </h1>

        <p>
            {{ $refund->refund_number }}
        </p>

    </div>

    @if (session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    @if (session('error'))
        <div class="error">
            {{ session('error') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="error">
            <strong>
                Terjadi kesalahan:
            </strong>

            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Refund Summary --}}
    <div class="card">

        <h2>
            Informasi Refund
        </h2>

        <div class="grid">

            <div class="item">
                <span class="label">
                    Nomor Refund
                </span>

                <span class="value">
                    {{ $refund->refund_number }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Status
                </span>

                <span
                    class="status status-{{ $refund->status }}"
                >
                    {{ ucfirst($refund->status) }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Jumlah Refund
                </span>

                <span class="amount">
                    Rp
                    {{ number_format(
                        (float) $refund->amount,
                        0,
                        ',',
                        '.'
                    ) }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Dibuat
                </span>

                <span class="value">
                    {{ $refund->created_at?->format('d/m/Y H:i') }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Refund Selesai
                </span>

                <span class="value">
                    {{ $refund->refunded_at?->format('d/m/Y H:i') ?? '-' }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Diproses Oleh
                </span>

                <span class="value">
                    {{ $refund->processor?->name ?? '-' }}
                </span>
            </div>

        </div>

    </div>

    {{-- Reason --}}
    <div class="card">

        <h2>
            Alasan Refund
        </h2>

        <p>
            {{ $refund->reason ?: '-' }}
        </p>

        @if ($refund->notes)
            <hr>

            <strong>
                Catatan:
            </strong>

            <p>
                {{ $refund->notes }}
            </p>
        @endif

    </div>

    {{-- Booking --}}
    <div class="card">

        <h2>
            Informasi Booking
        </h2>

        <div class="grid">

            <div class="item">
                <span class="label">
                    Nomor Booking
                </span>

                <span class="value">
                    {{ $refund->booking?->booking_number ?? '-' }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Status Booking
                </span>

                <span class="value">
                    {{ ucfirst(
                        $refund->booking?->status ?? '-'
                    ) }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Customer
                </span>

                <span class="value">
                    {{ $refund->booking?->customer?->name ?? '-' }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Mitra
                </span>

                <span class="value">
                    {{ $refund->booking?->agentProfile?->agency_name ?? '-' }}
                </span>
            </div>

        </div>

    </div>

    {{-- Payment --}}
    <div class="card">

        <h2>
            Pembayaran
        </h2>

        <div class="grid">

            <div class="item">
                <span class="label">
                    Nomor Pembayaran
                </span>

                <span class="value">
                    {{ $refund->payment?->payment_number ?? '-' }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Metode
                </span>

                <span class="value">
                    {{ strtoupper(
                        $refund->payment?->payment_method ?? '-'
                    ) }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Jumlah Dibayar
                </span>

                <span class="value">
                    Rp
                    {{ number_format(
                        (float) ($refund->payment?->amount ?? 0),
                        0,
                        ',',
                        '.'
                    ) }}
                </span>
            </div>

            <div class="item">
                <span class="label">
                    Dibayar Pada
                </span>

                <span class="value">
                    {{ $refund->payment?->paid_at?->format('d/m/Y H:i') ?? '-' }}
                </span>
            </div>

        </div>

    </div>

    {{-- Vehicles --}}
    @if ($refund->booking?->items?->count())

        <div class="card">

            <h2>
                Kendaraan
            </h2>

            @foreach ($refund->booking->items as $item)

                <div class="vehicle">

                    <strong>
                        {{ $item->vehicle?->name ?? '-' }}
                    </strong>

                    <p>
                        {{ $item->rental_start?->format('d/m/Y') }}
                        -
                        {{ $item->rental_end?->format('d/m/Y') }}
                    </p>

                </div>

            @endforeach

        </div>

    @endif

    {{-- Admin Process --}}
    @if (
        auth()->user()->hasRole('admin') &&
        in_array($refund->status, ['pending', 'processing'], true)
    )

        <div class="card">

            <h2>
                Proses Refund
            </h2>

            <form
                action="{{ route('refunds.process', $refund) }}"
                method="POST"
            >

                @csrf

                <div class="form-group">

                    <label for="status">
                        Status Refund
                    </label>

                    <select
                        name="status"
                        id="status"
                        required
                    >

                        <option value="">
                            Pilih status
                        </option>

                        <option value="processing">
                            Processing
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="failed">
                            Failed
                        </option>

                        <option value="cancelled">
                            Cancelled
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
                        maxlength="1000"
                        placeholder="Tambahkan catatan proses refund..."
                    >{{ old('notes') }}</textarea>

                </div>

                <button
                    type="submit"
                    class="button button-success"
                    onclick="
                        return confirm(
                            'Apakah Anda yakin ingin mengubah status refund ini?'
                        );
                    "
                >
                    Proses Refund
                </button>

            </form>

        </div>

    @endif

    {{-- Navigation --}}
    <div class="card">

        <div class="actions">

            <a
                href="{{ route('refunds.index') }}"
                class="button button-secondary"
            >
                Kembali ke Refund
            </a>

            @if ($refund->booking)
                <a
                    href="{{ route('bookings.show', $refund->booking) }}"
                    class="button button-primary"
                >
                    Lihat Booking
                </a>
            @endif

        </div>

    </div>

</div>

</body>
</html>