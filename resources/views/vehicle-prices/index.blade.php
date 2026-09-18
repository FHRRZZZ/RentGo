<!DOCTYPE html>

<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Harga Kendaraan</title>
</head>
<body>

<h1>Harga Kendaraan</h1>

@if (session('success')) <div>
{{ session('success') }} </div>
@endif

@if (session('error')) <div>
{{ session('error') }} </div>
@endif

<a href="{{ route('vehicle-prices.create') }}">
    Tambah Harga
</a>

<hr>

@if ($prices->count())

```
<table border="1" cellpadding="8" cellspacing="0">
    <thead>
        <tr>
            <th>ID</th>
            <th>Kendaraan</th>
            <th>Plat Nomor</th>
            <th>Mitra</th>
            <th>Harga / Hari</th>
            <th>Mulai</th>
            <th>Selesai</th>
            <th>Status</th>
            <th>Aksi</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($prices as $price)
            <tr>
                <td>
                    {{ $price->id }}
                </td>

                <td>
                    {{ $price->vehicle?->name ?? '-' }}
                </td>

                <td>
                    {{ $price->vehicle?->license_plate ?? '-' }}
                </td>

                <td>
                    {{ $price->vehicle?->agentProfile?->agency_name ?? '-' }}
                </td>

                <td>
                    Rp {{ number_format($price->price_per_day, 0, ',', '.') }}
                </td>

                <td>
                    {{ $price->start_date?->format('d-m-Y') ?? '-' }}
                </td>

                <td>
                    {{ $price->end_date?->format('d-m-Y') ?? '-' }}
                </td>

                <td>
                    @if ($price->is_active)
                        Aktif
                    @else
                        Tidak Aktif
                    @endif
                </td>

                <td>
                    <a href="{{ route('vehicle-prices.show', $price) }}">
                        Lihat
                    </a>

                    |

                    <a href="{{ route('vehicle-prices.edit', $price) }}">
                        Edit
                    </a>

                    |

                    <form
                        action="{{ route('vehicle-prices.destroy', $price) }}"
                        method="POST"
                        style="display:inline"
                        onsubmit="return confirm('Yakin ingin menghapus harga ini?')"
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
    {{ $prices->links() }}
</div>
```

@else

```
<p>
    Belum ada data harga kendaraan.
</p>
```

@endif

</body>
</html>
