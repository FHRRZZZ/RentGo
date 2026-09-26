import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";

const StarDisplay = ({ rating, size = "sm" }) => {
    const sz = size === "lg" ? "text-xl" : "text-sm";
    return (
        <span className={sz}>
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={
                        s <= rating ? "text-[#F5B800]" : "text-stone-200"
                    }
                >
                    ★
                </span>
            ))}
        </span>
    );
};

const RATING_LABELS = {
    5: "Sangat Bagus",
    4: "Bagus",
    3: "Cukup",
    2: "Buruk",
    1: "Sangat Buruk",
};

const STATUS_LABELS = {
    published: "Tampil",
    pending: "Menunggu Moderasi",
    hidden: "Disembunyikan",
    rejected: "Ditolak",
};

const formatTanggal = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

/**
 * Ulasan Customer (sisi Mitra).
 *
 * Data dari Agent\ReviewController@index. Balasan dikirim ke
 * route mitra.reviews.reply lalu halaman di-reload Inertia.
 */
export default function AgentReviews({ reviews = [] }) {
    const [ratingFilter, setRatingFilter] = useState(0);
    const [replyModal, setReplyModal] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const avgRating = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);

    const ratingCounts = useMemo(() => {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            if (r.rating) counts[r.rating] = (counts[r.rating] || 0) + 1;
        });
        return counts;
    }, [reviews]);

    const filtered = useMemo(
        () =>
            ratingFilter === 0
                ? reviews
                : reviews.filter((r) => r.rating === ratingFilter),
        [reviews, ratingFilter],
    );

    const openReply = (review) => {
        setReplyModal(review);
        setReplyText(review.reply || "");
    };

    const submitReply = (e) => {
        e.preventDefault();
        if (!replyText.trim() || !replyModal) return;
        setSubmitting(true);
        router.post(
            `/mitra/ulasan/${replyModal.id}/balas`,
            { reply: replyText.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyModal(null);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    return (
        <AgentLayout active="/mitra/ulasan" title="Ulasan dari Customer">
            <Head title="Ulasan - RentGo Mitra" />

            <div className="mb-6 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">
                        Portal Mitra
                    </span>
                    <h1 className="mt-0.5 text-xl font-bold text-[#111]">
                        Ulasan Customer
                    </h1>
                    <p className="mt-1 text-xs text-stone-500">
                        Pantau dan balas ulasan dari customer yang telah menyewa
                        unit Anda.
                    </p>
                </div>
            </div>

            {/* Ringkasan rating */}
            <div className="mb-6 grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="col-span-2 flex-col items-center justify-center rounded-xl border-stone-200 bg-white p-4 text-center shadow-sm sm:col-span-1">
                    <p className="text-4xl font-extrabold tracking-tight text-[#111]">
                        {avgRating}
                    </p>
                    <StarDisplay rating={Math.round(avgRating)} size="lg" />
                    <p className="mt-1 text-[11px] text-stone-400">
                        {reviews.length} ulasan total
                    </p>
                </div>
                <div className="col-span-2 rounded-xl border-stone-200 bg-white p-4 shadow-sm sm:col-span-3">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Distribusi Rating
                    </p>
                    <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingCounts[star] || 0;
                            const pct = reviews.length
                                ? Math.round((count / reviews.length) * 100)
                                : 0;
                            return (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                        setRatingFilter(
                                            ratingFilter === star ? 0 : star,
                                        )
                                    }
                                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1 text-xs transition hover:bg-stone-50"
                                >
                                    <span className="w-8 text-right font-semibold text-stone-600">
                                        {star}★
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                                        <div
                                            className="h-full rounded-full bg-[#F5B800] transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-stone-400">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="mb-4 flex-wrap gap-2">
                {[0, 5, 4, 3, 2, 1].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRatingFilter(r)}
                        className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition ${
                            ratingFilter === r
                                ? "bg-[#111] text-[#F5B800]"
                                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                        }`}
                    >
                        {r === 0 ? "Semua" : `${r} Bintang`}
                        <span
                            className={`ml-1.5 rounded-full px-1.5 text-[10px] ${
                                ratingFilter === r
                                    ? "bg-[#F5B800] text-[#111]"
                                    : "bg-stone-100 text-stone-500"
                            }`}
                        >
                            {r === 0 ? reviews.length : ratingCounts[r] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border-stone-200 bg-white p-16 text-center">
                    <div className="mb-3 text-4xl">⭐</div>
                    <p className="text-sm font-semibold text-stone-700">
                        Belum ada ulasan
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                        Ulasan dari customer akan muncul di sini setelah pesanan
                        selesai.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((review) => (
                        <div
                            key={review.id}
                            className="overflow-hidden rounded-xl border-stone-200 bg-white shadow-sm"
                        >
                            <div className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111] text-sm font-bold text-[#F5B800]">
                                            {(review.customer_name || "C")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#111]">
                                                {review.customer_name ||
                                                    "Customer"}
                                            </p>
                                            <p className="text-[11px] text-stone-400">
                                                {review.vehicle_name || "Unit"}{" "}
                                                ·{" "}
                                                {review.booking_number
                                                    ? `BK-${review.booking_number}`
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <StarDisplay
                                            rating={review.rating || 0}
                                        />
                                        <p className="mt-0.5 text-[10px] text-stone-400">
                                            {RATING_LABELS[review.rating] ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                                    {review.review || "-"}
                                </p>

                                <div className="mt-2 flex-wrap items-center gap-2">
                                    <span className="text-[10px] text-stone-400">
                                        {formatTanggal(
                                            review.published_at ||
                                                review.created_at,
                                        )}
                                    </span>
                                    <span
                                        className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${
                                            review.status === "published"
                                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                : review.status === "pending"
                                                  ? "border-amber-300 bg-amber-50 text-amber-800"
                                                  : "border-stone-300 bg-stone-100 text-stone-600"
                                        }`}
                                    >
                                        {STATUS_LABELS[review.status] ||
                                            review.status}
                                    </span>
                                </div>

                                {review.reply && (
                                    <div className="mt-4 rounded-lg border-[#F5B800]/30 bg-[#FFFBEA] p-3">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#b38600]">
                                            Balasan Anda ·{" "}
                                            {formatTanggal(review.replied_at)}
                                        </p>
                                        <p className="text-xs leading-relaxed text-stone-700">
                                            {review.reply}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end border-t border-stone-100 bg-stone-50 px-5 py-3">
                                <button
                                    type="button"
                                    onClick={() => openReply(review)}
                                    className="flex items-center gap-1.5 rounded-lg border-stone-300 bg-white px-4 py-2 text-[11px] font-semibold text-stone-700 transition hover:border-[#111] hover:text-black"
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
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                        />
                                    </svg>
                                    {review.reply
                                        ? "Edit Balasan"
                                        : "Balas Ulasan"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal balasan */}
            {replyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
                        <div className="bg-gradient-to-br from-[#111] to-[#2a2a2a] px-6 py-5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">
                                Balas Ulasan
                            </span>
                            <h3 className="mt-0.5 text-sm font-bold text-white">
                                {replyModal.customer_name || "Customer"}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                <StarDisplay rating={replyModal.rating} />
                                <span className="max-w-xs truncate text-[11px] text-stone-400">
                                    “{replyModal.review}”
                                </span>
                            </div>
                        </div>
                        <form onSubmit={submitReply} className="space-y-4 p-5">
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                    Balasan Anda (publik)
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) =>
                                        setReplyText(e.target.value)
                                    }
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Ucapkan terima kasih atau tanggapi masukan customer dengan sopan..."
                                    className="w-full resize-none rounded-lg border-stone-200 bg-stone-50 px-4 py-3 text-xs outline-none transition focus:border-[#F5B800] focus:bg-white focus:ring-2 focus:ring-[#F5B800]/20"
                                    required
                                />
                                <p className="mt-1 text-right text-[10px] text-stone-400">
                                    {replyText.length}/1000
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReplyModal(null)}
                                    className="flex-1 rounded-lg border-stone-200 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    className="flex-1 rounded-lg bg-[#F5B800] py-2.5 text-xs font-bold text-[#111] hover:bg-[#e0a800] disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Menyimpan..."
                                        : "Simpan Balasan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AgentLayout>
    );
}
