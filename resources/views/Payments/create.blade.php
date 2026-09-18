<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Pembayaran - RentGo</title>

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

        .booking-info {
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
            margin-bottom: 5px;
            font-size: 13px;
            color: #6b7280;
        }

        .info-value {
            font-weight: 600;
        }

        .total {
            margin-top: 20px;
            padding: 18px;
            background: #f3f4f6;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .total-label {
            font-size: 16px;
            font-weight: 600;
        }

        .total-value {
            font-size: 24px;
            font-weight: 700;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }

        input[type="radio"] {
            margin-right: 8px;
        }

        .payment-methods {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }

        .payment-option {
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 18px;
            cursor: pointer;
            transition: 0.2s;
        }

        .payment-option:hover {
            border-color: #9ca3af;
        }

        .payment-option input:checked + .payment-content {
            font-weight: 600;
        }

        .payment-option:has(input:checked) {
            border-color: #2563eb;
            background: #eff6ff;
        }

        .payment-content strong {
            display: block;
            margin-bottom: 5px;
        }

        .payment-content span {
            color: #6b7280;
            font-size: 14px;
        }

        .proof-section {
            display: none;
            margin-top: 20px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
        }

        .proof-section.active {
            display: block;
        }

        .required {
            color: #dc2626;
        }

        input[type="file"],
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            background: #ffffff;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .help-text {
            margin-top: 7px;
            color: #6b7280;
            font-size: 13px;
        }

        .error {
            margin-top: 7px;
            color: #dc2626;
            font-size: 13px;
        }

        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
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
            border: none;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
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

        @media (max-width: 700px) {
            .booking-info,
            .payment-methods {
                grid-template-columns: 1fr;
            }

            .total {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
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
        <h1>Pembayaran Booking</h1>
        <p>Silakan pilih metode pembayaran untuk menyelesaikan booking Anda.</p>
    </div>

    {{-- Error validasi --}}
    @if ($errors->any())
        <div class="alert alert-error">
            <strong>Terdapat kesalahan:</strong>

            <ul style="margin-bottom: 0;">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Informasi Booking --}}
    <div class="card">
        <h2>Detail Booking</h2>

        <div class="booking-info">

            <div class="info-item">
                <span class="info-label">Nomor Booking</span>
                <span class="info-value">
                    {{ $booking->booking_number }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">
                    {{ ucfirst(str_replace('_', ' ', $booking->status)) }}
                </span>
            </div>

            @if ($booking->items->isNotEmpty())
                <div class="info-item">
                    <span class="info-label">Kendaraan</span>
                    <span class="info-value">
                        {{ $booking->items->first()->vehicle->name ?? '-' }}
                    </span>
                </div>
            @endif

            <div class="info-item">
                <span class="info-label">Tanggal Mulai</span>
                <span class="info-value">
                    {{ optional($booking->rental_start)->format('d M Y H:i') }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">Tanggal Selesai</span>
                <span class="info-value">
                    {{ optional($booking->rental_end)->format('d M Y H:i') }}
                </span>
            </div>

            <div class="info-item">
                <span class="info-label">Metode Pengambilan</span>
                <span class="info-value">
                    {{ $booking->fulfillment_type === 'delivery'
                        ? 'Delivery'
                        : 'Self Pickup' }}
                </span>
            </div>

        </div>

        <div class="total">
            <span class="total-label">Total Pembayaran</span>

            <span class="total-value">
                Rp {{ number_format((float) $booking->total_amount, 0, ',', '.') }}
            </span>
        </div>
    </div>

    {{-- Form Pembayaran --}}
    <div class="card">

        <h2>Metode Pembayaran</h2>

        <form
            action="{{ route('payments.store') }}"
            method="POST"
            enctype="multipart/form-data"
        >

            @csrf

            <input
                type="hidden"
                name="booking_id"
                value="{{ $booking->id }}"
            >

            <div class="form-group">

                <label>
                    Pilih Metode Pembayaran
                </label>

                <div class="payment-methods">

                    {{-- Cash --}}
                    <label class="payment-option">

                        <input
                            type="radio"
                            name="payment_method"
                            value="cash"
                            {{ old('payment_method', 'cash') === 'cash' ? 'checked' : '' }}
                        >

                        <span class="payment-content">
                            <strong>Cash</strong>
                            <span>
                                Pembayaran secara tunai.
                            </span>
                        </span>

                    </label>

                    {{-- QRIS --}}
                    <label class="payment-option">

                        <input
                            type="radio"
                            name="payment_method"
                            value="qris"
                            {{ old('payment_method') === 'qris' ? 'checked' : '' }}
                        >

                        <span class="payment-content">
                            <strong>QRIS</strong>
                            <span>
                                Bayar menggunakan QRIS dan upload bukti pembayaran.
                            </span>
                        </span>

                    </label>

                </div>

                @error('payment_method')
                    <div class="error">{{ $message }}</div>
                @enderror

            </div>

            {{-- Bukti QRIS --}}
            <div
                id="proof-section"
                class="proof-section"
            >

                <div class="form-group" style="margin-bottom: 0;">

                    <label for="proof_file">
                        Bukti Pembayaran QRIS
                        <span class="required">*</span>
                    </label>

                    <input
                        type="file"
                        id="proof_file"
                        name="proof_file"
                        accept=".jpg,.jpeg,.png,.pdf"
                    >

                    <div class="help-text">
                        Wajib untuk pembayaran QRIS.
                        Format: JPG, JPEG, PNG, atau PDF.
                        Maksimal 5 MB.
                    </div>

                    @error('proof_file')
                        <div class="error">{{ $message }}</div>
                    @enderror

                </div>

            </div>

            {{-- Catatan --}}
            <div class="form-group" style="margin-top: 20px;">

                <label for="notes">
                    Catatan
                </label>

                <textarea
                    id="notes"
                    name="notes"
                    placeholder="Tambahkan catatan jika diperlukan..."
                >{{ old('notes') }}</textarea>

                @error('notes')
                    <div class="error">{{ $message }}</div>
                @enderror

            </div>

            <div class="actions">

                <a
                    href="{{ route('bookings.show', $booking) }}"
                    class="btn btn-secondary"
                >
                    Kembali
                </a>

                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Lanjutkan Pembayaran
                </button>

            </div>

        </form>

    </div>

</div>

<script>
    const paymentMethods = document.querySelectorAll(
        'input[name="payment_method"]'
    );

    const proofSection = document.getElementById(
        'proof-section'
    );

    const proofFile = document.getElementById(
        'proof_file'
    );

    function updatePaymentMethod() {
        const selected = document.querySelector(
            'input[name="payment_method"]:checked'
        );

        if (!selected) {
            proofSection.classList.remove('active');
            proofFile.required = false;
            return;
        }

        if (selected.value === 'qris') {
            proofSection.classList.add('active');
            proofFile.required = true;
        } else {
            proofSection.classList.remove('active');
            proofFile.required = false;
            proofFile.value = '';
        }
    }

    paymentMethods.forEach(function (radio) {
        radio.addEventListener(
            'change',
            updatePaymentMethod
        );
    });

    updatePaymentMethod();
</script>

</body>
</html>
