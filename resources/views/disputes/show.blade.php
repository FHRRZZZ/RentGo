<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Detail Dispute - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        h1,
        h2 {
            margin-top: 0;
        }

        .row {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .label {
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 13px;
            background: #e5e7eb;
        }

        .success {
            background: #dcfce7;
            color: #166534;
        }

        .warning {
            background: #fef3c7;
            color: #92400e;
        }

        .danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .info {
            background: #dbeafe;
            color: #1e40af;
        }

        textarea,
        select,
        input {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-family: inherit;
        }

        textarea {
            min-height: 120px;
            resize: vertical;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        button,
        .btn {
            display: inline-block;
            padding: 10px 15px;
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

        .alert {
            padding: 12px 15px;
            border-radius: 7px;
            margin-bottom: 15px;
            background: #dcfce7;
            color: #166534;
        }

        .attachment {
            display: inline-block;
            margin: 5px;
        }

        .attachment img {
            max-width: 180px;
            max-height: 180px;
            border-radius: 8px;
            object-fit: cover;
        }

        .actions {
            margin-top: 20px;
        }

        @media (max-width: 700px) {
            body {
                padding: 15px;
            }

            .row {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Detail Dispute</h1>

    @if (session('success'))
        <div class="alert">
            {{ session('success') }}
        </div>
    @endif

    {{-- Informasi dispute --}}
    <div class="card">

        <h2>Informasi Sengketa</h2>

        <div class="row">
            <div class="label">ID</div>
            <div>{{ $dispute->id }}</div>
        </div>

        <div class="row">
            <div class="label">Booking</div>
            <div>
                @if ($dispute->booking)
                    #{{ $dispute->booking->booking_number }}
                @else
                    -
                @endif
            </div>
        </div>

        <div class="row">
            <div class="label">Pengaju</div>
            <div>
                {{ $dispute->initiator?->name ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">Pihak Lawan</div>
            <div>
                {{ $dispute->respondent?->name ?? '-' }}
            </div>
        </div>

        <div class="row">
            <div class="label">Subjek</div>
            <div>
                {{ $dispute->subject }}
            </div>
        </div>

        <div class="row">
            <div class="label">Kategori</div>
            <div>
                {{ ucfirst($dispute->category) }}
            </div>
        </div>

        <div class="row">
            <div class="label">Status</div>
            <div>
                @php
                    $statusClass = match ($dispute->status) {
                        'resolved' => 'success',
                        'rejected' => 'danger',
                        'investigating' => 'info',
                        default => 'warning',
                    };
                @endphp

                <span class="badge {{ $statusClass }}">
                    {{ ucfirst($dispute->status) }}
                </span>
            </div>
        </div>

    </div>

    {{-- Deskripsi --}}
    <div class="card">

        <h2>Deskripsi</h2>

        <p style="white-space: pre-line;">
            {{ $dispute->description }}
        </p>

    </div>

    {{-- Booking --}}
    @if ($dispute->booking)

        <div class="card">

            <h2>Booking Terkait</h2>

            <div class="row">
                <div class="label">Nomor Booking</div>
                <div>
                    #{{ $dispute->booking->booking_number }}
                </div>
            </div>

            <div class="row">
                <div class="label">Status Booking</div>
                <div>
                    {{ ucfirst($dispute->booking->status) }}
                </div>
            </div>

            @if ($dispute->booking->items->isNotEmpty())

                <div class="row">
                    <div class="label">Kendaraan</div>
                    <div>
                        {{ $dispute->booking->items->first()->vehicle?->name ?? '-' }}
                    </div>
                </div>

            @endif

        </div>

    @endif

    {{-- Attachment --}}
    @if (!empty($dispute->attachments))

        <div class="card">

            <h2>Lampiran</h2>

            @foreach ($dispute->attachments as $attachment)

                <div class="attachment">

                    <a
                        href="{{ asset('storage/' . $attachment) }}"
                        target="_blank"
                    >
                        <img
                            src="{{ asset('storage/' . $attachment) }}"
                            alt="Lampiran dispute"
                        >
                    </a>

                </div>

            @endforeach

        </div>

    @endif

    {{-- Hasil penyelesaian --}}
    @if (
        $dispute->resolution ||
        $dispute->resolved_at ||
        (float) $dispute->refund_amount > 0
    )

        <div class="card">

            <h2>Hasil Penyelesaian</h2>

            @if ($dispute->resolution)
                <div class="row">
                    <div class="label">Resolusi</div>
                    <div style="white-space: pre-line;">
                        {{ $dispute->resolution }}
                    </div>
                </div>
            @endif

            @if ($dispute->resolution_party)
                <div class="row">
                    <div class="label">Pihak Keputusan</div>
                    <div>
                        {{ ucfirst($dispute->resolution_party) }}
                    </div>
                </div>
            @endif

            <div class="row">
                <div class="label">Refund</div>
                <div>
                    Rp {{ number_format((float) $dispute->refund_amount, 0, ',', '.') }}
                </div>
            </div>

            @if ($dispute->resolved_at)
                <div class="row">
                    <div class="label">Diselesaikan</div>
                    <div>
                        {{ $dispute->resolved_at->format('d-m-Y H:i') }}
                    </div>
                </div>
            @endif

            @if ($dispute->assignee)
                <div class="row">
                    <div class="label">Admin</div>
                    <div>
                        {{ $dispute->assignee->name }}
                    </div>
                </div>
            @endif

            @if ($dispute->notes)
                <div class="row">
                    <div class="label">Catatan</div>
                    <div style="white-space: pre-line;">
                        {{ $dispute->notes }}
                    </div>
                </div>
            @endif

        </div>

    @endif

    {{-- Form proses admin --}}
    @if (
        auth()->user()->hasRole('admin') &&
        in_array($dispute->status, ['pending', 'investigating'], true)
    )

        <div class="card">

            <h2>Proses Dispute</h2>

            <form
                method="POST"
                action="{{ route('disputes.process', $dispute) }}"
            >

                @csrf

                <div class="form-group">

                    <label for="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        required
                    >
                        <option
                            value="investigating"
                            @selected($dispute->status === 'investigating')
                        >
                            Investigating
                        </option>

                        <option value="resolved">
                            Resolved
                        </option>

                        <option value="rejected">
                            Rejected
                        </option>
                    </select>

                    @error('status')
                        <div style="color:#dc2626;">
                            {{ $message }}
                        </div>
                    @enderror

                </div>

                <div class="form-group">

                    <label for="assigned_to">
                        ID Admin yang Ditugaskan
                    </label>

                    <input
                        type="number"
                        id="assigned_to"
                        name="assigned_to"
                        value="{{ old('assigned_to', $dispute->assigned_to) }}"
                        min="1"
                    >

                    @error('assigned_to')
                        <div style="color:#dc2626;">
                            {{ $message }}
                        </div>
                    @enderror

                </div>

                <div class="form-group">

                    <label for="resolution">
                        Resolusi
                    </label>

                    <textarea
                        id="resolution"
                        name="resolution"
                        maxlength="5000"
                    >{{ old('resolution', $dispute->resolution) }}</textarea>

                    @error('resolution')
                        <div style="color:#dc2626;">
                            {{ $message }}
                        </div>
                    @enderror

                </div>

                <div class="form-group">

                    <label for="resolution_party">
                        Pihak yang Mendapat Keputusan
                    </label>

                    <select
                        id="resolution_party"
                        name="resolution_party"
                    >
                        <option value="">
                            -- Pilih --
                        </option>

                        <option
                            value="customer"
                            @selected($dispute->resolution_party === 'customer')
                        >
                            Customer
                        </option>

                        <option
                            value="mitra"
                            @selected($dispute->resolution_party === 'mitra')
                        >
                            Mitra
                        </option>

                        <option
                            value="both"
                            @selected($dispute->resolution_party === 'both')
                        >
                            Keduanya
                        </option>

                        <option
                            value="none"
                            @selected($dispute->resolution_party === 'none')
                        >
                            Tidak ada
                        </option>
                    </select>

                </div>

                <div class="form-group">

                    <label for="refund_amount">
                        Jumlah Refund
                    </label>

                    <input
                        type="number"
                        id="refund_amount"
                        name="refund_amount"
                        value="{{ old('refund_amount', $dispute->refund_amount ?? 0) }}"
                        min="0"
                        step="0.01"
                    >

                    @error('refund_amount')
                        <div style="color:#dc2626;">
                            {{ $message }}
                        </div>
                    @enderror

                </div>

                <div class="form-group">

                    <label for="notes">
                        Catatan Admin
                    </label>

                    <textarea
                        id="notes"
                        name="notes"
                        maxlength="2000"
                    >{{ old('notes', $dispute->notes) }}</textarea>

                </div>

                <button type="submit">
                    Simpan Proses Dispute
                </button>

            </form>

        </div>

    @endif

    <div class="actions">

        <a
            href="{{ route('disputes.index') }}"
            class="btn btn-secondary"
        >
            Kembali
        </a>

        @if ($dispute->booking)
            <a
                href="{{ route('bookings.show', $dispute->booking) }}"
                class="btn"
            >
                Lihat Booking
            </a>
        @endif

    </div>

</div>

</body>
</html>