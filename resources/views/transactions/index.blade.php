<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Transactions - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 1200px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        .btn {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 6px;
            text-decoration: none;
            background: #222;
            color: white;
        }

        .success {
            padding: 12px;
            background: #dff5e1;
            margin-bottom: 20px;
            border-radius: 6px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Transactions</h1>

    @if(session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">

        <form method="GET">

            <select name="status">
                <option value="">Semua Status</option>

                @foreach([
                    'pending',
                    'completed',
                    'cancelled',
                    'refunded'
                ] as $status)

                    <option
                        value="{{ $status }}"
                        @selected(request('status') === $status)
                    >
                        {{ ucfirst($status) }}
                    </option>

                @endforeach
            </select>

            <button type="submit">
                Filter
            </button>

        </form>

    </div>

    <div class="card">

        <table>

            <thead>
                <tr>
                    <th>No. Transaksi</th>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Mitra</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody>

            @forelse($transactions as $transaction)

                <tr>

                    <td>
                        {{ $transaction->transaction_number }}
                    </td>

                    <td>
                        {{ $transaction->booking?->booking_number ?? '-' }}
                    </td>

                    <td>
                        {{ $transaction->customer?->name ?? '-' }}
                    </td>

                    <td>
                        {{ $transaction->agentProfile?->agency_name ?? '-' }}
                    </td>

                    <td>
                        Rp {{ number_format(
                            (float) $transaction->total_amount,
                            0,
                            ',',
                            '.'
                        ) }}
                    </td>

                    <td>
                        {{ ucfirst($transaction->status) }}
                    </td>

                    <td>
                        <a
                            href="{{ route(
                                'transactions.show',
                                $transaction
                            ) }}"
                            class="btn"
                        >
                            Detail
                        </a>
                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="7">
                        Belum ada transaksi.
                    </td>
                </tr>

            @endforelse

            </tbody>

        </table>

    </div>

    {{ $transactions->links() }}

</div>

</body>
</html>