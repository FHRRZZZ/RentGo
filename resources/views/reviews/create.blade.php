<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berikan Review</title>
</head>
<body>

<div style="max-width:800px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Berikan Review</h1>

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

    @if (!$booking)
        <p>Booking belum dipilih.</p>
        <a href="{{ route('bookings.index') }}">
            Kembali ke Booking
        </a>
    @else

        <div style="padding:20px;border:1px solid #ddd;border-radius:8px;">

            <p>
                <strong>Booking:</strong>
                {{ $booking->booking_number }}
            </p>

            @foreach ($booking->items as $item)
                <p>
                    <strong>Kendaraan:</strong>
                    {{ $item->vehicle?->name ?? '-' }}
                </p>
            @endforeach

            <p>
                <strong>Status:</strong>
                {{ ucfirst($booking->status) }}
            </p>

            <form
                method="POST"
                action="{{ route('reviews.store') }}"
            >
                @csrf

                <input
                    type="hidden"
                    name="booking_id"
                    value="{{ $booking->id }}"
                >

                <div style="margin-top:20px;">
                    <label for="rating">
                        <strong>Rating</strong>
                    </label>

                    <select
                        name="rating"
                        id="rating"
                        required
                    >
                        <option value="">Pilih rating</option>
                        @for ($i = 5; $i >= 1; $i--)
                            <option
                                value="{{ $i }}"
                                @selected(old('rating') == $i)
                            >
                                {{ $i }} / 5
                            </option>
                        @endfor
                    </select>
                </div>

                <div style="margin-top:20px;">
                    <label for="review">
                        <strong>Review</strong>
                    </label>

                    <br>

                    <textarea
                        name="review"
                        id="review"
                        rows="6"
                        style="width:100%;margin-top:8px;"
                        maxlength="5000"
                        placeholder="Tulis pengalaman Anda..."
                    >{{ old('review') }}</textarea>
                </div>

                <button
                    type="submit"
                    style="margin-top:20px;padding:10px 18px;"
                >
                    Kirim Review
                </button>
            </form>

        </div>

    @endif

</div>

</body>
</html>