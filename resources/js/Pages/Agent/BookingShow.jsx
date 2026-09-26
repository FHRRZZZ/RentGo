import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    StatusBadge,
    DataRow,
    Card,
    FailSafeImage,
} from "@/Components/RentGo/Ui";

// Placeholder netral bila mitra belum mengunggah foto unit.
const NO_PHOTO =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="24" text-anchor="middle">Foto unit belum tersedia</text></svg>`,
    );

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatTanggalJam = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

const BOOKING_STATUS = {
    pending_payment: {
        label: "Menunggu Pembayaran",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    paid: {
        label: "Sudah Dibayar",
        color: "bg-blue-100 text-blue-900 border-blue-300",
    },
    waiting_agent_confirmation: {
        label: "Menunggu Konfirmasi Mitra",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    confirmed: {
        label: "Dikonfirmasi Mitra",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    ready_for_pickup: {
        label: "Siap Diambil",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    ongoing: {
        label: "Sedang Berjalan",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    returned: {
        label: "Kendaraan Dikembalikan",
        color: "bg-purple-100 text-purple-800 border-purple-300",
    },
    completed: {
        label: "Selesai",
        color: "bg-stone-100 text-stone-700 border-stone-300",
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-800 border-red-300",
    },
    rejected: {
        label: "Ditolak Mitra",
        color: "bg-red-100 text-red-700 border-red-300",
    },
    expired: {
        label: "Kadaluwarsa",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
    refund_pending: {
        label: "Menunggu Refund",
        color: "bg-purple-100 text-purple-800 border-purple-300",
    },
};

const PAYMENT_STATUS = {
    pending: {
        label: "Menunggu Bayar",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    awaiting_verification: {
        label: "Perlu Cek Pembayaran",
        color: "bg-sky-100 text-sky-900 border-sky-300",
    },
    paid: {
        label: "Sudah Dibayar",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    failed: {
        label: "Pembayaran Gagal",
        color: "bg-red-100 text-red-800 border-red-300",
    },
    expired: {
        label: "Kedaluwarsa",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-800 border-red-300",
    },
};

const METHOD_LABELS = {
    cash: "COD (Bayar di Tempat)",
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
};

// Label jenis dokumen identitas penyewa (KTP/SIM, dll.).
const DOCUMENT_TYPE_LABELS = {
    ktp: "KTP",
    sim: "SIM",
    sim_a: "SIM A",
    sim_c: "SIM C",
    passport: "Paspor",
    npwp: "NPWP",
    selfie_ktp: "Selfie + KTP",
};

// Status verifikasi dokumen penyewa.
const DOCUMENT_STATUS = {
    approved: {
        label: "Terverifikasi",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    pending: {
        label: "Menunggu Verifikasi",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
    },
};

const documentTypeLabel = (type) =>
    DOCUMENT_TYPE_LABELS[type] ||
    (type ? type.toUpperCase().replace(/_/g, " ") : "Dokumen");

const REFUND_STATUS = {
    pending: {
        label: "Menunggu",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    approved: {
        label: "Disetujui",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    completed: {
        label: "Selesai",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
    },
};

/*
 * FLOW tracker mitra yang disederhanakan menjadi 4 tahap:
 * Konfirmasi → Berjalan → Dikembalikan → Selesai.
 *
 * Saat mitra menekan "Konfirmasi Pesanan", status booking langsung menjadi
 * ongoing, sehingga bar berpindah ke tahap "Berjalan" seketika. Status
 * confirmed/ready_for_pickup tetap dipetakan ke "Konfirmasi" untuk data lama
 * yang masih menyimpan status tersebut.
 */
const FLOW = [
    { key: "confirmation", label: "Konfirmasi" },
    { key: "ongoing", label: "Berjalan" },
    { key: "returned", label: "Dikembalikan" },
    { key: "completed", label: "Selesai" },
];

// Status mentah → key tahap pada FLOW di atas.
const STATUS_TO_STAGE = {
    pending_payment: "confirmation",
    paid: "confirmation",
    waiting_agent_confirmation: "confirmation",
    confirmed: "confirmation",
    ready_for_pickup: "confirmation",
    ongoing: "ongoing",
    returned: "returned",
    completed: "completed",
};

function flowIndex(status) {
    const stage = STATUS_TO_STAGE[status];
    return stage ? FLOW.findIndex((step) => step.key === stage) : -1;
}

const PAYMENT_REVIEW_STATUSES = ["pending", "awaiting_verification"];

const latestPaymentOf = (booking) => {
    const payments = booking?.payments || [];
    if (!payments.length) return null;
    return [...payments].sort((a, b) => (b.id || 0) - (a.id || 0))[0];
};

export default function AgentBookingShow({
    bookingNumber = "",
    booking: serverBooking = {},
    customerDetails: serverCustomer = null,
}) {
    const [busy, setBusy] = useState(false);
    const [showCustomerDetail, setShowCustomerDetail] = useState(false);

    const booking = useMemo(() => serverBooking || {}, [serverBooking]);

    const customerDetails = useMemo(
        () => serverCustomer || { available: false },
        [serverCustomer],
    );

    const vehicle = useMemo(() => {
        const v = booking.items?.[0]?.vehicle || booking.item?.vehicle;
        if (!v) return null;
        const photo = (v.photos || []).find(
            (p) => p?.file_path || p?.photo_path,
        );
        const path = photo?.file_path || photo?.photo_path;
        return {
            id: v.id,
            name:
                v.name ||
                `${v.brand || ""} ${v.model || ""}`.trim() ||
                "Kendaraan",
            license_plate: v.license_plate || "-",
            transmission: v.transmission === "manual" ? "Manual" : "Matic",
            seat_capacity: v.seat_capacity ?? null,
            vehicle_type: v.vehicle_type || "car",
            img: path ? `/storage/${path}` : null,
        };
    }, [booking]);

    const item = booking.items?.[0] || {};
    const payment = latestPaymentOf(booking);
    const needsPaymentReview =
        Boolean(payment) && PAYMENT_REVIEW_STATUSES.includes(payment.status);

    const currentStep = flowIndex(booking.status);
    const isTerminal = ["cancelled", "rejected", "expired"].includes(
        booking.status,
    );

    const canConfirm = booking.status === "waiting_agent_confirmation";
    const showPaymentActions = needsPaymentReview;

    // Aksi per tahap pada tracker yang disederhanakan.
    // "Berjalan" → catat pengembalian (check-in). "Dikembalikan" → selesaikan.
    const canRecordReturn = booking.status === "ongoing";
    const canComplete = booking.status === "returned";

    const biaya = [
        ["Sewa unit", booking.rental_amount],
        ["Biaya layanan", booking.service_fee],
        ["Biaya antar (delivery)", booking.delivery_fee],
        ["Biaya tambahan", booking.additional_fee],
    ];

    // Titik presisi yang ditandai customer saat memesan (metode yang dipakai).
    const mapCoordinate = useMemo(() => {
        const isDelivery = booking.fulfillment_type === "delivery";
        const lat = isDelivery
            ? booking.delivery_latitude
            : booking.pickup_latitude;
        const lng = isDelivery
            ? booking.delivery_longitude
            : booking.pickup_longitude;
        return lat != null && lng != null
            ? { lat: Number(lat), lng: Number(lng), isDelivery }
            : null;
    }, [booking]);

    const mapLink = mapCoordinate
        ? `https://www.google.com/maps/search/?api=1&query=${mapCoordinate.lat},${mapCoordinate.lng}`
        : null;

    const postAction = (url, payload = {}, confirmMsg = null) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;
        setBusy(true);
        router.post(url, payload, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    const handleApprovePayment = () =>
        postAction(
            `/bookings/${booking.id}/payment/approve`,
            { payment_id: payment?.id },
            "Setujui pembayaran ini? Pastikan dana sudah masuk ke rekening Anda.",
        );

    const handleRejectPayment = () => {
        const reason = window.prompt(
            "Alasan penolakan pembayaran (dikirim ke customer):",
            "Dana belum masuk / bukti pembayaran tidak sesuai.",
        );
        if (reason === null) return;
        postAction(`/bookings/${booking.id}/payment/reject`, {
            payment_id: payment?.id,
            notes: reason,
        });
    };

    const handleConfirm = () =>
        postAction(
            `/bookings/${booking.id}/confirm`,
            { status: "confirmed" },
            "Konfirmasi pesanan ini?",
        );

    const handleReject = () => {
        const note = window.prompt(
            "Alasan penolakan pesanan (dikirim ke customer):",
            "Unit tidak tersedia pada tanggal tersebut.",
        );
        if (note === null) return;
        postAction(`/bookings/${booking.id}/confirm`, {
            status: "rejected",
            agent_note: note,
        });
    };

    // Tahap "Berjalan": buka form check-in (Catat Pengembalian).
    const handleRecordReturn = () => {
        router.visit(`/mitra/pesanan/${booking.id}/pengembalian`);
    };

    // Tahap "Dikembalikan": proses penyelesaian pesanan oleh mitra.
    const handleComplete = () =>
        postAction(
            `/mitra/pesanan/${booking.id}/selesaikan`,
            {},
            "Selesaikan pesanan ini? Pastikan unit & deposit sudah beres.",
        );

    return (
        <>
            <Head
                title={`Pesanan ${booking.booking_number || bookingNumber} — RentGo`}
            />

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-[11px] text-stone-500">
                <Link href="/mitra/pesanan" className="hover:text-[#111]">
                    Pesanan Masuk
                </Link>
                <span className="text-stone-300">/</span>
                <span className="font-mono font-semibold text-[#111]">
                    {booking.booking_number || bookingNumber}
                </span>
            </nav>

            {/* Header ringkasan */}
            <Card className="p-5 border mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                            Nomor Pesanan
                        </p>
                        <h1 className="text-lg font-semibold font-mono mt-1">
                            {booking.booking_number || bookingNumber}
                        </h1>
                        <p className="text-xs text-stone-500 mt-1">
                            {formatTanggalJam(booking.rental_start)} —{" "}
                            {formatTanggalJam(booking.rental_end)}
                        </p>
                    </div>
                    <div className="text-right">
                        <StatusBadge
                            status={booking.status}
                            map={BOOKING_STATUS}
                            className="text-xs px-3 py-1"
                        />
                        <p className="text-lg font-semibold mt-2">
                            {formatRupiah(booking.total_amount)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Progress flow */}
            <Card className="p-5 border mb-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                    Status Penyewaan
                </p>
                {isTerminal ? (
                    <div className="flex items-center gap-3">
                        <StatusBadge
                            status={booking.status}
                            map={BOOKING_STATUS}
                            className="text-xs px-3 py-1"
                        />
                        <span className="text-xs text-stone-500">
                            {booking.status === "cancelled"
                                ? "Pesanan ini telah dibatalkan."
                                : booking.status === "rejected"
                                  ? "Pesanan ini Anda tolak."
                                  : "Pesanan ini telah kadaluwarsa."}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center w-full overflow-x-auto">
                        {FLOW.map((step, index) => {
                            const done = index <= currentStep;
                            const active = index === currentStep;
                            return (
                                <React.Fragment key={step.key}>
                                    <div className="flex flex-col items-center shrink-0">
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                                                done
                                                    ? "bg-[#111] text-[#F5B800] border-[#111]"
                                                    : "bg-white text-stone-300 border-stone-200"
                                            } ${active ? "ring-4 ring-[#F5B800]/30" : ""}`}
                                        >
                                            {index + 1}
                                        </div>
                                        <span
                                            className={`text-[10px] mt-1.5 text-center w-16 ${done ? "text-[#111] font-semibold" : "text-stone-400"}`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < FLOW.length - 1 && (
                                        <div
                                            className={`flex-1 h-0.5 mx-1 min-w-4 ${index < currentStep ? "bg-[#111]" : "bg-stone-200"}`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Penyewa */}
                    <Card className="p-5 border">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                Data Penyewa
                            </p>
                            {customerDetails.available && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCustomerDetail((v) => !v)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-sm border-stone-300 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-[#111] hover:text-[#111] transition-colors"
                                >
                                    <svg
                                        className="h-3.5 w-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                        />
                                    </svg>
                                    {showCustomerDetail
                                        ? "Sembunyikan"
                                        : "Cek Detail"}
                                </button>
                            )}
                        </div>

                        {/* Ringkasan cepat identitas + indikator keamanan. */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-xs font-bold text-[#F5B800]">
                                {(customerDetails.name || booking.customer?.name || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#111] truncate">
                                    {customerDetails.name ||
                                        booking.customer?.name ||
                                        "-"}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate">
                                    {customerDetails.email ||
                                        booking.customer?.email ||
                                        "-"}
                                </p>
                            </div>
                            {customerDetails.available &&
                                (customerDetails.verifiedDocuments > 0 ? (
                                    <span className="ml-auto inline-flex items-center gap-1 rounded-xs border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 12.75l6 6 9-13.5"
                                            />
                                        </svg>
                                        Identitas Terverifikasi
                                    </span>
                                ) : (
                                    <span className="ml-auto inline-flex items-center gap-1 rounded-xs border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                        Identitas Belum Terverifikasi
                                    </span>
                                ))}
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <DataRow
                                label="Telepon"
                                value={
                                    customerDetails.phone ||
                                    booking.customer?.phone ||
                                    "-"
                                }
                                strong
                            />
                            <DataRow
                                label="Email"
                                value={
                                    customerDetails.email ||
                                    booking.customer?.email ||
                                    "-"
                                }
                            />
                        </div>

                        {/* Detail lengkap (identitas & riwayat) — toggle "Cek Detail". */}
                        {customerDetails.available && showCustomerDetail && (
                            <div className="mt-5 space-y-5 border-t border-stone-200 pt-4">
                                {/* Identitas penyewa */}
                                <div className="">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-2">
                                        Identitas (KTP / SIM)
                                    </p>
                                    {customerDetails.profileComplete ? (
                                        <div className="space-y-2.5 text-xs">
                                            <DataRow
                                                label="No. Identitas (KTP)"
                                                value={
                                                    customerDetails.identityNumber ||
                                                    "-"
                                                }
                                                strong
                                            />
                                            <DataRow
                                                label="Jenis SIM"
                                                value={
                                                    customerDetails.simType ||
                                                    "-"
                                                }
                                            />
                                            <DataRow
                                                label="Tanggal Lahir"
                                                value={
                                                    customerDetails.dateOfBirth ||
                                                    "-"
                                                }
                                            />
                                            <DataRow
                                                label="Alamat"
                                                value={
                                                    [
                                                        customerDetails.address,
                                                        customerDetails.city,
                                                        customerDetails.province,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") || "-"
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-stone-500">
                                            Penyewa belum melengkapi profil
                                            identitas. Mintakan KTP/SIM saat
                                            serah terima unit.
                                        </p>
                                    )}
                                </div>

                                {/* Kontak darurat */}
                                {(customerDetails.emergencyName ||
                                    customerDetails.emergencyPhone) && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-2">
                                            Kontak Darurat
                                        </p>
                                        <div className="space-y-2.5 text-xs">
                                            <DataRow
                                                label="Nama"
                                                value={
                                                    customerDetails.emergencyName ||
                                                    "-"
                                                }
                                                strong
                                            />
                                            <DataRow
                                                label="Hubungan"
                                                value={
                                                    customerDetails.emergencyRelation ||
                                                    "-"
                                                }
                                            />
                                            <DataRow
                                                label="Telepon"
                                                value={
                                                    customerDetails.emergencyPhone ||
                                                    "-"
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Dokumen pendukung */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-2">
                                        Dokumen Pendukung (
                                        {customerDetails.verifiedDocuments} dari{" "}
                                        {customerDetails.totalDocuments}{" "}
                                        terverifikasi)
                                    </p>
                                    {customerDetails.documents?.length > 0 ? (
                                        <div className="space-y-2">
                                            {customerDetails.documents.map(
                                                (doc) => {
                                                    const meta =
                                                        DOCUMENT_STATUS[
                                                            doc.status
                                                        ] || {
                                                            label:
                                                                doc.status ||
                                                                "-",
                                                            color: "bg-stone-100 text-stone-600 border-stone-300",
                                                        };
                                                    return (
                                                        <div
                                                            key={doc.id}
                                                            className="flex items-center justify-between gap-3 rounded-sm border-stone-200 bg-stone-50 px-3 py-2"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-semibold text-[#111]">
                                                                    {documentTypeLabel(
                                                                        doc.type,
                                                                    )}
                                                                </p>
                                                                {doc.number && (
                                                                    <p className="text-[10px] text-stone-500 font-mono truncate">
                                                                        {
                                                                            doc.number
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span
                                                                    className={`rounded-xs border px-1.5 py-0.5 text-[9px] font-bold ${meta.color}`}
                                                                >
                                                                    {
                                                                        meta.label
                                                                    }
                                                                </span>
                                                                {doc.file_url && (
                                                                    <a
                                                                        href={
                                                                            doc.file_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-sm border-[#111] px-2 py-1 text-[10px] font-semibold text-[#111] hover:bg-[#111] hover:text-[#F5B800] transition-colors"
                                                                    >
                                                                        <svg
                                                                            className="h-3 w-3"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                            strokeWidth={2}
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                            />
                                                                        </svg>
                                                                        Lihat
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-stone-500">
                                            Penyewa belum mengunggah dokumen
                                            identitas.
                                        </p>
                                    )}
                                </div>

                                {/* Riwayat sewa pada mitra ini — indikator risiko. */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-2">
                                        Riwayat pada Toko Anda
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                                                Total Pesanan
                                            </p>
                                            <p className="text-base font-semibold text-[#111]">
                                                {
                                                    customerDetails.stats
                                                        ?.totalBookings ?? 0
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                                                Selesai
                                            </p>
                                            <p className="text-base font-semibold text-[#111]">
                                                {
                                                    customerDetails.stats
                                                        ?.completedBookings ?? 0
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                                                Kerusakan
                                            </p>
                                            <p
                                                className={`text-base font-semibold ${customerDetails.stats?.damages > 0 ? "text-red-600" : "text-[#111]"}`}
                                            >
                                                {
                                                    customerDetails.stats
                                                        ?.damages ?? 0
                                                }
                                            </p>
                                        </div>
                                        <div className="rounded-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
                                                Sengketa
                                            </p>
                                            <p
                                                className={`text-base font-semibold ${customerDetails.stats?.disputes > 0 ? "text-red-600" : "text-[#111]"}`}
                                            >
                                                {
                                                    customerDetails.stats
                                                        ?.disputes ?? 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Unit */}
                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Unit yang Disewa
                        </p>
                        <div className="flex gap-4">
                            <div className="w-28 h-24 rounded-sm overflow-hidden bg-stone-100 shrink-0">
                                <FailSafeImage
                                    src={vehicle?.img || NO_PHOTO}
                                    alt={vehicle?.name || "Unit kendaraan"}
                                    fallback={NO_PHOTO}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-xs space-y-1">
                                <h3 className="text-sm font-semibold">
                                    {vehicle?.name ||
                                        "Data unit tidak tersedia"}
                                </h3>
                                <p className="text-stone-500 font-mono">
                                    {vehicle?.license_plate || "-"}
                                </p>
                                <p className="text-stone-500">
                                    {vehicle?.transmission}
                                    {vehicle?.seat_capacity
                                        ? ` · ${vehicle.seat_capacity} ${vehicle?.vehicle_type === "car" ? "Kursi" : "Orang"}`
                                        : ""}
                                </p>
                                <p className="text-stone-500">
                                    {item.rental_days} hari ×{" "}
                                    {formatRupiah(item.price_per_day)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Jadwal & Serah terima */}
                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Jadwal & Serah Terima
                        </p>
                        <div className="space-y-2.5 text-xs">
                            <DataRow
                                label="Mulai sewa"
                                value={formatTanggalJam(booking.rental_start)}
                            />
                            <DataRow
                                label="Selesai sewa"
                                value={formatTanggalJam(booking.rental_end)}
                            />
                            <DataRow
                                label="Metode"
                                value={
                                    booking.fulfillment_type === "delivery"
                                        ? "Antar ke lokasi"
                                        : "Ambil sendiri"
                                }
                            />
                            <DataRow
                                label={
                                    booking.fulfillment_type === "delivery"
                                        ? "Alamat antar"
                                        : "Titik ambil"
                                }
                                value={
                                    booking.delivery_address ||
                                    booking.pickup_location ||
                                    "-"
                                }
                                strong
                            />
                            {(booking.delivery_landmark ||
                                booking.pickup_landmark) && (
                                <DataRow
                                    label="Patokan"
                                    value={
                                        booking.delivery_landmark ||
                                        booking.pickup_landmark
                                    }
                                />
                            )}

                            {/* Titik presisi: tombol navigasi ke Google Maps, ala Gojek. */}
                            {mapLink && (
                                <a
                                    href={mapLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 flex items-center justify-between gap-2 rounded-sm border-[#111] bg-white px-3 py-2.5 hover:bg-stone-50 transition-colors"
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <svg
                                            className="h-4 w-4 text-[#111] shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                            />
                                        </svg>
                                        <span className="min-w-0">
                                            <span className="block text-[11px] font-bold text-[#111]">
                                                Lihat Titik Presisi
                                            </span>
                                            <span className="block text-[10px] text-stone-500 font-mono">
                                                {Number(
                                                    mapCoordinate.lat,
                                                ).toFixed(5)}
                                                ,{" "}
                                                {Number(
                                                    mapCoordinate.lng,
                                                ).toFixed(5)}
                                            </span>
                                        </span>
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b38600] shrink-0">
                                        Buka Peta
                                    </span>
                                </a>
                            )}
                            {booking.customer_note && (
                                <DataRow
                                    label="Catatan penyewa"
                                    value={booking.customer_note}
                                />
                            )}
                            {booking.agent_note && (
                                <DataRow
                                    label="Catatan mitra"
                                    value={booking.agent_note}
                                />
                            )}
                        </div>
                    </Card>

                    {/* Checkout / Checkin */}
                    {(booking.rentalCheckout || booking.rentalCheckin) && (
                        <Card className="p-5 border">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                Serah Terima Unit
                            </p>
                            <div className="grid sm:grid-cols-2 gap-5 text-xs">
                                {booking.rentalCheckout && (
                                    <div className="border border-stone-200 rounded-sm p-4">
                                        <p className="font-semibold text-stone-700 mb-2">
                                            Check-out (Penyerahan)
                                        </p>
                                        <div className="space-y-1.5">
                                            <DataRow
                                                label="Waktu"
                                                value={formatTanggalJam(
                                                    booking.rentalCheckout
                                                        .checkout_at,
                                                )}
                                            />
                                            <DataRow
                                                label="Odometer"
                                                value={`${Number(booking.rentalCheckout.odometer || 0).toLocaleString("id-ID")} km`}
                                            />
                                            <DataRow
                                                label="Bahan bakar"
                                                value={
                                                    booking.rentalCheckout
                                                        .fuel_level || "-"
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                                {booking.rentalCheckin && (
                                    <div className="border border-stone-200 rounded-sm p-4">
                                        <p className="font-semibold text-stone-700 mb-2">
                                            Check-in (Pengembalian)
                                        </p>
                                        <div className="space-y-1.5">
                                            <DataRow
                                                label="Waktu"
                                                value={formatTanggalJam(
                                                    booking.rentalCheckin
                                                        .checkin_at,
                                                )}
                                            />
                                            <DataRow
                                                label="Odometer"
                                                value={`${Number(booking.rentalCheckin.odometer || 0).toLocaleString("id-ID")} km`}
                                            />
                                            <DataRow
                                                label="Terlambat"
                                                value={
                                                    booking.rentalCheckin
                                                        .is_late_return
                                                        ? formatRupiah(
                                                              booking
                                                                  .rentalCheckin
                                                                  .late_return_fee,
                                                          )
                                                        : "Tidak"
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar: aksi, biaya, pembayaran, pembatalan */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Aksi mitra */}
                    {(canConfirm ||
                        showPaymentActions ||
                        canRecordReturn ||
                        canComplete) && (
                        <Card className="p-5 border-2 border-[#111]">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                Aksi Anda
                            </p>
                            <div className="space-y-2.5">
                                {showPaymentActions && (
                                    <>
                                        <p className="text-[11px] text-stone-500 mb-1">
                                            Periksa mutasi rekening/bukti bayar
                                            (QRIS atau transfer) sebelum
                                            menyetujui.
                                        </p>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleApprovePayment}
                                            className="w-full bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] text-xs font-bold py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                                        >
                                            Setujui Pembayaran
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleRejectPayment}
                                            className="w-full border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-xs font-semibold py-2.5 rounded-sm transition-colors"
                                        >
                                            Tolak Pembayaran
                                        </button>
                                    </>
                                )}
                                {canConfirm && !showPaymentActions && (
                                    <>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleConfirm}
                                            className="w-full bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] text-xs font-bold py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                                        >
                                            Konfirmasi Pesanan
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleReject}
                                            className="w-full border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-xs font-semibold py-2.5 rounded-sm transition-colors"
                                        >
                                            Tolak Pesanan
                                        </button>
                                    </>
                                )}
                                {canRecordReturn && (
                                    <>
                                        <p className="text-[11px] text-stone-500 mb-1">
                                            Unit sedang disewa. Catat
                                            pengembalian setelah penyewa
                                            menyerahkan unit kembali.
                                        </p>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleRecordReturn}
                                            className="w-full bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] text-xs font-bold py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                                        >
                                            Catat Pengembalian
                                        </button>
                                    </>
                                )}
                                {canComplete && (
                                    <>
                                        <p className="text-[11px] text-stone-500 mb-1">
                                            Unit sudah dikembalikan.
                                            Selesaikan pesanan untuk menutup
                                            transaksi sewa.
                                        </p>
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={handleComplete}
                                            className="w-full bg-[#111] hover:bg-stone-800 disabled:opacity-60 text-[#F5B800] text-xs font-bold py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                                        >
                                            Selesaikan Pesanan
                                        </button>
                                    </>
                                )}
                            </div>
                        </Card>
                    )}

                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Rincian Biaya
                        </p>
                        <div className="space-y-2 text-xs">
                            {biaya.map(([label, value]) => (
                                <DataRow
                                    key={label}
                                    label={label}
                                    value={formatRupiah(
                                        Math.abs(Number(value) || 0),
                                    )}
                                />
                            ))}
                            <div className="pt-2 border-t border-stone-200">
                                <DataRow
                                    label="Deposit"
                                    value={formatRupiah(booking.deposit_amount)}
                                />
                            </div>
                            <div className="pt-2 border-t border-stone-200">
                                <DataRow
                                    label="Total"
                                    value={formatRupiah(booking.total_amount)}
                                    strong
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Pembayaran Penyewa
                        </p>
                        {payment ? (
                            <div className="space-y-2 text-xs">
                                <DataRow
                                    label="No. Pembayaran"
                                    value={
                                        payment.payment_number ||
                                        `PAY-${payment.id}`
                                    }
                                />
                                <DataRow
                                    label="Metode"
                                    value={
                                        METHOD_LABELS[payment.payment_method] ||
                                        payment.payment_method
                                    }
                                />
                                {payment.bank_code && (
                                    <DataRow
                                        label="Bank / VA"
                                        value={`${payment.bank_code} · ${payment.va_number || "-"}`}
                                    />
                                )}
                                <DataRow
                                    label="Nominal"
                                    value={formatRupiah(payment.amount)}
                                />
                                {payment.paid_at && (
                                    <DataRow
                                        label="Dibayar"
                                        value={formatTanggalJam(
                                            payment.paid_at,
                                        )}
                                    />
                                )}
                                <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                    <span className="text-stone-500">
                                        Status
                                    </span>
                                    <StatusBadge
                                        status={payment.status}
                                        map={PAYMENT_STATUS}
                                    />
                                </div>

                                {payment.proof_file_path ? (
                                    <a
                                        href={`/bookings/${booking.id}/payment-proof?payment_id=${payment.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-[11px] font-semibold text-[#111] underline decoration-[#F5B800] decoration-2 underline-offset-2 pt-1"
                                    >
                                        Buka bukti pembayaran
                                    </a>
                                ) : (
                                    <p className="text-[11px] text-amber-700 pt-1">
                                        Penyewa belum mengunggah bukti
                                        pembayaran.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-stone-400">
                                Belum ada pembayaran dari penyewa.
                            </p>
                        )}
                    </Card>

                    {booking.cancellations?.[0] && (
                        <Card className="p-5 border">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                Pembatalan & Refund
                            </p>
                            <div className="space-y-2 text-xs">
                                <DataRow
                                    label="Alasan"
                                    value={
                                        booking.cancellations[0].reason || "-"
                                    }
                                />
                                <DataRow
                                    label="Waktu"
                                    value={formatTanggalJam(
                                        booking.cancellations[0].cancelled_at,
                                    )}
                                />
                                <DataRow
                                    label="Refund"
                                    value={`${booking.cancellations[0].refund_percentage}%`}
                                />
                                <DataRow
                                    label="Nominal"
                                    value={formatRupiah(
                                        booking.cancellations[0].refund_amount,
                                    )}
                                />
                                <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                    <span className="text-stone-500">
                                        Status refund
                                    </span>
                                    <StatusBadge
                                        status={
                                            booking.cancellations[0]
                                                .refund_status
                                        }
                                        map={REFUND_STATUS}
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}

AgentBookingShow.layout = (page) => (
    <AgentLayout active="/mitra/pesanan" title="Detail Pesanan">
        {page}
    </AgentLayout>
);
