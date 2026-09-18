<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>{{ $notification->title }} - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6fa;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 800px;
            margin: auto;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .message {
            line-height: 1.6;
            margin: 20px 0;
        }

        .meta {
            color: #777;
            font-size: 14px;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }

        .actions {
            margin-top: 20px;
        }

        a,
        button {
            padding: 9px 14px;
            border-radius: 5px;
            border: none;
            text-decoration: none;
            cursor: pointer;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .btn-danger {
            background: #dc2626;
            color: white;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="card">

        <div class="title">
            {{ $notification->title }}
        </div>

        <div class="message">
            {{ $notification->message }}
        </div>

        <div class="meta">
            <div>
                <strong>Tipe:</strong>
                {{ $notification->type }}
            </div>

            <div>
                <strong>Channel:</strong>
                {{ $notification->channel }}
            </div>

            <div>
                <strong>Dibuat:</strong>
                {{ $notification->created_at->format('d M Y H:i') }}
            </div>

            <div>
                <strong>Status:</strong>

                @if($notification->read_at)
                    Sudah dibaca
                    ({{ $notification->read_at->format('d M Y H:i') }})
                @else
                    Belum dibaca
                @endif
            </div>
        </div>

        @if($notification->data)
            <div class="meta" style="margin-top: 15px;">
                <strong>Data:</strong>

                <pre>{{ json_encode($notification->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
            </div>
        @endif

        <div class="actions">

            <a
                href="{{ route('notifications.index') }}"
                class="btn-primary"
            >
                Kembali
            </a>

            @if(!$notification->read_at)
                <form
                    method="POST"
                    action="{{ route('notifications.read', $notification) }}"
                    style="display:inline;"
                >
                    @csrf

                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        Tandai Dibaca
                    </button>
                </form>
            @endif

            <form
                method="POST"
                action="{{ route('notifications.destroy', $notification) }}"
                style="display:inline;"
                onsubmit="return confirm('Hapus notifikasi ini?')"
            >
                @csrf
                @method('DELETE')

                <button
                    type="submit"
                    class="btn-danger"
                >
                    Hapus
                </button>
            </form>

        </div>

    </div>

</div>

</body>
</html>