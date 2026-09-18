<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kategori Kendaraan</title>
</head>
<body>

    <h1>Kategori Kendaraan</h1>

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

    <a href="{{ route('vehicle-categories.create') }}">
        Tambah Kategori
    </a>

    <hr>

    @if ($categories->count())

        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Slug</th>
                    <th>Deskripsi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>

            <tbody>
                @foreach ($categories as $category)
                    <tr>
                        <td>{{ $category->id }}</td>
                        <td>{{ $category->name }}</td>
                        <td>{{ $category->slug }}</td>
                        <td>{{ $category->description ?? '-' }}</td>
                        <td>
                            {{ $category->is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </td>
                        <td>
                            <a href="{{ route('vehicle-categories.show', $category) }}">
                                Lihat
                            </a>

                            |

                            <a href="{{ route('vehicle-categories.edit', $category) }}">
                                Edit
                            </a>

                            |

                            <form
                                action="{{ route('vehicle-categories.destroy', $category) }}"
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
            {{ $categories->links() }}
        </div>

    @else

        <p>Belum ada kategori kendaraan.</p>

    @endif

</body>
</html>