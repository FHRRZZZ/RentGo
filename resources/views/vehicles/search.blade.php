<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Search Kendaraan - RentGo</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #f5f7fa;
            color: #1f2937;
        }

        .container {
            max-width: 1200px;
            margin: auto;
        }

        .header {
            margin-bottom: 25px;
        }

        .header h1 {
            margin: 0 0 8px;
        }

        .header p {
            margin: 0;
            color: #6b7280;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .search-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group.full {
            grid-column: 1 / -1;
        }

        label {
            margin-bottom: 7px;
            font-weight: bold;
        }

        input,
        select {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
        }

        input:focus,
        select:focus {
            outline: none;
            border-color: #2563eb;
        }

        .button-wrapper {
            grid-column: 1 / -1;
            margin-top: 5px;
        }

        .button {
            display: inline-block;
            padding: 11px 18px;
            border: none;
            border-radius: 6px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            cursor: pointer;
            font-size: 14px;
        }

        .button:hover {
            background: #1d4ed8;
        }

        .button-secondary {
            background: #6b7280;
        }

        .button-secondary:hover {
            background: #4b5563;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
        }

        .error-list {
            margin: 0;
            padding-left: 20px;
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .result-header h2 {
            margin: 0;
        }

        .result-count {
            color: #6b7280;
            font-size: 14px;
        }

        .vehicle-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .vehicle-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            background: white;
        }

        .vehicle-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
        }

        .vehicle-content {
            padding: 18px;
        }

        .vehicle-name {
            margin: 0 0 8px;
            font-size: 18px;
        }

        .vehicle-info {
            margin: 6px 0;
            color: #6b7280;
            font-size: 14px;
        }

        .vehicle-price {
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
        }

        .price-label {
            font-size: 12px;
            font-weight: normal;
            color: #6b7280;
        }

        .badge {
            display: inline-block;
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            background: #dcfce7;
            color: #166534;
            margin-top: 8px;
        }

        .empty {
            padding: 40px 20px;
            text-align: center;
            color: #6b7280;
        }

        .empty h3 {
            margin-top: 0;
            color: #374151;
        }

        @media (max-width: 900px) {
            .vehicle-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 650px) {
            body {
                padding: 15px;
            }

            .search-grid {
                grid-template-columns: 1fr;
            }

            .form-group.full,
            .button-wrapper {
                grid-column: auto;
            }

            .vehicle-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>Cari Kendaraan</h1>
        <p>
            Temukan kendaraan yang tersedia sesuai kebutuhan rental Anda.
        </p>
    </div>

    @if($errors->any())
        <div class="alert alert-error">
            <ul class="error-list">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="card">

        <form
            method="GET"
            action="{{ route('vehicles.search') }}"
        >

            <div class="search-grid">

                <div class="form-group">
                    <label for="location">
                        Lokasi Pickup
                    </label>

                    <input
                        type="text"
                        id="location"
                        name="location"
                        value="{{ old('location', $filters['location'] ?? '') }}"
                        placeholder="Contoh: Jakarta"
                    >
                </div>

                <div class="form-group">
                    <label for="vehicle_type">
                        Jenis Kendaraan
                    </label>

                    <select
                        id="vehicle_type"
                        name="vehicle_type"
                    >
                        <option value="">
                            Semua Jenis
                        </option>

                        <option
                            value="car"
                            @selected(($filters['vehicle_type'] ?? '') === 'car')
                        >
                            Mobil
                        </option>

                        <option
                            value="motorcycle"
                            @selected(($filters['vehicle_type'] ?? '') === 'motorcycle')
                        >
                            Motor
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="vehicle_category_id">
                        Kategori
                    </label>

                    <select
                        id="vehicle_category_id"
                        name="vehicle_category_id"
                    >
                        <option value="">
                            Semua Kategori
                        </option>

                        @foreach($categories as $category)
                            <option
                                value="{{ $category->id }}"
                                @selected(
                                    (string) ($filters['vehicle_category_id'] ?? '')
                                    ===
                                    (string) $category->id
                                )
                            >
                                {{ $category->name }}
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="form-group">
                    <label for="rental_start">
                        Mulai Sewa
                    </label>

                    <input
                        type="date"
                        id="rental_start"
                        name="rental_start"
                        value="{{ old('rental_start', $filters['rental_start'] ?? '') }}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="rental_end">
                        Selesai Sewa
                    </label>

                    <input
                        type="date"
                        id="rental_end"
                        name="rental_end"
                        value="{{ old('rental_end', $filters['rental_end'] ?? '') }}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="min_price">
                        Harga Minimum / Hari
                    </label>

                    <input
                        type="number"
                        id="min_price"
                        name="min_price"
                        min="0"
                        step="0.01"
                        value="{{ old('min_price', $filters['min_price'] ?? '') }}"
                        placeholder="Contoh: 100000"
                    >
                </div>

                <div class="form-group">
                    <label for="max_price">
                        Harga Maksimum / Hari
                    </label>

                    <input
                        type="number"
                        id="max_price"
                        name="max_price"
                        min="0"
                        step="0.01"
                        value="{{ old('max_price', $filters['max_price'] ?? '') }}"
                        placeholder="Contoh: 500000"
                    >
                </div>

                <div class="button-wrapper">

                    <button
                        type="submit"
                        class="button"
                    >
                        Cari Kendaraan
                    </button>

                    <a
                        href="{{ route('vehicles.search') }}"
                        class="button button-secondary"
                    >
                        Reset
                    </a>

                </div>

            </div>

        </form>

    </div>

    @if(isset($filters['rental_start']) && isset($filters['rental_end']))

        <div class="card">

            <div class="result-header">

                <h2>
                    Hasil Pencarian
                </h2>

                <div class="result-count">
                    {{ $vehicles->count() }} kendaraan ditemukan
                </div>

            </div>

            @if($vehicles->isEmpty())

                <div class="empty">

                    <h3>
                        Kendaraan tidak ditemukan
                    </h3>

                    <p>
                        Tidak ada kendaraan yang tersedia
                        untuk periode dan filter yang dipilih.
                    </p>

                </div>

            @else

                <div class="vehicle-grid">

                    @foreach($vehicles as $vehicle)

                        <div class="vehicle-card">

                            @php
                                $primaryPhoto = $vehicle->photos
                                    ->firstWhere('is_primary', true)
                                    ?? $vehicle->photos->first();
                            @endphp

                            @if($primaryPhoto)

                                <img
                                    src="{{ asset('storage/' . $primaryPhoto->file_path) }}"
                                    alt="{{ $vehicle->name }}"
                                    class="vehicle-image"
                                >

                            @else

                                <div class="vehicle-image">
                                    Tidak ada foto
                                </div>

                            @endif

                            <div class="vehicle-content">

                                <h3 class="vehicle-name">
                                    {{ $vehicle->name }}
                                </h3>

                                <div class="vehicle-info">
                                    <strong>Jenis:</strong>
                                    {{ $vehicle->vehicle_type === 'car'
                                        ? 'Mobil'
                                        : 'Motor' }}
                                </div>

                                <div class="vehicle-info">
                                    <strong>Kategori:</strong>
                                    {{ $vehicle->category?->name ?? '-' }}
                                </div>

                                <div class="vehicle-info">
                                    <strong>Lokasi:</strong>
                                    {{ $vehicle->pickup_location ?? '-' }}
                                </div>

                                <div class="vehicle-info">
                                    <strong>Transmisi:</strong>
                                    {{ $vehicle->transmission ?? '-' }}
                                </div>

                                <div class="vehicle-info">
                                    <strong>Kapasitas:</strong>
                                    {{ $vehicle->seat_capacity ?? '-' }}
                                </div>

                                @if($vehicle->search_price !== null)

                                    <div class="vehicle-price">

                                        Rp
                                        {{ number_format(
                                            $vehicle->search_price,
                                            0,
                                            ',',
                                            '.'
                                        ) }}

                                        <span class="price-label">
                                            / hari
                                        </span>

                                    </div>

                                @endif

                                <span class="badge">
                                    Tersedia
                                </span>

                            </div>

                        </div>

                    @endforeach

                </div>

            @endif

        </div>

    @endif

</div>

</body>
</html>