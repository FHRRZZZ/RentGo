<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Audit Log - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6fa;
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
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
        }

        .filter {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        select,
        button {
            padding: 8px 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
        }

        th {
            background: #f9fafb;
        }

        .btn {
            display: inline-block;
            padding: 7px 10px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }

        .badge {
            padding: 4px 8px;
            border-radius: 5px;
            background: #e5e7eb;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Audit Log</h1>

    <div class="card">

        <form
            action="{{ route('audit-logs.index') }}"
            method="GET"
            class="filter"
        >

            <select name="action">
                <option value="">Semua Action</option>

                @foreach ($actions as $action)
                    <option
                        value="{{ $action }}"
                        @selected(request('action') === $action)
                    >
                        {{ ucfirst($action) }}
                    </option>
                @endforeach
            </select>

            <select name="module">
                <option value="">Semua Module</option>

                @foreach ($modules as $module)
                    <option
                        value="{{ $module }}"
                        @selected(request('module') === $module)
                    >
                        {{ ucfirst($module) }}
                    </option>
                @endforeach
            </select>

            <button type="submit">
                Filter
            </button>

            <a
                href="{{ route('audit-logs.index') }}"
                class="btn"
            >
                Reset
            </a>

        </form>

    </div>

    <div class="card">

        <table>

            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody>

            @forelse ($auditLogs as $log)

                <tr>

                    <td>
                        {{ $log->created_at?->format('d M Y H:i:s') }}
                    </td>

                    <td>
                        {{ $log->user?->name ?? 'System' }}
                    </td>

                    <td>
                        <span class="badge">
                            {{ $log->action }}
                        </span>
                    </td>

                    <td>
                        {{ $log->module }}
                    </td>

                    <td>
                        {{ $log->description }}
                    </td>

                    <td>
                        <a
                            href="{{ route('audit-logs.show', $log) }}"
                            class="btn"
                        >
                            Detail
                        </a>
                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="6">
                        Belum ada audit log.
                    </td>
                </tr>

            @endforelse

            </tbody>

        </table>

    </div>

    {{ $auditLogs->links() }}

</div>

</body>
</html>