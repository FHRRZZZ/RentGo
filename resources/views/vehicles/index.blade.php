<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Kendaraan</title>
</head>
<body>

    <h1>Daftar Kendaraan</h1>

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

    <a href="{{ route('vehicles.create') }}">
        Tambah Kendaraan
    </a>

    <hr>

    @if ($vehicles->count())

        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Jenis</th>
                    <th>Merek</th>
                    <th>Model</th>
                    <th>Kategori</th>
                    <th>Plat Nomor</th>
                    <th>Mitra</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody>
                @foreach ($vehicles as $vehicle)
                    <tr>
                        <td>{{ $vehicle->id }}</td>

                        <td>{{ $vehicle->name }}</td>

                        <td>
                            {{ $vehicle->vehicle_type === 'car' ? 'Mobil' : 'Motor' }}
                        </td>

                        <td>
                            {{ $vehicle->brand ?? '-' }}
                        </td>

                        <td>
                            {{ $vehicle->model ?? '-' }}
                        </td>

                        <td>
                            {{ $vehicle->vehicleCategory?->name ?? '-' }}
                        </td>

                        <td>
                            {{ $vehicle->license_plate }}
                        </td>

                        <td>
                            {{ $vehicle->agentProfile?->agency_name ?? '-' }}
                        </td>

                        <td>
                            {{ $vehicle->status }}
                        </td>

                        <td>

                            <a href="{{ route('vehicles.show', $vehicle) }}">
                                Lihat
                            </a>

                            |

                            <a href="{{ route('vehicles.edit', $vehicle) }}">
                                Edit
                            </a>

                            |

                            <form
                                action="{{ route('vehicles.destroy', $vehicle) }}"
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
            {{ $vehicles->links() }}
        </div>

    @else

        <p>Belum ada kendaraan.</p>

    @endif

</body>
</html>