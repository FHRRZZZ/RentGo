import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

const formatRupiah = (n) =>
    "Rp " + Number(n).toLocaleString("id-ID", { minimumFractionDigits: 0 });

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "-";

const STATUS_CONFIG = {
    unpaid: {
        label: "Belum Dibayar",
        bg: "bg-amber-400/15",
        text: "text-amber-300",
        border: "border-amber-500/30",
        dot: "bg-amber-400",
    },
    awaiting_review: {
        label: "Menunggu Konfirmasi",
        bg: "bg-blue-400/15",
        text: "text-blue-300",
        border: "border-blue-500/30",
        dot: "bg-blue-400",
    },
    paid: {
        label: "Lunas",
        bg: "bg-emerald-400/15",
        text: "text-emerald-300",
        border: "border-emerald-500/30",
        dot: "bg-emerald-400",
    },
    overdue: {
        label: "Jatuh Tempo",
        bg: "bg-red-400/15",
        text: "text-red-300",
        border: "border-red-500/30",
        dot: "bg-red-400",
    },
    waived: {
        label: "Dibebaskan",
        bg: "bg-slate-400/15",
        text: "text-slate-300",
        border: "border-slate-500/30",
        dot: "bg-slate-400",
    },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function ConfirmModal({ tax, action, onClose }) {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const titles = {
        confirm: "Konfirmasi Pembayaran",
        reject:  "Tolak Bukti Pembayaran",
        waive:   "Bebaskan Tagihan",
    };
    const descriptions = {
        confirm: `Konfirmasi bahwa pembayaran ${tax?.billing_period_label} sebesar ${formatRupiah(tax?.amount)} telah diterima. Mitra akan diaktifkan kembali jika sebelumnya nonaktif.`,
        reject:  "Tolak bukti pembayaran ini dan minta mitra untuk mengupload ulang.",
        waive:   `Bebaskan tagihan ${tax?.billing_period_label} — mitra tidak perlu membayar untuk bulan ini.`,
    };
    const btnColors = {
        confirm: "bg-emerald-500 hover:bg-emerald-400 text-black",
        reject:  "bg-red-500 hover:bg-red-400 text-white",
        waive:   "bg-slate-500 hover:bg-slate-400 text-white",
    };
    const btnLabels = {
        confirm: "Ya, Konfirmasi",
        reject:  "Ya, Tolak",
        waive:   "Ya, Bebaskan",
    };

    const routeNames = {
        confirm: "admin.marketing-tax.confirm",
        reject:  "admin.marketing-tax.reject-proof",
        waive:   "admin.marketing-tax.waive",
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(
            route(routeNames[action], tax.id),
            { notes },
            {
                onSuccess: () => {
                    setLoading(false);
                    onClose();
                },
                onError: () => setLoading(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#161616] border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">{titles[action]}</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-2 p-4 bg-stone-800/50 rounded-xl">
                    <p className="text-stone-300 text-sm">{descriptions[action]}</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="text-xs text-stone-500">Tagihan:</div>
                        <div className="text-white font-mono text-xs">{tax?.tax_number}</div>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                        <div className="text-xs text-stone-500">Mitra:</div>
                        <div className="text-white text-xs font-semibold">{tax?.agent_name}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
                            Catatan {action === "reject" && <span className="text-red-400">*</span>}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            required={action === "reject"}
                            placeholder={
                                action === "reject"
                                    ? "Jelaskan alasan penolakan..."
                                    : "Catatan opsional..."
                            }
                            className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white text-sm placeholder-stone-600 focus:outline-none focus:border-amber-500/50 resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-600 text-stone-300 hover:text-white hover:border-stone-500 transition-colors text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 ${btnColors[action]}`}
                        >
                            {loading ? "Memproses..." : btnLabels[action]}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function GenerateModal({ onClose }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);

    const monthNames = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(
            route("admin.marketing-tax.generate"),
            { year, month },
            {
                onSuccess: () => { setLoading(false); onClose(); },
                onError: () => setLoading(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#161616] border border-stone-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-bold text-lg">Generate Tagihan Manual</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Tahun</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                min={2024}
                                max={2099}
                                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-stone-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Bulan</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <p className="text-stone-500 text-xs mb-4">
                        Tagihan akan dibuat untuk semua mitra aktif yang belum memiliki tagihan untuk periode ini.
                    </p>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-stone-600 text-stone-300 hover:text-white transition-colors text-sm font-medium">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm transition-colors">
                            {loading ? "Generating..." : "Generate"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminMarketingTax({ taxes, pagination, stats, filters }) {
    const { flash } = usePage().props;
    const [modal, setModal] = useState(null); // { tax, action }
    const [showGenerate, setShowGenerate] = useState(false);
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");

    const applyFilter = (status) => {
        setStatusFilter(status);
        router.get(route("admin.marketing-tax.index"), { status: status || undefined }, { preserveState: true });
    };

    const taxesWithAgent = taxes.map((t) => ({
        ...t,
        agent_name: t.agent_profile?.agency_name || t.agent_profile?.user?.name || "Mitra",
    }));

    const statCards = [
        {
            label: "Belum Dibayar / Jatuh Tempo",
            value: stats.total_unpaid,
            unit: "tagihan",
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-500/20",
        },
        {
            label: "Menunggu Konfirmasi",
            value: stats.total_awaiting_review,
            unit: "tagihan",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-500/20",
        },
        {
            label: "Lunas Bulan Ini",
            value: stats.total_paid_this_month,
            unit: "tagihan",
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-500/20",
        },
        {
            label: "Pendapatan Pajak Bln Ini",
            value: formatRupiah(stats.revenue_this_month),
            unit: "",
            color: "text-[#F5B800]",
            bg: "bg-amber-400/10",
            border: "border-amber-500/20",
        },
        {
            label: "Mitra Dinonaktifkan",
            value: stats.total_overdue_agents,
            unit: "mitra",
            color: "text-red-400",
            bg: "bg-red-400/10",
            border: "border-red-500/20",
        },
    ];

    return (
        <AdminLayout>
            <Head title="Pajak Pemasaran — Admin RentGo" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Pajak Pemasaran Mitra</h1>
                        <p className="text-stone-400 text-sm mt-1">
                            Kelola tagihan biaya pemasaran bulanan Rp 75.000/mitra
                        </p>
                    </div>
                    <button
                        onClick={() => setShowGenerate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Generate Tagihan
                    </button>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-5 p-4 bg-emerald-400/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-emerald-300 text-sm">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-5 p-4 bg-red-400/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-300 text-sm">{flash.error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {statCards.map((s) => (
                        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                            <p className="text-stone-400 text-xs mb-2 leading-tight">{s.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black ${s.color}`}>
                                    {typeof s.value === "number" ? s.value : s.value}
                                </span>
                                {s.unit && <span className="text-stone-500 text-xs">{s.unit}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {[
                        { label: "Semua", val: "" },
                        { label: "Belum Dibayar", val: "unpaid" },
                        { label: "Menunggu Konfirmasi", val: "awaiting_review" },
                        { label: "Lunas", val: "paid" },
                        { label: "Jatuh Tempo", val: "overdue" },
                        { label: "Dibebaskan", val: "waived" },
                    ].map((f) => (
                        <button
                            key={f.val}
                            onClick={() => applyFilter(f.val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                                statusFilter === f.val
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    : "bg-stone-800/60 text-stone-400 border-stone-700 hover:text-white"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Tabel */}
                <div className="bg-[#111] border border-stone-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-800">
                                    <th className="text-left px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">No. Tagihan</th>
                                    <th className="text-left px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Mitra</th>
                                    <th className="text-left px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Periode</th>
                                    <th className="text-left px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Jatuh Tempo</th>
                                    <th className="text-right px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Nominal</th>
                                    <th className="text-center px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Status</th>
                                    <th className="text-center px-5 py-3 text-stone-500 font-semibold text-xs uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800/60">
                                {taxesWithAgent.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <p className="text-stone-500 text-sm">Tidak ada tagihan ditemukan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    taxesWithAgent.map((tax) => (
                                        <tr key={tax.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <span className="text-stone-300 font-mono text-xs">{tax.tax_number}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-white font-medium text-sm">{tax.agent_name}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-stone-300 text-sm">{tax.billing_period_label}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`text-sm ${tax.is_overdue ? "text-red-400 font-semibold" : "text-stone-400"}`}>
                                                    {formatDate(tax.due_date)}
                                                    {tax.is_overdue && " ⚠️"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className="text-white font-bold">{formatRupiah(tax.amount)}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <StatusBadge status={tax.status} />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Lihat bukti */}
                                                    {tax.has_proof && (
                                                        <a
                                                            href={route("mitra.marketing-tax.proof-file", tax.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-2.5 py-1.5 rounded-lg bg-stone-700/50 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                                                            title="Lihat bukti"
                                                        >
                                                            Bukti
                                                        </a>
                                                    )}
                                                    {/* Konfirmasi */}
                                                    {tax.status === "awaiting_review" && (
                                                        <>
                                                            <button
                                                                onClick={() => setModal({ tax, action: "confirm" })}
                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                                                            >
                                                                Konfirmasi
                                                            </button>
                                                            <button
                                                                onClick={() => setModal({ tax, action: "reject" })}
                                                                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* Bebaskan */}
                                                    {(tax.status === "unpaid" || tax.status === "overdue") && (
                                                        <button
                                                            onClick={() => setModal({ tax, action: "waive" })}
                                                            className="px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                                                        >
                                                            Bebaskan
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination?.last_page > 1 && (
                        <div className="px-5 py-4 border-t border-stone-800 flex items-center justify-between">
                            <p className="text-stone-500 text-sm">
                                Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} tagihan
                            </p>
                            <div className="flex gap-1">
                                {pagination.links?.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || "#"}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            link.active
                                                ? "bg-amber-500 text-black"
                                                : link.url
                                                ? "text-stone-400 hover:text-white bg-stone-800/50"
                                                : "text-stone-700 cursor-not-allowed"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {modal && (
                <ConfirmModal
                    tax={{ ...modal.tax, agent_name: modal.tax.agent_profile?.agency_name || modal.tax.agent_profile?.user?.name || "Mitra" }}
                    action={modal.action}
                    onClose={() => setModal(null)}
                />
            )}
            {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
        </AdminLayout>
    );
}
