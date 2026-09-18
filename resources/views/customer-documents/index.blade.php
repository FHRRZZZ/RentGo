```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Documents - RentGo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            margin: 0;
            padding: 30px;
            color: #222;
        }

        .container {
            max-width: 1100px;
            margin: auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }

        h1 {
            margin: 0;
        }

        .button {
            display: inline-block;
            padding: 10px 16px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }

        .button:hover {
            background: #1d4ed8;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            background: #dcfce7;
            color: #166534;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow-x: auto;
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
            vertical-align: middle;
        }

        th {
            background: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
        }

        .pending {
            background: #fef3c7;
            color: #92400e;
        }

        .approved {
            background: #dcfce7;
            color: #166534;
        }

        .rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .expired {
            background: #e5e7eb;
            color: #374151;
        }

        .actions a,
        .actions button {
            margin-right: 5px;
            margin-bottom: 5px;
        }

        .link {
            color: #2563eb;
            text-decoration: none;
        }

        .danger {
            color: #dc2626;
        }

        form {
            display: inline;
        }

        .empty {
            text-align: center;
            padding: 30px;
            color: #6b7280;
        }
    </style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1>Customer Documents</h1>

        @can('create', App\Models\CustomerDocument::class)
            <a href="{{ route('customer-documents.create') }}" class="button">
                + Upload Dokumen
            </a>
        @endcan
    </div>

    @if(session('success'))
        <div class="alert">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-error">
            {{ session('error') }}
        </div>
    @endif

    <div class="card">

        @if($documents->count())

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Jenis Dokumen</th>
                        <th>Nomor Dokumen</th>
                        <th>Status</th>
                        <th>Kedaluwarsa</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    @foreach($documents as $document)
                        <tr>
                            <td>{{ $document->id }}</td>

                            <td>
                                {{ $document->customerProfile?->user?->name ?? '-' }}
                                <br>
                                <small>
                                    {{ $document->customerProfile?->user?->email ?? '-' }}
                                </small>
                            </td>

                            <td>
                                {{ $document->document_type }}
                            </td>

                            <td>
                                {{ $document->document_number ?? '-' }}
                            </td>

                            <td>
                                <span class="badge {{ $document->status }}">
                                    {{ ucfirst($document->status) }}
                                </span>
                            </td>

                            <td>
                                {{ $document->expires_at?->format('d-m-Y') ?? '-' }}
                            </td>

                            <td class="actions">

                                @can('view', $document)
                                    <a
                                        href="{{ route('customer-documents.show', $document) }}"
                                        class="link"
                                    >
                                        Lihat
                                    </a>
                                @endcan

                                @can('update', $document)
                                    <a
                                        href="{{ route('customer-documents.edit', $document) }}"
                                        class="link"
                                    >
                                        Edit
                                    </a>
                                @endcan

                                @can('delete', $document)
                                    <form
                                        action="{{ route('customer-documents.destroy', $document) }}"
                                        method="POST"
                                        onsubmit="return confirm('Yakin ingin menghapus dokumen ini?')"
                                    >
                                        @csrf
                                        @method('DELETE')

                                        <button
                                            type="submit"
                                            class="link danger"
                                            style="border: none; background: none; cursor: pointer;"
                                        >
                                            Hapus
                                        </button>
                                    </form>
                                @endcan

                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div style="margin-top: 20px;">
                {{ $documents->links() }}
            </div>

        @else

            <div class="empty">
                Belum ada dokumen customer.
            </div>

        @endif

    </div>

</div>

</body>
</html>
```
