import React, { useMemo, useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    StatusBadge,
    Card,
    SectionTitle,
    EmptyState,
} from "@/Components/RentGo/Ui";

const formatRupiah = (v = 0) => `Rp ${Number(v).toLocaleString('id-ID')}`;
const formatTanggalJam = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const BOOKING_STATUS = {
    pending_payment: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    waiting_agent_confirmation: { label: 'Menunggu Konfirmasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    ready_for_pickup: { label: 'Siap Diambil', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    ongoing: { label: 'Berjalan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    returned: { label: 'Dikembalikan', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    completed: { label: 'Selesai', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 border-red-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-300' },
};

/* Status pembayaran (dibedakan dari status booking). */
const PAYMENT_STATUS = {
    pending: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    awaiting_verification: { label: 'Perlu Cek Pembayaran', color: 'bg-sky-100 text-sky-900 border-sky-300' },
    paid: { label: 'Sudah Dibayar', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    failed: { label: 'Pembayaran Gagal', color: 'bg-red-100 text-red-800 border-red-300' },
    expired: { label: 'Kedaluwarsa', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-300' },
};

const METHOD_LABELS = {
    cash: 'COD (Bayar di Tempat)',
    qris: 'QRIS',
    bank_transfer: 'Transfer Bank (VA)',
};

const TABS = [
    { id: "all", label: "Semua" },
    { id: "pending_payment", label: "Menunggu Bayar" },
    { id: "waiting_agent_confirmation", label: "Perlu Konfirmasi" },
    { id: "confirmed", label: "Dikonfirmasi" },
    { id: "ongoing", label: "Berjalan" },
    { id: "completed", label: "Selesai" },
];

const NEEDS_ACTION_STATUSES = ['waiting_agent_confirmation', 'ready_for_pickup'];

/**
 * Pesanan yang butuh mitra memeriksa pembayaran customer.
 *
 * QRIS & transfer bank ditandai "lunas" HANYA setelah mitra menekan
 * "Setujui Pembayaran" (tidak ada auto-approve), jadi selama statusnya
 * pending / awaiting_verification mitra masih perlu memeriksa.
 */
const PAYMENT_REVIEW_STATUSES = ['pending', 'awaiting_verification'];

/** Pembayaran ini masih menunggu keputusan mitra (belum lunas). */
const needsPaymentReview = (payment) =>
    Boolean(payment) && PAYMENT_REVIEW_STATUSES.includes(payment.status);

/**
 * Pembayaran yang perlu ditampilkan di panel rincian: menunggu keputusan
 * mitra lebih diprioritaskan daripada pembayaran lama yang sudah lunas.
 */
const paymentForReview = (booking) => {
    const payments = booking?.payments || [];
    if (!payments.length) return null;

    const sorted = [...payments].sort((a, b) => (b.id || 0) - (a.id || 0));

    return sorted.find((payment) => needsPaymentReview(payment)) || sorted[0];
};

/**
 * Halaman Pesanan Masuk (Mitra).
 * Props dari BookingController::index(): { bookings, pagination }
 */
function AgentBookings({ bookings = [], pagination = {} }) {
    const [tab, setTab] = useState("all");

    const visible = useMemo(() => {
        if (tab === "all") return bookings;
        return bookings.filter((b) => b.status === tab);
    }, [tab, bookings]);

    const countOf = (id) => {
        if (id === "all") return bookings.length;
        return bookings.filter((b) => b.status === id).length;
    };

    const handleConfirm = (bookingId) => {
        router.post(`/bookings/${bookingId}/confirm`, {}, {
            preserveScroll: true,
        });
    };

    // Buka / mulai percakapan dengan customer pemesan.
    const handleChatCustomer = (bookingId) => {
        router.post(`/message/booking/${bookingId}`, {}, { preserveScroll: true });
    };

    // Mitra menyetujui pembayaran (dana sudah masuk).
    const handleApprovePayment = (booking, payment) => {
        if (!payment) return;
        if (!confirm('Setujui pembayaran ini? Pastikan dana sudah masuk ke rekening Anda.')) return;
        router.post(
            `/bookings/${booking.id}/payment/approve`,
            { payment_id: payment.id },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Pesanan Masuk â€” RentGo" />

            <SectionTitle
                kicker="Permintaan Sewa"
                title="Pesanan Masuk"
                description="Periksa bukti pembayaran customer (QRIS/transfer bank), setujui pembayaran, lalu konfirmasi atau tolak pesanan."
            />

            <Card className="border p-2 mb-6">
                <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-sm">
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={`text-xs font-medium px-3.5 py-2 rounded-sm transition-colors ${
                                tab === item.id
                                    ? "bg-[#111] text-[#F5B800]"
                                    : "text-stone-600 hover:text-black"
                            }`}
                        >
                            {item.label}
                            <span
                                className={`ml-1.5 text-[10px] px-1.5 rounded-sm ${tab === item.id ? "bg-[#F5B800] text-[#111]" : "bg-stone-200 text-stone-700"}`}
                            >
                                {countOf(item.id)}
                            </span>
                        </button>
                    ))}
                </div>
            </Card>

            {visible.length === 0 ? (
                <EmptyState
                    title="Tidak ada pesanan"
                    description="Belum ada pesanan pada kategori ini."
                />
            ) : (
                <div className="space-y-4">
                    {visible.map((booking) => {
                        const vehicle = booking.items?.[0]?.vehicle;
                        const needsAction = NEEDS_ACTION_STATUSES.includes(booking.status);
                        const payment = paymentForReview(booking);
                        const reviewPayment = needsPaymentReview(payment);
                        const paymentSettled = payment?.status === 'paid';
                        return (
                            <Card
                                key={booking.id}
                                className="border overflow-hidden"
                            >
                                <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                            {booking.booking_number}
                                        </span>
                                        <span className="text-stone-400">â€¢</span>
                                        <span className="text-stone-600 font-medium">
                                            {vehicle?.name || 'Unit Kendaraan'}
                                        </span>
                                    </div>
                                    <StatusBadge
                                        status={booking.status}
                                        map={BOOKING_STATUS}
                                    />
                                </div>

                                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center text-xs">
                                    <div className="md:col-span-5 space-y-1.5">
                                        <h3 className="text-sm font-semibold">
                                            {booking.customer?.name || 'Penyewa'}
                                        </h3>
                                        <p className="text-stone-500">
                                            Telepon:{" "}
                                            <span className="font-mono">
                                                {booking.customer?.phone || '-'}
                                            </span>
                                        </p>
                                        <p className="text-stone-500">
                                            Jadwal:{" "}
                                            {formatTanggalJam(booking.rental_start)}{" "}
                                            â€”{" "}
                                            {formatTanggalJam(booking.rental_end)}
                                        </p>
                                    </div>

                                    <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 md:pl-5 pt-4 md:pt-0">
                                        <p className="text-stone-500">Nilai Pesanan</p>
                                        <p className="text-base font-semibold mt-0.5">
                                            {formatRupiah(booking.total_amount)}
                                        </p>
                                        <p className="text-[11px] text-stone-400 mt-1">
                                            Plat unit:{" "}
                                            <span className="font-mono">
                                                {vehicle?.license_plate || '-'}
                                            </span>
                                        </p>

                                        {/* Status pembayaran customer */}
                                        {payment && (
                                            <div className="mt-2 space-y-1">
                                                <p className="text-[11px] text-stone-500">
                                                    {METHOD_LABELS[payment.payment_method] || payment.payment_method}
                                                    {payment.bank_code ? ` Â· ${payment.bank_code}` : ''}
                                                </p>
                                                <StatusBadge
                                                    status={payment.status}
                                                    map={PAYMENT_STATUS}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-stone-200 md:pl-5 pt-4 md:pt-0 flex flex-col gap-2">
                                        <Link
                                            href={`/mitra/pesanan/${booking.id}`}
                                            className="w-full text-center text-xs font-medium border-stone-300 hover:bg-stone-50 py-2 rounded-sm transition-colors"
                                        >
                                            Detail &amp; Progres
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleChatCustomer(booking.id)}
                                            className="w-full text-xs font-medium border-stone-300 hover:bg-stone-50 py-2 rounded-sm transition-colors"
                                        >
                                            Chat Customer
                                        </button>
                                        {reviewPayment ? (
                                            <button
                                                type="button"
                                                onClick={() => handleApprovePayment(booking, payment)}
                                                className="w-full text-xs font-semibold bg-[#F5B800] hover:bg-[#e0a800] text-[#111] py-2 rounded-sm transition-colors"
                                            >
                                                Cek & Setujui Pembayaran
                                            </button>
                                        ) : needsAction && paymentSettled ? (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirm(booking.id)}
                                                className="w-full text-xs font-semibold bg-[#F5B800] hover:bg-[#e0a800] text-[#111] py-2 rounded-sm transition-colors"
                                            >
                                                Konfirmasi
                                            </button>
                                        ) : (
                                            <span className="w-full text-center text-[11px] text-stone-400 py-2 rounded-sm border-dashed border-stone-300">
                                                {payment
                                                    ? 'Menunggu bayar customer'
                                                    : 'Belum ada pembayaran'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

        </>
    );
}

AgentBookings.layout = (page) => (
    <AgentLayout active="/mitra/pesanan" title="Pesanan Masuk">
        {page}
    </AgentLayout>
);

export default AgentBookings;
