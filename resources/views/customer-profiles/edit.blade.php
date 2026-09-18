<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Customer Profile</title>
</head>
<body>

<h1>Edit Customer Profile</h1>

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
    action="{{ route('customer-profiles.update', $customerProfile) }}"
    method="POST"
>
    @csrf
    @method('PUT')

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
        value="{{ old('phone', $customerProfile->phone) }}"
        maxlength="20"
        required
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
        value="{{ old('identity_number', $customerProfile->identity_number) }}"
        maxlength="50"
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
        value="{{ old('date_of_birth', $customerProfile->date_of_birth?->format('Y-m-d')) }}"
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
    >{{ old('address', $customerProfile->address) }}</textarea>
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
        value="{{ old('city', $customerProfile->city) }}"
        maxlength="100"
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
        value="{{ old('province', $customerProfile->province) }}"
        maxlength="100"
    >
</div>

<br>

<div>
    <label>
        <input
            type="checkbox"
            name="is_active"
            value="1"
            {{ old('is_active', $customerProfile->is_active) ? 'checked' : '' }}
        >

        Profile Aktif
    </label>
</div>

<br>

<button type="submit">
    Simpan Perubahan
</button>

<a href="{{ route('customer-profiles.show', $customerProfile) }}">
    Batal
</a>
```

</form>

</body>
</html>
