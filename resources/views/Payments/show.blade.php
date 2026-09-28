<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Detail Pembayaran - RentGo</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f7fa;
            color: #1f2937;
        }

        .container {
            width: 100%;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .header {
            margin-bottom: 25px;
        }

        .header h1 {
            margin: 0 0 8px;
            font-size: 28px;
        }

        .header p {
            margin: 0;
            color: #6b7280;
        }

        .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        .card h2 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
        }

        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
        }

        .alert-success {
            background: #dcfce7;
            color: #166534;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-wrapper {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 18px;
            background: #f9fafb;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .status-label {
            color: #6b7280;
            font-size: 14px;
        }

        .status {
            display: inline-block;
            padding: 7px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 700;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-paid {
            background: #dcfce7;
            color: #166534;
        }

        .status-failed,
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-expired {
            background: #e5e7eb;
            color: #374151;
        }

        .status-info {
            background: #dbeafe;
            color: #1e40af;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .info-item {
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .info-label {
            display: block;
            margin-bottom: 6px;
            color: #6b7280;
            font-size: 13px;
        }

        .info-value {
            font-weight: 600;
            word-break: break-word;
        }

        .total {
            margin-top: 20px;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }

        .total-label {
            font-weight: 600;
        }

        .total-value {
            font-size: 24px;
            font-weight: 700;
        }

        .proof {
            margin-top: 20px;
        }

        .proof-preview {
            margin-top: 12px;
        }

        .proof-preview img {
            display: block;
            max-width: 100%;
            max-height: 500px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .proof-link {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 15px;
            border-radius: 8px;
            background: #e5e7eb;
            color: #374151;
            text-decoration: none;
            font-weight: 600;
        }

        .note {
            margin-top: 15px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            white-space: pre-wrap;
        }

        .actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 25px;
        }

        .btn {
            display: inline-block;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-secondary {
            background: #e5e7eb;
            color: #374151;
        }

        .btn-primary {
            background: #2563eb;
            color: #ffffff;
        }

        .btn-primary:hover {
            background: #1d4ed8;
        }

        .message {
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
        }

        .message-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .message-success {
            background: #dcfce7;
            color: #166534;
        }

        @media (max-width: 700px) {
            .info-grid {
                grid-template-columns: 1fr;
            }

            .status-wrapper {
                flex-direction: column;
                align-items: flex-start;
            }

            .total {
                flex-direction: column;
                align-items: flex-start;
            }

            .actions {
                flex-direction: column;
            }

            .actions .btn {
                width: 100%;
                text-align: center;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>Detail Pembayaran</h1>
        <p>Informasi pembayaran booking RentGo.</p>
    </div>

    {{-- Success message --}}
    @if (session('success'))
        <div class="alert alert-success">
            {{ session('success') }}
        </div>
    @endif

    {{-- Error message --}}
    @if (session('error'))
        <div class="alert alert-error">
            {{ session('error') }}
        </div>
    @endif


    {{-- Status Pembayaran --}}
    <div class="card">

        <div class="status-wrapper">

            <div>
                <div class="status-label">
                    Status Pembayaran
                </div>

                <strong>
                    {{ ucfirst($payment->status) }}
                </strong>
            </div>

            @php
                $statusClass = match ($payment->status) {
                    'pending' => 'status-pending',
                    'paid' => 'status-paid',
                    'failed' => 'status-failed',
                    'expired' => 'status-expired',
                    'cancelled' => 'status-cancelled',
                    default => 'status-info',
                };
            @endphp

            <span class="status {{ $statusClass }}">
                {{ ucfirst($payment->status) }}
            </span>

        </div>

        <div class="info-grid">

            <div class="info-item">
                <span class="info-label">
                    Nomor Pembayaran
                </span>

                <span class="info-value">
                    {{ $payment->payment_number }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Nomor Booking
                </span>

                <span class="info-value">
                    {{ $payment->booking->booking_number }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Metode Pembayaran
                </span>

                <span class="info-value">
                    {{ strtoupper($payment->payment_method) }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Dibuat
                </span>

                <span class="info-value">
                    {{ optional($payment->created_at)->format('d M Y H:i') }}
                </span>
            </div>

            @if ($payment->paid_at)
                <div class="info-item">
                    <span class="info-label">
                        Waktu Pembayaran
                    </span>

                    <span class="info-value">
                        {{ $payment->paid_at->format('d M Y H:i') }}
                    </span>
                </div>
            @endif

            @if ($payment->verified_at)
                <div class="info-item">
                    <span class="info-label">
                        Diverifikasi
                    </span>

                    <span class="info-value">
                        {{ $payment->verified_at->format('d M Y H:i') }}
                    </span>
                </div>
            @endif

            @if ($payment->verifier)
                <div class="info-item">
                    <span class="info-label">
                        Diverifikasi Oleh
                    </span>

                    <span class="info-value">
                        {{ $payment->verifier->name }}
                    </span>
                </div>
            @endif

        </div>

        <div class="total">

            <span class="total-label">
                Total Pembayaran
            </span>

            <span class="total-value">
                Rp {{ number_format((float) $payment->amount, 0, ',', '.') }}
            </span>

        </div>

    </div>


    {{-- Informasi Booking --}}
    <div class="card">

        <h2>Detail Booking</h2>

        <div class="info-grid">

            <div class="info-item">
                <span class="info-label">
                    Kendaraan
                </span>

                <span class="info-value">
                    {{ $payment->booking->items->first()->vehicle->name ?? '-' }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Status Booking
                </span>

                <span class="info-value">
                    {{ ucfirst(str_replace('_', ' ', $payment->booking->status)) }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Mulai Sewa
                </span>

                <span class="info-value">
                    {{ optional($payment->booking->rental_start)->format('d M Y H:i') }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">
                    Selesai Sewa
                </span>

                <span class="info-value">
                    {{ optional($payment->booking->rental_end)->format('d M Y H:i') }}
                </span>
            </div>

        </div>

    </div>


    {{-- Bukti Pembayaran --}}
    @if ($payment->proof_file_path)

        <div class="card">

            <h2>Bukti Pembayaran</h2>

            <div class="proof">

                <p>
                    Bukti pembayaran tersimpan secara private.
                </p>

                <a
                    href="{{ route('payments.proof', $payment) }}"
                    class="proof-link"
                    target="_blank"
                >
                    Lihat Bukti Pembayaran
                </a>

            </div>

        </div>

    @endif

{{-- Verifikasi Pembayaran Admin --}}
@if (auth()->user()->hasRole('admin') && $payment->status === 'pending')

    <div class="card">

        <h2>Verifikasi Pembayaran</h2>

        <p style="color: #6b7280; margin-bottom: 20px;">
            Periksa bukti pembayaran terlebih dahulu sebelum menentukan
            status pembayaran.
        </p>

        @if ($payment->payment_method === 'qris')

            <div class="message message-warning" style="margin-bottom: 20px;">
                Pembayaran menggunakan QRIS.
                Pastikan bukti pembayaran sesuai dengan nominal booking
                sebelum memilih status <strong>Paid</strong>.
            </div>

        @elseif ($payment->payment_method === 'cash')

            <div class="message message-warning" style="margin-bottom: 20px;">
                Pembayaran menggunakan Cash.
                Pastikan pembayaran tunai telah diterima sebelum memilih
                status <strong>Paid</strong>.
            </div>

        @endif

        <form
            action="{{ route('payments.verify', $payment) }}"
            method="POST"
        >

            @csrf

            <div class="form-group">

                <label for="status">
                    Status Pembayaran
                </label>

                <select
                    id="status"
                    name="status"
                    required
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        background: #ffffff;
                    "
                >

                    <option value="">
                        -- Pilih Status --
                    </option>

                    <option value="paid">
                        Paid — Pembayaran Diterima
                    </option>

                    <option value="failed">
                        Failed — Pembayaran Tidak Valid
                    </option>

                    <option value="expired">
                        Expired — Pembayaran Kedaluwarsa
                    </option>

                    <option value="cancelled">
                        Cancelled — Pembayaran Dibatalkan
                    </option>

                </select>

                @error('status')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>


            <div class="form-group">

                <label for="notes">
                    Catatan Verifikasi
                </label>

                <textarea
                    id="notes"
                    name="notes"
                    placeholder="Contoh: Bukti QRIS sesuai dengan nominal pembayaran."
                >{{ old('notes') }}</textarea>

                @error('notes')
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
                        'Apakah Anda yakin ingin memperbarui status pembayaran ini?'
                    );
                "
            >
                Verifikasi Pembayaran
            </button>

        </form>

    </div>

@endif


    {{-- Informasi berdasarkan status --}}
    <div class="card">

        <h2>Informasi</h2>

        @if ($payment->status === 'pending')

            <div class="message message-warning">
                Pembayaran Anda sedang menunggu verifikasi admin.
                Silakan tunggu sampai pembayaran diverifikasi.
            </div>

        @elseif ($payment->status === 'paid')

            <div class="message message-success">
                Pembayaran telah dikonfirmasi.
                Booking selanjutnya menunggu konfirmasi dari mitra.
            </div>

        @elseif ($payment->status === 'failed')

            <div class="message message-warning">
                Pembayaran tidak berhasil diverifikasi.
                Silakan lakukan pembayaran kembali jika booking masih tersedia.
            </div>

        @elseif ($payment->status === 'expired')

            <div class="message message-warning">
                Pembayaran telah kedaluwarsa.
                Silakan lakukan pembayaran kembali jika booking masih tersedia.
            </div>

        @elseif ($payment->status === 'cancelled')

            <div class="message message-warning">
                Pembayaran telah dibatalkan.
            </div>

        @endif

        @if ($payment->notes)

            <div class="note">
                <strong>Catatan:</strong><br>

                {{ $payment->notes }}
            </div>

        @endif

    </div>


    {{-- Action --}}
    <div class="actions">

        <a
            href="{{ route('bookings.show', $payment->booking) }}"
            class="btn btn-secondary"
        >
            Kembali ke Booking
        </a>

        @if (in_array($payment->booking->status, ['waiting_payment', 'pending']))
    <a
        href="{{ route('payments.create', $payment->booking) }}"
        class="btn btn-primary"
    >
        Bayar Booking
    </a>
@endif

    </div>

</div>

</body>
</html>