<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Detail Pengaduan</title>
</head>
<body>

<div style="max-width:850px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Detail Pengaduan</h1>

    @if (session('success'))
        <div style="padding:15px;background:#d1fae5;margin-bottom:20px;">
            {{ session('success') }}
        </div>
    @endif

    <div style="padding:20px;border:1px solid #ddd;border-radius:8px;">

        <p>
            <strong>Subjek:</strong>
            {{ $complaint->subject }}
        </p>

        <p>
            <strong>Booking:</strong>
            {{ $complaint->booking?->booking_number ?? '-' }}
        </p>

        <p>
            <strong>Pelapor:</strong>
            {{ $complaint->complainant?->name ?? '-' }}
        </p>

        <p>
            <strong>Kategori:</strong>
            {{ ucfirst($complaint->category) }}
        </p>

        <p>
            <strong>Prioritas:</strong>
            {{ ucfirst($complaint->priority) }}
        </p>

        <p>
            <strong>Status:</strong>
            {{ ucfirst(str_replace(
                '_',
                ' ',
                $complaint->status
            )) }}
        </p>

        <p>
            <strong>Deskripsi:</strong>
        </p>

        <div style="padding:15px;background:#f5f5f5;">
            {{ $complaint->description }}
        </div>

        @if ($complaint->reportedUser)
            <p>
                <strong>User yang Dilaporkan:</strong>
                {{ $complaint->reportedUser->name }}
            </p>
        @endif

        @if ($complaint->assignee)
            <p>
                <strong>Ditangani Oleh:</strong>
                {{ $complaint->assignee->name }}
            </p>
        @endif

        @if ($complaint->resolution)
            <p>
                <strong>Resolusi:</strong>
            </p>

            <div style="padding:15px;background:#f5f5f5;">
                {{ $complaint->resolution }}
            </div>
        @endif

        @if ($complaint->attachments)
            <p>
                <strong>Lampiran:</strong>
            </p>

            @foreach ($complaint->attachments as $attachment)
                <div style="margin-bottom:8px;">
                    <a
                        href="{{ asset(
                            'storage/' . $attachment
                        ) }}"
                        target="_blank"
                    >
                        Lihat Lampiran
                    </a>
                </div>
            @endforeach
        @endif

    </div>

    @if (
        auth()->user()->hasRole('admin') &&
        in_array(
            $complaint->status,
            ['pending', 'in_progress'],
            true
        )
    )

        <div style="margin-top:30px;padding:20px;border:1px solid #ddd;">

            <h2>Proses Pengaduan</h2>

            @if ($errors->any())
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            @endif

            <form
                method="POST"
                action="{{ route(
                    'complaints.process',
                    $complaint
                ) }}"
            >
                @csrf

                <div>
                    <label>Status</label>
                    <br>

                    <select name="status" required>
                        <option value="in_progress">
                            In Progress
                        </option>

                        <option value="resolved">
                            Resolved
                        </option>

                        <option value="rejected">
                            Rejected
                        </option>
                    </select>
                </div>

                <div style="margin-top:15px;">
                    <label>ID Admin yang Ditugaskan</label>
                    <br>

                    <input
                        type="number"
                        name="assigned_to"
                        value="{{ old('assigned_to') }}"
                    >
                </div>

                <div style="margin-top:15px;">
                    <label>Resolusi</label>
                    <br>

                    <textarea
                        name="resolution"
                        rows="6"
                        maxlength="5000"
                        style="width:100%;"
                    >{{ old('resolution') }}</textarea>
                </div>

                <button
                    type="submit"
                    style="margin-top:15px;padding:10px 18px;"
                >
                    Proses Pengaduan
                </button>
            </form>

        </div>

    @endif

    <div style="margin-top:20px;">
        <a href="{{ route('complaints.index') }}">
            Kembali ke Pengaduan
        </a>
    </div>

</div>

</body>
</html>