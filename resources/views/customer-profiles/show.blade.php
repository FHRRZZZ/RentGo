<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Customer Profile</title>
</head>
<body>

<h1>Detail Customer Profile</h1>

@if (session('success')) <div>
{{ session('success') }} </div>
@endif

@if (session('error')) <div>
{{ session('error') }} </div>
@endif

<hr>

<h2>Informasi Akun</h2>

<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Nama</th>
        <td>
            {{ $customerProfile->user?->name ?? '-' }}
        </td>
    </tr>

```
<tr>
    <th>Email</th>
    <td>
        {{ $customerProfile->user?->email ?? '-' }}
    </td>
</tr>
```

</table>

<br>

<h2>Informasi Customer</h2>

<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Nomor Telepon</th>
        <td>
            {{ $customerProfile->phone ?? '-' }}
        </td>
    </tr>

```
<tr>
    <th>Nomor Identitas</th>
    <td>
        {{ $customerProfile->identity_number ?? '-' }}
    </td>
</tr>

<tr>
    <th>Tanggal Lahir</th>
    <td>
        {{ $customerProfile->date_of_birth?->format('d-m-Y') ?? '-' }}
    </td>
</tr>

<tr>
    <th>Alamat</th>
    <td>
        {{ $customerProfile->address ?? '-' }}
    </td>
</tr>

<tr>
    <th>Kota</th>
    <td>
        {{ $customerProfile->city ?? '-' }}
    </td>
</tr>

<tr>
    <th>Provinsi</th>
    <td>
        {{ $customerProfile->province ?? '-' }}
    </td>
</tr>

<tr>
    <th>Status</th>
    <td>
        @if ($customerProfile->is_active)
            Aktif
        @else
            Tidak Aktif
        @endif
    </td>
</tr>
```

</table>

<br>

@can('update', $customerProfile) <a href="{{ route('customer-profiles.edit', $customerProfile) }}">
Edit </a>
@endif

  |  

<a href="{{ route('customer-profiles.index') }}">
    Kembali
</a>

</body>
</html>
