```blade
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Customer Document - RentGo</title>

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

        h1 {
            margin-top: 0;
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

        .button:hover {
            background: #1d4ed8;
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

    <a href="{{ route('customer-documents.index') }}" class="back">
        ← Kembali
    </a>

    <div class="card">

        <h1>Upload Dokumen Customer</h1>

        <div class="info">
            File yang diperbolehkan: JPG, JPEG, PNG, atau PDF.
            Maksimal ukuran file 5 MB.
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

        <form
            action="{{ route('customer-documents.store') }}"
            method="POST"
            enctype="multipart/form-data"
        >

            @csrf

            @if(auth()->user()->hasRole('admin'))

                <div class="form-group">
                    <label for="customer_profile_id">
                        Customer Profile
                    </label>

                    <select
                        name="customer_profile_id"
                        id="customer_profile_id"
                        required
                    >
                        <option value="">
                            -- Pilih Customer --
                        </option>

                        @foreach($customerProfiles as $profile)
                            <option
                                value="{{ $profile->id }}"
                                {{ old('customer_profile_id') == $profile->id ? 'selected' : '' }}
                            >
                                {{ $profile->user?->name ?? 'Tanpa Nama' }}
                                -
                                {{ $profile->user?->email ?? '-' }}
                            </option>
                        @endforeach
                    </select>

                    @error('customer_profile_id')
                        <div class="error">{{ $message }}</div>
                    @enderror
                </div>

            @else

                <input
                    type="hidden"
                    name="customer_profile_id"
                    value="{{ $customerProfile->id }}"
                >

                <div class="form-group">
                    <label>Customer</label>

                    <input
                        type="text"
                        value="{{ $customerProfile->user?->name ?? '-' }}"
                        disabled
                    >
                </div>

            @endif

            <div class="form-group">
                <label for="document_type">
                    Jenis Dokumen
                </label>

                <select
                    name="document_type"
                    id="document_type"
                    required
                >
                    <option value="">
                        -- Pilih Jenis Dokumen --
                    </option>

                    <option
                        value="KTP"
                        {{ old('document_type') === 'KTP' ? 'selected' : '' }}
                    >
                        KTP
                    </option>

                    <option
                        value="SIM"
                        {{ old('document_type') === 'SIM' ? 'selected' : '' }}
                    >
                        SIM
                    </option>

                    <option
                        value="Passport"
                        {{ old('document_type') === 'Passport' ? 'selected' : '' }}
                    >
                        Passport
                    </option>

                    <option
                        value="Other"
                        {{ old('document_type') === 'Other' ? 'selected' : '' }}
                    >
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
                    value="{{ old('document_number') }}"
                    placeholder="Contoh: 317xxxxxxxxxxxxx"
                >

                @error('document_number')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <div class="form-group">
                <label for="file">
                    File Dokumen
                </label>

                <input
                    type="file"
                    name="file"
                    id="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                >

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
                    value="{{ old('expires_at') }}"
                >

                @error('expires_at')
                    <div class="error">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="button">
                Upload Dokumen
            </button>

        </form>

    </div>

</div>

</body>
</html>
```
