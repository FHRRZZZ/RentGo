<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Rental Damage - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 1200px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        h1 {
            margin-top: 0;
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
        }

        th {
            background: #f8f8f8;
        }

        .btn {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 6px;
            text-decoration: none;
            border: none;
            cursor: pointer;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .filter {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        select {
            padding: 9px;
            border: 1px solid #ddd;
            border-radius: 6px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 12px;
            background: #eee;
        }

        .pagination {
            margin-top: 20px;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="card">
        <h1>Data Kerusakan Kendaraan</h1>

        <form
            action="{{ route('rental-damages.index') }}"
            method="GET"
            class="filter"
        >
            <select name="status">
                <option value="">Semua Status</option>

                @foreach([
                    'reported',
                    'confirmed',
                    'resolved',
                    'rejected'
                ] as $status)

                    <option
                        value="{{ $status }}"
                        @selected(request('status') === $status)
                    >
                        {{ ucfirst($status) }}
                    </option>

                @endforeach
            </select>

            <select name="severity">
                <option value="">Semua Tingkat</option>

                @foreach([
                    'minor',
                    'moderate',
                    'major'
                ] as $severity)

                    <option
                        value="{{ $severity }}"
                        @selected(request('severity') === $severity)
                    >
                        {{ ucfirst($severity) }}
                    </option>

                @endforeach
            </select>

            <button
                type="submit"
                class="btn btn-primary"
            >
                Filter
            </button>
        </form>
    </div>

    <div class="card">

        <table>
            <thead>
                <tr>
                    <th>Booking</th>
                    <th>Kendaraan</th>
                    <th>Kerusakan</th>
                    <th>Tingkat</th>
                    <th>Customer Charge</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>

            @forelse($damages as $damage)

                <tr>
                    <td>
                        {{ $damage->booking?->booking_number ?? '-' }}
                    </td>

                    <td>
                        {{ $damage->vehicle?->name ?? '-' }}
                    </td>

                    <td>
                        {{ \Illuminate\Support\Str::limit(
                            $damage->description,
                            70
                        ) }}
                    </td>

                    <td>
                        <span class="badge">
                            {{ ucfirst($damage->severity) }}
                        </span>
                    </td>

                    <td>
                        Rp
                        {{ number_format(
                            (float) $damage->customer_charge,
                            0,
                            ',',
                            '.'
                        ) }}
                    </td>

                    <td>
                        <span class="badge">
                            {{ ucfirst($damage->status) }}
                        </span>
                    </td>

                    <td>
                        <a
                            href="{{ route(
                                'rental-damages.show',
                                $damage
                            ) }}"
                            class="btn btn-primary"
                        >
                            Detail
                        </a>
                    </td>
                </tr>

            @empty

                <tr>
                    <td colspan="7">
                        Belum ada data kerusakan kendaraan.
                    </td>
                </tr>

            @endforelse

            </tbody>
        </table>

        <div class="pagination">
            {{ $damages->links() }}
        </div>

    </div>

</div>

</body>
</html>