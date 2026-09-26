import React, { useState, useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatusBadge, SectionTitle, FailSafeImage } from "@/Components/RentGo/Ui";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

const VEHICLE_STATUS = {
    available: { label: "Tersedia", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rented: { label: "Disewa", color: "bg-blue-100 text-blue-800 border-blue-300" },
    maintenance: { label: "Servis", color: "bg-amber-100 text-amber-900 border-amber-300" },
    inactive: { label: "Nonaktif", color: "bg-stone-100 text-stone-600 border-stone-300" },
    pending_review: { label: "Menunggu Review", color: "bg-purple-100 text-purple-800 border-purple-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function AdminVehiclesPage({
    vehicles = [],
    categories = [],
}) {
    const { flash, errors } = usePage().props;
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [inspectVehicle, setInspectVehicle] = useState(null);
    const [rejectModalVehicle, setRejectModalVehicle] = useState(null);
    const [deleteModalVehicle, setDeleteModalVehicle] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const categoryList = categories.length > 0 ? categories : [
        { id: 1, name: "City Car", slug: "city-car" },
        { id: 2, name: "MPV Keluarga", slug: "mpv" },
        { id: 3, name: "SUV Tangguh", slug: "suv" },
        { id: 4, name: "Sedan Premium", slug: "sedan" },
        { id: 5, name: "Motor Matic", slug: "matic" },
        { id: 6, name: "Motor Sport", slug: "sport" },
    ];

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((v) => {
            const matchesStatus = statusFilter === "all" ? true : v.status === statusFilter;
            const matchesSearch =
                (v.name || `${v.brand || ''} ${v.model || ''}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.license_plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.agent_name || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [vehicles, statusFilter, searchQuery]);

    const handleApprove = (vehicleId) => {
        setProcessing(true);
        // Server melakukan redirect back() sehingga Inertia otomatis memuat
        // ulang props Halaman (vehicles) setelah data tersimpan. Jangan
        // memanggil router.reload() di sini — dua request yang bertabrakan
        // membuat daftar terisi data sebelum perubahan di-commit.
        router.post(`/admin/vehicles/${vehicleId}/verify`, {
            decision: "approved",
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInspectVehicle(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectModalVehicle) return;
        setProcessing(true);
        router.post(`/admin/vehicles/${rejectModalVehicle.id}/verify`, {
            decision: "rejected",
            rejection_reason: rejectionReason || "Dokumen atau kondisi unit belum memenuhi standar kelayakan operasional.",
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalVehicle(null);
                setInspectVehicle(null);
                setRejectionReason("");
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteModalVehicle) return;
        setProcessing(true);
        router.delete(`/admin/vehicles/${deleteModalVehicle.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalVehicle(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    // Ubah status operasional unit (Tersedia / Servis / Nonaktif).
    // Endpoint update memakai UpdateVehicleRequest yang mewajibkan field inti,
    // sehingga payload dikirim lengkap dari data unit agar lolos validasi.
    const handleUpdateStatus = (vehicle, newStatus) => {
        if (!vehicle) return;
        setProcessing(true);
        router.put(`/admin/vehicles/${vehicle.id}`, {
            vehicle_category_id: vehicle.vehicle_category_id,
            vehicle_type: vehicle.vehicle_type,
            name: vehicle.name,
            license_plate: vehicle.license_plate,
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInspectVehicle(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout activeTab="vehicles">
            <Head title="Katalog & Verifikasi Armada — Admin RentGo" />

            {/* Umpan balik aksi — agar kegagalan tidak senyap */}
            {flash?.success && (
                <div className="mb-4 px-4 py-3 bg-emerald-50 border-emerald-200 text-emerald-800 text-xs font-medium rounded-sm">
                    ✓ {flash.success}
                </div>
            )}
            {(flash?.error || errors?.decision || errors?.vehicle_category_id || errors?.name || errors?.license_plate) && (
                <div className="mb-4 px-4 py-3 bg-red-50 border-red-200 text-red-800 text-xs font-medium rounded-sm">
                    ✕ {flash?.error || errors?.decision || errors?.vehicle_category_id || errors?.name || errors?.license_plate}
                </div>
            )}

            {/* Header & Kategori Ringkas */}
            <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm mb-6">
                <SectionTitle
                    kicker="Katalog & Kelayakan Operasional"
                    title="Armada Kendaraan & Validasi Unit"
                    description="Pantau seluruh unit mobil dan motor yang didaftarkan mitra. Periksa kelayakan, dan setujui penerbitan ke katalog publik."
                    action={
                        <Link
                            href="/admin/vehicles/create"
                            className="inline-flex items-center justify-center text-xs font-semibold px-4 py-2.5 rounded-sm bg-[#F5B800] hover:bg-[#e0a800] text-[#111] transition-colors shadow-xs"
                        >
                            + Tambah Unit
                        </Link>
                    }
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                    {categoryList.map((cat) => (
                        <div key={cat.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-sm text-center">
                            <p className="text-[9px] uppercase font-bold text-stone-400">{cat.slug}</p>
                            <p className="text-xs font-bold text-[#111] mt-0.5">{cat.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kontrol & Filter */}
            <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {["all", "available", "pending_review", "rented", "maintenance", "rejected"].map((st) => (
                        <button
                            key={st}
                            type="button"
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-sm capitalize transition-colors ${
                                statusFilter === st
                                    ? "bg-[#111] text-[#F5B800]"
                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                        >
                            {st === "all" ? "Semua" : (VEHICLE_STATUS[st]?.label || st)}
                        </button>
                    ))}
                </div>

                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Cari armada, plat, mitra..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm px-3 py-2 focus:bg-white focus:border-[#111] outline-none"
                    />
                </div>
            </div>

            {/* Tabel Armada */}
            <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="p-3.5">Unit & Mitra</th>
                                <th className="p-3.5">Tipe & Transmisi</th>
                                <th className="p-3.5">Plat Nomor</th>
                                <th className="p-3.5">Tarif Sewa</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-stone-400">
                                        Tidak ada kendaraan yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-stone-50/60 transition-colors">
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-3">
                                                <FailSafeImage
                                                    src={vehicle.img}
                                                    alt={vehicle.name}
                                                    className="w-10 h-10 rounded-sm object-cover border border-stone-200"
                                                />
                                                <div>
                                                    <p className="font-bold text-[#111]">{vehicle.name}</p>
                                                    <p className="text-[11px] text-stone-400">
                                                        {vehicle.agent_name || "Mitra RentGo"} · Th {vehicle.year || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            <span className="uppercase text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-sm">
                                                {vehicle.vehicle_type} · {vehicle.transmission}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-mono font-bold text-stone-800">
                                            {vehicle.license_plate}
                                        </td>
                                        <td className="p-3.5 font-semibold text-[#111]">
                                            {formatRupiah(vehicle.price_per_day)}/hari
                                        </td>
                                        <td className="p-3.5">
                                            <StatusBadge status={vehicle.status} map={VEHICLE_STATUS} />
                                        </td>
                                        <td className="p-3.5 text-right space-x-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setInspectVehicle(vehicle)}
                                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors border border-stone-200"
                                            >
                                                Detail
                                            </button>
                                            <Link
                                                href={`/admin/vehicles/${vehicle.id}/edit`}
                                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors border-stone-200"
                                            >
                                                Edit
                                            </Link>
                                            {vehicle.status === "pending_review" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled={processing}
                                                        onClick={() => handleApprove(vehicle.id)}
                                                        className="px-2.5 py-1 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold rounded-sm transition-colors"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRejectModalVehicle(vehicle)}
                                                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-sm transition-colors"
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setDeleteModalVehicle(vehicle)}
                                                className="px-2 py-1 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-sm transition-colors"
                                                title="Hapus Unit"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detail Armada */}
            {inspectVehicle && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-[#111]">{inspectVehicle.name}</h3>
                                <p className="text-xs text-stone-500">Plat: {inspectVehicle.license_plate} · Pemilik: {inspectVehicle.agent_name}</p>
                            </div>
                            <button type="button" onClick={() => setInspectVehicle(null)} className="text-stone-400 hover:text-black">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <FailSafeImage
                                src={inspectVehicle.img}
                                alt={inspectVehicle.name}
                                className="w-full h-44 object-cover rounded-sm border border-stone-200"
                            />
                            <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-sm border border-stone-200">
                                <p><strong>Kapasitas:</strong> {inspectVehicle.seat_capacity} Kursi</p>
                                <p><strong>BBM:</strong> {inspectVehicle.fuel_type}</p>
                                <p><strong>Transmisi:</strong> {inspectVehicle.transmission}</p>
                                <p><strong>Tahun:</strong> {inspectVehicle.year || "-"}</p>
                                <p><strong>Tarif Sewa:</strong> {formatRupiah(inspectVehicle.price_per_day)}/hari</p>
                                <p><strong>Lokasi:</strong> {inspectVehicle.pickup_location || "-"}</p>
                            </div>
                            {inspectVehicle.description && (
                                <div className="bg-stone-50 p-3 rounded-sm border border-stone-200">
                                    <p className="font-semibold mb-0.5">Deskripsi Unit:</p>
                                    <p className="text-stone-600 leading-relaxed">{inspectVehicle.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {inspectVehicle.status !== "available" && (
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleUpdateStatus(inspectVehicle, "available")}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-semibold"
                                    >
                                        Aktifkan (Tersedia)
                                    </button>
                                )}
                                {inspectVehicle.status !== "maintenance" && (
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleUpdateStatus(inspectVehicle, "maintenance")}
                                        className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-sm text-xs font-semibold"
                                    >
                                        Set Servis
                                    </button>
                                )}
                            </div>

                            {inspectVehicle.status === "pending_review" ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRejectModalVehicle(inspectVehicle);
                                        }}
                                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-sm text-xs font-semibold"
                                    >
                                        Tolak Unit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleApprove(inspectVehicle.id)}
                                        className="px-4 py-1.5 bg-[#F5B800] text-[#111] rounded-sm text-xs font-semibold hover:bg-[#e0a800]"
                                    >
                                        Setujui Publikasi
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setInspectVehicle(null)}
                                    className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm text-xs font-semibold"
                                >
                                    Tutup
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tolak Verifikasi */}
            {rejectModalVehicle && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-2.5">
                            <div>
                                <h3 className="text-sm font-bold text-red-700">Tolak Verifikasi Armada</h3>
                                <p className="text-xs text-stone-500">{rejectModalVehicle.name} ({rejectModalVehicle.license_plate})</p>
                            </div>
                            <button type="button" onClick={() => setRejectModalVehicle(null)} className="text-stone-400 hover:text-black">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1">Alasan Penolakan *</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Jelaskan alasan penolakan agar mitra dapat memperbaiki data atau foto unit..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalVehicle(null)}
                                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-sm font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-sm font-semibold disabled:opacity-50"
                                >
                                    {processing ? "Memproses..." : "Kirim Penolakan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Unit */}
            {deleteModalVehicle && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-md w-full p-6 text-center animate-in fade-in">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center text-xl font-bold mb-3">
                            !
                        </div>
                        <h3 className="text-base font-bold text-[#111]">Hapus Kendaraan Ini?</h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                            Apakah Anda yakin ingin menghapus unit <strong>{deleteModalVehicle.name}</strong> ({deleteModalVehicle.license_plate})? Unit yang memiliki transaksi terkait tidak dapat dihapus.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteModalVehicle(null)}
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
        </AdminLayout>
    );
}
