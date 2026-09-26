import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { StatusBadge, SectionTitle, Card, DataRow, StatCard } from '@/Components/RentGo/Ui';

const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);

const DOC_STATUS = {
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const ONBOARDING_STATUS = {
    pending: { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Aktif / Disetujui', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

export default function ProfileIndex({
    auth = {},
    role = 'customer',
    customerProfile = null,
    agentProfile = null,
    customerDocuments = [],
    agentDocuments = [],
    agentStats = null,
}) {
    const userRole = auth?.user?.role || role;
    const [activeRole, setActiveRole] = useState(userRole === 'mitra' ? 'agent' : 'customer');

    const isAgent = activeRole === 'agent';
    const profile = isAgent
        ? agentProfile || {
              agency_name: auth?.user?.name || 'Mitra RentGo',
              owner_name: auth?.user?.name || '-',
              phone: auth?.user?.phone || '-',
              business_type: 'Perorangan',
              city: 'Jakarta',
              province: 'DKI Jakarta',
              address: 'Kantor Mitra RentGo',
              onboarding_status: 'approved',
              description: 'Mitra rental kendaraan terpercaya',
          }
        : customerProfile || {
              name: auth?.user?.name || 'Customer',
              phone: auth?.user?.phone || '-',
              identity_number: '-',
              date_of_birth: '-',
              city: 'Jakarta',
              province: 'DKI Jakarta',
              address: 'Alamat tempat tinggal',
              is_active: true,
          };

    const documents = isAgent ? (agentDocuments || []) : (customerDocuments || []);
    const stats = agentStats || {
        total_vehicles: 0,
        available: 0,
        rented: 0,
        monthly_revenue: 0,
        pending_payout: 0,
        pending_bookings: 0,
    };

    return (
        <CustomerLayout auth={auth} activeNav="profil" backHref="/" backLabel="Beranda">
            <Head title="Profil & Dokumen - RentGo" />

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <span className="h-2 w-2 bg-[#F5B800]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                            Akun Saya
                        </span>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-[#111111]">Profil &amp; Dokumen</h1>
                    <p className="mt-1 text-xs text-stone-500">
                        Kelola data pribadi dan kelengkapan dokumen untuk memenuhi syarat penyewaan.
                    </p>
                </div>

                {/* Toggle Role */}
                <div className="flex items-center gap-1 rounded-sm border border-stone-200 bg-stone-100 p-1">
                    {[
                        { id: 'customer', label: 'Sebagai Penyewa' },
                        { id: 'agent', label: 'Sebagai Mitra' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveRole(item.id)}
                            className={`rounded-sm px-3.5 py-2 text-xs font-medium transition-colors ${
                                activeRole === item.id
                                    ? 'bg-[#111111] text-[#F5B800]'
                                    : 'text-stone-600 hover:text-[#111111]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards (Mitra only) */}
            {isAgent && (
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Total Unit" value={stats.total_vehicles} />
                    <StatCard label="Unit Tersedia" value={stats.available} />
                    <StatCard label="Sedang Disewa" value={stats.rented} />
                    <StatCard
                        label="Pendapatan Bulan Ini"
                        value={formatRupiah(stats.monthly_revenue)}
                        accent
                    />
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Kartu Identitas */}
                <Card className="border p-5 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-lg font-bold text-[#F5B800]">
                            {(isAgent ? profile.agency_name : auth?.user?.name || 'P').charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {isAgent ? profile.agency_name : auth?.user?.name || 'Nama Penyewa'}
                            </p>
                            <p className="text-[11px] text-stone-500">
                                {isAgent ? profile.owner_name : 'Penyewa RentGo'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        {isAgent ? (
                            <StatusBadge status={profile.onboarding_status} map={ONBOARDING_STATUS} />
                        ) : (
                            <StatusBadge
                                status={profile.is_active ? 'approved' : 'rejected'}
                                map={{
                                    approved: { label: 'Akun Aktif', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                                    rejected: { label: 'Nonaktif', color: 'bg-red-100 text-red-800 border-red-300' },
                                }}
                            />
                        )}
                    </div>

                    <div className="mt-5 space-y-2.5 border-t border-stone-200 pt-5 text-xs">
                        <DataRow label="Telepon" value={profile.phone || '-'} />
                        {isAgent ? (
                            <>
                                <DataRow label="Jenis Usaha" value={profile.business_type} />
                                <DataRow label="Kota" value={`${profile.city}, ${profile.province}`} />
                                <DataRow label="Kode Mitra" value={`AGT-${String(profile.id || 1).padStart(4, '0')}`} />
                            </>
                        ) : (
                            <>
                                <DataRow label="Nomor Identitas" value={profile.identity_number || '-'} />
                                <DataRow label="Tanggal Lahir" value={profile.date_of_birth || '-'} />
                                <DataRow label="Kota" value={`${profile.city}, ${profile.province}`} />
                            </>
                        )}
                    </div>

                    {isAgent && (
                        <div className="mt-5 space-y-2.5 border-t border-stone-200 pt-5 text-xs">
                            <DataRow label="Pendapatan Bersih" value={formatRupiah(stats.monthly_revenue)} />
                            <DataRow label="Pencairan Tertunda" value={formatRupiah(stats.pending_payout)} />
                            <DataRow label="Pesanan Perlu Aksi" value={`${stats.pending_bookings} pesanan`} />
                        </div>
                    )}
                </Card>

                {/* Dokumen & Info */}
                <div className="space-y-6 lg:col-span-2">
                    <Card className="border p-5">
                        <SectionTitle
                            kicker="Kelengkapan"
                            title="Dokumen Verifikasi"
                            description={
                                isAgent
                                    ? 'Dokumen usaha yang diverifikasi tim RentGo sebelum unit dapat tayang.'
                                    : 'Dokumen identitas yang wajib terverifikasi untuk menyewa unit.'
                            }
                        />
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-stone-200 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-stone-200 bg-stone-100 text-[10px] font-bold text-stone-500">
                                            {doc.document_type.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">{doc.document_type}</p>
                                            <p className="font-mono text-[11px] text-stone-500">
                                                {doc.document_number || '-'}
                                            </p>
                                            {doc.expires_at && (
                                                <p className="mt-0.5 text-[10px] text-stone-400">
                                                    Berlaku s/d {doc.expires_at}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={doc.status} map={DOC_STATUS} />
                                        <button
                                            type="button"
                                            className="rounded-sm border border-stone-300 px-3 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-stone-50"
                                        >
                                            {doc.status === 'pending' ? 'Lengkapi' : 'Lihat'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[11px] text-stone-400">
                            Dokumen diverifikasi maksimal 1&times;24 jam kerja. Status akan diperbarui otomatis.
                        </p>
                    </Card>

                    {isAgent ? (
                        <Card className="border p-5">
                            <SectionTitle kicker="Profil Usaha" title="Informasi Mitra" />
                            <div className="space-y-2.5 text-xs">
                                <DataRow label="Nama Badan Usaha" value={profile.agency_name} />
                                <DataRow label="Nama Pemilik" value={profile.owner_name} />
                                <DataRow label="Alamat" value={profile.address} />
                                <DataRow label="Kota" value={profile.city} />
                                <DataRow label="Provinsi" value={profile.province} />
                            </div>
                            <p className="mt-3 border-t border-stone-100 pt-3 text-xs leading-relaxed text-stone-600">
                                {profile.description}
                            </p>
                        </Card>
                    ) : (
                        <Card className="border p-5">
                            <SectionTitle kicker="Alamat" title="Data Tempat Tinggal" />
                            <div className="space-y-2.5 text-xs">
                                <DataRow label="Alamat" value={profile.address} />
                                <DataRow label="Kota" value={profile.city} />
                                <DataRow label="Provinsi" value={profile.province} />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
