<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Data Pembayaran - RentGo</title>

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
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .header {
            margin-bottom: 25px;
        }

        .header h1 {
            margin: 0 0 8px;
        }

        .header p {
            margin: 0;
            color: #6b7280;
        }

        .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        }

        .filters {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: end;
        }

        .filter-group {
            min-width: 180px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-size: 13px;
            font-weight: 600;
        }

        select {
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 7px;
            background: #ffffff;
        }

        button,
        .btn {
            display: inline-block;
            padding: 10px 15px;
            border: none;
            border-radius: 7px;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-primary {
            background: #2563eb;
            color: #ffffff;
        }

        .btn-secondary {
            background: #e5e7eb;
            color: #374151;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 850px;
        }

        th,
        td {
            padding: 13px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
            vertical-align: middle;
        }

        th {
            background: #f9fafb;
            font-size: 13px;
        }

        td {
            font-size: 14px;
        }

        .status {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 12px;
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

        .status-failed {
            background: #fee2e2;
            color: #991b1b;
        }

        .status-expired {
            background: #e5e7eb;
            color: #374151;
        }

        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }

        .method {
            font-weight: 600;
        }

        .pagination {
            margin-top: 20px;
        }

        .pagination a,
        .pagination span {
            display: inline-block;
            padding: 7px 11px;
            margin-right: 4px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 13px;
        }

        .pagination a {
            background: #e5e7eb;
            color: #374151;
        }

        .pagination span {
            background: #2563eb;
            color: #ffffff;
        }

        .empty {
            padding: 40px;
            text-align: center;
            color: #6b7280;
        }

        .pending-highlight {
            background: #fffbeb;
        }

        @media (max-width: 700px) {
            .filters {
                flex-direction: column;
                align-items: stretch;
            }

            .filter-group {
                width: 100%;
            }

            .filters .btn {
                text-align: center;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>Data Pembayaran</h1>

        <p>
            Kelola dan lihat pembayaran booking RentGo.
        </p>
    </div>


    {{-- Filter --}}
    <div class="card">

        <form
            action="{{ route('payments.index') }}"
            method="GET"
        >

            <div class="filters">

                <div class="filter-group">

                    <label for="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                    >
                        <option value="">
                            Semua Status
                        </option>

                        <option
                            value="pending"
                            {{ request('status') === 'pending' ? 'selected' : '' }}
                        >
                            Pending
                        </option>

                        <option
                            value="paid"
                            {{ request('status') === 'paid' ? 'selected' : '' }}
                        >
                            Paid
                        </option>

                        <option
                            value="failed"
                            {{ request('status') === 'failed' ? 'selected' : '' }}
                        >
                            Failed
                        </option>

                        <option
                            value="expired"
                            {{ request('status') === 'expired' ? 'selected' : '' }}
                        >
                            Expired
                        </option>

                        <option
                            value="cancelled"
                            {{ request('status') === 'cancelled' ? 'selected' : '' }}
                        >
                            Cancelled
                        </option>

                    </select>

                </div>


                <div class="filter-group">

                    <label for="payment_method">
                        Metode Pembayaran
                    </label>

                    <select
                        id="payment_method"
                        name="payment_method"
                    >

                        <option value="">
                            Semua Metode
                        </option>

                        <option
                            value="cash"
                            {{ request('payment_method') === 'cash' ? 'selected' : '' }}
                        >
                            Cash
                        </option>

                        <option
                            value="qris"
                            {{ request('payment_method') === 'qris' ? 'selected' : '' }}
                        >
                            QRIS
                        </option>

                    </select>

                </div>


                <button
                    type="submit"
                    class="btn btn-primary"
                >
                    Filter
                </button>


                <a
                    href="{{ route('payments.index') }}"
                    class="btn btn-secondary"
                >
                    Reset
                </a>

            </div>

        </form>

    </div>


    {{-- Table --}}
    <div class="card">

        <div class="table-wrapper">

            @if ($payments->count())

                <table>

                    <thead>
                        <tr>
                            <th>No. Pembayaran</th>
                            <th>No. Booking</th>
                            <th>Customer</th>
                            <th>Metode</th>
                            <th>Nominal</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>

                    @foreach ($payments as $payment)

                        @php
                            $statusClass = match ($payment->status) {
                                'pending' => 'status-pending',
                                'paid' => 'status-paid',
                                'failed' => 'status-failed',
                                'expired' => 'status-expired',
                                'cancelled' => 'status-cancelled',
                                default => '',
                            };
                        @endphp

                        <tr class="{{ $payment->status === 'pending' ? 'pending-highlight' : '' }}">

                            <td>
                                <strong>
                                    {{ $payment->payment_number }}
                                </strong>
                            </td>

                            <td>
                                {{ $payment->booking->booking_number ?? '-' }}
                            </td>

                            <td>
                                {{ $payment->booking->customer->name ?? '-' }}
                            </td>

                            <td>
                                <span class="method">
                                    {{ strtoupper($payment->payment_method) }}
                                </span>
                            </td>

                            <td>
                                Rp {{ number_format((float) $payment->amount, 0, ',', '.') }}
                            </td>

                            <td>
                                <span class="status {{ $statusClass }}">
                                    {{ ucfirst($payment->status) }}
                                </span>
                            </td>

                            <td>
                                {{ optional($payment->created_at)->format('d M Y H:i') }}
                            </td>

                            <td>
                                <a
                                    href="{{ route('payments.show', $payment) }}"
                                    class="btn btn-primary"
                                >
                                    Detail
                                </a>
                            </td>

                        </tr>

                    @endforeach

                    </tbody>

                </table>

            @else

                <div class="empty">
                    Tidak ada data pembayaran.
                </div>

            @endif

        </div>


        {{-- Pagination --}}
        @if ($payments->hasPages())

            <div class="pagination">
                {{ $payments->links() }}
            </div>

        @endif

    </div>

</div>

</body>
</html>