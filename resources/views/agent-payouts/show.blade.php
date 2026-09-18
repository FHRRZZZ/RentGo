<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        {{ $agentPayout->payout_number }} - RentGo
    </title>

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
            margin-bottom: 20px;
        }

        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        input,
        select,
        textarea {
            width: 100%;
            padding: 10px;
            margin-top: 6px;
            margin-bottom: 15px;
            box-sizing: border-box;
        }

        button,
        .btn {
            padding: 10px 16px;
            background: #222;
            color: white;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
        }

        .success {
            background: #dff5e1;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }

        .error {
            color: #b00020;
            margin-bottom: 20px;
        }

    </style>

</head>

<body>

<div class="container">

    <h1>
        {{ $agentPayout->payout_number }}
    </h1>

    @if(session('success'))

        <div class="success">
            {{ session('success') }}
        </div>

    @endif

    @if($errors->any())

        <div class="error">

            @foreach($errors->all() as $error)
                <div>{{ $error }}</div>
            @endforeach

        </div>

    @endif

    <div class="card">

        <h2>Informasi Payout</h2>

        <div class="row">
            <span>Mitra</span>

            <strong>
                {{
                    $agentPayout
                        ->agentProfile
                        ?->agency_name
                    ?? '-'
                }}
            </strong>
        </div>

        <div class="row">
            <span>Transaction</span>

            <strong>
                {{
                    $agentPayout
                        ->transaction
                        ?->transaction_number
                    ?? '-'
                }}
            </strong>
        </div>

        <div class="row">
            <span>Amount</span>

            <strong>
                Rp {{ number_format(
                    (float) $agentPayout->amount,
                    0,
                    ',',
                    '.'
                ) }}
            </strong>
        </div>

        <div class="row">
            <span>Status</span>

            <strong>
                {{ ucfirst($agentPayout->status) }}
            </strong>
        </div>

        <div class="row">
            <span>Metode</span>

            <strong>
                {{
                    $agentPayout->payout_method
                    ?? '-'
                }}
            </strong>
        </div>

    </div>

    @if($agentPayout->transactionCommission)

        <div class="card">

            <h2>Commission</h2>

            <div class="row">

                <span>Commission Base</span>

                <strong>
                    Rp {{ number_format(
                        (float)
                        $agentPayout
                            ->transactionCommission
                            ->commission_base,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>

            </div>

            <div class="row">

                <span>Commission</span>

                <strong>
                    Rp {{ number_format(
                        (float)
                        $agentPayout
                            ->transactionCommission
                            ->commission_amount,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>

            </div>

            <div class="row">

                <span>Net Mitra</span>

                <strong>
                    Rp {{ number_format(
                        (float)
                        $agentPayout
                            ->transactionCommission
                            ->net_amount,
                        0,
                        ',',
                        '.'
                    ) }}
                </strong>

            </div>

        </div>

    @endif

    @if(
        auth()->user()->hasRole('admin') &&
        in_array(
            $agentPayout->status,
            ['pending', 'processing']
        )
    )

        <div class="card">

            <h2>Proses Payout</h2>

            <form
                method="POST"
                action="{{ route(
                    'agent-payouts.process',
                    $agentPayout
                ) }}"
            >

                @csrf

                <label>
                    Status
                </label>

                <select name="status" required>

                    <option value="">
                        Pilih Status
                    </option>

                    <option value="processing">
                        Processing
                    </option>

                    <option value="paid">
                        Paid
                    </option>

                    <option value="failed">
                        Failed
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>

                </select>

                <label>
                    Metode Payout
                </label>

                <select
                    name="payout_method"
                    required
                >

                    <option value="">
                        Pilih Metode
                    </option>

                    <option value="bank_transfer">
                        Bank Transfer
                    </option>

                    <option value="cash">
                        Cash
                    </option>

                </select>

                <label>
                    Nama Rekening
                </label>

                <input
                    type="text"
                    name="account_name"
                    value="{{ old('account_name', $agentPayout->account_name) }}"
                >

                <label>
                    Nomor Rekening
                </label>

                <input
                    type="text"
                    name="account_number"
                    value="{{ old('account_number', $agentPayout->account_number) }}"
                >

                <label>
                    Catatan
                </label>

                <textarea
                    name="notes"
                >{{ old('notes', $agentPayout->notes) }}</textarea>

                <button type="submit">
                    Simpan Payout
                </button>

            </form>

        </div>

    @endif

    <a
        href="{{ route('agent-payouts.index') }}"
        class="btn"
    >
        Kembali
    </a>

</div>

</body>

</html>