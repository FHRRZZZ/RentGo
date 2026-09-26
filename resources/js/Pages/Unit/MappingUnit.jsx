import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import NearbyRentalMap from '@/Components/NearbyRentalMap';

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

/** status database kendaraan → label Indonesia */
const VEHICLE_STATUS = {
    available: 'Tersedia',
    booked: 'Sudah Dipesan',
    rented: 'Sedang Disewa',
    maintenance: 'Perawatan',
    inactive: 'Nonaktif',
    draft: 'Draft',
    pending_review: 'Menunggu Verifikasi',
    rejected: 'Ditolak',
};

/** Ambil foto pertama yang bukan video. */
const primaryPhoto = (photos = []) =>
    photos.find((media) => media.media_type !== 'video' && media.file_path) ||
    photos.find((media) => media.file_path);

/** Daftar kota yang dikenali, untuk menebak kota dari teks lokasi penjemputan. */
const KNOWN_CITIES = [
    'Jakarta', 'Bandung', 'Yogyakarta', 'Bali', 'Denpasar', 'Surabaya',
    'Semarang', 'Medan', 'Makassar', 'Bekasi', 'Depok', 'Tangerang',
    'Bogor', 'Malang', 'Solo', 'Palembang', 'Balikpapan', 'Manado',
];

/** Tebak nama kota dari teks lokasi penjemputan (mis. "Jl. Dago, Bandung"). */
const cityFromLocation = (location) => {
    const text = String(location || '').toLowerCase();
    if (!text) return null;
    return KNOWN_CITIES.find((city) => text.includes(city.toLowerCase())) || null;
};

export default function MappingUnit({ auth = {}, search = {}, units = [] }) {
    const [sort, setSort] = useState('relevan');
    const [type, setType] = useState(search.tipe || 'mobil');
    const city = search.kota || 'Semua Kota';
    const keyword = (search.q || '').trim().toLowerCase();

    // Hanya data unit yang benar-benar ada di database (tanpa data dummy).
    const activeUnits = useMemo(() => {
        if (!units || units.length === 0) return [];
        return units.map((u) => {
            const price = u.search_price ?? u.prices?.[0]?.price_per_day ?? u.price_per_day ?? 0;
            const photo = primaryPhoto(u.photos);
            const photoPath = photo?.file_path;
            const imgUrl = photoPath
                ? (photoPath.startsWith('http') || photoPath.startsWith('/storage/') ? photoPath : `/storage/${photoPath}`)
                : null;
            const agent = u.agent_profile || u.agentProfile || {};
            const agentUser = agent.user || {};
            const agentName = agent.agency_name || agentUser.name || 'Mitra RentGo';

            // Logo mitra — pakai storage path jika ada, null jika belum diupload.
            const rawLogo = agent.logo || null;
            const mitraLogo = rawLogo
                ? (rawLogo.startsWith('http') || rawLogo.startsWith('/storage/')
                    ? rawLogo
                    : `/storage/${rawLogo}`)
                : null;

            // Alamat & kota unit mengikuti PROFIL MITRA penyedianya (bukan teks
            // bebas per-unit), sesuai model: 1 mitra → 1 alamat titik serah terima.
            const alamatMitra = agent.address || u.pickup_location || 'Alamat mitra belum diisi';
            const kotaMitra =
                agent.city || cityFromLocation(agent.address) || cityFromLocation(u.pickup_location) || 'Indonesia';

            return {
                id: u.id,
                dbId: u.id,
                kode: u.license_plate || `UNIT-${u.id}`,
                tipe: u.vehicle_type === 'motorcycle' ? 'motor' : 'mobil',
                nama: u.name || `${u.brand || ''} ${u.model || ''}`.trim() || 'Unit Kendaraan',
                kategori: (u.vehicle_category || u.category)?.name || '-',
                transmisi: u.transmission === 'manual' ? 'Manual' : 'Matic',
                kursi: u.seat_capacity ? `${u.seat_capacity} Kursi` : '-',
                bahanBakar: u.fuel_type || '-',
                harga: Number(price),
                // Data mitra penyedia — dipakai untuk mapping unit per mitra.
                mitraId: agent.id || null,
                mitra: agentName,
                mitraLogo,
                mitraAlamat: alamatMitra,
                mitraKota: kotaMitra,
                // Koordinat presisi lokasi usaha mitra (dipilih di peta saat
                // pengajuan). Menjadi titik pin asli pada peta unit.
                mitraLat:
                    agent.latitude ?? u.agent_latitude ?? null,
                mitraLng:
                    agent.longitude ?? u.agent_longitude ?? null,
                kota: kotaMitra,
                lokasi: alamatMitra,
                status: VEHICLE_STATUS[u.status] || u.status || '-',
                rentedUntil: u.rented_until || null,
                img: imgUrl,
            };
        });
    }, [units]);

    const filteredUnits = useMemo(() => {
        const cityKey = (city || 'Semua Kota').split(' ')[0].toLowerCase();
        const result = activeUnits.filter((unit) => {
            const haystack = [unit.nama, unit.kategori, unit.kota, unit.lokasi, unit.kode, unit.mitra]
                .filter(Boolean)
                .map((value) => String(value).toLowerCase());
            const matchesKeyword = !keyword || haystack.some((value) => value.includes(keyword));
            const matchesType = type === 'all' || unit.tipe === type;
            const unitKotaLower = String(unit.kota || '').toLowerCase();
            const matchesCity = city === 'Semua Kota' || unitKotaLower.includes(cityKey) || cityKey.includes(unitKotaLower);

            return matchesType && matchesKeyword && matchesCity;
        });
        return [...result].sort((a, b) => sort === 'termurah' ? a.harga - b.harga : a.nama.localeCompare(b.nama));
    }, [activeUnits, city, keyword, sort, type]);

    const displayCity = city === 'Semua Kota' ? 'seluruh kota' : city;
    const mapCity = city === 'Semua Kota' ? 'Semua Kota' : city.split(' ')[0];

    return (
        <CustomerLayout auth={auth} activeNav="" backHref="/" backLabel="Beranda">
            <Head title="Cari Unit - RentGo" />

            {/* Page Header */}
            <div className="mb-6 rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Hasil Pencarian
                    </span>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
                            Unit di {displayCity}
                        </h1>
                        <p className="mt-1 text-xs text-stone-500">
                            {search.tanggal || 'Tanggal fleksibel'}
                            <span className="mx-1.5 text-stone-300">/</span>
                            {search.durasi || '1 Hari'}
                            <span className="mx-1.5 text-stone-300">/</span>
                            {search.layanan === 'supir' ? 'Dengan Supir' : 'Lepas Kunci'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-sm border border-stone-200">
                        <button
                            type="button"
                            onClick={() => setType('all')}
                            className={`rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors ${
                                type === 'all'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('mobil')}
                            className={`rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors ${
                                type === 'mobil'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Mobil
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('motor')}
                            className={`rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors ${
                                type === 'motor'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Motor
                        </button>
                    </div>
                </div>
            </div>

                    <section id="armada-mobil" className="scroll-mt-24">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 pb-4 border-b border-stone-200">
                                <div>
                                    <p className="text-[10px] text-stone-500 uppercase tracking-[0.16em] font-bold">Hasil pencarian</p>
                                    <h2 className="text-xl font-semibold mt-1">{filteredUnits.length} unit siap disewa</h2>
                                    {keyword && <p className="text-xs text-stone-500 mt-1">Menampilkan hasil untuk <span className="font-semibold text-[#111111]">“{search.q}”</span></p>}
                                </div>
                                <label className="flex items-center gap-2 text-[11px] font-semibold text-stone-500 shrink-0">
                                    Urutkan
                                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs font-semibold bg-white border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none">
                                        <option value="relevan">Paling relevan</option>
                                        <option value="termurah">Harga terendah</option>
                                    </select>
                                </label>
                            </div>

                            {filteredUnits.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-sm p-10 text-center"><p className="text-sm font-semibold">Belum ada unit terdaftar di kota ini</p><p className="text-xs text-stone-500 mt-1">Coba ubah kata kunci atau pilih &quot;Semua Kota&quot; untuk melihat seluruh unit yang tersedia dari mitra.</p><button type="button" onClick={() => { setType('all'); }} className="inline-block mt-3 text-xs font-semibold bg-[#F5B800] px-4 py-2 rounded-sm text-[#111]">Lihat semua unit</button></div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-5">
                                    {filteredUnits.map((unit) => (
                                        <article key={unit.id} className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-[#111111] hover:shadow-md transition-all flex flex-col">
                                            <div className="h-44 bg-stone-100 relative overflow-hidden">
                                                {unit.img ? (
                                                    <img
                                                        src={unit.img}
                                                        alt={unit.nama}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center text-[11px] font-medium text-stone-400">Foto unit belum tersedia</span>
                                                )}
                                                {unit.rentedUntil ? (
                                                    <span className="absolute top-3 left-3 bg-blue-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-xs flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                                        Disewa s/d {unit.rentedUntil}
                                                    </span>
                                                ) : (
                                                    <span className="absolute top-3 left-3 bg-[#111111] text-[#F5B800] text-[10px] font-bold px-2 py-1 rounded-sm shadow-xs">{unit.status}</span>
                                                )}
                                                <span className="absolute top-3 right-3 bg-white/90 text-[#111] text-[10px] font-semibold px-2 py-1 rounded-sm border border-stone-200 shadow-xs">{unit.kategori}</span>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] text-stone-400 font-mono">{unit.kode} &bull; {unit.kota}</p>
                                                        <h3 className="text-sm font-bold mt-0.5 leading-tight text-[#111]">{unit.nama}</h3>
                                                    </div>
                                                </div>
                                                {/* Badge mitra dengan logo/avatar */}
                                                <div className="flex items-center gap-2 mt-2.5 p-2 bg-stone-50 rounded-xs border border-stone-100">
                                                    {unit.mitraLogo ? (
                                                        <img
                                                            src={unit.mitraLogo}
                                                            alt={unit.mitra}
                                                            className="w-7 h-7 rounded-xs object-contain bg-white border border-stone-200 shrink-0 p-0.5"
                                                            onError={(e) => {
                                                                e.currentTarget.onerror = null;
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="w-7 h-7 rounded-xs bg-[#111] text-[#F5B800] font-bold text-[10px] items-center justify-center shrink-0"
                                                        style={{ display: unit.mitraLogo ? 'none' : 'flex' }}
                                                    >
                                                        {(unit.mitra || 'M').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold leading-none">Mitra Resmi</p>
                                                        <p className="text-[11px] font-semibold text-stone-700 truncate leading-tight mt-0.5">{unit.mitra}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2.5 text-[10px] text-stone-600 pt-2 border-t border-stone-100">
                                                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs">{unit.transmisi}</span>
                                                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs">{unit.kursi}</span>
                                                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs">{unit.bahanBakar}</span>
                                                </div>
                                                <div className="flex items-end justify-between border-t border-stone-100 mt-auto pt-3">
                                                    <div>
                                                        <p className="text-[10px] text-stone-400 line-clamp-1">{unit.lokasi}</p>
                                                        <p className="text-sm font-black mt-0.5 text-[#111]">{formatRupiah(unit.harga)}<span className="text-[10px] font-normal text-stone-400"> / hari</span></p>
                                                    </div>
                                                    <Link href={`/vehicles/${unit.dbId || unit.id}`} className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-[11px] font-bold px-3 py-2 rounded-sm shrink-0 inline-block text-center shadow-xs transition-colors">Pilih Unit &rarr;</Link>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-8 border-t border-stone-200">
                            <NearbyRentalMap selectedCity={mapCity} units={activeUnits} />
                        </div>
                    </section>
        </CustomerLayout>
    );
}
