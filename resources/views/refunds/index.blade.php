<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Refund - RentGo</title>

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
            width: min(1200px, 94%);
            margin: 30px auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        }

        h1 {
            margin: 0;
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

        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, .05);
        }

        .filter-form {
            display: flex;
            align-items: end;
            gap: 15px;
            flex-wrap: wrap;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        label {
            font-weight: 600;
            font-size: 14px;
        }

        select {
            min-width: 180px;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
        }

        .table-wrapper {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 13px 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
            white-space: nowrap;
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
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 12px;
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

        .amount {
            font-weight: 700;
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

        .empty {
            padding: 40px 20px;
            text-align: center;
            color: #6b7280;
        }

        .pagination {
            margin-top: 20px;
        }

        .pagination a,
        .pagination span {
            display: inline-block;
            padding: 8px 12px;
            margin-right: 4px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            text-decoration: none;
            color: #374151;
        }

        @media (max-width: 700px) {
            .header {
                align-items: flex-start;
                flex-direction: column;
            }

            .filter-form {
                align-items: stretch;
                flex-direction: column;
            }

            select {
                width: 100%;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <div>
            <h1>Daftar Refund</h1>
            <p>Kelola pengembalian dana booking RentGo.</p>
        </div>

        <a
            href="{{ url()->previous() }}"
            class="button button-secondary"
        >
            Kembali
        </a>
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

    {{-- Filter --}}
    <div class="card">

        <form
            action="{{ route('refunds.index') }}"
            method="GET"
            class="filter-form"
        >

            <div class="form-group">
                <label for="status">
                    Status Refund
                </label>

                <select
                    name="status"
                    id="status"
                >
                    <option value="">
                        Semua Status
                    </option>

                    <option
                        value="pending"
                        @selected(request('status') === 'pending')
                    >
                        Pending
                    </option>

                    <option
                        value="processing"
                        @selected(request('status') === 'processing')
                    >
                        Processing
                    </option>

                    <option
                        value="completed"
                        @selected(request('status') === 'completed')
                    >
                        Completed
                    </option>

                    <option
                        value="failed"
                        @selected(request('status') === 'failed')
                    >
                        Failed
                    </option>

                    <option
                        value="cancelled"
                        @selected(request('status') === 'cancelled')
                    >
                        Cancelled
                    </option>
                </select>
            </div>

            <button
                type="submit"
                class="button button-primary"
            >
                Filter
            </button>

            <a
                href="{{ route('refunds.index') }}"
                class="button button-secondary"
            >
                Reset
            </a>

        </form>

    </div>

    {{-- Table --}}
    <div class="card">

        @if ($refunds->count() > 0)

            <div class="table-wrapper">

                <table>

                    <thead>
                        <tr>
                            <th>No. Refund</th>
                            <th>No. Booking</th>
                            <th>Customer</th>
                            <th>Mitra</th>
                            <th>Jumlah</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>

                        @foreach ($refunds as $refund)

                            <tr>

                                <td>
                                    <strong>
                                        {{ $refund->refund_number }}
                                    </strong>
                                </td>

                                <td>
                                    {{ $refund->booking?->booking_number ?? '-' }}
                                </td>

                                <td>
                                    {{ $refund->booking?->customer?->name ?? '-' }}
                                </td>

                                <td>
                                    {{ $refund->booking?->agentProfile?->agency_name ?? '-' }}
                                </td>

                                <td class="amount">
                                    Rp
                                    {{ number_format(
                                        (float) $refund->amount,
                                        0,
                                        ',',
                                        '.'
                                    ) }}
                                </td>

                                <td>
                                    <span
                                        class="status status-{{ $refund->status }}"
                                    >
                                        {{ ucfirst($refund->status) }}
                                    </span>
                                </td>

                                <td>
                                    {{ $refund->created_at?->format('d/m/Y H:i') }}
                                </td>

                                <td>
                                    <a
                                        href="{{ route('refunds.show', $refund) }}"
                                        class="button button-primary"
                                    >
                                        Detail
                                    </a>
                                </td>

                            </tr>

                        @endforeach

                    </tbody>

                </table>

            </div>

            <div class="pagination">
                {{ $refunds->links() }}
            </div>

        @else

            <div class="empty">
                <h3>Belum ada refund</h3>
                <p>
                    Data refund akan muncul ketika terdapat booking
                    yang ditolak oleh mitra setelah pembayaran berhasil.
                </p>
            </div>

        @endif

    </div>

</div>

</body>
</html>