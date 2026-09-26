import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    StatusBadge,
    Card,
    SectionTitle,
    StatCard,
    EmptyState,
} from "@/Components/RentGo/Ui";

const formatRupiah = (v = 0) => `Rp ${Number(v).toLocaleString('id-ID')}`;
const formatTanggalJam = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        label: "Cair",
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
    { id: "komisi", label: "Komisi Transaksi" },
    { id: "pencairan", label: "Pencairan" },
];

/**
 * Halaman Pendapatan & Pencairan (Mitra).
 * Meniru skema: transaction_commissions, agent_payouts, transactions.
 * Props dari controller nanti: { commissions, payouts }
 */
function AgentEarnings({ commissions = [], payouts = [], stats = {} }) {
    const [tab, setTab] = useState("komisi");

    const totalNet = commissions.reduce((sum, c) => sum + Number(c.agent_net_amount || 0), 0);
    const totalKomisi = commissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
    const totalCair = payouts.reduce((sum, p) => (p.status === 'paid' ? sum + Number(p.amount || 0) : sum), 0);

    return (
        <>
            <Head title="Pendapatan — RentGo" />

            <SectionTitle
                kicker="Keuangan Mitra"
                title="Pendapatan & Pencairan"
                description="Pantau pendapatan bersih dari setiap transaksi dan status pencairan ke rekening Anda."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    label="Pendapatan Bersih"
                    value={formatRupiah(totalNet)}
                    hint="Setelah komisi platform"
                    accent
                />
                <StatCard
                    label="Komisi Platform"
                    value={formatRupiah(totalKomisi)}
                    hint="10% dari dasar sewa"
                />
                <StatCard
                    label="Sudah Dicairkan"
                    value={formatRupiah(totalCair)}
                    hint="Total transfer berhasil"
                />
            </div>

            <Card className="border p-3 mb-6">
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
                        </button>
                    ))}
                </div>
            </Card>

            {tab === "komisi" && (
                <div className="space-y-4">
                    {commissions.length === 0 ? (
                        <EmptyState title="Belum ada komisi transaksi" />
                    ) : (
                        commissions.map((c) => (
                            <Card key={c.id} className="border p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-mono font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                            {c.transaction?.transaction_number || `TRX-${c.id}`}
                                        </span>
                                        <span className="text-stone-500">
                                            Booking {c.transaction?.booking?.booking_number || '-'}
                                        </span>
                                    </div>
                                    <StatusBadge
                                        status={c.status}
                                        map={COMMISSION_STATUS}
                                    />
                                </div>

                                <div className="grid sm:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <p className="text-stone-500">
                                            Dasar Komisi
                                        </p>
                                        <p className="font-semibold mt-0.5">
                                            {formatRupiah(c.commission_base_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-500">
                                            Komisi ({c.commission_percentage}%)
                                        </p>
                                        <p className="font-semibold mt-0.5 text-stone-700">
                                            - {formatRupiah(c.commission_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-500">
                                            Pendapatan Anda
                                        </p>
                                        <p className="font-semibold text-base text-[#111] mt-0.5">
                                            {formatRupiah(c.agent_net_amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-500">
                                            Transaksi
                                        </p>
                                        <p className="mt-0.5">
                                            {c.transaction?.completed_at
                                                ? formatTanggalJam(c.transaction.completed_at)
                                                : 'Belum selesai'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {tab === "pencairan" && (
                <div className="space-y-4">
                    <Card className="border p-5">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                            Saldo Siap Dicairkan
                        </p>
                        <div className="flex flex-wrap items-end justify-between gap-3 mt-1">
                            <p className="text-2xl font-semibold">
                                {formatRupiah(stats.pending_payout || 0)}
                            </p>
                            <button
                                type="button"
                                className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
                            >
                                Ajukan Pencairan
                            </button>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                            Pencairan diproses maksimal 2×24 jam kerja setelah
                            diajukan.
                        </p>
                    </Card>

                    {payouts.length === 0 ? (
                        <EmptyState title="Belum ada riwayat pencairan" />
                    ) : (
                        payouts.map((payout) => (
                            <Card key={payout.id} className="border p-5">
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
                                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <p className="text-stone-500">
                                            Nominal
                                        </p>
                                        <p className="font-semibold text-base mt-0.5">
                                            {formatRupiah(payout.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-500">Metode</p>
                                        <p className="mt-0.5">
                                            {payout.payout_method ===
                                            "bank_transfer"
                                                ? `Transfer ${payout.bank_name}`
                                                : "Tunai"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-stone-500">
                                            Rekening
                                        </p>
                                        <p className="mt-0.5">
                                            {payout.account_name} ·{" "}
                                            <span className="font-mono">
                                                {payout.account_number}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {payout.paid_at && (
                                    <p className="text-[11px] text-stone-400 mt-3 pt-3 border-t border-stone-100">
                                        Dibayarkan{" "}
                                        {formatTanggalJam(payout.paid_at)}
                                    </p>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </>
    );
}

AgentEarnings.layout = (page) => (
    <AgentLayout active="/mitra/pendapatan" title="Pendapatan">
        {page}
    </AgentLayout>
);

export default AgentEarnings;
