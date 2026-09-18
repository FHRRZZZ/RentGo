<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Agent Payout - RentGo</title>

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
            background: #dff5e1;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Agent Payout</h1>

    @if(session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">

        <form method="GET">

            <select name="status">

                <option value="">
                    Semua Status
                </option>

                @foreach([
                    'pending',
                    'processing',
                    'paid',
                    'failed',
                    'cancelled',
                ] as $status)

                    <option
                        value="{{ $status }}"
                        @selected(
                            request('status') === $status
                        )
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
                    <th>Payout</th>
                    <th>Mitra</th>
                    <th>Transaction</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>

            </thead>

            <tbody>

            @forelse($payouts as $payout)

                <tr>

                    <td>
                        {{ $payout->payout_number }}
                    </td>

                    <td>
                        {{ $payout->agentProfile?->agency_name ?? '-' }}
                    </td>

                    <td>
                        {{
                            $payout->transaction
                                ?->transaction_number
                            ?? '-'
                        }}
                    </td>

                    <td>
                        Rp {{ number_format(
                            (float) $payout->amount,
                            0,
                            ',',
                            '.'
                        ) }}
                    </td>

                    <td>
                        {{ ucfirst($payout->status) }}
                    </td>

                    <td>

                        <a
                            href="{{ route(
                                'agent-payouts.show',
                                $payout
                            ) }}"
                            class="btn"
                        >
                            Detail
                        </a>

                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="6">
                        Belum ada payout.
                    </td>
                </tr>

            @endforelse

            </tbody>

        </table>

    </div>

    {{ $payouts->links() }}

</div>

</body>

</html>