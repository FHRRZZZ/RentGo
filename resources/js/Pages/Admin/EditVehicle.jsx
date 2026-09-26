import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, SectionTitle, FailSafeImage, StatusBadge } from "@/Components/RentGo/Ui";

const VEHICLE_STATUS = {
    available: { label: "Tersedia", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rented: { label: "Disewa", color: "bg-blue-100 text-blue-800 border-blue-300" },
    booked: { label: "Dipesan", color: "bg-blue-100 text-blue-800 border-blue-300" },
    maintenance: { label: "Servis", color: "bg-amber-100 text-amber-900 border-amber-300" },
    inactive: { label: "Nonaktif", color: "bg-stone-100 text-stone-600 border-stone-300" },
    pending_review: { label: "Menunggu Review", color: "bg-purple-100 text-purple-800 border-purple-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
    draft: { label: "Draft", color: "bg-stone-100 text-stone-600 border-stone-300" },
};

/**
 * Form edit unit khusus Admin.
 * Admin dapat mengubah seluruh data unit termasuk pemilik (mitra)
 * dan status operasional secara bebas.
 */
export default function AdminEditVehicle({ vehicle = {}, categories = [], mitras = [] }) {
    const [form, setForm] = useState({
        agent_profile_id: vehicle.agent_profile_id || "",
        name: vehicle.name || "",
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        license_plate: vehicle.license_plate || "",
        vehicle_category_id: vehicle.vehicle_category_id || categories[0]?.id || 1,
        vehicle_type: vehicle.vehicle_type || "car",
        year: vehicle.year || new Date().getFullYear(),
        transmission: vehicle.transmission || "Matic",
        seat_capacity: vehicle.seat_capacity || 5,
        fuel_type: vehicle.fuel_type || "Bensin",
        price_per_day: vehicle.price_per_day || "400000",
        pickup_location: vehicle.pickup_location || "",
        description: vehicle.description || "",
        status: vehicle.status || "available",
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [documents, setDocuments] = useState({
        stnk_number: vehicle.stnk?.document_number || "",
        stnk_file: null,
        bpkb_number: vehicle.bpkb?.document_number || "",
        bpkb_file: null,
    });

    const handleDocumentChange = (field, value) => {
        setDocuments((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ""));
        payload.append("_method", "PUT");
        payload.append("stnk_number", documents.stnk_number ?? "");
        payload.append("bpkb_number", documents.bpkb_number ?? "");
        if (documents.stnk_file) payload.append("stnk_file", documents.stnk_file);
        if (documents.bpkb_file) payload.append("bpkb_file", documents.bpkb_file);

        router.post(`/admin/vehicles/${vehicle.id}`, payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <AdminLayout activeTab="vehicles">
            <Head title={`Edit ${vehicle.name} — Admin RentGo`} />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Link href="/admin/vehicles" className="hover:text-black transition-colors">
                    ← Kembali ke Katalog Armada
                </Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">Edit Unit: {vehicle.name}</span>
            </div>

            <SectionTitle
                kicker="Pembaruan Armada"
                title={`Perbarui Data: ${vehicle.name}`}
                description="Ubah spesifikasi, tarif, kepemilikan, dan status operasional unit."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Kepemilikan & Status */}
                <Card className="border p-6 space-y-4">
                    <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-[#111]">1. Kepemilikan & Status</h3>
                            <p className="text-xs text-stone-500">Mitra pemilik unit dan status publikasi</p>
                        </div>
                        {vehicle.img && (
                            <FailSafeImage
                                src={vehicle.img}
                                alt={vehicle.name}
                                className="w-14 h-14 rounded-sm object-cover border-stone-200"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Mitra Pemilik Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={form.agent_profile_id}
                                onChange={(e) => setForm({ ...form, agent_profile_id: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="">— Pilih Mitra —</option>
                                {mitras.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.agency_name || m.user?.name || `Mitra #${m.id}`}
                                    </option>
                                ))}
                            </select>
                            {errors.agent_profile_id && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.agent_profile_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Status Operasional
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold"
                            >
                                <option value="available">Tersedia</option>
                                <option value="pending_review">Menunggu Review</option>
                                <option value="maintenance">Dalam Perawatan</option>
                                <option value="inactive">Nonaktif</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="w-full">
                                <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Status saat ini</p>
                                <StatusBadge status={vehicle.status} map={VEHICLE_STATUS} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Identitas Kendaraan */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">2. Identitas & Model Kendaraan</h3>
                        <p className="text-xs text-stone-500">Nama model, merek, dan nomor plat registrasi resmi</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nama Model Kendaraan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nomor Plat Polisi (STNK) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.license_plate}
                                onChange={(e) => setForm({ ...form, license_plate: e.target.value.toUpperCase() })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none uppercase font-mono font-bold"
                            />
                            {errors.license_plate && <p className="text-[11px] text-red-500 mt-1">{errors.license_plate}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Merek</label>
                            <input
                                type="text"
                                value={form.brand}
                                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Model</label>
                            <input
                                type="text"
                                value={form.model}
                                onChange={(e) => setForm({ ...form, model: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Tahun</label>
                            <input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Jenis Kendaraan</label>
                            <select
                                value={form.vehicle_type}
                                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="car">Mobil (Car)</option>
                                <option value="motorcycle">Sepeda Motor (Motorcycle)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Armada</label>
                            <select
                                value={form.vehicle_category_id}
                                onChange={(e) => setForm({ ...form, vehicle_category_id: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 3. Spesifikasi Teknis */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">3. Spesifikasi Teknis</h3>
                        <p className="text-xs text-stone-500">Transmisi, kapasitas tempat duduk, dan bahan bakar</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Transmisi</label>
                            <select
                                value={form.transmission}
                                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="Matic">Matic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Kapasitas Kursi</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={form.seat_capacity}
                                onChange={(e) => setForm({ ...form, seat_capacity: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Bahan Bakar</label>
                            <select
                                value={form.fuel_type}
                                onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="Bensin">Bensin</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Listrik">Listrik (EV)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 4. Tarif & Lokasi */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">4. Tarif Sewa & Lokasi Pool</h3>
                        <p className="text-xs text-stone-500">Harga per hari dan titik penjemputan armada</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Tarif Sewa Harian (Rp/Hari) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                step="5000"
                                value={form.price_per_day}
                                onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold text-base"
                            />
                            {errors.price_per_day && <p className="text-[11px] text-red-500 mt-1">{errors.price_per_day}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Lokasi Penjemputan / Pool
                            </label>
                            <input
                                type="text"
                                value={form.pickup_location}
                                onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Deskripsi & Kelengkapan
                        </label>
                        <textarea
                            rows="3"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                        />
                    </div>
                </Card>

                {/* Dokumen Legal Kendaraan (STNK & BPKB) */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            Dokumen Legal Kendaraan (STNK & BPKB)
                        </h3>
                        <p className="text-xs text-stone-500">
                            Biarkan kosong jika tidak ingin mengganti dokumen yang sudah tersimpan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nomor STNK
                            </label>
                            <input
                                type="text"
                                value={documents.stnk_number}
                                onChange={(e) => handleDocumentChange("stnk_number", e.target.value)}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {vehicle.stnk?.url ? (
                                <a href={vehicle.stnk.url} target="_blank" rel="noreferrer" className="inline-block text-[11px] font-semibold text-[#b38600] underline">
                                    Lihat STNK tersimpan
                                </a>
                            ) : (
                                <p className="text-[11px] text-red-500">STNK belum tersimpan (wajib diunggah).</p>
                            )}
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Ganti STNK
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                onChange={(e) => handleDocumentChange("stnk_file", e.target.files?.[0] || null)}
                                className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-sm file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                            />
                            {errors.stnk_file && (
                                <p className="text-[11px] text-red-500">{errors.stnk_file}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nomor BPKB
                            </label>
                            <input
                                type="text"
                                value={documents.bpkb_number}
                                onChange={(e) => handleDocumentChange("bpkb_number", e.target.value)}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {vehicle.bpkb?.url ? (
                                <a href={vehicle.bpkb.url} target="_blank" rel="noreferrer" className="inline-block text-[11px] font-semibold text-[#b38600] underline">
                                    Lihat BPKB tersimpan
                                </a>
                            ) : (
                                <p className="text-[11px] text-red-500">BPKB belum tersimpan (wajib diunggah).</p>
                            )}
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Ganti BPKB
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,application/pdf"
                                onChange={(e) => handleDocumentChange("bpkb_file", e.target.files?.[0] || null)}
                                className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-sm file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                            />
                            {errors.bpkb_file && (
                                <p className="text-[11px] text-red-500">{errors.bpkb_file}</p>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/vehicles"
                        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-50"
                    >
                        {processing ? "Memperbarui..." : "Simpan Perubahan Unit"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
