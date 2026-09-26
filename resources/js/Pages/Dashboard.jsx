import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import UserAvatar from '@/Components/UserAvatar';

const formatRupiah = (val) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

export default function Dashboard({ auth = {}, availableVehicles = [] }) {
    const user = auth?.user || {};
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@rentgo.test';
    const isMitra = user?.role === 'mitra' || user?.email === 'mitra@rentgo.test';
    const [vehicleFilter, setVehicleFilter] = React.useState('all');

    const filteredVehicles = React.useMemo(() => {
        if (vehicleFilter === 'all') return availableVehicles;
        return availableVehicles.filter((v) => {
            if (vehicleFilter === 'car') return v.vehicle_type === 'car';
            if (vehicleFilter === 'motorcycle') return v.vehicle_type === 'motorcycle';
            return true;
        });
    }, [availableVehicles, vehicleFilter]);

    return (
        <CustomerLayout auth={auth} activeNav="" backHref="/" backLabel="Beranda">
            <Head title="Dashboard - RentGo" />

            {/* Banner Selamat Datang */}
            <div className="mb-6 rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <UserAvatar user={user} className="h-14 w-14" textClassName="text-xl" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-[#111111]">
                                    Halo, {user.name || 'Pengguna'}!
                                </h1>
                                {isAdmin && (
                                    <span className="bg-[#111111] text-[#F5B800] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                        Super Admin
                                    </span>
                                )}
                                {isMitra && (
                                    <span className="bg-[#F5B800] text-[#111111] text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                        Mitra Rental
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-stone-500 mt-1">
                                {user.email} &bull; Akun terverifikasi untuk pemesanan sewa kendaraan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1.5 rounded-sm bg-[#111111] text-[#F5B800] px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                </svg>
                                Admin Control Center
                            </Link>
                        )}
                        {isMitra && (
                            <Link
                                href="/mitra"
                                className="inline-flex items-center gap-1.5 rounded-sm bg-[#F5B800] text-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#e0a800] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                                Portal Mitra
                            </Link>
                        )}
                        <Link
                            href="/pencarian"
                            className="inline-flex items-center gap-1.5 rounded-sm border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-[#111111] hover:bg-stone-50 transition-colors"
                        >
                            Cari Kendaraan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Link
                    href="/pencarian"
                    className="group rounded-sm border border-stone-200 bg-white p-5 shadow-sm hover:border-[#111111] hover:shadow-md transition-all"
                >
                    <div className="w-10 h-10 rounded-sm bg-amber-50 text-[#b38600] flex items-center justify-center mb-3 group-hover:bg-[#F5B800] group-hover:text-[#111111] transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-semibold text-[#111111] group-hover:text-black">
                        Cari Kendaraan
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Pilih mobil atau motor lepas kunci di berbagai kota tujuan.
                    </p>
                </Link>

                <Link
                    href="/pesanan"
                    className="group rounded-sm border border-stone-200 bg-white p-5 shadow-sm hover:border-[#111111] hover:shadow-md transition-all"
                >
                    <div className="w-10 h-10 rounded-sm bg-stone-100 text-stone-700 flex items-center justify-center mb-3 group-hover:bg-[#111111] group-hover:text-[#F5B800] transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-semibold text-[#111111] group-hover:text-black">
                        Pesanan Saya
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Pantau status penjemputan unit dan rincian sewa aktif.
                    </p>
                </Link>

                <Link
                    href="/profile"
                    className="group rounded-sm border border-stone-200 bg-white p-5 shadow-sm hover:border-[#111111] hover:shadow-md transition-all"
                >
                    <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.18 7.372l-2.02.138A7.5 7.5 0 014.25 12c0-3.036 1.8-5.65 4.38-6.848m8.74 0A7.5 7.5 0 0120 12c0 1.63-.52 3.14-1.4 4.38" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-semibold text-[#111111] group-hover:text-black">
                        Dokumen Sewa (KTP/SIM)
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Kelola data identitas wajib sebelum serah terima unit kendaraan.
                    </p>
                </Link>

                <Link
                    href="/message"
                    className="group rounded-sm border border-stone-200 bg-white p-5 shadow-sm hover:border-[#111111] hover:shadow-md transition-all"
                >
                    <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h6m-9.75 8.25 2.25-3h8.25A3.75 3.75 0 0018 12.75v-3A3.75 3.75 0 0014.25 6h-4.5A3.75 3.75 0 006 9.75v6.75z" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-semibold text-[#111111] group-hover:text-black">
                        Pesan &amp; Bantuan
                    </h2>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Koordinasi dengan mitra serah terima atau customer support.
                    </p>
                </Link>
            </div>

            {/* Seksi Unit Armada Siap Sewa */}
            <div className="mb-8 rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#F5B800]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b38600]">
                                Rekomendasi Armada
                            </span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-[#111111] mt-0.5">
                            Unit Tersedia Siap Sewa
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Pilih mobil atau motor langsung dari mitra terverifikasi untuk disewa sekarang.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex rounded-sm border border-stone-200 p-0.5 bg-stone-50 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setVehicleFilter('all')}
                                className={`px-3 py-1.5 rounded-xs transition-colors ${
                                    vehicleFilter === 'all'
                                        ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                        : 'text-stone-600 hover:text-black'
                                }`}
                            >
                                Semua ({availableVehicles.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setVehicleFilter('car')}
                                className={`px-3 py-1.5 rounded-xs transition-colors ${
                                    vehicleFilter === 'car'
                                        ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                        : 'text-stone-600 hover:text-black'
                                }`}
                            >
                                Mobil
                            </button>
                            <button
                                type="button"
                                onClick={() => setVehicleFilter('motorcycle')}
                                className={`px-3 py-1.5 rounded-xs transition-colors ${
                                    vehicleFilter === 'motorcycle'
                                        ? 'bg-[#111111] text-[#F5B800] shadow-xs'
                                        : 'text-stone-600 hover:text-black'
                                }`}
                            >
                                Motor
                            </button>
                        </div>

                        <Link
                            href="/pencarian"
                            className="inline-flex items-center gap-1 rounded-sm bg-[#111111] px-3 py-1.5 text-xs font-semibold text-[#F5B800] hover:bg-black transition-colors"
                        >
                            Katalog Lengkap &rarr;
                        </Link>
                    </div>
                </div>

                {filteredVehicles.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-stone-800">Tidak ada unit yang sesuai filter</p>
                        <p className="text-xs text-stone-500 mt-1">Coba pilih kategori lain atau buka halaman pencarian armada.</p>
                        <Link
                            href="/pencarian"
                            className="inline-block mt-3 text-xs font-semibold bg-[#F5B800] text-[#111111] px-4 py-2 rounded-sm hover:bg-[#e0a800] transition-colors"
                        >
                            Jelajahi Semua Kendaraan
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                        {filteredVehicles.map((unit) => (
                            <article
                                key={unit.id}
                                className="group flex flex-col rounded-sm border border-stone-200 bg-white overflow-hidden hover:border-[#111111] hover:shadow-md transition-all"
                            >
                                <div className="relative h-40 bg-stone-100 overflow-hidden">
                                    <img
                                        src={unit.img || FALLBACK_IMAGE}
                                        alt={unit.name}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                    <span className="absolute top-2.5 left-2.5 bg-[#111111] text-[#F5B800] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow-xs">
                                        {unit.category || (unit.vehicle_type === 'motorcycle' ? 'Motor' : 'Mobil')}
                                    </span>
                                    <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm shadow-xs">
                                        Siap Sewa
                                    </span>
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    <div>
                                        <p className="text-[10px] text-stone-400 font-mono">
                                            {unit.city} &bull; {unit.pickup_location}
                                        </p>
                                        <h3 className="text-sm font-bold text-[#111111] mt-1 leading-snug group-hover:text-black">
                                            {unit.name}
                                        </h3>
                                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                                            <svg className="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V6z" />
                                            </svg>
                                            <span>Mitra: <strong className="text-stone-700 font-semibold">{unit.mitra_name}</strong></span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-600 mt-3 pt-3 border-t border-stone-100">
                                        <span className="bg-stone-100 px-2 py-0.5 rounded-xs font-medium">
                                            {unit.transmission}
                                        </span>
                                        <span className="bg-stone-100 px-2 py-0.5 rounded-xs font-medium">
                                            {unit.seat_capacity} Kursi
                                        </span>
                                        <span className="bg-stone-100 px-2 py-0.5 rounded-xs font-medium">
                                            {unit.fuel_type}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] text-stone-400">Tarif Harian</p>
                                            <p className="text-sm font-black text-[#111111]">
                                                {formatRupiah(unit.price_per_day)}
                                                <span className="text-[10px] font-normal text-stone-400"> /hari</span>
                                            </p>
                                        </div>
                                        <Link
                                            href={`/vehicles/${unit.id}`}
                                            className="inline-flex items-center gap-1 bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-xs font-bold px-3 py-1.5 rounded-sm transition-colors shadow-xs"
                                        >
                                            Sewa Unit &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Informasi & Status Akun */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                                Panduan Singkat
                            </span>
                            <h3 className="text-base font-semibold text-[#111111] mt-0.5">
                                Alur Penyewaan Unit RentGo
                            </h3>
                        </div>
                        <Link
                            href="/pesanan"
                            className="text-xs font-semibold text-[#b38600] hover:underline"
                        >
                            Cek Pesanan &rarr;
                        </Link>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-start gap-3 p-3 rounded-sm bg-stone-50 border border-stone-200">
                            <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5B800] text-xs font-bold flex items-center justify-center shrink-0">
                                1
                            </span>
                            <div>
                                <p className="font-semibold text-stone-900">Pilih Armada &amp; Jadwal</p>
                                <p className="text-stone-500 mt-0.5">
                                    Gunakan pencarian untuk memilih mobil atau motor sesuai kapasitas penumpang dan kota penjemputan.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-sm bg-stone-50 border border-stone-200">
                            <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5B800] text-xs font-bold flex items-center justify-center shrink-0">
                                2
                            </span>
                            <div>
                                <p className="font-semibold text-stone-900">Unggah KTP &amp; SIM di Profil</p>
                                <p className="text-stone-500 mt-0.5">
                                    Pastikan dokumen KTP dan SIM aktif telah terisi di tab <Link href="/profile" className="font-semibold text-[#111111] underline">Dokumen Sewa</Link> agar serah terima berjalan lancar.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-sm bg-stone-50 border border-stone-200">
                            <span className="w-6 h-6 rounded-full bg-[#111111] text-[#F5B800] text-xs font-bold flex items-center justify-center shrink-0">
                                3
                            </span>
                            <div>
                                <p className="font-semibold text-stone-900">Serah Terima &amp; Cek Kondisi Unit</p>
                                <p className="text-stone-500 mt-0.5">
                                    Mitra mengantar unit ke lokasi yang disepakati (bandara, stasiun, hotel, atau alamat domisili).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="rounded-sm border border-stone-200 bg-white p-5 shadow-sm">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                            Profil Pengguna
                        </span>
                        <h3 className="text-sm font-semibold text-[#111111] mt-1">
                            {user.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">
                            {user.email}
                        </p>
                        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-xs text-stone-600">Status Akun:</span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                                Aktif
                            </span>
                        </div>
                        <Link
                            href="/profile"
                            className="mt-4 block w-full text-center bg-stone-100 hover:bg-stone-200 text-[#111111] text-xs font-semibold py-2 rounded-sm transition-colors"
                        >
                            Pengaturan Profil &rarr;
                        </Link>
                    </div>

                    <div className="rounded-sm border border-stone-200 bg-[#111111] text-white p-5 shadow-sm">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F5B800]">
                            Bantuan Pelanggan
                        </span>
                        <h4 className="text-xs font-semibold text-white mt-1">
                            Perlu Bantuan Pemesanan?
                        </h4>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                            Tim CS kami siap membantu verifikasi dan koordinasi serah terima unit 24/7.
                        </p>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                        >
                            Hubungi CS WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
