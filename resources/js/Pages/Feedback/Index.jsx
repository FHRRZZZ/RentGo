import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { StatusBadge, SectionTitle, Card, EmptyState } from '@/Components/RentGo/Ui';

const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);

const formatTanggalJam = (dateStr) => {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
};

const REVIEW_STATUS = {
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const COMPLAINT_STATUS = {
    open: { label: 'Terbuka', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    investigating: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    resolved: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    closed: { label: 'Ditutup', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

const DISPUTE_STATUS = {
    open: { label: 'Terbuka', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    mediation: { label: 'Mediasi', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    resolved: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    escalated: { label: 'Eskalasi', color: 'bg-red-100 text-red-800 border-red-300' },
};

const PRIORITY = {
    low: { label: 'Rendah', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    medium: { label: 'Sedang', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    high: { label: 'Tinggi', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-800 border-red-300' },
};

export default function FeedbackIndex({
    auth = {},
    reviews = [],
    complaints = [],
    disputes = [],
}) {
    const [tab, setTab] = useState('review');

    const TABS = [
        { id: 'review', label: 'Ulasan', data: reviews },
        { id: 'complaint', label: 'Komplain', data: complaints },
        { id: 'dispute', label: 'Sengketa', data: disputes },
    ];

    return (
        <CustomerLayout auth={auth} activeNav="pesanan" backHref="/pesanan" backLabel="Pesanan">
            <Head title="Ulasan & Laporan - RentGo" />

            {/* Page Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Umpan Balik
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
                    Ulasan, Komplain &amp; Sengketa
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                    Kelola ulasan penyewaan, keluhan layanan, dan perselisihan yang sedang ditangani.
                </p>
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
                                    ? 'bg-[#111111] text-[#F5B800]'
                                    : 'text-stone-600 hover:text-[#111111]'
                            }`}
                        >
                            {item.label}
                            <span
                                className={`ml-1.5 rounded-sm px-1.5 py-0.5 text-[10px] ${
                                    tab === item.id ? 'bg-[#F5B800] text-[#111111]' : 'bg-stone-200 text-stone-600'
                                }`}
                            >
                                {item.data.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Konten Tab: Ulasan */}
            {tab === 'review' && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <EmptyState title="Belum ada ulasan" />
                    ) : (
                        reviews.map((review) => (
                            <Card key={review.id} className="border p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-[#F5B800]">
                                            {(review.customer_name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">{review.customer_name || review.user?.name || 'Customer'}</p>
                                            <p className="text-[11px] text-stone-500">
                                                {review.vehicle_name || review.vehicle?.name || 'Kendaraan'} &middot; {review.booking_number || (review.booking_id ? `BK-${review.booking_id}` : '-')}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={review.status || 'approved'} map={REVIEW_STATUS} />
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm text-[#F5B800]">
                                        {'★'.repeat(review.rating || 5)}
                                        <span className="text-stone-300">{'★'.repeat(Math.max(0, 5 - (review.rating || 5)))}</span>
                                    </span>
                                    <span className="text-[11px] text-stone-500">{review.rating || 5}/5</span>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-stone-600">{review.review || review.comment}</p>
                                {review.published_at && (
                                    <p className="mt-2 text-[10px] text-stone-400">
                                        Dipublikasikan {formatTanggalJam(review.published_at)}
                                    </p>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Konten Tab: Komplain */}
            {tab === 'complaint' && (
                <div className="space-y-4">
                    {complaints.length === 0 ? (
                        <EmptyState title="Belum ada komplain" />
                    ) : (
                        complaints.map((item) => (
                            <Card key={item.id} className="border p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-sm bg-stone-200/80 px-2 py-0.5 font-mono text-[11px] font-semibold">
                                            #{item.id}
                                        </span>
                                        <span className="text-[11px] text-stone-500">
                                            Booking {item.booking_number || item.booking_id}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={item.priority || 'medium'} map={PRIORITY} />
                                        <StatusBadge status={item.status || 'open'} map={COMPLAINT_STATUS} />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold">{item.subject}</h3>
                                <p className="mt-1 text-xs leading-relaxed text-stone-600">{item.description}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                                    <span className="font-semibold uppercase tracking-wider text-stone-400">
                                        Kategori: {item.category || 'Layanan'}
                                    </span>
                                    <span>&middot;</span>
                                    <span>{formatTanggalJam(item.created_at)}</span>
                                </div>
                                {item.resolution && (
                                    <div className="mt-3 border-t border-stone-100 pt-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                            Penyelesaian
                                        </p>
                                        <p className="mt-1 text-xs text-stone-600">{item.resolution}</p>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Konten Tab: Sengketa */}
            {tab === 'dispute' && (
                <div className="space-y-4">
                    {disputes.length === 0 ? (
                        <EmptyState title="Belum ada sengketa" />
                    ) : (
                        disputes.map((item) => (
                            <Card key={item.id} className="border p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-sm bg-stone-200/80 px-2 py-0.5 font-mono text-[11px] font-semibold">
                                            #{item.id}
                                        </span>
                                        <span className="text-[11px] text-stone-500">
                                            Booking {item.booking_number}
                                        </span>
                                    </div>
                                    <StatusBadge status={item.status} map={DISPUTE_STATUS} />
                                </div>
                                <h3 className="text-sm font-semibold">{item.subject}</h3>
                                <p className="mt-1 text-xs leading-relaxed text-stone-600">{item.description}</p>
                                <div className="mt-3 grid gap-2 text-[11px] text-stone-500 sm:grid-cols-3">
                                    <span className="font-semibold uppercase tracking-wider text-stone-400">
                                        Kategori: {item.category}
                                    </span>
                                    <span>
                                        Nominal sengketa:{' '}
                                        <span className="font-semibold text-[#111111]">
                                            {formatRupiah(item.refund_amount)}
                                        </span>
                                    </span>
                                    <span>{formatTanggalJam(item.created_at)}</span>
                                </div>
                                {item.resolution && (
                                    <div className="mt-3 border-t border-stone-100 pt-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                            Hasil
                                        </p>
                                        <p className="mt-1 text-xs text-stone-600">{item.resolution}</p>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </CustomerLayout>
    );
}
