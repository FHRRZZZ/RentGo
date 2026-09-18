<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Review</title>
</head>
<body>

<div style="max-width:1000px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Review</h1>

    @if (session('success'))
        <div style="padding:15px;background:#d1fae5;margin-bottom:20px;">
            {{ session('success') }}
        </div>
    @endif

    <table
        width="100%"
        cellpadding="10"
        cellspacing="0"
        border="1"
    >
        <thead>
            <tr>
                <th>Booking</th>
                <th>Customer</th>
                <th>Kendaraan</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Aksi</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($reviews as $review)
                <tr>
                    <td>
                        {{ $review->booking?->booking_number ?? '-' }}
                    </td>

                    <td>
                        {{ $review->customer?->name ?? '-' }}
                    </td>

                    <td>
                        {{ $review->vehicle?->name ?? '-' }}
                    </td>

                    <td>
                        {{ $review->rating }}/5
                    </td>

                    <td>
                        {{ ucfirst($review->status) }}
                    </td>

                    <td>
                        <a
                            href="{{ route('reviews.show', $review) }}"
                        >
                            Detail
                        </a>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6">
                        Belum ada review.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top:20px;">
        {{ $reviews->links() }}
    </div>

</div>

</body>
</html>