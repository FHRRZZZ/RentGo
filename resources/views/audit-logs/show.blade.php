<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Detail Audit Log - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6fa;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 900px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            margin-bottom: 15px;
        }

        .row {
            margin-bottom: 15px;
        }

        .label {
            font-weight: bold;
            margin-bottom: 5px;
        }

        pre {
            background: #f3f4f6;
            padding: 15px;
            overflow-x: auto;
            border-radius: 6px;
        }

        .btn {
            display: inline-block;
            padding: 8px 12px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Detail Audit Log</h1>

    <div class="card">

        <div class="row">
            <div class="label">User</div>
            <div>
                {{ $auditLog->user?->name ?? 'System' }}
            </div>
        </div>

        <div class="row">
            <div class="label">Action</div>
            <div>
                {{ $auditLog->action }}
            </div>
        </div>

        <div class="row">
            <div class="label">Module</div>
            <div>
                {{ $auditLog->module }}
            </div>
        </div>

        <div class="row">
            <div class="label">Description</div>
            <div>
                {{ $auditLog->description }}
            </div>
        </div>

        <div class="row">
            <div class="label">Auditable Type</div>
            <div>
                {{ $auditLog->auditable_type ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">Auditable ID</div>
            <div>
                {{ $auditLog->auditable_id ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">IP Address</div>
            <div>
                {{ $auditLog->ip_address ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">User Agent</div>
            <div>
                {{ $auditLog->user_agent ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">Old Values</div>

            <pre>{{ json_encode($auditLog->old_values, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
        </div>

        <div class="row">
            <div class="label">New Values</div>

            <pre>{{ json_encode($auditLog->new_values, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
        </div>

        <div class="row">
            <div class="label">Waktu</div>
            <div>
                {{ $auditLog->created_at?->format('d M Y H:i:s') }}
            </div>
        </div>

    </div>

    <a
        href="{{ route('audit-logs.index') }}"
        class="btn"
    >
        Kembali
    </a>

</div>

</body>
</html>