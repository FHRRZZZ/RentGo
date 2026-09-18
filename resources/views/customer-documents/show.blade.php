```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Detail Customer Document - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 800px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .row {
            display: grid;
            grid-template-columns: 200px 1fr;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .label {
            font-weight: bold;
        }

        .actions {
            margin-top: 25px;
        }

        .button {
            display: inline-block;
            padding: 10px 16px;
            margin-right: 8px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            border: none;
            font-size: 14px;
        }

        .button-secondary {
            background: #6b7280;
        }

        .button-success {
            background: #16a34a;
            cursor: pointer;
        }

        .button-success:hover {
            background: #15803d;
        }

        .button-danger {
            background: #dc2626;
            cursor: pointer;
        }

        .button-danger:hover {
            background: #b91c1c;
        }

        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
        }

        .pending {
            background: #fef3c7;
            color: #92400e;
        }

        .approved {
            background: #dcfce7;
            color: #166534;
        }

        .rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .expired {
            background: #e5e7eb;
            color: #374151;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            background: #dcfce7;
            color: #166534;
        }

        .error-alert {
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            background: #fee2e2;
            color: #991b1b;
        }

        .verification {
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid #e5e7eb;
        }

        .verification h2 {
            margin-top: 0;
            margin-bottom: 10px;
        }

        .verification p {
            color: #6b7280;
        }

        .verification-form {
            margin-top: 15px;
        }

        .verification-form textarea {
            width: 100%;
            max-width: 100%;
            min-height: 100px;
            padding: 10px;
            margin-top: 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-sizing: border-box;
            resize: vertical;
            font-family: Arial, sans-serif;
            font-size: 14px;
        }

        .verification-form textarea:focus {
            outline: none;
            border-color: #2563eb;
        }

        .error {
            color: #dc2626;
            margin-top: 5px;
            font-size: 14px;
        }

        .status-approved {
            color: #166534;
            font-weight: bold;
        }

        .status-rejected {
            color: #991b1b;
            font-weight: bold;
        }

        .status-pending {
            color: #92400e;
            font-weight: bold;
        }

        @media (max-width: 600px) {
            body {
                padding: 15px;
            }

            .card {
                padding: 18px;
            }

            .row {
                grid-template-columns: 1fr;
                gap: 5px;
            }

            .label {
                margin-bottom: 3px;
            }

            .button {
                margin-bottom: 8px;
            }
        }
    </style>
</head>

<body>

<div class="container">

    {{-- SUCCESS MESSAGE --}}
    @if(session('success'))
        <div class="alert">
            {{ session('success') }}
        </div>
    @endif

    {{-- ERROR MESSAGE --}}
    @if(session('error'))
        <div class="error-alert">
            {{ session('error') }}
        </div>
    @endif

    {{-- VALIDATION ERRORS --}}
    @if($errors->any())
        <div class="error-alert">
            <strong>Terjadi kesalahan:</strong>

            <ul style="margin-bottom: 0;">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="card">

        <h1>Detail Customer Document</h1>

        {{-- ID --}}
        <div class="row">
            <div class="label">ID</div>
            <div>
                {{ $customerDocument->id }}
            </div>
        </div>

        {{-- CUSTOMER --}}
        <div class="row">
            <div class="label">Customer</div>
            <div>
                {{ $customerDocument->customerProfile?->user?->name ?? '-' }}
            </div>
        </div>

        {{-- EMAIL --}}
        <div class="row">
            <div class="label">Email</div>
            <div>
                {{ $customerDocument->customerProfile?->user?->email ?? '-' }}
            </div>
        </div>

        {{-- JENIS DOKUMEN --}}
        <div class="row">
            <div class="label">Jenis Dokumen</div>
            <div>
                {{ $customerDocument->document_type }}
            </div>
        </div>

        {{-- NOMOR DOKUMEN --}}
        <div class="row">
            <div class="label">Nomor Dokumen</div>
            <div>
                {{ $customerDocument->document_number ?? '-' }}
            </div>
        </div>

        {{-- FILE --}}
        <div class="row">
            <div class="label">File</div>
            <div>
                {{ $customerDocument->file_path }}
            </div>
        </div>

        {{-- STATUS --}}
        <div class="row">
            <div class="label">Status</div>
            <div>
                <span class="badge {{ $customerDocument->status }}">
                    {{ ucfirst($customerDocument->status) }}
                </span>
            </div>
        </div>

        {{-- TANGGAL VERIFIKASI --}}
        <div class="row">
            <div class="label">Tanggal Verifikasi</div>
            <div>
                {{ $customerDocument->verified_at?->format('d-m-Y H:i') ?? '-' }}
            </div>
        </div>

        {{-- VERIFIER --}}
        <div class="row">
            <div class="label">Diverifikasi Oleh</div>
            <div>
                {{ $customerDocument->verifier?->name ?? '-' }}
            </div>
        </div>

        {{-- ALASAN PENOLAKAN --}}
        <div class="row">
            <div class="label">Alasan Penolakan</div>
            <div>
                {{ $customerDocument->rejection_reason ?? '-' }}
            </div>
        </div>

        {{-- KEDALUWARSA --}}
        <div class="row">
            <div class="label">Kedaluwarsa</div>
            <div>
                {{ $customerDocument->expires_at?->format('d-m-Y') ?? '-' }}
            </div>
        </div>


        {{-- ========================================== --}}
        {{-- ADMIN VERIFICATION                         --}}
        {{-- Hanya muncul jika user adalah admin        --}}
        {{-- dan status dokumen masih pending           --}}
        {{-- ========================================== --}}

        @if(
            auth()->user()->hasRole('admin')
            && $customerDocument->status === 'pending'
        )

            <div class="verification">

                <h2>Verifikasi Dokumen</h2>

                <p>
                    Dokumen ini masih menunggu verifikasi admin.
                    Silakan periksa dokumen sebelum memberikan keputusan.
                </p>


                {{-- ================================ --}}
                {{-- APPROVE                           --}}
                {{-- ================================ --}}

                <form
                    action="{{ route(
                        'customer-documents.verify',
                        $customerDocument
                    ) }}"
                    method="POST"
                    class="verification-form"
                >

                    @csrf

                    <input
                        type="hidden"
                        name="status"
                        value="approved"
                    >

                    <button
                        type="submit"
                        class="button button-success"
                        onclick="return confirm(
                            'Apakah Anda yakin ingin menyetujui dokumen ini?'
                        )"
                    >
                        ✓ Approve Dokumen
                    </button>

                </form>


                {{-- ================================ --}}
                {{-- REJECT                            --}}
                {{-- ================================ --}}

                <form
                    action="{{ route(
                        'customer-documents.verify',
                        $customerDocument
                    ) }}"
                    method="POST"
                    class="verification-form"
                >

                    @csrf

                    <input
                        type="hidden"
                        name="status"
                        value="rejected"
                    >

                    <div>
                        <label for="rejection_reason">
                            <strong>Alasan Penolakan</strong>
                        </label>
                    </div>

                    <textarea
                        name="rejection_reason"
                        id="rejection_reason"
                        maxlength="500"
                        placeholder="Masukkan alasan penolakan..."
                        required
                    >{{ old('rejection_reason') }}</textarea>

                    @error('rejection_reason')
                        <div class="error">
                            {{ $message }}
                        </div>
                    @enderror

                    <br>

                    <button
                        type="submit"
                        class="button button-danger"
                        onclick="return confirm(
                            'Apakah Anda yakin ingin menolak dokumen ini?'
                        )"
                    >
                        ✕ Tolak Dokumen
                    </button>

                </form>

            </div>

        @endif


        {{-- ========================================== --}}
        {{-- INFORMASI STATUS APPROVED                 --}}
        {{-- ========================================== --}}

        @if($customerDocument->status === 'approved')

            <div class="verification">

                <h2>Hasil Verifikasi</h2>

                <p class="status-approved">
                    ✓ Dokumen telah disetujui oleh admin.
                </p>

                <div style="margin-top: 15px;">

                    <strong>Tanggal Verifikasi:</strong>

                    {{ $customerDocument->verified_at?->format(
                        'd-m-Y H:i'
                    ) ?? '-' }}

                </div>

                <div style="margin-top: 8px;">

                    <strong>Diverifikasi Oleh:</strong>

                    {{ $customerDocument->verifier?->name ?? '-' }}

                </div>

            </div>

        @endif


        {{-- ========================================== --}}
        {{-- INFORMASI STATUS REJECTED                 --}}
        {{-- ========================================== --}}

        @if($customerDocument->status === 'rejected')

            <div class="verification">

                <h2>Hasil Verifikasi</h2>

                <p class="status-rejected">
                    ✕ Dokumen ditolak oleh admin.
                </p>

                <div style="margin-top: 15px;">

                    <strong>Alasan Penolakan:</strong>

                    <p>
                        {{ $customerDocument->rejection_reason ?? '-' }}
                    </p>

                </div>

                <div style="margin-top: 8px;">

                    <strong>Tanggal Verifikasi:</strong>

                    {{ $customerDocument->verified_at?->format(
                        'd-m-Y H:i'
                    ) ?? '-' }}

                </div>

                <div style="margin-top: 8px;">

                    <strong>Diverifikasi Oleh:</strong>

                    {{ $customerDocument->verifier?->name ?? '-' }}

                </div>

            </div>

        @endif


        {{-- ========================================== --}}
        {{-- ACTION BUTTONS                            --}}
        {{-- ========================================== --}}

        <div class="actions">

            @can('update', $customerDocument)

                <a
                    href="{{ route(
                        'customer-documents.edit',
                        $customerDocument
                    ) }}"
                    class="button"
                >
                    Edit
                </a>

            @endcan


            <a
                href="{{ route('customer-documents.index') }}"
                class="button button-secondary"
            >
                Kembali
            </a>

        </div>

    </div>

</div>

</body>
</html>
```
