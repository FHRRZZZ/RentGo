import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

const STATUS_MAP = {
    pending_payment: { status: 'menunggu', label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    waiting_agent_confirmation: { status: 'menunggu', label: 'Menunggu Konfirmasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    confirmed: { status: 'aktif', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    ready_for_pickup: { status: 'aktif', label: 'Siap Diambil', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    ongoing: { status: 'aktif', label: 'Sedang Berjalan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    returned: { status: 'selesai', label: 'Dikembalikan', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    completed: { status: 'selesai', label: 'Selesai', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    cancelled: { status: 'batal', label: 'Dibatalkan', color: 'bg-red-100 text-red-700 border-red-300' },
    rejected: { status: 'batal', label: 'Ditolak Mitra', color: 'bg-red-100 text-red-700 border-red-300' },
};

// Label metode pembayaran (untuk kartu pesanan).
const METHOD_LABELS = {
    cash: 'COD (Bayar di Tempat)',
    qris: 'QRIS',
    bank_transfer: 'Transfer Bank (VA)',
};

// Label status pembayaran (bukti bayar sedang diperiksa mitra, dsb.).
const PAYMENT_STATUS_LABELS = {
    pending: 'Belum Dibayar',
    awaiting_verification: 'Menunggu Verifikasi Mitra',
    paid: 'Lunas',
    failed: 'Pembayaran Gagal',
    expired: 'Pembayaran Kedaluwarsa',
    cancelled: 'Pembayaran Dibatalkan',
};

// Ambil path foto asli pertama (file_path dari vehicle_photos).
const primaryPhotoPath = (photos = []) => {
    const photo = (photos || []).find((p) => p?.file_path || p?.photo_path);
    const path = photo?.file_path || photo?.photo_path;
    return path ? `/storage/${path}` : null;
};

const TABS = [
    { id: 'semua', label: 'Semua' },
    { id: 'aktif', label: 'Berjalan' },
    { id: 'menunggu', label: 'Menunggu Bayar' },
    { id: 'selesai', label: 'Selesai' },
    { id: 'batal', label: 'Dibatalkan' },
];

export default function OrdersIndex({ auth = {}, bookings = [], availableUnits = [] }) {
    const [statusFilter, setStatusFilter] = useState('semua');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewModal, setReviewModal] = useState(null); // order being reviewed
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewedOrders, setReviewedOrders] = useState({});

    const openReview = (order) => {
        setReviewModal(order);
        setReviewRating(5);
        setReviewHover(0);
        setReviewText('');
    };

    const submitReview = (e) => {
        e.preventDefault();
        if (!reviewText.trim() || !reviewModal) return;
        setReviewSubmitting(true);
        router.post('/reviews', {
            booking_id: reviewModal.dbId,
            rating: reviewRating,
            comment: reviewText.trim(),
        }, {
            onSuccess: () => {
                setReviewedOrders(prev => ({ ...prev, [reviewModal.dbId]: true }));
                setReviewModal(null);
                setReviewSubmitting(false);
            },
            onError: () => setReviewSubmitting(false),
            preserveScroll: true,
        });
    };
    // Buka / mulai percakapan dengan mitra penyedia untuk pesanan ini.
    const handleChatMitra = (order) => {
        router.post(`/message/booking/${order.dbId}`, {}, { preserveScroll: true });
    };

    // unit data asli dari server (dipakai saat belum ada pesanan)

    const activeOrders = useMemo(() => {
        if (!bookings || bookings.length === 0) return [];
        return bookings.map((b) => {
            const vehicle = b.items?.[0]?.vehicle;
            const s = STATUS_MAP[b.status] || { status: 'aktif', label: b.status, color: 'bg-stone-100 text-stone-700 border-stone-300' };
            return {
                id: b.booking_number || `RG-${b.id}`,
                dbId: b.id,
                status: s.status,
                statusLabel: s.label,
                statusColor: s.color,
                rawStatus: b.status,
                kendaraanNama: vehicle?.name || [vehicle?.brand, vehicle?.model].filter(Boolean).join(' ') || b.vehicle_name || 'Kendaraan',
                kendaraanTipe: vehicle?.vehicle_type === 'motorcycle' ? 'Motor' : 'Mobil',
                transmisi: vehicle?.transmission === 'manual' ? 'Manual' : 'Matic',
                kursi: vehicle?.seat_capacity
                    ? `${vehicle.seat_capacity} ${vehicle.vehicle_type === 'motorcycle' ? 'Orang' : 'Kursi'}`
                    : '-',
                platNomor: vehicle?.license_plate || '-',
                layanan: b.delivery_type === 'delivery' ? 'Antar-Jemput' : 'Lepas Kunci',
                tglMulai: b.rental_start,
                tglSelesai: b.rental_end,
                durasi: `${b.total_days || 1} Hari`,
                lokasiAmbil: b.pickup_location || b.items?.[0]?.vehicle?.pickup_location || 'Belum ditentukan',
                lokasiKembali: b.return_location || b.pickup_location || 'Belum ditentukan',
                totalHarga: Number(b.total_amount) || 0,
                biayaDetail: {
                    sewaPerHari: Number(b.rental_amount) / (b.total_days || 1),
                    hari: b.total_days || 1,
                    asuransi: Number(b.service_fee) || 0,
                    diskon: 0,
                },
                // Hanya pakai foto asli dari vehicle_photos (file_path),
                // tanpa gambar contoh bila mitra belum mengunggah.
                img: primaryPhotoPath(vehicle?.photos),
                unitKode: vehicle?.license_plate || (vehicle?.id ? `UNIT-${vehicle.id}` : '-'),
                metodeBayar:
                    METHOD_LABELS[b.payments?.[0]?.payment_method] || '-',
                paymentStatusLabel:
                    PAYMENT_STATUS_LABELS[b.payments?.[0]?.status] || null,
                paymentId: b.payments?.[0]?.id || null,
                paymentStatus: b.payments?.[0]?.status || null,
                needsPayment: ['pending_payment', 'waiting_payment'].includes(b.status),
                driverName: b.agent_profile?.agency_name || b.agent_profile?.user?.name || '-',
                driverPhone: b.agent_profile?.user?.phone || b.agent_profile?.phone || '-',
            };
        });
    }, [bookings]);

    const filteredOrders = activeOrders.filter((o) =>
        statusFilter === 'semua' ? true : o.status === statusFilter,
    );

    const countOf = (id) =>
        id === 'semua' ? activeOrders.length : activeOrders.filter((o) => o.status === id).length;

    return (
        <CustomerLayout auth={auth} activeNav="pesanan" backHref="/" backLabel="Beranda">
            <Head title="Pesanan Saya - RentGo" />

            {/* Page Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Aktivitas Penyewaan
                    </span>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
                            Riwayat &amp; Pesanan Saya
                        </h1>
                        <p className="mt-1 text-xs text-stone-500">
                            Pantau status penjemputan unit, rincian biaya, dan kontak mitra serah terima kendaraan.
                        </p>
                    </div>
                    <Link
                        href="/#armada-mobil"
                        className="inline-flex w-fit items-center rounded-sm bg-[#F5B800] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#e0a800]"
                    >
                        Sewa Kendaraan Baru
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 rounded-sm border border-stone-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 rounded-sm bg-stone-100 p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`rounded-sm px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                                statusFilter === tab.id
                                    ? 'bg-[#111111] text-[#F5B800]'
                                    : 'text-stone-600 hover:text-[#111111]'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`ml-1.5 rounded-sm px-1.5 py-0.5 text-[10px] ${
                                    statusFilter === tab.id
                                        ? 'bg-[#F5B800] text-[#111111]'
                                        : 'bg-stone-200 text-stone-600'
                                }`}
                            >
                                {countOf(tab.id)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Daftar Pesanan */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="rounded-sm border border-stone-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-sm font-semibold text-stone-800">Tidak ada pesanan di kategori ini</p>
                        <p className="mt-1 text-xs text-stone-400">
                            Silakan cek status pesanan lainnya atau buat pemesanan unit baru.
                        </p>
                        <Link
                            href="/#armada-mobil"
                            className="mt-4 inline-block rounded-sm bg-[#F5B800] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#111111] transition-colors hover:bg-[#e0a800]"
                        >
                            Jelajahi Armada
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
                        >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-3 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="rounded-sm bg-stone-200/80 px-2 py-0.5 font-mono font-semibold text-[#111111]">
                                        {order.id}
                                    </span>
                                    <span className="text-stone-400">&bull;</span>
                                    <span className="font-medium text-stone-600">
                                        {order.tglMulai} s/d {order.tglSelesai}
                                    </span>
                                </div>
                                <span
                                    className={`rounded-sm border px-2.5 py-0.5 text-[11px] font-semibold ${order.statusColor}`}
                                >
                                    {order.statusLabel}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="grid grid-cols-1 items-center gap-5 p-5 md:grid-cols-12">
                                {/* Thumbnail */}
                                <div className="md:col-span-3">
                                    <div className="h-32 overflow-hidden rounded-sm border border-stone-200 bg-stone-100">
                                        {order.img ? (
                                            <img
                                                src={order.img}
                                                alt={order.kendaraanNama}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="px-2 text-center text-[10px] font-medium text-stone-400">
                                                Foto unit belum tersedia
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Spesifikasi */}
                                <div className="space-y-1.5 text-xs md:col-span-5">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-sm bg-[#111111] px-1.5 py-0.5 text-[10px] font-medium text-[#F5B800]">
                                            {order.kendaraanTipe}
                                        </span>
                                        <span className="font-mono font-medium text-stone-500">
                                            {order.unitKode}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-[#111111]">
                                        {order.kendaraanNama}
                                    </h3>
                                    <div className="space-y-1 pt-1 text-stone-600">
                                        <p>
                                            <span className="font-semibold text-stone-700">Layanan: </span>
                                            {order.layanan} ({order.transmisi}) &bull; {order.kursi} &bull; {order.durasi}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-stone-700">Titik Serah Terima: </span>
                                            <span className="truncate">{order.lokasiAmbil}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Harga & Aksi */}
                                <div className="flex h-full flex-col justify-between border-t pt-4 text-xs md:col-span-4 md:border-l md:border-t-0 md:pl-5 md:pt-0 border-stone-200">
                                    <div>
                                        <span className="block text-stone-500">Total Biaya Sewa</span>
                                        <span className="text-lg font-semibold text-[#111111]">
                                            Rp {order.totalHarga.toLocaleString('id-ID')}
                                        </span>
                                        <span className="mt-0.5 block font-medium text-[11px] text-stone-400">
                                            Metode: {order.metodeBayar}
                                        </span>
                                        {order.paymentStatusLabel && (
                                            <span className="mt-1 block text-[11px] text-stone-500">
                                                Status pembayaran:{" "}
                                                <b className="text-[#111]">{order.paymentStatusLabel}</b>
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex-1 rounded-sm border border-stone-300 bg-white py-2 text-center font-medium text-stone-800 transition-colors hover:bg-stone-50"
                                        >
                                            Rincian Sewa
                                        </button>
                                        {order.needsPayment ? (
                                            <Link
                                                href={`/payments/create/${order.dbId}`}
                                                className="flex-1 rounded-sm bg-[#F5B800] py-2 text-center font-bold text-[#111] transition-colors hover:bg-[#e0a800]"
                                            >
                                                Bayar Sekarang
                                            </Link>
                                        ) : order.paymentId ? (
                                            <Link
                                                href={`/payments/${order.paymentId}/receipt`}
                                                className="flex-1 rounded-sm bg-[#F5B800] py-2 text-center font-medium text-[#111] transition-colors hover:bg-[#e0a800]"
                                            >
                                                Lihat Struk
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleChatMitra(order)}
                                                className="flex-1 rounded-sm bg-[#F5B800] py-2 text-center font-medium text-[#111111] transition-colors hover:bg-[#e0a800]"
                                            >
                                                Chat Mitra
                                            </button>
                                        )}
                                        {(order.rawStatus === 'completed' || order.rawStatus === 'returned') && (
                                            reviewedOrders[order.dbId] ? (
                                                <span className="w-full flex items-center justify-center gap-1.5 rounded-sm border border-emerald-200 bg-emerald-50 py-2 text-[11px] font-semibold text-emerald-700">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                    Ulasan Terkirim
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openReview(order)}
                                                    className="w-full flex items-center justify-center gap-1.5 rounded-sm border border-[#F5B800] bg-[#FFFBEA] py-2 text-[11px] font-semibold text-[#b38600] transition-colors hover:bg-[#F5B800] hover:text-[#111]"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                                    Beri Ulasan
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Rincian */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-sm border border-stone-200 bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-stone-800 bg-[#111111] p-4 text-white">
                            <div>
                                <span className="font-mono text-[10px] font-medium uppercase text-[#F5B800]">
                                    Invoice Penyewaan &bull; {selectedOrder.id}
                                </span>
                                <h3 className="mt-0.5 text-sm font-semibold">{selectedOrder.kendaraanNama}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="px-2 py-1 text-lg font-medium text-stone-400 hover:text-white"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 p-5 text-xs text-[#111111]">
                            <div className="space-y-1.5 rounded-sm border border-stone-200 bg-stone-50 p-3">
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Waktu Mulai:</span>
                                    <span className="font-medium">{selectedOrder.tglMulai}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stone-500">Waktu Kembali:</span>
                                    <span className="font-medium">{selectedOrder.tglSelesai}</span>
                                </div>
                                <div className="flex justify-between border-t border-stone-200 pt-1.5">
                                    <span className="text-stone-500">Titik Serah Terima:</span>
                                    <span className="max-w-xs text-right font-medium">{selectedOrder.lokasiAmbil}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-700">
                                    Rincian Tarif
                                </p>
                                <div className="flex justify-between text-stone-600">
                                    <span>
                                        Tarif Unit ({selectedOrder.biayaDetail.hari} Hari &times; Rp{' '}
                                        {selectedOrder.biayaDetail.sewaPerHari.toLocaleString('id-ID')}):
                                    </span>
                                    <span>
                                        Rp{' '}
                                        {(
                                            selectedOrder.biayaDetail.hari *
                                            selectedOrder.biayaDetail.sewaPerHari
                                        ).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-stone-600">
                                    <span>Proteksi Asuransi Armada:</span>
                                    <span>Rp {selectedOrder.biayaDetail.asuransi.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-emerald-600">
                                    <span>Promo Diskon Member:</span>
                                    <span>- Rp {selectedOrder.biayaDetail.diskon.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-semibold text-[#111111]">
                                    <span>Total Pembayaran:</span>
                                    <span>Rp {selectedOrder.totalHarga.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="space-y-1 rounded-sm border border-stone-200 bg-stone-50 p-3 text-[11px]">
                                <span className="block font-medium text-stone-700">Petugas Penyerahan Armada:</span>
                                <p className="text-stone-600">
                                    {selectedOrder.driverName} (Telp: {selectedOrder.driverPhone})
                                </p>
                                <p className="text-stone-400">
                                    Harap tunjukkan KTP &amp; SIM asli saat serah terima unit di lokasi.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 p-4 text-xs">
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-sm border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-100"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="rounded-sm bg-[#111111] px-4 py-2 font-medium uppercase tracking-wider text-[#F5B800] hover:bg-black"
                            >
                                Cetak Tanda Bukti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Review */}
            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-[#111] to-[#2a2a2a] px-6 py-5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">Beri Ulasan Penyewaan</span>
                            <h3 className="mt-0.5 text-base font-bold text-white">{reviewModal.kendaraanNama}</h3>
                            <p className="mt-0.5 text-[11px] text-stone-400">ID Pesanan: {reviewModal.id}</p>
                        </div>

                        <form onSubmit={submitReview} className="p-5 space-y-5">
                            {/* Star Rating */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">Rating Pengalaman Sewa</p>
                                <div className="flex items-center justify-center gap-2">
                                    {[1,2,3,4,5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            onMouseEnter={() => setReviewHover(star)}
                                            onMouseLeave={() => setReviewHover(0)}
                                            className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <span className={(reviewHover || reviewRating) >= star ? 'text-[#F5B800]' : 'text-stone-200'}>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-xs font-semibold text-stone-500 mt-2">
                                    {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][(reviewHover || reviewRating)]}
                                </p>
                            </div>

                            {/* Komentar */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                                    Ceritakan Pengalaman Anda
                                </label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    rows={4}
                                    placeholder="Bagaimana kondisi kendaraan, pelayanan mitra, dan pengalaman sewa secara keseluruhan?"
                                    className="w-full resize-none rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs outline-none transition focus:border-[#F5B800] focus:bg-white focus:ring-2 focus:ring-[#F5B800]/20"
                                    required
                                />
                                <p className="mt-1 text-right text-[10px] text-stone-400">{reviewText.length}/500</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setReviewModal(null)}
                                    className="flex-1 rounded-lg border border-stone-200 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting || !reviewText.trim()}
                                    className="flex-1 rounded-lg bg-[#F5B800] py-2.5 text-xs font-bold text-[#111] transition hover:bg-[#e0a800] disabled:opacity-50"
                                >
                                    {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
