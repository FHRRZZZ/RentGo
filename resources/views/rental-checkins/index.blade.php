<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rental Check-in - RentGo</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            color: #1f2937;
        }

        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
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

        .btn {
            display: inline-block;
            padding: 10px 16px;
            border-radius: 8px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,.05);
        }

        .filter {
            display: flex;
            gap: 10px;
            align-items: end;
            flex-wrap: wrap;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        label {
            font-size: 14px;
            font-weight: 600;
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
            min-width: 850px;
        }

        th,
        td {
            padding: 13px;
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

        .badge {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .amount {
            font-weight: 600;
        }

        .pagination {
            margin-top: 20px;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            background: #dcfce7;
            color: #166534;
        }

        @media (max-width: 700px) {
            .header {
                align-items: flex-start;
                flex-direction: column;
            }

            .container {
                margin-top: 20px;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <div>
            <h1>Rental Check-in</h1>
            <p>Daftar pengembalian kendaraan</p>
        </div>

        <a
            href="{{ route('bookings.index') }}"
            class="btn btn-secondary"
        >
            Kembali ke Booking
        </a>
    </div>

    @if(session('success'))
        <div class="alert">
            {{ session('success') }}
        </div>
    @endif

    <div class="card">
        <form
            method="GET"
            action="{{ route('rental-checkins.index') }}"
            class="filter"
        >
            <div class="form-group">
                <label for="late">Status Pengembalian</label>

                <select name="late" id="late">
                    <option value="">Semua</option>

                    <option
                        value="0"
                        @selected(request('late') === '0')
                    >
                        Tidak Terlambat
                    </option>

                    <option
                        value="1"
                        @selected(request('late') === '1')
                    >
                        Terlambat
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
                href="{{ route('rental-checkins.index') }}"
                class="btn btn-secondary"
            >
                Reset
            </a>
        </form>
    </div>

    <div class="card">

        @if($checkins->count() > 0)

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Booking</th>
                            <th>Kendaraan</th>
                            <th>Customer</th>
                            <th>Check-in</th>
                            <th>Odometer</th>
                            <th>Status</th>
                            <th>Late Fee</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>

                    @foreach($checkins as $checkin)

                        <tr>
                            <td>
                                <strong>
                                    {{ $checkin->booking?->booking_number ?? '-' }}
                                </strong>
                            </td>

                            <td>
                                {{ $checkin->vehicle?->name ?? '-' }}
                            </td>

                            <td>
                                {{ $checkin->booking?->customer?->name ?? '-' }}
                            </td>

                            <td>
                                {{ $checkin->checkin_at?->format('d M Y H:i') ?? '-' }}
                            </td>

                            <td>
                                {{ number_format((float) $checkin->odometer, 0, ',', '.') }}
                            </td>

                            <td>
                                @if($checkin->is_late_return)
                                    <span class="badge badge-danger">
                                        Terlambat
                                    </span>
                                @else
                                    <span class="badge badge-success">
                                        Tepat Waktu
                                    </span>
                                @endif
                            </td>

                            <td class="amount">
                                Rp {{ number_format((float) $checkin->late_return_fee, 0, ',', '.') }}
                            </td>

                            <td>
                                <a
                                    href="{{ route('rental-checkins.show', $checkin) }}"
                                    class="btn btn-primary"
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
                {{ $checkins->links() }}
            </div>

        @else

            <p>Belum ada data rental check-in.</p>

        @endif

    </div>

</div>

</body>
</html>