import React, { useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";

const formatRupiah = (n) =>
    "Rp " + Number(n).toLocaleString("id-ID", { minimumFractionDigits: 0 });

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
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

function UploadModal({ tax, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        proof: null,
    });
    const [preview, setPreview] = useState(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("proof", file);
            if (file.type.startsWith("image/")) {
                setPreview(URL.createObjectURL(file));
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.post(
            route("mitra.marketing-tax.upload-proof", tax.id),
            { proof: data.proof },
            {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-[#161616] border border-stone-700 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-white font-bold text-lg">
                            Upload Bukti Pembayaran
                        </h3>
                        <p className="text-stone-400 text-sm mt-0.5">
                            {tax.billing_period_label} — {formatRupiah(tax.amount)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Info rekening */}
                <div className="bg-amber-400/10 border border-amber-500/30 rounded-xl p-4 mb-5">
                    <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-2">
                        Transfer ke Rekening Berikut
                    </p>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-stone-400">Bank</span>
                            <span className="text-white font-medium">BCA</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-stone-400">No. Rekening</span>
                            <span className="text-white font-mono font-bold">1234-5678-90</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-stone-400">Atas Nama</span>
                            <span className="text-white font-medium">PT RentGo Indonesia</span>
                        </div>
                        <div className="flex justify-between border-t border-stone-700 mt-2 pt-2">
                            <span className="text-stone-400">Jumlah</span>
                            <span className="text-amber-400 font-bold">{formatRupiah(tax.amount)}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <label
                        className="block border-2 border-dashed border-stone-600 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                        htmlFor="proof-upload"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mx-auto max-h-40 object-contain rounded-lg"
                            />
                        ) : (
                            <>
                                <svg
                                    className="w-10 h-10 text-stone-500 group-hover:text-amber-500/70 mx-auto mb-2 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-stone-400 text-sm">
                                    Klik untuk pilih file
                                </p>
                                <p className="text-stone-600 text-xs mt-1">
                                    JPG, PNG, atau PDF — maks 5 MB
                                </p>
                            </>
                        )}
                        <input
                            id="proof-upload"
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleFile}
                        />
                    </label>
                    {data.proof && !preview && (
                        <p className="text-stone-400 text-xs mt-2 text-center">
                            📄 {data.proof.name}
                        </p>
                    )}
                    {errors.proof && (
                        <p className="text-red-400 text-xs mt-2">{errors.proof}</p>
                    )}

                    <div className="flex gap-3 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-600 text-stone-300 hover:text-white hover:border-stone-500 transition-colors text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!data.proof || processing}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm transition-colors"
                        >
                            {processing ? "Mengirim..." : "Kirim Bukti"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MarketingTax({ taxes, openTax, agent }) {
    const { flash } = usePage().props;
    const [uploadTarget, setUploadTarget] = useState(null);

    return (
        <>
            <Head title="Pajak Pemasaran — RentGo Mitra" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                * { font-family: 'Inter', sans-serif; }
                body { background: #0a0a0a; }
                .card-glow:hover { box-shadow: 0 0 0 1px rgba(245,184,0,0.15), 0 8px 32px rgba(0,0,0,0.4); }
            `}</style>

            <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route("mitra.dashboard")}
                            className="inline-flex items-center gap-2 text-stone-400 hover:text-white text-sm mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Dashboard Mitra
                        </Link>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Pajak Pemasaran
                                </h1>
                                <p className="text-stone-400 text-sm mt-1">
                                    Biaya pemasaran bulanan untuk mendukung visibilitas mitra di platform RentGo
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-stone-500 uppercase tracking-wide">Tarif Bulanan</div>
                                <div className="text-2xl font-black text-amber-400">Rp 75.000</div>
                            </div>
                        </div>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-emerald-400/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-emerald-300 text-sm">{flash.success}</p>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-400/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-300 text-sm">{flash.error}</p>
                        </div>
                    )}

                    {/* Status Akun — tampil jika mitra nonaktif */}
                    {!agent?.is_active && (
                        <div className="mb-6 p-5 bg-red-500/10 border border-red-500/40 rounded-2xl">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-red-300 font-bold">Akun Mitra Dinonaktifkan</h3>
                                    <p className="text-red-400/80 text-sm mt-1">
                                        Akun Anda dinonaktifkan karena terdapat tagihan pajak pemasaran yang belum dibayar melewati tanggal jatuh tempo.
                                        Segera upload bukti pembayaran untuk mengaktifkan kembali akun Anda.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tagihan Terbuka / Perlu Dibayar */}
                    {openTax && (
                        <div className={`mb-6 p-5 rounded-2xl border ${
                            openTax.status === "overdue"
                                ? "bg-red-500/10 border-red-500/40"
                                : openTax.status === "awaiting_review"
                                ? "bg-blue-500/10 border-blue-500/30"
                                : "bg-amber-500/10 border-amber-500/30"
                        }`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        openTax.status === "overdue" ? "bg-red-500/20" :
                                        openTax.status === "awaiting_review" ? "bg-blue-500/20" :
                                        "bg-amber-500/20"
                                    }`}>
                                        <svg className={`w-6 h-6 ${
                                            openTax.status === "overdue" ? "text-red-400" :
                                            openTax.status === "awaiting_review" ? "text-blue-400" :
                                            "text-amber-400"
                                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-stone-300 text-sm font-medium">
                                            Tagihan {openTax.billing_period_label}
                                        </p>
                                        <p className={`text-2xl font-black mt-0.5 ${
                                            openTax.status === "overdue" ? "text-red-400" :
                                            openTax.status === "awaiting_review" ? "text-blue-400" :
                                            "text-amber-400"
                                        }`}>
                                            {formatRupiah(openTax.amount)}
                                        </p>
                                        <p className="text-stone-500 text-xs mt-1">
                                            Jatuh tempo: {formatDate(openTax.due_date)}
                                            {openTax.is_overdue && (
                                                <span className="text-red-400 font-semibold ml-1">
                                                    — SUDAH LEWAT
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={openTax.status} />
                                    {openTax.status !== "awaiting_review" && (
                                        <button
                                            onClick={() => setUploadTarget(openTax)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                openTax.status === "overdue"
                                                    ? "bg-red-500 hover:bg-red-400 text-white"
                                                    : "bg-amber-500 hover:bg-amber-400 text-black"
                                            }`}
                                        >
                                            {openTax.status === "overdue" ? "⚡ Bayar Sekarang" : "Upload Bukti"}
                                        </button>
                                    )}
                                    {openTax.status === "awaiting_review" && (
                                        <p className="text-blue-400 text-xs">
                                            ✓ Bukti sudah dikirim
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cara Pembayaran */}
                    <div className="mb-6 bg-[#111] border border-stone-800 rounded-2xl p-5">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Cara Pembayaran
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    step: "1",
                                    title: "Transfer",
                                    desc: "Transfer Rp 75.000 ke rekening BCA 1234-5678-90 a.n PT RentGo Indonesia"
                                },
                                {
                                    step: "2",
                                    title: "Upload Bukti",
                                    desc: "Upload screenshot/foto bukti transfer di tagihan yang tersedia"
                                },
                                {
                                    step: "3",
                                    title: "Konfirmasi",
                                    desc: "Admin akan memverifikasi dalam 1×24 jam. Akun aktif kembali otomatis."
                                },
                            ].map((s) => (
                                <div key={s.step} className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                                        <span className="text-amber-400 font-bold text-xs">{s.step}</span>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">{s.title}</p>
                                        <p className="text-stone-500 text-xs mt-0.5">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Riwayat Tagihan */}
                    <div className="bg-[#111] border border-stone-800 rounded-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-stone-800">
                            <h3 className="text-white font-semibold">Riwayat Tagihan</h3>
                        </div>

                        {taxes.length === 0 ? (
                            <div className="py-16 text-center">
                                <svg className="w-12 h-12 text-stone-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                </svg>
                                <p className="text-stone-500 text-sm">Belum ada tagihan pajak pemasaran</p>
                                <p className="text-stone-600 text-xs mt-1">Tagihan akan muncul di sini setiap bulan</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-800/60">
                                {taxes.map((tax) => (
                                    <div
                                        key={tax.id}
                                        className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors card-glow"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                tax.status === "paid" ? "bg-emerald-500/15" :
                                                tax.status === "overdue" ? "bg-red-500/15" :
                                                tax.status === "awaiting_review" ? "bg-blue-500/15" :
                                                tax.status === "waived" ? "bg-slate-500/15" :
                                                "bg-amber-500/15"
                                            }`}>
                                                <svg className={`w-4 h-4 ${
                                                    tax.status === "paid" ? "text-emerald-400" :
                                                    tax.status === "overdue" ? "text-red-400" :
                                                    tax.status === "awaiting_review" ? "text-blue-400" :
                                                    tax.status === "waived" ? "text-slate-400" :
                                                    "text-amber-400"
                                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">
                                                    {tax.billing_period_label}
                                                </p>
                                                <p className="text-stone-500 text-xs mt-0.5 font-mono">
                                                    {tax.tax_number}
                                                </p>
                                                <p className="text-stone-600 text-xs mt-0.5">
                                                    Jatuh tempo: {formatDate(tax.due_date)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-white font-bold text-sm">
                                                    {formatRupiah(tax.amount)}
                                                </p>
                                                {tax.paid_at && (
                                                    <p className="text-stone-500 text-xs">
                                                        Dibayar {formatDate(tax.paid_at)}
                                                    </p>
                                                )}
                                            </div>
                                            <StatusBadge status={tax.status} />
                                            {(tax.status === "unpaid" || tax.status === "overdue") && (
                                                <button
                                                    onClick={() => setUploadTarget(tax)}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30"
                                                >
                                                    Bayar
                                                </button>
                                            )}
                                            {tax.has_proof && tax.status !== "paid" && (
                                                <a
                                                    href={route("mitra.marketing-tax.proof-file", tax.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-lg bg-stone-700/50 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                                                >
                                                    Lihat Bukti
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadTarget && (
                <UploadModal
                    tax={uploadTarget}
                    onClose={() => setUploadTarget(null)}
                />
            )}
        </>
    );
}
