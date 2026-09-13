import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const MOCK_ORDERS = [
    {
        id: 'RG-2026-0914',
        status: 'aktif',
        statusLabel: 'Sedang Berjalan',
        statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        kendaraanNama: 'Toyota Avanza 1.3 G',
        kendaraanTipe: 'Mobil MPV',
        transmisi: 'Matic',
        platNomor: 'B 1928 KZA',
        layanan: 'Lepas Kunci',
        tglMulai: '14 Sep 2026, 09:00 WIB',
        tglSelesai: '16 Sep 2026, 09:00 WIB',
        durasi: '2 Hari (48 Jam)',
        lokasiAmbil: 'Bandara Soekarno-Hatta (CGK) Terminal 3',
        lokasiKembali: 'Bandara Soekarno-Hatta (CGK) Terminal 3',
        totalHarga: 800000,
        biayaDetail: {
            sewaPerHari: 400000,
            hari: 2,
            asuransi: 50000,
            diskon: 50000,
        },
        img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        metodeBayar: 'QRIS / BCA Virtual Account',
        driverName: 'Serah Terima Mandiri (Mitra Rental CGK)',
        driverPhone: '081299887766',
    },
    {
        id: 'RG-2026-0918',
        status: 'menunggu',
        statusLabel: 'Menunggu Pembayaran',
        statusColor: 'bg-amber-100 text-amber-900 border-amber-300',
        kendaraanNama: 'Honda PCX 160',
        kendaraanTipe: 'Motor Maxi',
        transmisi: 'Matic',
        platNomor: 'AB 3841 YZ',
        layanan: 'Lepas Kunci',
        tglMulai: '18 Sep 2026, 10:00 WIB',
        tglSelesai: '21 Sep 2026, 10:00 WIB',
        durasi: '3 Hari',
        lokasiAmbil: 'Stasiun Tugu Yogyakarta',
        lokasiKembali: 'Stasiun Tugu Yogyakarta',
        totalHarga: 360000,
        biayaDetail: {
            sewaPerHari: 120000,
            hari: 3,
            asuransi: 30000,
            diskon: 30000,
        },
        img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
        metodeBayar: 'Menunggu Transfer Bank',
        driverName: 'Mitra RentGo Tugu',
        driverPhone: '081388776655',
    },
    {
        id: 'RG-2026-0820',
        status: 'selesai',
        statusLabel: 'Selesai',
        statusColor: 'bg-stone-100 text-stone-700 border-stone-300',
        kendaraanNama: 'Honda HR-V 1.5 E',
        kendaraanTipe: 'Mobil SUV',
        transmisi: 'Matic',
        platNomor: 'DK 1420 AB',
        layanan: 'Lepas Kunci',
        tglMulai: '20 Agu 2026, 12:00 WITA',
        tglSelesai: '23 Agu 2026, 12:00 WITA',
        durasi: '3 Hari',
        lokasiAmbil: 'Bandara I Gusti Ngurah Rai (DPS) Bali',
        lokasiKembali: 'Area Kuta & Seminyak',
        totalHarga: 1800000,
        biayaDetail: {
            sewaPerHari: 600000,
            hari: 3,
            asuransi: 75000,
            diskon: 75000,
        },
        img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        metodeBayar: 'Lunas (Kartu Kredit)',
        driverName: 'Mitra Armada Bali Jaya',
        driverPhone: '081234567890',
    },
];

export default function OrdersIndex({ auth = {} }) {
    const [statusFilter, setStatusFilter] = useState('semua');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const user = auth.user;

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(typeof route === 'function' ? route('logout') : '/logout');
    };

    const filteredOrders = MOCK_ORDERS.filter((order) => {
        if (statusFilter === 'semua') return true;
        return order.status === statusFilter;
    });

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
            <Head title="Riwayat Pesanan Saya - RentGo" />

            {/* Header Navbar — Identik dengan Welcome.jsx */}
            <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600 font-medium">
                            <Link href="/#sekitar-kita" className="hover:text-black">Sekitar Kita</Link>
                            <Link href="/#armada-mobil" className="hover:text-black">Sewa Mobil</Link>
                            <Link href="/#armada-motor" className="hover:text-black">Sewa Motor</Link>
                            <Link href="/pesanan" className="text-black font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                <span>Pesanan Saya</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-xs font-bold text-stone-600 hover:text-black px-3 py-2 border border-stone-200 rounded-sm hover:border-stone-400 transition-colors"
                        >
                            &larr; Beranda
                        </Link>

                        {user && (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    className="flex items-center gap-2 py-1.5 pl-2 pr-3 rounded-full border border-stone-200 bg-white hover:border-[#F5B800] transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[#111111] text-[#F5B800] font-black flex items-center justify-center text-xs">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-[#111111]">
                                        {user.name?.split(' ')[0]}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-200 rounded-sm shadow-xl z-50 py-1">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Profil &amp; Dokumen Sewa
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            Keluar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section — RentGo Industrial Dark Theme */}
            <section className="bg-[#111111] text-white py-8 sm:py-12 border-b border-stone-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-[#F5B800]"></span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F5B800]">
                            AKTIVITAS &bull; STATUS PENYEWAAN
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                Riwayat &amp; Pesanan Saya
                            </h1>
                            <p className="text-xs text-stone-400 mt-0.5">
                                Pantau status penjemputan unit, rincian biaya sewa, dan kontak mitra serah terima kendaraan.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-stone-900 text-stone-300 px-3 py-1.5 rounded-sm border border-stone-700">
                                Total: {MOCK_ORDERS.length} Transaksi
                            </span>
                            <Link
                                href="/#armada-mobil"
                                className="text-xs font-bold bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] px-4 py-1.5 rounded-sm uppercase tracking-wider transition-colors"
                            >
                                Sewa Kendaraan Baru
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Stage */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Filter Tabs Sesuai Style Welcome.jsx */}
                <div className="bg-white p-2 rounded-sm border border-stone-200 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-sm">
                        {[
                            { id: 'semua', label: 'Semua Pesanan', count: MOCK_ORDERS.length },
                            { id: 'aktif', label: 'Sedang Berjalan', count: 1 },
                            { id: 'menunggu', label: 'Menunggu Pembayaran', count: 1 },
                            { id: 'selesai', label: 'Selesai', count: 1 },
                            { id: 'batal', label: 'Dibatalkan', count: 0 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStatusFilter(tab.id)}
                                className={`text-xs font-bold px-3.5 py-2 rounded-sm transition-colors whitespace-nowrap ${
                                    statusFilter === tab.id
                                        ? 'bg-[#111111] text-[#F5B800]'
                                        : 'text-stone-600 hover:text-black'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-xs ${
                                    statusFilter === tab.id ? 'bg-[#F5B800] text-[#111111]' : 'bg-stone-200 text-stone-700'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Kartu Pesanan */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white p-12 text-center border border-stone-200 rounded-sm">
                            <p className="text-sm font-bold text-stone-800">Tidak ada pesanan di kategori ini</p>
                            <p className="text-xs text-stone-400 mt-1">Silakan cek status pesanan lainnya atau buat pemesanan unit baru.</p>
                            <Link
                                href="/#armada-mobil"
                                className="inline-block mt-4 text-xs font-bold bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] px-5 py-2 rounded-sm uppercase tracking-wider"
                            >
                                Jelajahi Armada
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden hover:border-stone-400 transition-all"
                            >
                                {/* Order Card Header */}
                                <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-[#111111] bg-stone-200/80 px-2 py-0.5 rounded-xs">
                                            {order.id}
                                        </span>
                                        <span className="text-stone-400">&bull;</span>
                                        <span className="text-stone-600 font-medium">
                                            Jadwal: {order.tglMulai} s/d {order.tglSelesai}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-xs text-[11px] font-bold border ${order.statusColor}`}>
                                            {order.statusLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Card Body */}
                                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                                    {/* Thumbnail Armada */}
                                    <div className="md:col-span-3">
                                        <div className="h-32 rounded-sm overflow-hidden bg-stone-100 border border-stone-200">
                                            <img
                                                src={order.img}
                                                alt={order.kendaraanNama}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Spesifikasi & Rincian Sewa */}
                                    <div className="md:col-span-5 space-y-1.5 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-[#F5B800] bg-[#111111] px-1.5 py-0.2 rounded-xs">
                                                {order.kendaraanTipe}
                                            </span>
                                            <span className="text-stone-500 font-mono font-bold">{order.platNomor}</span>
                                        </div>

                                        <h3 className="text-base font-black text-[#111111]">
                                            {order.kendaraanNama}
                                        </h3>

                                        <div className="text-stone-600 space-y-1 pt-1">
                                            <p className="flex items-center gap-1.5">
                                                <span className="font-semibold text-stone-700">Layanan:</span>
                                                <span>{order.layanan} ({order.transmisi}) &bull; {order.durasi}</span>
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <span className="font-semibold text-stone-700">Titik Serah Terima:</span>
                                                <span className="truncate">{order.lokasiAmbil}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kolom Harga & Aksi */}
                                    <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 md:pl-5 pt-4 md:pt-0 flex flex-col justify-between h-full text-xs">
                                        <div>
                                            <span className="text-stone-500 block">Total Biaya Sewa:</span>
                                            <span className="text-lg font-black text-[#111111]">
                                                Rp {order.totalHarga.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[11px] text-stone-400 block mt-0.5 font-medium">
                                                Metode: {order.metodeBayar}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedOrder(order)}
                                                className="flex-1 bg-white hover:bg-stone-100 text-stone-800 font-bold border border-stone-300 py-2 rounded-sm transition-colors text-center"
                                            >
                                                Rincian Sewa
                                            </button>

                                            <a
                                                href={`https://wa.me/6281234567890?text=Halo%20RentGo,%20saya%20ingin%20konfirmasi%20pesanan%20${order.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] font-bold py-2 rounded-sm transition-colors text-center"
                                            >
                                                Kontak Mitra
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Modal Rincian Pesanan Sewa */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-sm border border-stone-300 w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
                        {/* Modal Header */}
                        <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b border-stone-800">
                            <div>
                                <span className="text-[10px] font-mono text-[#F5B800] uppercase font-bold">
                                    INVOICE PENYEWAAN &bull; {selectedOrder.id}
                                </span>
                                <h3 className="text-sm font-black text-white mt-0.5">
                                    {selectedOrder.kendaraanNama}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="text-stone-400 hover:text-white text-lg font-bold px-2 py-1"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-5 space-y-4 text-xs text-[#111111]">
                            {/* Jadwal Penjemputan */}
                            <div className="p-3 bg-stone-50 border border-stone-200 rounded-sm space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Waktu Mulai:</span>
                                    <span className="font-bold">{selectedOrder.tglMulai}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Waktu Kembali:</span>
                                    <span className="font-bold">{selectedOrder.tglSelesai}</span>
                                </div>
                                <div className="flex justify-between border-t border-stone-200 pt-1.5">
                                    <span className="text-stone-500">Titik Serah Terima:</span>
                                    <span className="font-bold text-right max-w-xs">{selectedOrder.lokasiAmbil}</span>
                                </div>
                            </div>

                            {/* Rincian Tarif */}
                            <div className="space-y-1.5 pt-2">
                                <p className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">Rincian Tarif</p>
                                <div className="flex justify-between text-stone-600">
                                    <span>Tarif Unit ({selectedOrder.biayaDetail.hari} Hari x Rp {selectedOrder.biayaDetail.sewaPerHari.toLocaleString('id-ID')}):</span>
                                    <span>Rp {(selectedOrder.biayaDetail.hari * selectedOrder.biayaDetail.sewaPerHari).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>Proteksi Asuransi Armada:</span>
                                    <span>Rp {selectedOrder.biayaDetail.asuransi.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                    <span>Promo Diskon Member:</span>
                                    <span>- Rp {selectedOrder.biayaDetail.diskon.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between font-black text-sm pt-2 border-t border-stone-200 text-[#111111]">
                                    <span>Total Pembayaran:</span>
                                    <span>Rp {selectedOrder.totalHarga.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Mitra Info */}
                            <div className="p-3 border border-stone-200 rounded-sm bg-stone-50 text-[11px] space-y-1">
                                <span className="font-bold text-stone-700 block">Petugas Penyerahan Armada:</span>
                                <p className="text-stone-600">{selectedOrder.driverName} (Telp: {selectedOrder.driverPhone})</p>
                                <p className="text-stone-400">Harap tunjukkan KTP &amp; SIM asli saat serah terima unit di lokasi.</p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-2 text-xs">
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 border border-stone-300 rounded-sm font-bold text-stone-700 hover:bg-stone-100"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-4 py-2 bg-[#111111] hover:bg-black text-[#F5B800] font-bold rounded-sm uppercase tracking-wider"
                            >
                                Cetak Tanda Bukti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
