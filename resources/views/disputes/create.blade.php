<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Ajukan Dispute - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
        }

        h1 {
            margin-top: 0;
            margin-bottom: 25px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-weight: bold;
        }

        input,
        select,
        textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-family: inherit;
        }

        textarea {
            min-height: 150px;
            resize: vertical;
        }

        .booking-info {
            padding: 15px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .error {
            color: #dc2626;
            font-size: 14px;
            margin-top: 5px;
        }

        .help {
            color: #6b7280;
            font-size: 13px;
            margin-top: 5px;
        }

        .actions {
            display: flex;
            gap: 10px;
            margin-top: 25px;
        }

        button,
        .btn {
            display: inline-block;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            cursor: pointer;
            background: #2563eb;
            color: white;
        }

        .btn-secondary {
            background: #6b7280;
        }
    </style>
</head>

<body>

<div class="container">

    <div class="card">

        <h1>Ajukan Dispute</h1>

        @if ($booking)
            <div class="booking-info">

                <strong>Booking terkait</strong>

                <p>
                    Nomor Booking:
                    <strong>
                        #{{ $booking->booking_number }}
                    </strong>
                </p>

                <p>
                    Customer:
                    {{ $booking->customer?->name ?? '-' }}
                </p>

                <p>
                    Mitra:
                    {{ $booking->agentProfile?->agency_name ?? '-' }}
                </p>

                @if ($booking->items->isNotEmpty())
                    <p>
                        Kendaraan:
                        {{ $booking->items->first()->vehicle?->name ?? '-' }}
                    </p>
                @endif

                <input
                    type="hidden"
                    name="booking_id"
                    value="{{ $booking->id }}"
                    form="dispute-form"
                >

            </div>
        @endif

        <form
            id="dispute-form"
            method="POST"
            action="{{ route('disputes.store') }}"
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

            <div class="form-group">

                <label for="respondent_id">
                    Pihak yang Dilaporkan
                </label>

                <input
                    type="number"
                    id="respondent_id"
                    name="respondent_id"
                    value="{{ old('respondent_id') }}"
                    placeholder="Opsional"
                >

                <div class="help">
                    Kosongkan jika dispute berasal dari booking.
                    Sistem akan menentukan pihak lawan secara otomatis.
                </div>

                @error('respondent_id')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>

            <div class="form-group">

                <label for="subject">
                    Subjek Sengketa
                </label>

                <input
                    type="text"
                    id="subject"
                    name="subject"
                    value="{{ old('subject') }}"
                    maxlength="255"
                    required
                >

                @error('subject')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>

            <div class="form-group">

                <label for="category">
                    Kategori
                </label>

                <select
                    id="category"
                    name="category"
                    required
                >
                    <option value="">
                        -- Pilih Kategori --
                    </option>

                    <option
                        value="vehicle"
                        @selected(old('category') === 'vehicle')
                    >
                        Kendaraan
                    </option>

                    <option
                        value="booking"
                        @selected(old('category') === 'booking')
                    >
                        Booking
                    </option>

                    <option
                        value="payment"
                        @selected(old('category') === 'payment')
                    >
                        Pembayaran
                    </option>

                    <option
                        value="service"
                        @selected(old('category') === 'service')
                    >
                        Pelayanan
                    </option>

                    <option
                        value="mitra"
                        @selected(old('category') === 'mitra')
                    >
                        Mitra
                    </option>

                    <option
                        value="customer"
                        @selected(old('category') === 'customer')
                    >
                        Customer
                    </option>

                    <option
                        value="other"
                        @selected(old('category') === 'other')
                    >
                        Lainnya
                    </option>
                </select>

                @error('category')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>

            <div class="form-group">

                <label for="description">
                    Deskripsi Sengketa
                </label>

                <textarea
                    id="description"
                    name="description"
                    maxlength="5000"
                    required
                >{{ old('description') }}</textarea>

                <div class="help">
                    Jelaskan masalah atau sengketa secara lengkap.
                </div>

                @error('description')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>

            <div class="form-group">

                <label for="attachments">
                    Lampiran
                </label>

                <input
                    type="file"
                    id="attachments"
                    name="attachments[]"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                >

                <div class="help">
                    Maksimal 5 file. Format JPG, JPEG, PNG, atau WEBP.
                    Maksimal 5 MB per file.
                </div>

                @error('attachments')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

                @error('attachments.*')
                    <div class="error">
                        {{ $message }}
                    </div>
                @enderror

            </div>

            <div class="actions">

                <button type="submit">
                    Ajukan Dispute
                </button>

                <a
                    href="{{ route('disputes.index') }}"
                    class="btn btn-secondary"
                >
                    Batal
                </a>

            </div>

        </form>

    </div>

</div>

</body>
</html>