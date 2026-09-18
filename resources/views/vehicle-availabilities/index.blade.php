<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ketersediaan Kendaraan</title>
</head>
<body>

```
<h1>Ketersediaan Kendaraan</h1>

@if (session('success'))
    <div>
        {{ session('success') }}
    </div>
@endif

@if (session('error'))
    <div>
        {{ session('error') }}
    </div>
@endif

<a href="{{ route('vehicle-availabilities.create') }}">
    Tambah Ketersediaan
</a>

<hr>

@if ($availabilities->count())

    <table border="1" cellpadding="8" cellspacing="0">
        <thead>
            <tr>
                <th>ID</th>
                <th>Kendaraan</th>
                <th>Mitra</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Status</th>
                <th>Catatan</th>
                <th>Aksi</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($availabilities as $availability)
                <tr>
                    <td>{{ $availability->id }}</td>

                    <td>
                        {{ $availability->vehicle?->name ?? '-' }}
                    </td>

                    <td>
                        {{ $availability->vehicle?->agentProfile?->agency_name ?? '-' }}
                    </td>

                    <td>
                        {{ $availability->start_date?->format('d-m-Y') }}
                    </td>

                    <td>
                        {{ $availability->end_date?->format('d-m-Y') }}
                    </td>

                    <td>
                        {{ $availability->status }}
                    </td>

                    <td>
                        {{ $availability->notes ?? '-' }}
                    </td>

                    <td>
                        <a href="{{ route('vehicle-availabilities.show', $availability) }}">
                            Lihat
                        </a>

                        |

                        <a href="{{ route('vehicle-availabilities.edit', $availability) }}">
                            Edit
                        </a>

                        |

                        <form
                            action="{{ route('vehicle-availabilities.destroy', $availability) }}"
                            method="POST"
                            style="display:inline"
                        >
                            @csrf
                            @method('DELETE')

                            <button type="submit">
                                Hapus
                            </button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div>
        {{ $availabilities->links() }}
    </div>

@else

    <p>Belum ada data ketersediaan kendaraan.</p>

@endif
```

</body>
</html>
