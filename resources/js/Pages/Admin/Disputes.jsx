import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatusBadge, SectionTitle } from "@/Components/RentGo/Ui";

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

// Label mengikuti enum kolom `disputes.status` di database.
const DISPUTE_STATUS = {
    open: { label: "Terbuka", color: "bg-amber-100 text-amber-900 border-amber-300" },
    investigating: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-300" },
    under_review: { label: "Ditinjau", color: "bg-blue-100 text-blue-800 border-blue-300" },
    resolved: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
    closed: { label: "Ditutup", color: "bg-stone-100 text-stone-600 border-stone-300" },
};

// Label mengikuti enum kolom `complaints.status` di database.
const COMPLAINT_STATUS = {
    open: { label: "Terbuka", color: "bg-amber-100 text-amber-900 border-amber-300" },
    submitted: { label: "Terkirim", color: "bg-amber-100 text-amber-900 border-amber-300" },
    in_review: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-300" },
    resolved: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
    closed: { label: "Ditutup", color: "bg-stone-100 text-stone-600 border-stone-300" },
};

const REVIEW_STATUS = {
    pending: { label: "Menunggu Moderasi", color: "bg-amber-100 text-amber-900 border-amber-300" },
    published: { label: "Publik", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    hidden: { label: "Disembunyikan", color: "bg-stone-100 text-stone-600 border-stone-200" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function AdminDisputesPage({
    disputes = [],
    complaints = [],
    reviews = [],
    admins = [],
}) {
    const { flash } = usePage().props;
    const [inspectDispute, setInspectDispute] = useState(null);
    const [inspectComplaint, setInspectComplaint] = useState(null);
    const [busy, setBusy] = useState(false);

    const toast =
        flash?.success || flash?.error
            ? { message: flash?.error || flash?.success, error: !!flash?.error }
            : null;

    // Posting ke backend lalu Inertia memuat ulang halaman dengan data terbaru.
    const post = (url, payload, onDone) => {
        setBusy(true);
        router.post(url, payload, {
            preserveScroll: true,
            onSuccess: () => onDone && onDone(),
            onFinish: () => setBusy(false),
        });
    };

    const handleResolve = (dispute, decision, resolution, resolutionParty, refundAmount) => {
        post(
            `/admin/disputes/${dispute.id}/process`,
            {
                status: "resolved",
                resolution,
                resolution_party: resolutionParty,
                refund_amount: refundAmount,
                notes: decision,
            },
            () => setInspectDispute(null),
        );
    };

    const handleDisputeStart = (dispute) => {
        post(`/admin/disputes/${dispute.id}/process`, { status: "investigating" });
    };

    const handleComplaintProcess = (complaint, status) => {
        const resolution =
            status === "resolved"
                ? window.prompt(
                      "Resolusi / tindakan yang dilakukan:",
                      "Kendala telah ditangani dan dikonfirmasi ke pelapor.",
                  )
                : null;

        if (status === "resolved" && resolution === null) return;

        post(
            `/admin/complaints/${complaint.id}/process`,
            { status, resolution },
            () => setInspectComplaint(null),
        );
    };

    const handleModerateReview = (review, status) => {
        const note =
            status === "published"
                ? null
                : window.prompt("Alasan moderasi (opsional):", "Melanggar pedoman komunitas.");

        post(`/admin/reviews/${review.id}/moderate`, {
            status,
            moderation_note: note || null,
        });
    };

    return (
        <AdminLayout activeTab="disputes">
            <Head title="Sengketa & Resolusi — Admin RentGo" />

            {toast && (
                <div className="fixed bottom-5 right-5 z-50 bg-[#111] text-[#F5B800] px-4 py-2.5 rounded-sm border border-stone-800 text-xs font-semibold shadow-md">
                    {toast.message}
                </div>
            )}

            <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm mb-6">
                <SectionTitle
                    kicker="Arbitrase & Layanan Pengguna"
                    title="Penyelesaian Sengketa & Moderasi Ulasan"
                    description="Sebagai pihak penengah netral, Admin memediasi perselisihan deposit kerusakan antara customer dan mitra, serta memoderasi keluhan dan ulasan publik."
                />
            </div>

            {/* Sengketa Deposit */}
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm mb-6">
                <SectionTitle
                    kicker="Arbitrase Deposit"
                    title="Kasus Sengketa Deposit Aktif (Disputes)"
                    description="Tuntutan pengembalian deposit akibat ketidaksepakatan potongan perbaikan kerusakan unit."
                />

                <div className="divide-y divide-stone-100">
                    {disputes.length === 0 && (
                        <p className="py-4 text-xs text-stone-400">
                            Tidak ada sengketa saat ini.
                        </p>
                    )}
                    {disputes.map((dsp) => (
                        <div key={dsp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#111]">{dsp.subject}</span>
                                    <StatusBadge status={dsp.status} map={DISPUTE_STATUS} />
                                    <span className="text-stone-400">· {dsp.booking_number}</span>
                                </div>
                                <p className="text-stone-500 mt-0.5">
                                    {dsp.initiator?.name || "-"} vs {dsp.respondent?.name || "-"}
                                    {dsp.category ? ` · ${dsp.category}` : ""}
                                </p>
                                <p className="text-stone-600 mt-1">{dsp.description}</p>
                                {dsp.resolution && (
                                    <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-900 text-[11px]">
                                        <strong>Keputusan Arbitrase:</strong> {dsp.resolution}
                                    </div>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs text-stone-500">Klaim Pengembalian:</p>
                                <p className="text-base font-bold text-red-700">{formatRupiah(dsp.refund_amount)}</p>
                                {(dsp.status === "open" || dsp.status === "investigating") && (
                                    <>
                                        {dsp.status === "open" && (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => handleDisputeStart(dsp)}
                                                className="mt-2 mr-2 px-3 py-1.5 border-stone-300 text-stone-700 text-xs font-semibold rounded-sm hover:bg-stone-50 disabled:opacity-60 transition-colors"
                                            >
                                                Tandai Diproses
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => setInspectDispute(dsp)}
                                            className="mt-2 px-3 py-1.5 bg-[#111] text-[#F5B800] text-xs font-semibold rounded-sm hover:bg-stone-800 disabled:opacity-60 transition-colors"
                                        >
                                            Ambil Keputusan
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Keluhan Pelanggan */}
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm mb-6">
                <SectionTitle
                    kicker="Layanan Bantuan"
                    title="Keluhan Operasional (Complaints)"
                    description="Laporan keterlambatan, AC unit, atau kendala serah terima kendaraan."
                />

                <div className="divide-y divide-stone-100">
                    {complaints.length === 0 && (
                        <p className="py-4 text-xs text-stone-400">
                            Tidak ada komplain saat ini.
                        </p>
                    )}
                    {complaints.map((cmp) => (
                        <div key={cmp.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#111]">{cmp.subject}</span>
                                    <StatusBadge status={cmp.status} map={COMPLAINT_STATUS} />
                                    <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-sm text-[10px] uppercase font-bold border border-stone-200">
                                        {cmp.category || "lain-lain"}
                                    </span>
                                </div>
                                <p className="text-stone-500 mt-0.5">
                                    {cmp.complainant?.name || "-"}
                                    {cmp.booking_number ? ` \u00b7 ${cmp.booking_number}` : ""}
                                </p>
                                <p className="text-stone-600 mt-1">{cmp.description}</p>
                                {cmp.resolution && (
                                    <div className="mt-2 p-2 bg-emerald-50 border-emerald-200 rounded-sm text-emerald-900 text-[11px]">
                                        <strong>Resolusi:</strong> {cmp.resolution}
                                    </div>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] text-stone-400 whitespace-nowrap block">
                                    {formatTanggalJam(cmp.created_at)}
                                </span>
                                {["open", "submitted", "in_review"].includes(cmp.status) && (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => setInspectComplaint(cmp)}
                                        className="mt-2 px-3 py-1.5 bg-[#111] text-[#F5B800] text-xs font-semibold rounded-sm hover:bg-stone-800 disabled:opacity-60 transition-colors"
                                    >
                                        Tangani
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Moderasi Review */}
            <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                <SectionTitle
                    kicker="Transparansi Rating"
                    title="Moderasi Ulasan Publik (Reviews)"
                    description="Kontrol visibilitas ulasan pelanggan untuk menjaga ekosistem yang sehat."
                />

                <div className="divide-y divide-stone-100">
                    {reviews.length === 0 && (
                        <p className="py-4 text-xs text-stone-400">
                            Tidak ada ulasan saat ini.
                        </p>
                    )}
                    {reviews.map((rev) => (
                        <div key={rev.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#111]">{rev.customer?.name || "Penyewa"}</span>
                                    <span className="text-amber-700 font-bold">Skor: {rev.rating}/5</span>
                                    <span className="text-stone-400">· {rev.vehicle_name}</span>
                                    <span
                                        className={`px-1.5 py-0.2 rounded-sm text-[10px] font-bold border ${
                                            rev.status === "published"
                                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                : "bg-stone-100 text-stone-600 border-stone-200"
                                        }`}
                                    >
                                        {REVIEW_STATUS[rev.status]?.label || rev.status}
                                    </span>
                                </div>
                                <p className="text-stone-600 mt-1 italic">"{rev.review}"</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleModerateReview(rev, "hidden")}
                                disabled={busy}
                                className="px-2.5 py-1 text-xs font-semibold border border-stone-200 hover:border-black rounded-sm transition-colors"
                            >
                                Sembunyikan & Tinjau
                            </button>{" "}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleModerateReview(rev, "published")}
                                className="px-2.5 py-1 text-xs font-semibold bg-[#111] text-[#F5B800] rounded-sm hover:bg-stone-800 disabled:opacity-60 transition-colors"
                            >
                                Publikasikan
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Keputusan Arbitrase */}
            {inspectDispute && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#111]">{inspectDispute.subject}</h3>
                                <p className="text-xs text-stone-500">Ref: {inspectDispute.booking_number}</p>
                            </div>
                            <button type="button" onClick={() => setInspectDispute(null)} className="text-stone-400 hover:text-black">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-stone-700">{inspectDispute.description}</p>
                            <p className="text-sm font-bold text-red-700">
                                Nominal Sengketa: {formatRupiah(inspectDispute.refund_amount)}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex justify-between">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                    handleResolve(
                                        inspectDispute,
                                        "Klaim customer ditolak. Bukti kerusakan mitra dinilai absah.",
                                        "Klaim customer ditolak. Bukti kerusakan dari mitra dinilai absah.",
                                        "mitra",
                                        0,
                                    )
                                }
                                className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-sm text-xs font-semibold hover:bg-stone-200 disabled:opacity-60"
                            >
                                Tolak Klaim
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                    handleResolve(
                                        inspectDispute,
                                        "Klaim diterima. Dana deposit dikembalikan ke customer.",
                                        "Klaim diterima. Dana deposit dikembalikan ke customer.",
                                        "customer",
                                        Number(inspectDispute.refund_amount) || 0,
                                    )
                                }
                                className="px-4 py-1.5 bg-[#F5B800] text-[#111] rounded-sm text-xs font-semibold hover:bg-[#e0a800] disabled:opacity-60"
                            >
                                Kembalikan Dana Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tangani Komplain */}
            {inspectComplaint && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#111]">{
                                    inspectComplaint.subject
                                }</h3>
                                <p className="text-xs text-stone-500">
                                    {inspectComplaint.complainant?.name || "-"}
                                    {inspectComplaint.booking_number
                                        ? ` \u00b7 ${inspectComplaint.booking_number}`
                                        : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectComplaint(null)}
                                className="text-stone-400 hover:text-black"
                            >
                                \u2715
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="text-stone-700">
                                {inspectComplaint.description}
                            </p>
                            <p className="text-stone-500">
                                Kategori: {inspectComplaint.category || "-"}
                                {inspectComplaint.priority
                                    ? ` \u00b7 Prioritas: ${inspectComplaint.priority}`
                                    : ""}
                            </p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex-wrap gap-2 justify-end">
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                    handleComplaintProcess(inspectComplaint, "rejected")
                                }
                                className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-sm text-xs font-semibold hover:bg-stone-200 disabled:opacity-60"
                            >
                                Tolak
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                    handleComplaintProcess(inspectComplaint, "in_review")
                                }
                                className="px-3 py-1.5 border-stone-300 text-stone-700 rounded-sm text-xs font-semibold hover:bg-stone-50 disabled:opacity-60"
                            >
                                Tandai Diproses
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                    handleComplaintProcess(inspectComplaint, "resolved")
                                }
                                className="px-4 py-1.5 bg-[#F5B800] text-[#111] rounded-sm text-xs font-semibold hover:bg-[#e0a800] disabled:opacity-60"
                            >
                                Selesaikan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
