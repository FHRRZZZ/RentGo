<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use Inertia\Inertia;

/**
 * AgentStorefrontController — halaman toko publik milik satu mitra.
 *
 * Dibuka saat pengunjung mengklik kotak lokasi mitra pada peta
 * "Sekitar Kita" di halaman Welcome. Menampilkan identitas toko mitra
 * (nama, alamat, kota, deskripsi, rating) beserta mapping unit yang
 * tersedia pada mitra tersebut.
 */
class AgentStorefrontController extends Controller
{
    public function show(AgentProfile $agentProfile): \Inertia\Response
    {
        $agentProfile->load('user');

        // Semua unit mitra — termasuk yang belum tersedia — agar pengunjung
        // bisa melihat seluruh armada toko. Unit 'available' ditampilkan lebih
        // dulu, sisanya menyusul dengan label statusnya.
        $vehicles = $agentProfile->vehicles()
            ->with(['vehicleCategory', 'photos', 'prices'])
            ->latest()
            ->get()
            ->sortBy(fn($v) => $v->status === 'available' ? 0 : 1)
            ->values();

        $units = $vehicles->map(function ($v) {
            $price = $v->prices->first()?->price_per_day ?? $v->price_per_day ?? 0;
            $photo = $v->photos->first()?->file_path;
            $namaModel = trim(implode(' ', array_filter([$v->brand, $v->model])));
            $status = $v->status ?: 'available';

            return [
                'id' => $v->id,
                'nama' => $v->name ?: ($namaModel ?: 'Unit'),
                'kategori' => $v->vehicleCategory->name ?? 'Unit',
                'tipe' => in_array($v->vehicle_type ?? '', ['motorcycle', 'motor', 'scooter']) ? 'motor' : 'mobil',
                'merek' => $namaModel ?: null,
                'tahun' => $v->year,
                'transmisi' => ucfirst($v->transmission ?? 'Matic'),
                'kursi' => ($v->seat_capacity ?? 5) . ' Kursi',
                'bensin' => ucfirst($v->fuel_type ?? 'Bensin'),
                'harga' => (float) $price,
                'img' => $photo ? '/storage/' . $photo : null,
                'status' => $status,
                'tersedia' => $status === 'available',
            ];
        })->values();

        // Ringkasan ulasan mitra untuk memperkuat kredibilitas toko.
        $reviews = $agentProfile->reviews()
            ->where('status', 'published')
            ->get(['rating']);
        $ratingAvg = $reviews->count() ? round($reviews->avg('rating'), 1) : null;

        return Inertia::render('Mitra/Store', [
            'agent' => [
                'id' => $agentProfile->id,
                'nama' => $agentProfile->agency_name
                    ?: ($agentProfile->user?->name ?? 'Mitra RentGo'),
                'ownerName' => $agentProfile->owner_name,
                'businessType' => $agentProfile->business_type,
                'phone' => $agentProfile->phone,
                'address' => $agentProfile->address,
                'city' => $agentProfile->city,
                'province' => $agentProfile->province,
                'latitude' => $agentProfile->latitude,
                'longitude' => $agentProfile->longitude,
                'description' => $agentProfile->description,
                'isVerified' => $agentProfile->onboarding_status === 'approved',
            ],
            'ratingAvg' => $ratingAvg,
            'reviewCount' => $reviews->count(),
            'units' => $units,
            'availableCount' => $units->where('tersedia', true)->count(),
        ]);
    }
}
