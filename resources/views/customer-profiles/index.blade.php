<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Profile</title>
</head>
<body>

<h1>Customer Profile</h1>

@if (session('success')) <div>
{{ session('success') }} </div>
@endif

@if (session('error')) <div>
{{ session('error') }} </div>
@endif

@can('create', App\Models\CustomerProfile::class) <a href="{{ route('customer-profiles.create') }}">
Tambah Customer Profile </a>
@endcan

<hr>

@if ($profiles->count())

```
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Telepon</th>
            <th>Kota</th>
            <th>Provinsi</th>
            <th>Status</th>
            <th>Aksi</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($profiles as $profile)
            <tr>
                <td>
                    {{ $profile->id }}
                </td>

                <td>
                    {{ $profile->user?->name ?? '-' }}
                </td>

                <td>
                    {{ $profile->user?->email ?? '-' }}
                </td>

                <td>
                    {{ $profile->phone ?? '-' }}
                </td>

                <td>
                    {{ $profile->city ?? '-' }}
                </td>

                <td>
                    {{ $profile->province ?? '-' }}
                </td>

                <td>
                    @if ($profile->is_active)
                        Aktif
                    @else
                        Tidak Aktif
                    @endif
                </td>

                <td>
                    <a href="{{ route('customer-profiles.show', $profile) }}">
                        Lihat
                    </a>

                    |

                    @can('update', $profile)
                        <a href="{{ route('customer-profiles.edit', $profile) }}">
                            Edit
                        </a>
                    @endcan

                    @can('delete', $profile)
                        |

                        <form
                            action="{{ route('customer-profiles.destroy', $profile) }}"
                            method="POST"
                            style="display:inline"
                            onsubmit="return confirm('Yakin ingin menghapus customer profile ini?')"
                        >
                            @csrf
                            @method('DELETE')

                            <button type="submit">
                                Hapus
                            </button>
                        </form>
                    @endcan
                </td>
            </tr>
        @endforeach
    </tbody>
</table>

<div>
    {{ $profiles->links() }}
</div>
```

@else

```
<p>
    Belum ada customer profile.
</p>
```

@endif

</body>
</html>
