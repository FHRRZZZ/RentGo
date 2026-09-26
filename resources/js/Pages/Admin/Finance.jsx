import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatusBadge, SectionTitle, StatCard } from "@/Components/RentGo/Ui";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

// Label mengikuti enum kolom `payments.status`.
const PAYMENT_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-900 border-amber-300" },
    awaiting_verification: { label: "Perlu Verifikasi", color: "bg-sky-100 text-sky-900 border-sky-300" },
    paid: { label: "Lunas", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    completed: { label: "Berhasil", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
    expired: { label: "Kedaluwarsa", color: "bg-stone-100 text-stone-600 border-stone-300" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-300" },
};

const PAYOUT_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-900 border-amber-300" },
    processing: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-300" },
    paid: { label: "Sudah Ditransfer", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
    cancelled: { label: "Dibatalkan", color: "bg-stone-100 text-stone-600 border-stone-300" },
};

const REFUND_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-900 border-amber-300" },
    processing: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-300" },
    completed: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
    cancelled: { label: "Dibatalkan", color: "bg-stone-100 text-stone-600 border-stone-300" },
};

const PAYOUT_METHODS = {
    bank_transfer: "Transfer Bank",
    cash: "Tunai",
};

const METHOD_LABELS = {
    cash: "COD (Bayar di Tempat)",
    qris: "QRIS",
    bank_transfer: "Transfer Bank",
};

export default function AdminFinancePage({
    payments = [],
    payouts = [],
    refunds = [],
    stats = null,
}) {
    const { flash } = usePage().props;
    const [busy, setBusy] = useState(false);

    const toast =
        flash?.success || flash?.error
            ? { message: flash?.error || flash?.success, error: !!flash?.error }
            : null;

    const post = (url, payload, confirmMsg = null) => {
        if (confirmMsg && !window.confirm(confirmMsg)) return;
        setBusy(true);
        router.post(url, payload, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    const adminStats = stats || {
        total_gmv: 0,
        platform_commission_revenue: 0,
        pending_payouts: 0,
        pending_refunds: 0,
    };

    // Proses payout mitra: tandai diproses / lunas / gagal.
    // Alur service: pending -> processing -> paid/failed/cancelled.
    // Info rekening wajib diisi untuk bank transfer (baik saat processing
    // maupun saat konfirmasi paid).
    const handlePayout = (po, status) => {
        const method = po.payout_method || "bank_transfer";
        const payload = { status, payout_method: method };

        if (method === "bank_transfer") {
            const accountName = window.prompt(
                "Nama pemilik rekening tujuan:",
                po.account_name || po.agent_name || "",
            );
            if (accountName === null) return;
            const accountNumber = window.prompt(
                "Nomor rekening tujuan:",
                po.account_number || "",
            );
            if (accountNumber === null) return;
            const bankName = window.prompt("Nama bank tujuan:", po.bank_name || "");
            if (bankName === null) return;

            payload.account_name = accountName;
            payload.account_number = accountNumber;
            payload.bank_name = bankName;
        }

        if (
            status === "paid" &&
            !window.confirm(
                `Konfirmasi transfer ${formatRupiah(po.amount)} ke ${payload.account_name || po.agent_name}?`,
            )
        ) {
            return;
        }

        setBusy(true);
        router.post(`/admin/payouts/${po.id}/process`, payload, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    // Proses refund ke customer.
    const handleRefund = (rf, status) => {
        const notes =
            status === "failed" || status === "cancelled"
                ? window.prompt("Alasan (opsional):", "")
                : null;

        if ((status === "failed" || status === "cancelled") && notes === null) return;

        post(`/admin/refunds/${rf.id}/process`, { status, notes });
    };

    return (
        <AdminLayout activeTab="finance">
            <Head title="Keuangan & Payout Mitra — Admin RentGo" />

            {toast && (
                <div className="fixed bottom-5 right-5 z-50 bg-[#111] text-[#F5B800] px-4 py-2.5 rounded-sm border border-stone-800 text-xs font-semibold shadow-md">
                    {toast.message}
                </div>
            )}

            <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm mb-6">
                <SectionTitle
                    kicker="Arus Kas & Pembagian Hasil"
                    title="Keuangan Platform & Payout Mitra"
                    description="Monitoring komisi platform 10%, settlement transaksi pembayaran customer, dan transfer pencairan saldo pendapatan mitra rental."
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <StatCard
                        label="Total Transaksi (GMV)"
                        value={formatRupiah(adminStats.total_gmv)}
                        hint="Seluruh volume sewa masuk"
                    />
                    <StatCard
                        label="Komisi RentGo (10%)"
                        value={formatRupiah(adminStats.platform_commission_revenue)}
                        hint="Pendapatan bersih platform"
                        accent
                    />
                    <StatCard
                        label="Antrian Pencairan (Payout)"
                        value={formatRupiah(adminStats.pending_payouts)}
                        hint="Menunggu konfirmasi transfer"
                    />
                </div>
            </div>

            {/* Payout Mitra */}
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm mb-6">
                <SectionTitle
                    kicker="Penarikan Saldo Mitra"
                    title="Daftar Permintaan Payout (Agent Payouts)"
                    description="Proses pencairan dana ke rekening bank resmi masing-masing mitra."
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3">No. Payout</th>
                                <th className="p-3">Penerima & Rekening</th>
                                <th className="p-3">Nominal Bersih</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-stone-400">
                                        Tidak ada permintaan payout.
                                    </td>
                                </tr>
                            )}
                            {payouts.map((po) => (
                                <tr key={po.id} className="hover:bg-stone-50/70">
                                    <td className="p-3 font-semibold text-[#111]">
                                        {po.payout_number}
                                        <p className="text-[10px] text-stone-400 font-normal">
                                            Ref: {po.transaction_number}
                                        </p>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-semibold text-[#111]">{po.agent_name}</p>
                                        <p className="text-[11px] text-stone-500">
                                            {po.account_name || "-"}
                                        </p>
                                        <p className="text-[11px] text-stone-400">
                                            {po.bank_name || "-"} \u00b7 {po.account_number || "-"}
                                        </p>
                                    </td>
                                    <td className="p-3 font-bold text-[#111]">{formatRupiah(po.amount)}</td>
                                    <td className="p-3">
                                        <StatusBadge status={po.status} map={PAYOUT_STATUS} />
                                        <p className="text-[10px] text-stone-400 mt-1">
                                            {PAYOUT_METHODS[po.payout_method] || po.payout_method}
                                        </p>
                                    </td>
                                    <td className="p-3 text-right">
                                        {["pending", "processing"].includes(po.status) ? (
                                            <div className="flex flex-col gap-1 items-end">
                                                {po.status === "processing" ? (
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => handlePayout(po, "paid")}
                                                        className="px-3 py-1.5 bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] font-semibold text-xs rounded-sm transition-colors"
                                                    >
                                                        Konfirmasi Transfer
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => handlePayout(po, "processing")}
                                                        className="px-3 py-1.5 bg-[#111] text-[#F5B800] hover:bg-stone-800 disabled:opacity-60 font-semibold text-xs rounded-sm transition-colors"
                                                    >
                                                        Tandai Diproses
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-stone-400 italic">
                                                {po.status === "paid"
                                                    ? `Lunas (${formatTanggal(po.paid_at)})`
                                                    : PAYOUT_STATUS[po.status]?.label}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaksi Masuk */}
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                <SectionTitle
                    kicker="Transaksi Masuk"
                    title="Riwayat Pembayaran & Komisi Platform"
                    description="Setiap pembayaran sewa dibagi otomatis 10% komisi RentGo dan 90% porsi mitra."
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3">No. Pembayaran</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Mitra</th>
                                <th className="p-3">Metode</th>
                                <th className="p-3">Nominal</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-stone-400">
                                        Belum ada pembayaran.
                                    </td>
                                </tr>
                            )}
                            {payments.map((trx) => (
                                <tr key={trx.id} className="hover:bg-stone-50/70">
                                    <td className="p-3 font-semibold text-[#111]">
                                        {trx.payment_number || `PAY-${trx.id}`}
                                    </td>
                                    <td className="p-3">{trx.booking?.customer?.name || "-"}</td>
                                    <td className="p-3">
                                        {trx.booking?.agent_profile?.agency_name ||
                                            trx.booking?.agentProfile?.agency_name ||
                                            "-"}
                                    </td>
                                    <td className="p-3">
                                        {METHOD_LABELS[trx.payment_method] || trx.payment_method || "-"}
                                    </td>
                                    <td className="p-3 font-bold text-[#111]">
                                        {formatRupiah(trx.amount)}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={trx.status} map={PAYMENT_STATUS} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Refund ke Customer */}
            <div className="bg-white border-stone-200 rounded-sm p-5 shadow-sm mt-6">
                <SectionTitle
                    kicker="Pengembalian Dana"
                    title="Daftar Refund (Refunds)"
                    description="Pengembalian dana ke customer akibat pembatalan, penolakan, atau sisa deposit sewa."
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3">No. Refund</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Alasan</th>
                                <th className="p-3">Nominal</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                            {refunds.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-stone-400">
                                        Tidak ada data refund.
                                    </td>
                                </tr>
                            )}
                            {refunds.map((rf) => (
                                <tr key={rf.id} className="hover:bg-stone-50/70">
                                    <td className="p-3 font-semibold text-[#111]">
                                        {rf.refund_number}
                                        <p className="text-[10px] text-stone-400 font-normal">
                                            {rf.booking_number}
                                        </p>
                                    </td>
                                    <td className="p-3">{rf.customer_name || "-"}</td>
                                    <td className="p-3 max-w-[220px] text-stone-600">
                                        {rf.reason || "-"}
                                    </td>
                                    <td className="p-3 font-bold text-red-700">
                                        {formatRupiah(rf.amount)}
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={rf.status} map={REFUND_STATUS} />
                                    </td>
                                    <td className="p-3 text-right">
                                        {["pending", "processing"].includes(rf.status) ? (
                                            <div className="flex flex-col gap-1 items-end">
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => handleRefund(rf, "completed")}
                                                    className="px-3 py-1.5 bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] font-semibold text-xs rounded-sm transition-colors"
                                                >
                                                    Tandai Selesai
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => handleRefund(rf, "failed")}
                                                    className="px-2 py-1 text-[11px] font-semibold border-red-200 text-red-600 rounded-sm hover:bg-red-50 disabled:opacity-60 transition-colors"
                                                >
                                                    Gagal
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-stone-400 italic">
                                                {rf.status === "completed"
                                                    ? `Selesai (${formatTanggal(rf.refunded_at)})`
                                                    : REFUND_STATUS[rf.status]?.label}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
