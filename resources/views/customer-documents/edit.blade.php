```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Customer Document - RentGo</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            margin: 0;
            padding: 30px;
        }

        .container {
            max-width: 700px;
            margin: auto;
        }

        .card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;
            font-weight: bold;
            margin-bottom: 7px;
        }

        input,
        select {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
        }

        input[type="file"] {
            padding: 8px;
        }

        .button {
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            background: #2563eb;
            color: white;
            cursor: pointer;
        }

        .back {
            display: inline-block;
            margin-bottom: 20px;
            color: #2563eb;
            text-decoration: none;
        }

        .error {
            color: #dc2626;
            font-size: 14px;
            margin-top: 5px;
        }

        .info {
            background: #eff6ff;
            color: #1e40af;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

<div class="container">

    <a
        href="{{ route('customer-documents.show', $customerDocument) }}"
        class="back"
    >
        ← Kembali
    </a>

    <div class="card">

        <h1>Edit Customer Document</h1>

        <div class="info">
            Jika file dokumen diganti, dokumen akan kembali berstatus
            <strong>pending</strong> dan harus diverifikasi ulang oleh admin.
        </div>

        @if($errors->any())
            <div style="color: #dc2626; margin-bottom: 20px;">
                <strong>Terjadi kesalahan:</strong>

                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="form-group">
            <label>Customer</label>

            <input
                type="text"
                value="{{ $customerDocument->customerProfile?->user?->name ?? '-' }}"
                disabled
            >
        </div>

        <div class="form-group">
            <label>Status Saat Ini</label>

            <input
                type="text"
                value="{{ ucfirst($customerDocument->status) }}"
                disabled
            >
        </div>

        <form
            action="{{ route('customer-documents.update', $customerDocument) }}"
            method="POST"
            enctype="multipart/form-data"
        >

            @csrf
            @method('PUT')

            <div class="form-group">
                <label for="document_type">
                    Jenis Dokumen
                </label>

                <select
                    name="document_type"
                    id="document_type"
                    required
                >
                    <option value="KTP"
                        {{ old('document_type', $customerDocument->document_type) === 'KTP' ? 'selected' : '' }}>
                        KTP
                    </option>

                    <option value="SIM"
                        {{ old('document_type', $customerDocument->document_type) === 'SIM' ? 'selected' : '' }}>
                        SIM
                    </option>

                    <option value="Passport"
                        {{ old('document_type', $customerDocument->document_type) === 'Passport' ? 'selected' : '' }}>
                        Passport
                    </option>

                    <option value="Other"
                        {{ old('document_type', $customerDocument->document_type) === 'Other' ? 'selected' : '' }}>
                        Lainnya
                    </option>
                </select>

                @error('document_type')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="document_number">
                    Nomor Dokumen
                </label>

                <input
                    type="text"
                    name="document_number"
                    id="document_number"
                    value="{{ old('document_number', $customerDocument->document_number) }}"
                >

                @error('document_number')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label>
                    File Saat Ini
                </label>

                <input
                    type="text"
                    value="{{ $customerDocument->file_path }}"
                    disabled
                >
            </div>

            <div class="form-group">
                <label for="file">
                    Ganti File Dokumen
                </label>

                <input
                    type="file"
                    name="file"
                    id="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                >

                <small>
                    Kosongkan jika tidak ingin mengganti file.
                    Maksimal 5 MB.
                </small>

                @error('file')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="expires_at">
                    Tanggal Kedaluwarsa
                </label>

                <input
                    type="date"
                    name="expires_at"
                    id="expires_at"
                    value="{{ old('expires_at', $customerDocument->expires_at?->format('Y-m-d')) }}"
                >

                @error('expires_at')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="button">
                Simpan Perubahan
            </button>

        </form>

    </div>

</div>

</body>
</html>
```
