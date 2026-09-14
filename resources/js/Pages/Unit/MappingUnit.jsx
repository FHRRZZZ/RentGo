import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NearbyRentalMap from '@/Components/NearbyRentalMap';

const UNITS = [
    { id: 'RG-AVZ-01', tipe: 'mobil', nama: 'Toyota Avanza 1.3 G', kategori: 'MPV', transmisi: 'Matic', kursi: '7 Kursi', harga: 400000, kota: 'Jakarta', lokasi: 'Kemang, Jakarta Selatan', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-BRIO-02', tipe: 'mobil', nama: 'Honda Brio Satya E', kategori: 'City Car', transmisi: 'Matic', kursi: '5 Kursi', harga: 300000, kota: 'Yogyakarta', lokasi: 'Sekitar Stasiun Tugu', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1590362891988-f778047831d6?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-XPD-03', tipe: 'mobil', nama: 'Mitsubishi Xpander Sport', kategori: 'MPV', transmisi: 'Matic', kursi: '7 Kursi', harga: 450000, kota: 'Bandung', lokasi: 'Stasiun Hall Bandung', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-INN-04', tipe: 'mobil', nama: 'Toyota Innova Reborn 2.4 G', kategori: 'MPV', transmisi: 'Matic', kursi: '7 Kursi', harga: 650000, kota: 'Surabaya', lokasi: 'Gubeng, Surabaya Pusat', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-HRV-05', tipe: 'mobil', nama: 'Honda HR-V 1.5 E', kategori: 'SUV', transmisi: 'Matic', kursi: '5 Kursi', harga: 600000, kota: 'Bali', lokasi: 'Kuta & Bandara DPS', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-NMX-06', tipe: 'motor', nama: 'Yamaha NMAX 155', kategori: 'Maxi Scooter', transmisi: 'Matic', kursi: '2 Orang', harga: 110000, kota: 'Bali', lokasi: 'Seminyak, Bali', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-PCX-07', tipe: 'motor', nama: 'Honda PCX 160', kategori: 'Maxi Scooter', transmisi: 'Matic', kursi: '2 Orang', harga: 120000, kota: 'Yogyakarta', lokasi: 'Kawasan Malioboro', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-VSP-08', tipe: 'motor', nama: 'Vespa Primavera 150', kategori: 'Scooter Klasik', transmisi: 'Matic', kursi: '2 Orang', harga: 180000, kota: 'Bandung', lokasi: 'Dago, Bandung', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=900&q=80' },
    { id: 'RG-VAR-09', tipe: 'motor', nama: 'Honda Vario 160', kategori: 'Matic Harian', transmisi: 'Matic', kursi: '2 Orang', harga: 90000, kota: 'Jakarta', lokasi: 'Depok & Jakarta Selatan', status: 'Tersedia', img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80' },
];

const formatRupiah = (value) => `Rp ${value.toLocaleString('id-ID')}`;

export default function MappingUnit({ auth = {}, search = {} }) {
    const [sort, setSort] = useState('relevan');
    const [type, setType] = useState(search.tipe || 'mobil');
    const city = search.kota || 'Semua Kota';
    const keyword = (search.q || '').trim().toLowerCase();

    const filteredUnits = useMemo(() => {
        const cityKey = city.split(' ')[0];
        const result = UNITS.filter((unit) => {
            const matchesKeyword = !keyword || [unit.nama, unit.kategori, unit.kota, unit.lokasi].some((value) => value.toLowerCase().includes(keyword));
            return unit.tipe === type && matchesKeyword && (city === 'Semua Kota' || unit.kota === cityKey);
        });
        return [...result].sort((a, b) => sort === 'termurah' ? a.harga - b.harga : a.nama.localeCompare(b.nama));
    }, [city, keyword, sort, type]);

    const displayCity = city === 'Semua Kota' ? 'seluruh kota' : city;
    const mapCity = city === 'Semua Kota' ? 'Semua Kota' : city.split(' ')[0];

    return (
        <>
            <Head title="Cari Unit - RentGo" />
            <div className="min-h-screen bg-[#F5F5F0] text-[#111111] font-sans">
                <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <Link href="/"><ApplicationLogo theme="light" /></Link>
                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-xs font-medium text-stone-500 hover:text-black">Ubah Pencarian</Link>
                            {auth?.user ? (
                                <Link href="/pesanan" className="text-xs font-semibold bg-[#111111] text-[#F5B800] px-3 py-2 rounded-sm">Pesanan Saya</Link>
                            ) : (
                                <Link href="/login" className="text-xs font-semibold bg-[#F5B800] text-[#111111] px-3 py-2 rounded-sm">Masuk</Link>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7">
                    <section className="bg-[#111111] text-white rounded-sm p-5 sm:p-6 mb-6 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-48 h-full opacity-10 bg-[linear-gradient(135deg,transparent_25%,#F5B800_25%,#F5B800_28%,transparent_28%,transparent_55%,#F5B800_55%,#F5B800_58%,transparent_58%)]" />
                        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                            <div>
                                <span className="text-[#F5B800] text-[10px] font-bold uppercase tracking-[0.18em]">Hasil Pencarian</span>
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">Unit di {displayCity}</h1>
                                <p className="text-stone-400 text-xs mt-2">{search.tanggal || 'Tanggal fleksibel'} <span className="mx-1.5 text-stone-600">/</span> {search.durasi || '1 Hari'} <span className="mx-1.5 text-stone-600">/</span> {search.layanan === 'supir' ? 'Dengan supir' : 'Lepas kunci'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <button type="button" onClick={() => setType('mobil')} className={`px-3 py-2 rounded-sm border ${type === 'mobil' ? 'bg-[#F5B800] text-[#111111] border-[#F5B800]' : 'border-stone-700 text-stone-300'}`}>Mobil</button>
                                <button type="button" onClick={() => setType('motor')} className={`px-3 py-2 rounded-sm border ${type === 'motor' ? 'bg-[#F5B800] text-[#111111] border-[#F5B800]' : 'border-stone-700 text-stone-300'}`}>Motor</button>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        <div className="xl:col-span-7">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs text-stone-500">Menampilkan</p>
                                    <h2 className="text-lg font-semibold">{filteredUnits.length} unit siap disewa</h2>
                                    {keyword && <p className="text-[11px] text-stone-500 mt-1">Hasil untuk: <span className="font-semibold text-[#111111]">{search.q}</span></p>}
                                </div>
                                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs font-semibold bg-white border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none">
                                    <option value="relevan">Paling relevan</option>
                                    <option value="termurah">Harga terendah</option>
                                </select>
                            </div>

                            {filteredUnits.length === 0 ? (
                                <div className="bg-white border border-stone-200 rounded-sm p-10 text-center"><p className="text-sm font-semibold">Belum ada unit di kota ini</p><Link href="/pencarian" className="inline-block mt-3 text-xs font-semibold bg-[#F5B800] px-4 py-2 rounded-sm">Lihat semua unit</Link></div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {filteredUnits.map((unit) => (
                                        <article key={unit.id} className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors">
                                            <div className="h-40 bg-stone-100 relative overflow-hidden"><img src={unit.img} alt={unit.nama} className="w-full h-full object-cover" /><span className="absolute top-3 left-3 bg-[#111111] text-[#F5B800] text-[10px] font-bold px-2 py-1 rounded-sm">{unit.status}</span></div>
                                            <div className="p-4"><div className="flex justify-between gap-3"><div><p className="text-[10px] text-stone-400 font-mono">{unit.id} / {unit.kota}</p><h3 className="text-sm font-semibold mt-1 leading-tight">{unit.nama}</h3></div><span className="text-[10px] font-semibold text-stone-500">{unit.kategori}</span></div><div className="flex gap-2 mt-3 text-[10px] text-stone-500"><span>{unit.transmisi}</span><span>·</span><span>{unit.kursi}</span></div><div className="flex items-end justify-between border-t border-stone-100 mt-3 pt-3"><div><p className="text-[10px] text-stone-400">{unit.lokasi}</p><p className="text-sm font-bold mt-0.5">{formatRupiah(unit.harga)}<span className="text-[10px] font-normal text-stone-400"> / hari</span></p></div><button type="button" className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-[10px] font-bold px-3 py-2 rounded-sm">Pilih Unit</button></div></div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="xl:col-span-5 xl:sticky xl:top-24"><NearbyRentalMap selectedCity={mapCity} /></div>
                    </section>
                </main>
            </div>
        </>
    );
}
