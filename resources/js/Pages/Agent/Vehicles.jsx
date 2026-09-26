import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    StatusBadge,
    Card,
    SectionTitle,
    EmptyState,
    FailSafeImage,
} from "@/Components/RentGo/Ui";

const formatRupiah = (v = 0) => `Rp ${Number(v).toLocaleString('id-ID')}`;

const VEHICLE_STATUS = {
    draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    pending_review: { label: 'Menunggu Review', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    available: { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    booked: { label: 'Dipesan', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    rented: { label: 'Disewa', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    maintenance: { label: 'Perawatan', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    inactive: { label: 'Nonaktif', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const FALLBACK =
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80";

const FILTERS = [
    { id: "all", label: "Semua" },
    { id: "available", label: "Tersedia" },
    { id: "pending_review", label: "Menunggu Review" },
    { id: "rented", label: "Disewa" },
    { id: "booked", label: "Dipesan" },
    { id: "maintenance", label: "Perawatan" },
    { id: "inactive", label: "Nonaktif" },
];

export default function AgentVehicles({ vehicles = [], agentProfile = {}, categories = [], compliance = null }) {
    const isApproved = agentProfile?.onboarding_status === 'approved';
    const complianceBlocked = compliance !== null && compliance?.complete === false;
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");
    const [lockModalOpen, setLockModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [processing, setProcessing] = useState(false);

    const categoryById = (id) => categories.find((c) => c.id === Number(id));

    const visible = useMemo(() => {
        return vehicles.filter((v) => {
            const matchFilter = filter === "all" || v.status === filter;
            const matchQuery =
                !query ||
                `${v.name} ${v.license_plate} ${v.brand} ${v.model}`
                    .toLowerCase()
                    .includes(query.toLowerCase());
            return matchFilter && matchQuery;
        });
    }, [vehicles, filter, query]);

    // Tambah unit â†’ arahkan ke halaman formulir khusus (/mitra/unit/tambah).
    const handleAddClick = () => {
        if (!isApproved) {
            setLockModalOpen(true);
            return;
        }
        router.visit("/mitra/unit/tambah");
    };

    // Edit unit â†’ arahkan ke halaman edit khusus (/mitra/unit/{id}/edit).
    const handleEditClick = (vehicle) => {
        if (!isApproved) {
            setLockModalOpen(true);
            return;
        }
        router.visit(`/mitra/unit/${vehicle.id}/edit`);
    };

    const handleStatusClick = (vehicle) => {
        if (!isApproved) {
            setLockModalOpen(true);
            return;
        }
        setSelectedVehicle(vehicle);
        setStatusModalOpen(true);
    };

    const handleDeleteClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setDeleteModalOpen(true);
    };

    const handleQuickStatusChange = (newStatus) => {
        if (!selectedVehicle) return;
        setProcessing(true);
        router.put(`/mitra/unit/${selectedVehicle.id}`, {
            vehicle_category_id: selectedVehicle.vehicle_category_id,
            vehicle_type: selectedVehicle.vehicle_type,
            name: selectedVehicle.name,
            license_plate: selectedVehicle.license_plate,
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setStatusModalOpen(false);
                setSelectedVehicle(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleDeleteConfirm = () => {
        if (!selectedVehicle) return;
        setProcessing(true);
        router.delete(`/mitra/unit/${selectedVehicle.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedVehicle(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Kelola Unit â€” RentGo" />

            <SectionTitle
                kicker="Armada Anda"
                title="Kelola Unit"
                description="Atur ketersediaan, harga harian, dan status tiap kendaraan Anda."
                action={
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className={`inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-sm transition-all shadow-xs ${
                            isApproved
                                ? "bg-[#F5B800] hover:bg-[#e0a800] text-[#111]"
                                : "bg-stone-200 hover:bg-stone-300 text-stone-600 border border-stone-300 cursor-not-allowed"
                        }`}
                        title={isApproved ? "Tambah armada baru" : "Terkunci: Menunggu persetujuan admin"}
                    >
                        {isApproved ? "+ Tambah Unit" : "+ Tambah Unit (Terkunci)"}
                    </button>
                }
            />

            {/* Banner Kunci jika belum disetujui */}
            {!isApproved && (
                <div className="mb-6 bg-white border border-amber-300 rounded-sm p-4 flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-sm bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-sm">
                        !
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                                Operasi CRUD Unit Armada Terkunci
                            </h4>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-xs border border-amber-200">
                                Verifikasi Diperlukan
                            </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Akun kemitraan Anda masih berstatus <strong>Menunggu Persetujuan Admin</strong>. Anda dapat melihat daftar armada, namun fitur <strong>Tambah Unit Baru, Edit Data, dan Pengaturan Ketersediaan</strong> dikunci sampai akun resmi disetujui Administrator RentGo.
                        </p>

                        {complianceBlocked && (
                            <div className="mt-3 rounded-sm border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                                <p className="font-bold uppercase tracking-wider mb-1">
                                    Persyaratan pengajuan mitra belum lengkap
                                </p>
                                <ul className="list-disc pl-4 space-y-0.5">
                                    {(compliance?.messages || []).map((msg, idx) => (
                                        <li key={idx}>{msg}</li>
                                    ))}
                                </ul>
                                <a
                                    href="/mitra/profil"
                                    className="mt-2 inline-block font-bold text-[#111] underline"
                                >
                                    Lengkapi data & dokumen mitra
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ringkasan status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    ["Total Unit", vehicles.length],
                    ["Tersedia", vehicles.filter((v) => v.status === "available").length],
                    ["Disewa/Dipesan", vehicles.filter((v) => ["rented", "booked"].includes(v.status)).length],
                    ["Perawatan", vehicles.filter((v) => v.status === "maintenance").length],
                ].map(([label, value]) => (
                    <Card key={label} className="border p-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                            {label}
                        </p>
                        <p className="text-xl font-semibold mt-1">{value}</p>
                    </Card>
                ))}
            </div>

            {/* Filter + pencarian */}
            <Card className="border p-3 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-sm flex-1">
                        {FILTERS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-sm transition-colors ${
                                    filter === item.id
                                        ? "bg-[#111] text-[#F5B800]"
                                        : "text-stone-600 hover:text-black"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari nama / plat nomor"
                        className="w-full sm:w-60 text-xs bg-stone-50 border-stone-300 rounded-sm px-3 py-2 focus:bg-white focus:border-[#111] focus:outline-none transition-colors"
                    />
                </div>
            </Card>

            {visible.length === 0 ? (
                <EmptyState
                    title="Tidak ada unit yang cocok"
                    description="Ubah filter atau tambahkan unit baru ke armada Anda."
                />
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visible.map((vehicle) => (
                        <Card
                            key={vehicle.id}
                            className="border overflow-hidden flex-col"
                        >
                            <div className="h-44 bg-stone-100 relative">
                                <FailSafeImage
                                    src={vehicle.img}
                                    alt={vehicle.name}
                                    fallback={FALLBACK}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute top-3 left-3">
                                    <StatusBadge
                                        status={vehicle.status}
                                        map={VEHICLE_STATUS}
                                    />
                                </span>
                                <span className="absolute top-3 right-3 bg-[#111] text-[#F5B800] text-[10px] font-bold px-2 py-1 rounded-sm font-mono">
                                    {vehicle.license_plate}
                                </span>
                            </div>

                            <div className="p-4 flex-col flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-stone-400 font-mono">
                                            UNIT-{String(vehicle.id).padStart(3, "0")}
                                        </p>
                                        <h3 className="text-sm font-semibold mt-0.5 leading-tight">
                                            {vehicle.name}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-semibold text-stone-500 shrink-0">
                                        {categoryById(vehicle.vehicle_category_id)?.name || vehicle.category_name}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] text-stone-600">
                                    <span className="border border-stone-200 bg-stone-50 rounded-xs px-2 py-0.5">
                                        {vehicle.transmission}
                                    </span>
                                    <span className="border border-stone-200 bg-stone-50 rounded-xs px-2 py-0.5">
                                        {vehicle.seat_capacity} {vehicle.vehicle_type === "car" ? "Kursi" : "Orang"}
                                    </span>
                                    <span className="border border-stone-200 bg-stone-50 rounded-xs px-2 py-0.5">
                                        {vehicle.fuel_type}
                                    </span>
                                    {vehicle.year && (
                                        <span className="border border-stone-200 bg-stone-50 rounded-xs px-2 py-0.5">
                                            Th {vehicle.year}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-stone-100 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] text-stone-400">Harga harian</p>
                                        <p className="text-sm font-bold text-[#111]">
                                            {formatRupiah(vehicle.price_per_day)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleEditClick(vehicle)}
                                            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-sm transition-colors border ${
                                                isApproved
                                                    ? "border-stone-300 hover:bg-stone-100 text-stone-700"
                                                    : "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed"
                                            }`}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatusClick(vehicle)}
                                            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-sm transition-colors ${
                                                isApproved
                                                    ? "bg-[#111] text-[#F5B800] hover:bg-black"
                                                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                                            }`}
                                        >
                                            Status
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(vehicle)}
                                            className="text-[11px] font-semibold px-2 py-1.5 rounded-sm text-red-600 hover:bg-red-50 transition-colors"
                                            title="Hapus Unit"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Quick Status */}
            {statusModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                            <div>
                                <h3 className="text-sm font-bold text-[#111]">Atur Status Unit</h3>
                                <p className="text-xs text-stone-500">{selectedVehicle.name} ({selectedVehicle.license_plate})</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStatusModalOpen(false)}
                                className="text-stone-400 hover:text-black"
                            >
                                âœ•
                            </button>
                        </div>

                        <p className="text-xs text-stone-600">
                            Pilih status ketersediaan unit untuk mengatur apakah unit dapat dipesan oleh customer saat ini:
                        </p>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => handleQuickStatusChange("available")}
                                className="w-full flex items-center justify-between p-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-sm text-xs font-semibold text-emerald-900 transition-colors text-left"
                            >
                                <span>Siap Disewa (Tersedia)</span>
                                <span className="text-[10px] text-emerald-700">Tampil di pencarian</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickStatusChange("maintenance")}
                                className="w-full flex items-center justify-between p-3 border border-orange-300 bg-orange-50 hover:bg-orange-100 rounded-sm text-xs font-semibold text-orange-900 transition-colors text-left"
                            >
                                <span>Dalam Servis / Perawatan</span>
                                <span className="text-[10px] text-orange-700">Disembunyikan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickStatusChange("inactive")}
                                className="w-full flex items-center justify-between p-3 border border-stone-300 bg-stone-50 hover:bg-stone-100 rounded-sm text-xs font-semibold text-stone-700 transition-colors text-left"
                            >
                                <span>Nonaktifkan Sementara</span>
                                <span className="text-[10px] text-stone-500">Tidak disewakan</span>
                            </button>
                        </div>

                        <div className="pt-2 border-t border-stone-100 text-right">
                            <button
                                type="button"
                                onClick={() => setStatusModalOpen(false)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Unit */}
            {deleteModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center text-xl font-bold mb-3">
                            !
                        </div>
                        <h3 className="text-base font-bold text-[#111]">Hapus Kendaraan Ini?</h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                            Apakah Anda yakin ingin menghapus <strong>{selectedVehicle.name}</strong> ({selectedVehicle.license_plate}) dari armada Anda? Unit yang sudah pernah memiliki riwayat transaksi tidak dapat dihapus.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm disabled:opacity-50"
                            >
                                {processing ? "Menghapus..." : "Ya, Hapus Unit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Peringatan Akses Terkunci */}
            {lockModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95">
                        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center text-2xl font-bold mb-4">
                            !
                        </div>
                        <h3 className="text-base font-bold text-[#111]">Fitur Unit Terkunci</h3>
                        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                            Sebagai mitra baru, Anda harus mendapatkan <strong>persetujuan (approval) resmi dari Administrator RentGo</strong> sebelum dapat menambah, mengedit, atau mengaktifkan unit armada.
                        </p>

                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-sm text-left text-xs text-amber-900 space-y-1">
                            <p className="font-semibold">Syarat Pembukaan Akses:</p>
                            <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                                <li>Admin meninjau identitas badan usaha</li>
                                <li>Dokumen profil kemitraan telah disetujui</li>
                            </ul>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setLockModalOpen(false)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm"
                            >
                                Tutup
                            </button>
                            <Link
                                href="/mitra/profil"
                                className="px-4 py-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold rounded-sm"
                            >
                                Cek Profil Saya
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

AgentVehicles.layout = (page) => (
    <AgentLayout active="/mitra/unit" title="Kelola Unit">
        {page}
    </AgentLayout>
);
