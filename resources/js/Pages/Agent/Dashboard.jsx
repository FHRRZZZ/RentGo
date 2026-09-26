import React from "react";
import { Head, Link } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    StatusBadge,
    Card,
    SectionTitle,
    StatCard,
    FailSafeImage,
} from "@/Components/RentGo/Ui";

const FALLBACK =
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80";

const formatRupiah = (v = 0) => `Rp ${Number(v).toLocaleString('id-ID')}`;
const formatTanggalJam = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const BOOKING_STATUS = {
    pending_payment: { label: 'Menunggu Bayar', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    waiting_agent_confirmation: { label: 'Menunggu Konfirmasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    ready_for_pickup: { label: 'Siap Diambil', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    ongoing: { label: 'Berjalan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    completed: { label: 'Selesai', color: 'bg-stone-100 text-stone-700 border-stone-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 border-red-300' },
};

const VEHICLE_STATUS = {
    available: { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rented: { label: 'Disewa', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    booked: { label: 'Dipesan', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    maintenance: { label: 'Perawatan', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    pending_review: { label: 'Menunggu Review', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    inactive: { label: 'Nonaktif', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

/**
 * Dashboard Mitra.
 * Props dari DashboardService::getMitraData():
 * { agentProfile, stats, pendingConfirmations, activeBookings }
 */
function AgentDashboard({ agentProfile = {}, stats = {}, pendingConfirmations = [], activeBookings = [] }) {
    const isApproved = agentProfile?.onboarding_status === 'approved';
    const myVehicles = agentProfile?.vehicles || [];

    return (
        <>
            <Head title="Dashboard Mitra — RentGo" />

            {/* Sambutan */}
            <Card className="p-6 border mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <span className="text-[#F5B800] text-[10px] font-bold uppercase tracking-[0.16em]">
                            Selamat datang kembali
                        </span>
                        <h2 className="text-lg font-semibold tracking-tight text-[#111] mt-1.5">
                            {agentProfile?.agency_name || 'Mitra RentGo'}
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                            {agentProfile?.user?.name} · {agentProfile?.city}, {agentProfile?.province}
                        </p>
                    </div>
                    {isApproved ? (
                        <Link
                            href="/mitra/unit"
                            className="inline-flex items-center justify-center bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
                        >
                            + Tambah Unit
                        </Link>
                    ) : (
                        <Link
                            href="/mitra/unit"
                            className="inline-flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 border border-stone-300 text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
                        >
                            + Tambah Unit (Terkunci)
                        </Link>
                    )}
                </div>
            </Card>

            {/* Statistik */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Unit"
                    value={stats.total_vehicles || 0}
                    hint="Terdaftar di akun Anda"
                />
                <StatCard
                    label="Unit Tersedia"
                    value={stats.active_vehicles || 0}
                    hint="Siap disewa"
                />
                <StatCard
                    label="Perlu Konfirmasi"
                    value={pendingConfirmations.length}
                    hint="Pesanan menunggu konfirmasi"
                    accent
                />
                <StatCard
                    label="Pendapatan Bulan Ini"
                    value={formatRupiah(stats.monthly_revenue || 0)}
                    hint="Setelah komisi"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Pesanan perlu aksi */}
                <div className="lg:col-span-2">
                    <SectionTitle
                        kicker="Tindakan Diperlukan"
                        title="Pesanan Menunggu Konfirmasi"
                        description="Tanggapi cepat agar penyewa tidak membatalkan pesanan."
                        action={
                            <Link
                                href="/mitra/pesanan"
                                className="text-xs font-semibold text-[#111] hover:underline"
                            >
                                Lihat semua
                            </Link>
                        }
                    />
                    <div className="space-y-3">
                        {pendingConfirmations.length === 0 ? (
                            <Card className="border p-6 text-center text-xs text-stone-400">
                                Tidak ada pesanan yang perlu tindakan.
                            </Card>
                        ) : (
                            pendingConfirmations.map((booking) => {
                                const vehicle = booking.items?.[0]?.vehicle;
                                return (
                                    <Card
                                        key={booking.id}
                                        className="border p-4 flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-semibold bg-stone-100 px-2 py-0.5 rounded-sm">
                                                    {booking.booking_number}
                                                </span>
                                                <StatusBadge
                                                    status={booking.status}
                                                    map={BOOKING_STATUS}
                                                />
                                            </div>
                                            <p className="text-sm font-semibold mt-1.5 truncate">
                                                {vehicle?.name || 'Unit Kendaraan'}
                                            </p>
                                            <p className="text-[11px] text-stone-500">
                                                {booking.customer?.name} ·{" "}
                                                {formatTanggalJam(booking.rental_start)}
                                            </p>
                                        </div>
                                        <Link
                                            href="/mitra/pesanan"
                                            className="shrink-0 text-xs font-semibold bg-[#111] text-[#F5B800] px-3 py-2 rounded-sm hover:bg-black"
                                        >
                                            Tanggapi
                                        </Link>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pencairan + Unit ringkas */}
                <div className="space-y-6">
                    <div>
                        <SectionTitle kicker="Keuangan" title="Saldo Pencairan" />
                        <Card className="border p-5">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                Menunggu Pencairan
                            </p>
                            <p className="text-xl font-semibold mt-1">
                                {formatRupiah(stats.pending_payout || 0)}
                            </p>
                            <Link
                                href="/mitra/pendapatan"
                                className="mt-4 block text-center text-xs font-semibold border-stone-300 hover:border-[#111] text-stone-700 hover:text-black py-2 rounded-sm transition-colors"
                            >
                                Kelola Pendapatan
                            </Link>
                        </Card>
                    </div>

                    <div>
                        <SectionTitle kicker="Armada" title="Unit Anda" />
                        <Card className="border divide-y divide-stone-100">
                            {myVehicles.length === 0 ? (
                                <p className="p-4 text-xs text-stone-400 text-center">Belum ada unit terdaftar.</p>
                            ) : (
                                myVehicles.slice(0, 3).map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="p-3 flex items-center gap-3"
                                    >
                                        <div className="w-12 h-10 rounded-sm overflow-hidden bg-stone-100 shrink-0">
                                            <FailSafeImage
                                                src={vehicle.photos?.[0]?.photo_path ? `/storage/${vehicle.photos[0].photo_path}` : FALLBACK}
                                                alt={vehicle.name}
                                                fallback={FALLBACK}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold truncate">
                                                {vehicle.name}
                                            </p>
                                            <p className="text-[10px] text-stone-400 font-mono">
                                                {vehicle.license_plate}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            status={vehicle.status}
                                            map={VEHICLE_STATUS}
                                        />
                                    </div>
                                ))
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AgentDashboard.layout = (page) => (
    <AgentLayout active="/mitra" title="Dashboard Mitra">
        {page}
    </AgentLayout>
);

export default AgentDashboard;
