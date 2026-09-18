<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dispute - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            margin-bottom: 20px;
        }

        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .filters {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: end;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        select,
        input {
            padding: 9px 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
        }

        button,
        .btn {
            display: inline-block;
            padding: 9px 14px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            cursor: pointer;
            background: #2563eb;
            color: white;
        }

        .btn-secondary {
            background: #6b7280;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 20px;
            font-size: 12px;
            background: #e5e7eb;
        }

        .success {
            background: #dcfce7;
            color: #166534;
        }

        .warning {
            background: #fef3c7;
            color: #92400e;
        }

        .danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .info {
            background: #dbeafe;
            color: #1e40af;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 7px;
            margin-bottom: 15px;
            background: #dcfce7;
            color: #166534;
        }

        .empty {
            text-align: center;
            padding: 30px;
            color: #666;
        }

        .pagination {
            margin-top: 20px;
        }

        @media (max-width: 768px) {
            body {
                padding: 15px;
            }

            table {
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Daftar Dispute</h1>

    @if (session('success'))
        <div class="alert">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">

        <form method="GET" action="{{ route('disputes.index') }}">

            <div class="filters">

                <div class="form-group">
                    <label for="status">Status</label>

                    <select name="status" id="status">
                        <option value="">Semua Status</option>

                        <option
                            value="pending"
                            @selected(request('status') === 'pending')
                        >
                            Pending
                        </option>

                        <option
                            value="investigating"
                            @selected(request('status') === 'investigating')
                        >
                            Investigating
                        </option>

                        <option
                            value="resolved"
                            @selected(request('status') === 'resolved')
                        >
                            Resolved
                        </option>

                        <option
                            value="rejected"
                            @selected(request('status') === 'rejected')
                        >
                            Rejected
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="category">Kategori</label>

                    <select name="category" id="category">
                        <option value="">Semua Kategori</option>

                        <option
                            value="vehicle"
                            @selected(request('category') === 'vehicle')
                        >
                            Kendaraan
                        </option>

                        <option
                            value="booking"
                            @selected(request('category') === 'booking')
                        >
                            Booking
                        </option>

                        <option
                            value="payment"
                            @selected(request('category') === 'payment')
                        >
                            Pembayaran
                        </option>

                        <option
                            value="service"
                            @selected(request('category') === 'service')
                        >
                            Pelayanan
                        </option>

                        <option
                            value="mitra"
                            @selected(request('category') === 'mitra')
                        >
                            Mitra
                        </option>

                        <option
                            value="customer"
                            @selected(request('category') === 'customer')
                        >
                            Customer
                        </option>

                        <option
                            value="other"
                            @selected(request('category') === 'other')
                        >
                            Lainnya
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <button type="submit">
                        Filter
                    </button>
                </div>

                <div class="form-group">
                    <a
                        href="{{ route('disputes.index') }}"
                        class="btn btn-secondary"
                    >
                        Reset
                    </a>
                </div>

            </div>

        </form>

    </div>

    <div class="card">

        @if ($disputes->count() > 0)

            <table>

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Booking</th>
                        <th>Pengaju</th>
                        <th>Pihak Lawan</th>
                        <th>Subjek</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>

                    @foreach ($disputes as $dispute)

                        @php
                            $statusClass = match ($dispute->status) {
                                'resolved' => 'success',
                                'rejected' => 'danger',
                                'investigating' => 'info',
                                default => 'warning',
                            };
                        @endphp

                        <tr>

                            <td>
                                {{ $dispute->id }}
                            </td>

                            <td>
                                @if ($dispute->booking)
                                    #{{ $dispute->booking->booking_number }}
                                @else
                                    -
                                @endif
                            </td>

                            <td>
                                {{ $dispute->initiator?->name ?? '-' }}
                            </td>

                            <td>
                                {{ $dispute->respondent?->name ?? '-' }}
                            </td>

                            <td>
                                {{ $dispute->subject }}
                            </td>

                            <td>
                                {{ ucfirst($dispute->category) }}
                            </td>

                            <td>
                                <span class="badge {{ $statusClass }}">
                                    {{ ucfirst($dispute->status) }}
                                </span>
                            </td>

                            <td>
                                <a
                                    href="{{ route('disputes.show', $dispute) }}"
                                    class="btn"
                                >
                                    Detail
                                </a>
                            </td>

                        </tr>

                    @endforeach

                </tbody>

            </table>

            <div class="pagination">
                {{ $disputes->links() }}
            </div>

        @else

            <div class="empty">
                Belum ada dispute.
            </div>

        @endif

    </div>

</div>

</body>
</html>