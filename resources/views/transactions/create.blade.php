<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Buat Transaksi - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 30px;
        }

        .container {
            max-width: 800px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
        }

        .field {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 6px;
            font-weight: bold;
        }

        textarea {
            width: 100%;
            min-height: 100px;
        }

        .btn {
            padding: 10px 18px;
            background: #222;
            color: white;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
        }

        .error {
            color: #b00020;
            margin-bottom: 15px;
        }
    </style>
</head>

<body>

<div class="container">

    <h1>Buat Transaksi</h1>

    <div class="card">

        @if($errors->any())
            <div class="error">
                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @if(!$booking)

            <p>
                Booking belum dipilih.
            </p>

        @else

            <p>
                <strong>Booking:</strong>
                {{ $booking->booking_number }}
            </p>

            <p>
                <strong>Customer:</strong>
                {{ $booking->customer?->name ?? '-' }}
            </p>

            <p>
                <strong>Status Booking:</strong>
                {{ ucfirst($booking->status) }}
            </p>

            <p>
                <strong>Rental:</strong>
                Rp {{ number_format(
                    (float) $booking->rental_amount,
                    0,
                    ',',
                    '.'
                ) }}
            </p>

            @if($booking->rentalDamages->isNotEmpty())

                <h3>Damage</h3>

                @foreach($booking->rentalDamages as $damage)

                    <div style="margin-bottom:10px;">

                        {{ $damage->description }}

                        <br>

                        Charge:
                        Rp {{ number_format(
                            (float) $damage->customer_charge,
                            0,
                            ',',
                            '.'
                        ) }}

                        <br>

                        @if($damage->deducted_from_deposit)
                            <strong>
                                Dipotong dari deposit
                            </strong>
                        @else
                            <strong>
                                Additional charge
                            </strong>
                        @endif

                    </div>

                @endforeach

            @endif

            <form
                method="POST"
                action="{{ route('transactions.store') }}"
            >

                @csrf

                <input
                    type="hidden"
                    name="booking_id"
                    value="{{ $booking->id }}"
                >

                <div class="field">

                    <label for="notes">
                        Catatan
                    </label>

                    <textarea
                        name="notes"
                        id="notes"
                    >{{ old('notes') }}</textarea>

                </div>

                <button
                    type="submit"
                    class="btn"
                >
                    Buat Transaksi
                </button>

            </form>

        @endif

    </div>

</div>

</body>
</html>