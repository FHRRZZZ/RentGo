import React, { useState } from "react";
import { Head, router, Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

const StarDisplay = ({ rating }) => (
    <span className="text-sm">
        {[1, 2, 3, 4, 5].map((s) => (
            <span
                key={s}
                className={s <= rating ? "text-[#F5B800]" : "text-stone-200"}
            >
                ★
            </span>
        ))}
    </span>
);

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
 * Ulasan Saya (sisi Customer).
 *
 * Props dari Customer\ReviewController@index:
 *   reviews         → ulasan yang sudah ditulis + balasan mitra
 *   pendingBookings → pesanan selesai yang belum diulas
 */
export default function ReviewsIndex({
    auth = {},
    reviews = [],
    pendingBookings = [],
}) {
    const [modal, setModal] = useState(null);
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const openReview = (booking) => {
        setModal(booking);
        setRating(5);
        setHover(0);
        setText("");
    };

    const submitReview = (e) => {
        e.preventDefault();
        if (!text.trim() || !modal) return;
        setSubmitting(true);
        router.post(
            "/ulasan",
            {
                booking_id: modal.id,
                rating,
                review: text.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setModal(null);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    return (
        <CustomerLayout
            auth={auth}
            activeNav="ulasan"
            backHref="/"
            backLabel="Beranda"
        >
            <Head title="Ulasan Saya - RentGo" />

            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Penilaian Anda
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111]">
                    Ulasan Saya
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                    Nilai pengalaman sewa Anda dan lihat tanggapan dari mitra
                    penyedia unit.
                </p>
            </div>

            {/* Pesanan yang menunggu ulasan */}
            {pendingBookings.length > 0 && (
                <div className="mb-6 rounded-sm border-[#F5B800]/40 bg-[#FFFBEA] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#b38600]">
                        Menunggu Ulasan Anda ({pendingBookings.length})
                    </p>
                    <div className="mt-3 space-y-2">
                        {pendingBookings.map((b) => (
                            <div
                                key={b.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-sm border-stone-200 bg-white px-3 py-2.5"
                            >
                                <div className="min-w-0 text-xs">
                                    <p className="truncate font-semibold text-[#111]">
                                        {b.vehicle_name}
                                    </p>
                                    <p className="text-[11px] text-stone-400">
                                        {b.booking_number} · selesai{" "}
                                        {formatTanggal(b.rental_end)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openReview(b)}
                                    className="rounded-sm bg-[#F5B800] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#111] transition hover:bg-[#e0a800]"
                                >
                                    Beri Ulasan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Daftar ulasan */}
            {reviews.length === 0 ? (
                <div className="rounded-sm border-stone-200 bg-white p-14 text-center shadow-sm">
                    <div className="mb-3 text-4xl">⭐</div>
                    <p className="text-sm font-semibold text-stone-800">
                        Belum ada ulasan
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                        Ulasan bisa ditulis setelah pesanan Anda selesai.
                    </p>
                    <Link
                        href="/pesanan"
                        className="mt-4 inline-block rounded-sm bg-[#F5B800] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#111] transition hover:bg-[#e0a800]"
                    >
                        Lihat Pesanan Saya
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-sm border-stone-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#111]">
                                        {r.vehicle_name || "Kendaraan"}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-stone-400">
                                        {r.agency_name || "Mitra RentGo"} ·{" "}
                                        {r.booking_number || "-"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <StarDisplay rating={r.rating || 0} />
                                    <p className="mt-0.5 text-[10px] text-stone-400">
                                        {RATING_LABELS[r.rating] || "-"}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-xs leading-relaxed text-stone-600">
                                {r.review || "-"}
                            </p>

                            <div className="mt-2 flex-wrap items-center gap-2">
                                <span className="text-[10px] text-stone-400">
                                    {formatTanggal(
                                        r.published_at || r.created_at,
                                    )}
                                </span>
                                <span
                                    className={`rounded-sm border px-2 py-0.5 text-[10px] font-semibold ${
                                        r.status === "published"
                                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                            : r.status === "pending"
                                              ? "border-amber-300 bg-amber-50 text-amber-800"
                                              : "border-stone-300 bg-stone-100 text-stone-600"
                                    }`}
                                >
                                    {STATUS_LABELS[r.status] || r.status}
                                </span>
                            </div>

                            {r.reply && (
                                <div className="mt-4 rounded-sm border-stone-200 bg-stone-50 p-3">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                                        Balasan Mitra ·{" "}
                                        {formatTanggal(r.replied_at)}
                                    </p>
                                    <p className="text-xs leading-relaxed text-stone-700">
                                        {r.reply}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal beri ulasan */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-sm bg-white shadow-2xl">
                        <div className="bg-[#111] px-6 py-5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">
                                Beri Ulasan Penyewaan
                            </span>
                            <h3 className="mt-0.5 text-base font-bold text-white">
                                {modal.vehicle_name}
                            </h3>
                            <p className="mt-0.5 text-[11px] text-stone-400">
                                ID Pesanan: {modal.booking_number}
                            </p>
                        </div>

                        <form onSubmit={submitReview} className="space-y-5 p-5">
                            <div>
                                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                    Rating Pengalaman Sewa
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <span
                                                className={
                                                    (hover || rating) >= star
                                                        ? "text-[#F5B800]"
                                                        : "text-stone-200"
                                                }
                                            >
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-center text-xs font-semibold text-stone-500">
                                    {
                                        [
                                            "",
                                            "Sangat Buruk",
                                            "Buruk",
                                            "Cukup",
                                            "Bagus",
                                            "Sangat Bagus",
                                        ][hover || rating]
                                    }
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                    Ceritakan Pengalaman Anda
                                </label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Bagaimana kondisi kendaraan, pelayanan mitra, dan pengalaman sewa secara keseluruhan?"
                                    className="w-full resize-none rounded-sm border-stone-200 bg-stone-50 px-4 py-3 text-xs outline-none transition focus:border-[#F5B800] focus:bg-white focus:ring-2 focus:ring-[#F5B800]/20"
                                    required
                                />
                                <p className="mt-1 text-right text-[10px] text-stone-400">
                                    {text.length}/1000
                                </p>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setModal(null)}
                                    className="flex-1 rounded-sm border-stone-200 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !text.trim()}
                                    className="flex-1 rounded-sm bg-[#F5B800] py-2.5 text-xs font-bold text-[#111] transition hover:bg-[#e0a800] disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Mengirim..."
                                        : "Kirim Ulasan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
