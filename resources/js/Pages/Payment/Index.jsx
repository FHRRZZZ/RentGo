import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import {
    StatusBadge,
    SectionTitle,
    Card,
    StatCard,
    EmptyState,
} from "@/Components/RentGo/Ui";

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

const TRANSACTION_STATUS = {
    pending: {
        label: "Menunggu",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    completed: {
        label: "Selesai",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
    refunded: {
        label: "Di-refund",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
};

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

const COMMISSION_STATUS = {
    pending: {
        label: "Menunggu",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    calculated: {
        label: "Terhitung",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    paid: {
        label: "Dibayarkan",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
};

const PAYOUT_STATUS = {
    pending: {
        label: "Menunggu",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    processing: {
        label: "Diproses",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    paid: {
        label: "Dibayarkan",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
};

const TABS = [
    { id: "transaksi", label: "Transaksi" },
    { id: "refund", label: "Refund" },
    { id: "payout", label: "Pencairan Mitra" },
];

export default function PaymentIndex({
    auth = {},
    booking = null,
    payments = [],
    transactions = [],
    refunds = [],
    payouts = [],
}) {
    const [tab, setTab] = useState("transaksi");
    const [payMethod, setPayMethod] = useState("qris");
    const [proofFile, setProofFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!booking) return;
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("booking_id", booking.id);
        formData.append("payment_method", payMethod);
        if (proofFile) {
            formData.append("proof_file", proofFile);
        }

        router.post("/payments", formData, {
            onError: (errs) => {
                setIsSubmitting(false);
                alert(Object.values(errs).join("\n") || "Gagal mengirim pembayaran.");
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const listTransaksi =
        transactions?.length > 0
            ? transactions
            : (payments || []).map((p) => ({
                  id: p.id,
                  transaction_number: p.payment_number || `TRX-${p.id}`,
                  booking_number:
                      p.booking?.booking_number ||
                      (p.booking_id ? `BK-${p.booking_id}` : "-"),
                  status: p.status || "pending",
                  customer_name:
                      p.booking?.customer?.name || auth?.user?.name || "Customer",
                  rental_amount: p.amount || p.booking?.total_amount || 0,
                  service_fee: 0,
                  deposit_amount: 0,
                  deposit_refund: 0,
                  completed_at: p.paid_at || p.created_at,
                  total_amount: p.amount || 0,
                  commission: {
                      commission_percentage: 10,
                      commission_amount: (p.amount || 0) * 0.1,
                      status: p.status === "completed" ? "paid" : "pending",
                      agent_net_amount: (p.amount || 0) * 0.9,
                  },
              }));

    const listRefund = refunds || [];
    const listPayout = payouts || [];

    const totalTransaksi = listTransaksi.reduce(
        (sum, t) => (t.status === "completed" ? sum + (Number(t.total_amount) || 0) : sum),
        0,
    );
    const totalKomisi = listTransaksi.reduce(
        (sum, t) =>
            t.commission?.status === "paid"
                ? sum + (Number(t.commission?.commission_amount) || 0)
                : sum,
        0,
    );
    const totalRefund = listRefund.reduce(
        (sum, r) => (r.status === "completed" ? sum + (Number(r.amount) || 0) : sum),
        0,
    );

    return (
        <CustomerLayout auth={auth} activeNav="pesanan" backHref="/pesanan" backLabel="Pesanan">
            <Head title="Keuangan - RentGo" />

            {/* Form Pembayaran Tagihan Aktif */}
            {booking && (
                <Card className="p-6 border-2 border-[#F5B800] bg-white mb-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 mb-4 gap-2">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b38600]">
                                Form Pembayaran Booking
                            </span>
                            <h2 className="text-lg font-bold text-[#111]">
                                Pesanan #{booking.booking_number || booking.id}
                            </h2>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">
                                Total Tagihan
                            </span>
                            <span className="text-xl font-bold text-[#111]">
                                {formatRupiah(booking.total_amount || 0)}
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                                Pilih Metode Pembayaran
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPayMethod("qris")}
                                    className={`p-3 text-left border rounded-sm transition-all ${
                                        payMethod === "qris"
                                            ? "border-[#111] bg-[#111] text-[#F5B800]"
                                            : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                                    }`}
                                >
                                    <p className="text-xs font-bold">QRIS Instant &amp; E-Wallet</p>
                                    <p className="text-[10px] opacity-80 mt-0.5">
                                        Scan barcode via BCA Mobile, Mandiri Livin, GoPay, OVO, Dana
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPayMethod("cash")}
                                    className={`p-3 text-left border rounded-sm transition-all ${
                                        payMethod === "cash"
                                            ? "border-[#111] bg-[#111] text-[#F5B800]"
                                            : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                                    }`}
                                >
                                    <p className="text-xs font-bold">Tunai di Lokasi (Cash on Delivery)</p>
                                    <p className="text-[10px] opacity-80 mt-0.5">
                                        Bayar langsung kepada mitra saat serah terima kendaraan
                                    </p>
                                </button>
                            </div>
                        </div>

                        {payMethod === "qris" && (
                            <div className="p-4 bg-stone-50 border border-stone-200 rounded-sm space-y-3">
                                <p className="text-xs font-semibold text-stone-800">
                                    Unggah Bukti Pembayaran QRIS / Transfer
                                </p>
                                <p className="text-[11px] text-stone-500">
                                    Silakan selesaikan pembayaran ke QRIS RentGo, lalu lampirkan file screenshot atau struk transfer di bawah ini.
                                </p>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    required
                                    onChange={(e) => setProofFile(e.target.files[0])}
                                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[#111] file:text-[#F5B800] hover:file:bg-black"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors"
                        >
                            {isSubmitting ? "Mengirim Konfirmasi..." : "Konfirmasi Pembayaran"}
                        </button>
                    </form>
                </Card>
            )}

            {/* Page Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Aktivitas Keuangan
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
                    Transaksi, Refund &amp; Pencairan
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                    Ringkasan alur dana sewa, komisi platform, refund customer, dan pencairan ke mitra.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Total Transaksi Selesai" value={formatRupiah(totalTransaksi)} hint="Nilai bruto sewa" accent />
                <StatCard label="Komisi Platform" value={formatRupiah(totalKomisi)} hint="10% dari dasar sewa" />
                <StatCard label="Total Refund" value={formatRupiah(totalRefund)} hint="Dana dikembalikan ke customer" />
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 rounded-sm border border-stone-200 bg-white p-2 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 rounded-sm bg-stone-100 p-1">
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={`rounded-sm px-3.5 py-2 text-xs font-medium transition-colors ${
                                tab === item.id
                                    ? "bg-[#111111] text-[#F5B800]"
                                    : "text-stone-600 hover:text-[#111111]"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

                    {tab === "transaksi" && (
                        <div className="space-y-4">
                            {listTransaksi.length === 0 ? (
                                <EmptyState title="Belum ada transaksi" />
                            ) : (
                                listTransaksi.map((trx) => (
                                    <Card
                                        key={trx.id}
                                        className="border overflow-hidden"
                                    >
                                        <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-200 flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                                    {trx.transaction_number}
                                                </span>
                                                <span className="text-stone-400">
                                                    •
                                                </span>
                                                <span className="text-stone-600 font-medium">
                                                    Booking {trx.booking_number}
                                                </span>
                                            </div>
                                            <StatusBadge
                                                status={trx.status}
                                                map={TRANSACTION_STATUS}
                                            />
                                        </div>
                                        <div className="p-5 grid-cols-1 md:grid-cols-12 gap-5 items-center text-xs">
                                            <div className="md:col-span-5 space-y-1.5">
                                                <h3 className="text-sm font-semibold">
                                                    {trx.customer_name}
                                                </h3>
                                                <p className="text-stone-500">
                                                    Sewa unit{" "}
                                                    {formatRupiah(
                                                        trx.rental_amount,
                                                    )}{" "}
                                                    · Layanan{" "}
                                                    {formatRupiah(
                                                        trx.service_fee,
                                                    )}
                                                </p>
                                                <p className="text-stone-500">
                                                    Deposit{" "}
                                                    {formatRupiah(
                                                        trx.deposit_amount,
                                                    )}{" "}
                                                    · Refund{" "}
                                                    {formatRupiah(
                                                        trx.deposit_refund,
                                                    )}
                                                </p>
                                                {trx.completed_at && (
                                                    <p className="text-stone-400">
                                                        Selesai{" "}
                                                        {formatTanggalJam(
                                                            trx.completed_at,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-stone-200 md:pl-5 pt-4 md:pt-0 space-y-1.5">
                                                <p className="text-stone-500">
                                                    Komisi (
                                                    {
                                                        trx.commission
                                                            .commission_percentage
                                                    }
                                                    %)
                                                </p>
                                                <p className="font-semibold">
                                                    {formatRupiah(
                                                        trx.commission
                                                            .commission_amount,
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <span className="text-stone-500">
                                                        Status komisi:
                                                    </span>
                                                    <StatusBadge
                                                        status={
                                                            trx.commission
                                                                .status
                                                        }
                                                        map={COMMISSION_STATUS}
                                                    />
                                                </div>
                                                <p className="text-stone-500 mt-1">
                                                    Mitra terima:{" "}
                                                    <span className="font-semibold text-[#111]">
                                                        {formatRupiah(
                                                            trx.commission
                                                                .agent_net_amount,
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-stone-200 md:pl-5 pt-4 md:pt-0">
                                                <p className="text-stone-500">
                                                    Total
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {formatRupiah(
                                                        trx.total_amount,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {tab === "refund" && (
                        <div className="space-y-4">
                            {listRefund.length === 0 ? (
                                <EmptyState title="Belum ada refund" />
                            ) : (
                                listRefund.map((refund) => (
                                    <Card
                                        key={refund.id}
                                        className="border p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="font-mono font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                                    {refund.refund_number}
                                                </span>
                                                <span className="text-stone-500">
                                                    Booking{" "}
                                                    {refund.booking_number}
                                                </span>
                                            </div>
                                            <StatusBadge
                                                status={refund.status}
                                                map={REFUND_STATUS}
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-3 gap-4 text-xs">
                                            <div>
                                                <p className="text-stone-500">
                                                    Nominal Refund
                                                </p>
                                                <p className="font-semibold text-base mt-0.5">
                                                    {formatRupiah(
                                                        refund.amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">
                                                    Pembayaran Asal
                                                </p>
                                                <p className="font-mono mt-0.5">
                                                    {refund.payment_number}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">
                                                    Waktu Refund
                                                </p>
                                                <p className="mt-0.5">
                                                    {refund.refunded_at
                                                        ? formatTanggalJam(
                                                              refund.refunded_at,
                                                           )
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100">
                                            {refund.reason}
                                        </p>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {tab === "payout" && (
                        <div className="space-y-4">
                            {listPayout.length === 0 ? (
                                <EmptyState title="Belum ada pencairan" />
                            ) : (
                                listPayout.map((payout) => (
                                    <Card
                                        key={payout.id}
                                        className="border p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="font-mono font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                                    {payout.payout_number}
                                                </span>
                                                <span className="text-stone-500">
                                                    Transaksi{" "}
                                                    {payout.transaction_number}
                                                </span>
                                            </div>
                                            <StatusBadge
                                                status={payout.status}
                                                map={PAYOUT_STATUS}
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-3 gap-4 text-xs">
                                            <div>
                                                <p className="text-stone-500">
                                                    Nominal Pencairan
                                                </p>
                                                <p className="font-semibold text-base mt-0.5">
                                                    {formatRupiah(
                                                        payout.amount,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">
                                                    Metode
                                                </p>
                                                <p className="mt-0.5">
                                                    {payout.payout_method ===
                                                    "bank_transfer"
                                                        ? `Transfer ${payout.bank_name}`
                                                        : "Tunai"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-stone-500">
                                                    Rekening Tujuan
                                                </p>
                                                <p className="mt-0.5">
                                                    {payout.account_name} ·{" "}
                                                    {payout.account_number}
                                                </p>
                                            </div>
                                        </div>
                                        {payout.paid_at && (
                                            <p className="text-[11px] text-stone-400 mt-3 pt-3 border-t border-stone-100">
                                                Dibayarkan{" "}
                                                {formatTanggalJam(
                                                    payout.paid_at,
                                                )}
                                            </p>
                                        )}
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
        </CustomerLayout>
    );
}
