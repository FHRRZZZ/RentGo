<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Notifikasi - RentGo</title>

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

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        .unread {
            border-left: 4px solid #2563eb;
        }

        .title {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .message {
            color: #555;
            margin-bottom: 10px;
        }

        .meta {
            color: #888;
            font-size: 13px;
        }

        .actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }

        a,
        button {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            cursor: pointer;
            font-size: 14px;
        }

        .btn-primary {
            background: #2563eb;
            color: white;
        }

        .btn-secondary {
            background: #e5e7eb;
            color: #111;
        }

        .btn-danger {
            background: #dc2626;
            color: white;
        }

        .success {
            background: #dcfce7;
            color: #166534;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
        }

        .filter {
            margin-bottom: 20px;
        }

        .filter a {
            margin-right: 5px;
        }

        .pagination {
            margin-top: 20px;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <div>
            <h1>Notifikasi</h1>
            <p>
                Belum dibaca:
                <strong>{{ $unreadCount }}</strong>
            </p>
        </div>

        @if($unreadCount > 0)
            <form
                method="POST"
                action="{{ route('notifications.readAll') }}"
            >
                @csrf

                <button
                    type="submit"
                    class="btn-primary"
                >
                    Tandai Semua Dibaca
                </button>
            </form>
        @endif
    </div>

    @if(session('success'))
        <div class="success">
            {{ session('success') }}
        </div>
    @endif

    <div class="filter">
        <a
            href="{{ route('notifications.index') }}"
            class="btn-secondary"
        >
            Semua
        </a>

        <a
            href="{{ route('notifications.index', ['status' => 'unread']) }}"
            class="btn-secondary"
        >
            Belum Dibaca
        </a>

        <a
            href="{{ route('notifications.index', ['status' => 'read']) }}"
            class="btn-secondary"
        >
            Sudah Dibaca
        </a>
    </div>

    @forelse($notifications as $notification)

        <div class="card {{ $notification->read_at ? '' : 'unread' }}">

            <div class="title">
                {{ $notification->title }}
            </div>

            <div class="message">
                {{ $notification->message }}
            </div>

            <div class="meta">
                {{ $notification->type }}
                ·
                {{ $notification->channel }}
                ·
                {{ $notification->created_at->format('d M Y H:i') }}
            </div>

            <div class="actions">

                <a
                    href="{{ route('notifications.show', $notification) }}"
                    class="btn-primary"
                >
                    Lihat
                </a>

                @if(!$notification->read_at)
                    <form
                        method="POST"
                        action="{{ route('notifications.read', $notification) }}"
                    >
                        @csrf

                        <button
                            type="submit"
                            class="btn-secondary"
                        >
                            Tandai Dibaca
                        </button>
                    </form>
                @endif

                <form
                    method="POST"
                    action="{{ route('notifications.destroy', $notification) }}"
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

    @empty

        <div class="card">
            Belum ada notifikasi.
        </div>

    @endforelse

    <div class="pagination">
        {{ $notifications->links() }}
    </div>

</div>

</body>
</html>