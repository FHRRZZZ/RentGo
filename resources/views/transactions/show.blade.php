<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>
        {{ $transaction->transaction_number }} - RentGo
    </title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 30px;
        }

        .container {
            max-width: 900px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .btn {
            display: inline-block;
            padding: 10px 16px;
            background: #222;
            color: white;
            text-decoration: none;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
        }

        .success {
            background: #dff5e1;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>
        {{ $transaction->transaction_number }}
    </h1>

    @if(session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">

        <h2>Informasi Transaksi</h2>

        <div class="row">
            <span>Booking</span>
            <strong>
                {{ $transaction->booking?->booking_number ?? '-' }}
            </strong>
        </div>

        <div class="row">
            <span>Customer</span>
            <strong>
                {{ $transaction->customer?->name ?? '-' }}
            </strong>
        </div>

        <div class="row">
            <span>Mitra</span>
            <strong>
                {{ $transaction->agentProfile?->agency_name ?? '-' }}
            </strong>
        </div>

        <div class="row">
            <span>Status</span>
            <strong>
                {{ ucfirst($transaction->status) }}
            </strong>
        </div>

    </div>

    <div class="card">

        <h2>Rincian Biaya</h2>

        <div class="row">
            <span>Rental</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->rental_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Delivery</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->delivery_fee,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Service</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->service_fee,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Additional</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->additional_fee,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Deposit</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->deposit_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Potongan Deposit</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->deduction_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Refund Deposit</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->refund_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Total</span>
            <strong>
                Rp {{ number_format(
                    (float) $transaction->total_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

    </div>

    @if($transaction->commission)

        <div class="card">

            <h2>Commission RentGo</h2>

            <div class="row">
                <span>Dasar Commission</span>
                <strong>
                    Rp {{ number_format(
                        (float) $transaction->commission->commission_base,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>
            </div>

            <div class="row">
                <span>Persentase</span>
                <strong>
                    {{ $transaction->commission->commission_percentage }}%
                </strong>
            </div>

            <div class="row">
                <span>Commission</span>
                <strong>
                    Rp {{ number_format(
                        (float) $transaction->commission->commission_amount,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>
            </div>

            <div class="row">
                <span>Net Mitra</span>
                <strong>
                    Rp {{ number_format(
                        (float) $transaction->commission->net_amount,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>
            </div>

        </div>

    @endif

    @if($transaction->notes)

        <div class="card">

            <h2>Catatan</h2>

            <p>
                {{ $transaction->notes }}
            </p>

        </div>

    @endif

    @if(
        auth()->user()->hasRole('admin') &&
        $transaction->status === 'pending'
    )

        <div class="card">

            <form
                method="POST"
                action="{{ route(
                    'transactions.complete',
                    $transaction
                ) }}"
            >

                @csrf

                <button
                    type="submit"
                    class="btn"
                >
                    Selesaikan Transaksi
                </button>

            </form>

        </div>

    @endif

    <a
        href="{{ route('transactions.index') }}"
        class="btn"
    >
        Kembali
    </a>

</div>

</body>
</html>