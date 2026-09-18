<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Customer Profile</title>
</head>
<body>

<h1>Tambah Customer Profile</h1>

@if ($errors->any()) <div> <strong>Terjadi kesalahan:</strong>

```
    <ul>
        @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
</div>
```

@endif

<form
    action="{{ route('customer-profiles.store') }}"
    method="POST"
>
    @csrf

```
<div>
    <label for="phone">
        Nomor Telepon
    </label>

    <br>

    <input
        type="text"
        name="phone"
        id="phone"
        value="{{ old('phone') }}"
        maxlength="20"
        required
        placeholder="081234567890"
    >
</div>

<br>

<div>
    <label for="identity_number">
        Nomor Identitas
    </label>

    <br>

    <input
        type="text"
        name="identity_number"
        id="identity_number"
        value="{{ old('identity_number') }}"
        maxlength="50"
        placeholder="Nomor KTP/Identitas"
    >
</div>

<br>

<div>
    <label for="date_of_birth">
        Tanggal Lahir
    </label>

    <br>

    <input
        type="date"
        name="date_of_birth"
        id="date_of_birth"
        value="{{ old('date_of_birth') }}"
    >
</div>

<br>

<div>
    <label for="address">
        Alamat
    </label>

    <br>

    <textarea
        name="address"
        id="address"
        rows="4"
        cols="50"
        maxlength="500"
    >{{ old('address') }}</textarea>
</div>

<br>

<div>
    <label for="city">
        Kota
    </label>

    <br>

    <input
        type="text"
        name="city"
        id="city"
        value="{{ old('city') }}"
        maxlength="100"
        placeholder="Depok"
    >
</div>

<br>

<div>
    <label for="province">
        Provinsi
    </label>

    <br>

    <input
        type="text"
        name="province"
        id="province"
        value="{{ old('province') }}"
        maxlength="100"
        placeholder="Jawa Barat"
    >
</div>

<br>

<div>
    <label>
        <input
            type="checkbox"
            name="is_active"
            value="1"
            {{ old('is_active', true) ? 'checked' : '' }}
        >

        Profile Aktif
    </label>
</div>

<br>

<button type="submit">
    Simpan Profile
</button>

<a href="{{ route('customer-profiles.index') }}">
    Batal
</a>
```

</form>

</body>
</html>
