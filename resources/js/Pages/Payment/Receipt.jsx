import React, { useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import { Card, StatusBadge } from "@/Components/RentGo/Ui";
import { qrSvgDataUri } from "@/Lib/qrCode";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatTanggal = (value, withTime = false) => {
    if (!value) return "-";
    try {
        return new Date(value).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
        });
    } catch {
        return String(value);
    }
};

const PAYMENT_STATUS = {
    pending: {
        label: "Menunggu Pembayaran",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    awaiting_verification: {
        label: "Menunggu Verifikasi Mitra",
        color: "bg-sky-100 text-sky-900 border-sky-300",
    },
    paid: {
        label: "Lunas",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
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
    cash: "Bayar di Tempat (COD)",
    qris: "QRIS",
    bank_transfer: "Transfer Bank (Virtual Account)",
};

export default function PaymentReceipt({
    auth = {},
    payment = null,
    booking = null,
    receiptNumber = null,
    instructions = null,
    instructionsForMethod = null,
    qrisPayload = null,
}) {
    const vehicle = booking?.items?.[0]?.vehicle || null;
    const agent = booking?.agent_profile || booking?.agentProfile || null;

    const isSettled = payment?.status === "paid";
    const method = payment?.payment_method;

    // QR hanya perlu ditampilkan selama pembayaran belum lunas (untuk dibayar).
    const qrImage = useMemo(
        () =>
            method === "qris" && qrisPayload && !isSettled
                ? qrSvgDataUri(qrisPayload, { scale: 5 })
                : null,
        [method, qrisPayload, isSettled],
    );

    if (!payment || !booking) {
        return (
            <CustomerLayout
                auth={auth}
                activeNav="pesanan"
                backHref="/pesanan"
                backLabel="Pesanan"
            >
                <Head title="Struk - RentGo" />
                <Card className="border p-10 text-center">
                    <p className="text-sm font-semibold">
                        Struk tidak ditemukan
                    </p>
                    <Link
                        href="/pesanan"
                        className="mt-4 inline-block rounded-sm bg-[#F5B800] px-5 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                        Kembali ke Pesanan
                    </Link>
                </Card>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout
            auth={auth}
            activeNav="pesanan"
            backHref="/pesanan"
            backLabel="Pesanan"
        >
            <Head title={`Struk ${receiptNumber} - RentGo`} />

            {/* Banner status */}
            <div className="mb-6 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-2 w-2 bg-[#F5B800]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                            {isSettled
                                ? "Pembayaran Berhasil"
                                : "Pesanan Berhasil Dibuat"}
                        </span>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-[#111]">
                        {isSettled
                            ? "Struk Pemesanan Anda"
                            : "Struk Pesanan — Selesaikan Pembayaran"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-sm border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#111] hover:bg-stone-50"
                    >
                        Cetak Struk
                    </button>
                    <Link
                        href={`/bookings/${booking.id}`}
                        className="rounded-sm bg-[#F5B800] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#111] hover:bg-[#e0a800]"
                    >
                        Lihat Pesanan
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Struk */}
                <div className="lg:col-span-2">
                    <Card className="border p-6">
                        {/* Kop struk */}
                        <div className="flex items-start justify-between border-b border-dashed border-stone-300 pb-4">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-[#111]">
                                    RentGo
                                </p>
                                <p className="text-[11px] text-stone-500">
                                    Rental Mobil &amp; Motor Indonesia
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                    No. Struk
                                </p>
                                <p className="font-mono text-xs font-semibold text-[#111]">
                                    {receiptNumber}
                                </p>
                                <p className="mt-1 text-[10px] text-stone-400">
                                    {formatTanggal(payment.created_at, true)}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-stone-300 py-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                    Status Pembayaran
                                </p>
                                <div className="mt-1">
                                    <StatusBadge
                                        status={payment.status}
                                        map={PAYMENT_STATUS}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                    Metode
                                </p>
                                <p className="text-xs font-semibold text-[#111]">
                                    {METHOD_LABELS[method] || method}
                                </p>
                                {payment.va_number && (
                                    <p className="font-mono text-[11px] text-stone-500">
                                        VA {payment.va_number} (
                                        {payment.bank_code})
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Data pemesanan */}
                        <div className="grid gap-4 py-4 sm:grid-cols-2 text-xs">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                    Penyewa
                                </p>
                                <p className="font-semibold text-[#111]">
                                    {booking.customer?.name ||
                                        auth?.user?.name ||
                                        "-"}
                                </p>
                                <p className="text-stone-500">
                                    {booking.customer?.email ||
                                        auth?.user?.email ||
                                        "-"}
                                </p>
                            </div>
                            <div className="space-y-2 sm:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                    Mitra Penyedia
                                </p>
                                <p className="font-semibold text-[#111]">
                                    {agent?.agency_name ||
                                        agent?.user?.name ||
                                        "-"}
                                </p>
                            </div>
                        </div>

                        {/* Unit */}
                        <div className="rounded-sm border-stone-200 bg-stone-50 p-4 text-xs">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Unit Disewa
                                    </p>
                                    <p className="mt-1 font-semibold text-[#111]">
                                        {vehicle?.name ||
                                            [vehicle?.brand, vehicle?.model]
                                                .filter(Boolean)
                                                .join(" ") ||
                                            "Unit kendaraan"}
                                    </p>
                                    <p className="font-mono text-[11px] text-stone-500">
                                        {vehicle?.license_plate || "-"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Periode Sewa
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {formatTanggal(booking.rental_start)}
                                    </p>
                                    <p className="text-[11px] text-stone-500">
                                        s/d {formatTanggal(booking.rental_end)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rincian biaya */}
                        <div className="mt-5 space-y-2 border-t border-dashed border-stone-300 pt-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-stone-500">
                                    Sewa unit (
                                    {booking.items?.[0]?.rental_days || 1} hari)
                                </span>
                                <span className="font-medium">
                                    {formatRupiah(booking.rental_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-500">
                                    Biaya layanan
                                </span>
                                <span className="font-medium">
                                    {formatRupiah(booking.service_fee)}
                                </span>
                            </div>
                            {Number(booking.delivery_fee) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-stone-500">
                                        Biaya antar
                                    </span>
                                    <span className="font-medium">
                                        {formatRupiah(booking.delivery_fee)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-stone-500">
                                    Deposit (refundable)
                                </span>
                                <span className="font-medium">
                                    {formatRupiah(booking.deposit_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-[#111]">
                                <span>Total Pembayaran</span>
                                <span>
                                    {formatRupiah(
                                        payment.amount || booking.total_amount,
                                    )}
                                </span>
                            </div>
                            {isSettled && payment.paid_at && (
                                <p className="pt-1 text-[11px] text-emerald-700">
                                    Dibayar pada{" "}
                                    {formatTanggal(payment.paid_at, true)}
                                </p>
                            )}
                        </div>

                        <p className="mt-5 border-t border-dashed border-stone-300 pt-4 text-center text-[10px] leading-relaxed text-stone-400">
                            Struk ini adalah bukti pemesanan elektronik yang
                            sah. Tunjukkan struk (cetak/digital) beserta KTP
                            &amp; SIM asli kepada mitra saat serah terima unit.
                            Terima kasih telah menggunakan RentGo.
                        </p>
                    </Card>
                </div>

                {/* Aksi lanjutan */}
                <div className="lg:col-span-1 print:hidden">
                    <div className="sticky top-24 space-y-4">
                        {!isSettled && method === "qris" && qrImage && (
                            <Card className="border p-5 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16] text-stone-500">
                                    Bayar via QRIS
                                </p>
                                <img
                                    src={qrImage}
                                    alt="QRIS RentGo"
                                    className="mx-auto mt-3 h-44 w-44"
                                />
                                <p className="mt-2 text-[11px] text-stone-500">
                                    Scan untuk membayar{" "}
                                    <b className="text-[#111]">
                                        {formatRupiah(payment.amount)}
                                    </b>
                                </p>
                                <p className="mt-2 text-[10px] leading-relaxed text-stone-400">
                                    Referensi:{" "}
                                    <span className="font-mono">
                                        {instructionsForMethod?.reference ||
                                            payment.payment_number}
                                    </span>
                                </p>
                            </Card>
                        )}

                        {!isSettled && method === "bank_transfer" && (
                            <Card className="border p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    Transfer ke Virtual Account
                                </p>
                                <p className="mt-2 font-mono text-base font-bold tracking-wider text-[#111]">
                                    {payment.va_number ||
                                        instructionsForMethod?.va_number ||
                                        "-"}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                    {payment.bank_code} · a.n.{" "}
                                    {instructionsForMethod?.account_name ||
                                        "PT RentGo Indonesia"}
                                </p>
                                {instructionsForMethod?.bank?.instruction && (
                                    <p className="mt-2 text-[11px] text-stone-600">
                                        {instructionsForMethod.bank.instruction}
                                    </p>
                                )}
                                <p className="mt-3 text-[11px] text-stone-600">
                                    Nominal:{" "}
                                    <b>{formatRupiah(payment.amount)}</b>
                                </p>
                            </Card>
                        )}

                        {!isSettled && (
                            <Card className="border p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    Verifikasi Pembayaran
                                </p>
                                <p className="mt-2 text-[11px] leading-relaxed text-stone-600">
                                    Bukti bayar Anda diperiksa langsung oleh
                                    mitra penyedia unit (QRIS/transfer bank
                                    masuk ke rekening mitra). Setelah disetujui,
                                    status pembayaran berubah menjadi{" "}
                                    <b className="text-[#111]">Lunas</b> dan
                                    pesanan diteruskan untuk konfirmasi mitra.
                                </p>
                            </Card>
                        )}

                        {!isSettled && method === "cash" && (
                            <Card className="border p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    COD — Bayar di Tempat
                                </p>
                                <p className="mt-2 text-[11px] leading-relaxed text-stone-600">
                                    {instructions?.note ||
                                        "Bayar tunai kepada mitra saat serah terima unit."}
                                </p>
                            </Card>
                        )}

                        {!isSettled && (
                            <Card className="border p-5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    Belum Selesai?
                                </p>
                                <p className="mt-2 text-[11px] leading-relaxed text-stone-600">
                                    Batas pembayaran{" "}
                                    <b className="text-[#111]">
                                        {formatTanggal(
                                            booking.payment_deadline,
                                            true,
                                        )}
                                    </b>
                                    . Setelah transfer, pembayaran diverifikasi
                                    admin sebelum diteruskan ke mitra.
                                </p>
                            </Card>
                        )}

                        <Card className="border bg-[#111] p-5 text-white">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F5B800]">
                                Butuh Bantuan?
                            </p>
                            <p className="mt-2 text-[11px] leading-relaxed text-stone-300">
                                Hubungi CS RentGo bila nominal transfer atau
                                status pembayaran belum sesuai.
                            </p>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-block rounded-sm bg-[#F5B800] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#111] hover:bg-[#e0a800]"
                            >
                                Hubungi CS
                            </a>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
