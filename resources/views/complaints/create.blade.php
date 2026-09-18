<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Buat Pengaduan</title>
</head>
<body>

<div style="max-width:800px;margin:40px auto;font-family:Arial,sans-serif;">

    <h1>Buat Pengaduan</h1>

    @if ($errors->any())
        <div style="padding:15px;background:#fee2e2;margin-bottom:20px;">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if ($booking)
        <div style="padding:15px;background:#f5f5f5;margin-bottom:20px;">
            <strong>Booking:</strong>
            {{ $booking->booking_number }}

            <br>

            <strong>Kendaraan:</strong>
            {{ $booking->items->first()?->vehicle?->name ?? '-' }}
        </div>
    @endif

    <form
        method="POST"
        action="{{ route('complaints.store') }}"
        enctype="multipart/form-data"
    >
        @csrf

        @if ($booking)
            <input
                type="hidden"
                name="booking_id"
                value="{{ $booking->id }}"
            >
        @endif

        <div style="margin-bottom:15px;">
            <label>Subjek</label>
            <br>
            <input
                type="text"
                name="subject"
                value="{{ old('subject') }}"
                required
                maxlength="255"
                style="width:100%;"
            >
        </div>

        <div style="margin-bottom:15px;">
            <label>Kategori</label>
            <br>

            <select name="category" required>
                <option value="">Pilih kategori</option>

                @foreach ([
                    'vehicle' => 'Kendaraan',
                    'booking' => 'Booking',
                    'payment' => 'Pembayaran',
                    'service' => 'Pelayanan',
                    'mitra' => 'Mitra',
                    'customer' => 'Customer',
                    'other' => 'Lainnya',
                ] as $value => $label)

                    <option
                        value="{{ $value }}"
                        @selected(old('category') === $value)
                    >
                        {{ $label }}
                    </option>

                @endforeach
            </select>
        </div>

        <div style="margin-bottom:15px;">
            <label>Prioritas</label>
            <br>

            <select name="priority" required>
                @foreach ([
                    'low',
                    'medium',
                    'high',
                    'urgent',
                ] as $priority)

                    <option
                        value="{{ $priority }}"
                        @selected(old('priority', 'medium') === $priority)
                    >
                        {{ ucfirst($priority) }}
                    </option>

                @endforeach
            </select>
        </div>

        <div style="margin-bottom:15px;">
            <label>Deskripsi</label>
            <br>

            <textarea
                name="description"
                rows="7"
                maxlength="5000"
                required
                style="width:100%;"
            >{{ old('description') }}</textarea>
        </div>

        <div style="margin-bottom:15px;">
            <label>Lampiran Foto</label>
            <br>

            <input
                type="file"
                name="attachments[]"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
            >

            <small>
                Maksimal 5 file, masing-masing 5 MB.
            </small>
        </div>

        <button
            type="submit"
            style="padding:10px 18px;"
        >
            Kirim Pengaduan
        </button>

    </form>

    <div style="margin-top:20px;">
        <a href="{{ route('complaints.index') }}">
            Kembali
        </a>
    </div>

</div>

</body>
</html>