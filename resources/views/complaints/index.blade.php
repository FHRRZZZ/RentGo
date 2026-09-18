<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pengaduan</title>
</head>
<body>

<div style="max-width:1100px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Pengaduan</h1>

    @if (session('success'))
        <div style="padding:15px;background:#d1fae5;margin-bottom:20px;">
            {{ session('success') }}
        </div>
    @endif

    <p>
        <a href="{{ route('complaints.create') }}">
            Buat Pengaduan
        </a>
    </p>

    <table
        width="100%"
        border="1"
        cellpadding="10"
        cellspacing="0"
    >
        <thead>
            <tr>
                <th>Booking</th>
                <th>Subjek</th>
                <th>Pelapor</th>
                <th>Kategori</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($complaints as $complaint)
                <tr>
                    <td>
                        {{ $complaint->booking?->booking_number ?? '-' }}
                    </td>

                    <td>
                        {{ $complaint->subject }}
                    </td>

                    <td>
                        {{ $complaint->complainant?->name ?? '-' }}
                    </td>

                    <td>
                        {{ ucfirst($complaint->category) }}
                    </td>

                    <td>
                        {{ ucfirst($complaint->priority) }}
                    </td>

                    <td>
                        {{ ucfirst(str_replace(
                            '_',
                            ' ',
                            $complaint->status
                        )) }}
                    </td>

                    <td>
                        <a
                            href="{{ route(
                                'complaints.show',
                                $complaint
                            ) }}"
                        >
                            Detail
                        </a>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">
                        Belum ada pengaduan.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top:20px;">
        {{ $complaints->links() }}
    </div>

</div>

</body>
</html>