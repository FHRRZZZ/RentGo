<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Detail Review</title>
</head>
<body>

<div style="max-width:800px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Detail Review</h1>

    @if (session('success'))
        <div style="padding:15px;background:#d1fae5;margin-bottom:20px;">
            {{ session('success') }}
        </div>
    @endif

    @if ($errors->any())
        <div style="padding:15px;background:#fee2e2;margin-bottom:20px;">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div style="padding:20px;border:1px solid #ddd;border-radius:8px;">

        <p>
            <strong>Booking:</strong>
            {{ $review->booking?->booking_number ?? '-' }}
        </p>

        <p>
            <strong>Customer:</strong>
            {{ $review->customer?->name ?? '-' }}
        </p>

        <p>
            <strong>Kendaraan:</strong>
            {{ $review->vehicle?->name ?? '-' }}
        </p>

        <p>
            <strong>Rating:</strong>
            {{ $review->rating }}/5
        </p>

        <p>
            <strong>Review:</strong>
        </p>

        <div style="padding:15px;background:#f5f5f5;">
            {{ $review->review ?: 'Tidak ada komentar.' }}
        </div>

        <p>
            <strong>Status:</strong>
            {{ ucfirst($review->status) }}
        </p>

        @if ($review->moderation_note)
            <p>
                <strong>Catatan Moderasi:</strong>
                {{ $review->moderation_note }}
            </p>
        @endif

    </div>

    @if (
        auth()->user()->hasRole('admin') &&
        $review->status === 'pending'
    )
        <div style="margin-top:30px;padding:20px;border:1px solid #ddd;">

            <h2>Moderasi Review</h2>

            <form
                method="POST"
                action="{{ route('reviews.process', $review) }}"
            >
                @csrf

                <div>
                    <label>Status</label>

                    <select name="status" required>
                        <option value="">Pilih status</option>
                        <option value="published">
                            Published
                        </option>
                        <option value="hidden">
                            Hidden
                        </option>
                        <option value="rejected">
                            Rejected
                        </option>
                    </select>
                </div>

                <div style="margin-top:15px;">
                    <label>Catatan Moderasi</label>

                    <br>

                    <textarea
                        name="moderation_note"
                        rows="5"
                        style="width:100%;"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    style="margin-top:15px;padding:10px 18px;"
                >
                    Proses Review
                </button>
            </form>

        </div>
    @endif

    <div style="margin-top:20px;">
        <a href="{{ route('reviews.index') }}">
            Kembali ke Review
        </a>
    </div>

</div>

</body>
</html>