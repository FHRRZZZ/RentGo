import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, SectionTitle } from "@/Components/RentGo/Ui";

/**
 * Form tambah unit khusus Admin.
 * Admin dapat mendaftarkan unit atas nama mitra tertentu dan
 * langsung menentukan status operasional unit tersebut.
 */
export default function AdminCreateVehicle({ categories = [], mitras = [] }) {
    const [form, setForm] = useState({
        agent_profile_id: mitras[0]?.id || "",
        name: "",
        brand: "",
        model: "",
        license_plate: "",
        vehicle_category_id: categories[0]?.id || 1,
        vehicle_type: "car",
        year: new Date().getFullYear(),
        transmission: "Matic",
        seat_capacity: 5,
        fuel_type: "Bensin",
        price_per_day: "400000",
        pickup_location: "",
        description: "",
        rental_requirements: "",
        status: "pending_review",
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [documents, setDocuments] = useState({
        stnk_number: "",
        stnk_file: null,
        bpkb_number: "",
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
        payload.append("stnk_number", documents.stnk_number ?? "");
        payload.append("bpkb_number", documents.bpkb_number ?? "");
        if (documents.stnk_file) payload.append("stnk_file", documents.stnk_file);
        if (documents.bpkb_file) payload.append("bpkb_file", documents.bpkb_file);

        router.post("/admin/vehicles", payload, {
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
            <Head title="Tambah Armada Baru — Admin RentGo" />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Link
                    href="/admin/vehicles"
                    className="hover:text-black transition-colors"
                >
                    ← Kembali ke Katalog Armada
                </Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">
                    Tambah Unit Baru
                </span>
            </div>

            <SectionTitle
                kicker="Registrasi Armada"
                title="Daftarkan Unit Kendaraan Baru"
                description="Tambahkan unit ke katalog sistem dan tetapkan mitra pemiliknya. Unit berstatus pending_review harus disetujui lebih lanjut melalui halaman verifikasi."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Kepemilikan Unit */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            1. Kepemilikan & Status
                        </h3>
                        <p className="text-xs text-stone-500">
                            Mitra pemilik unit dan status publikasi awal
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Mitra Pemilik Unit{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={form.agent_profile_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        agent_profile_id: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="">— Pilih Mitra —</option>
                                {mitras.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.agency_name ||
                                            m.user?.name ||
                                            `Mitra #${m.id}`}
                                    </option>
                                ))}
                            </select>
                            {errors.agent_profile_id && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.agent_profile_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Status Operasional
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold"
                            >
                                <option value="pending_review">
                                    Menunggu Review (Pending)
                                </option>
                                <option value="available">
                                    Tersedia (Langsung Terbit)
                                </option>
                                <option value="maintenance">
                                    Dalam Perawatan
                                </option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 2. Identitas Kendaraan */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            2. Identitas & Model Kendaraan
                        </h3>
                        <p className="text-xs text-stone-500">
                            Nama model, merek, dan nomor plat registrasi resmi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nama Model Kendaraan{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Toyota Avanza 1.3 G"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {errors.name && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nomor Plat Polisi (STNK){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="B 1234 XYZ"
                                value={form.license_plate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        license_plate:
                                            e.target.value.toUpperCase(),
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none uppercase font-mono font-bold"
                            />
                            {errors.license_plate && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.license_plate}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Merek
                            </label>
                            <input
                                type="text"
                                placeholder="Toyota / Honda / Yamaha"
                                value={form.brand}
                                onChange={(e) =>
                                    setForm({ ...form, brand: e.target.value })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Model
                            </label>
                            <input
                                type="text"
                                placeholder="Avanza / Vario"
                                value={form.model}
                                onChange={(e) =>
                                    setForm({ ...form, model: e.target.value })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Tahun
                            </label>
                            <input
                                type="number"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                value={form.year}
                                onChange={(e) =>
                                    setForm({ ...form, year: e.target.value })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Jenis Kendaraan
                            </label>
                            <select
                                value={form.vehicle_type}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        vehicle_type: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="car">Mobil (Car)</option>
                                <option value="motorcycle">
                                    Sepeda Motor (Motorcycle)
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kategori Armada
                            </label>
                            <select
                                value={form.vehicle_category_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        vehicle_category_id: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 3. Spesifikasi Teknis */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            3. Spesifikasi Teknis
                        </h3>
                        <p className="text-xs text-stone-500">
                            Transmisi, kapasitas tempat duduk, dan bahan bakar
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Transmisi
                            </label>
                            <select
                                value={form.transmission}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        transmission: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="Matic">Matic</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kapasitas Kursi
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={form.seat_capacity}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        seat_capacity: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Bahan Bakar
                            </label>
                            <select
                                value={form.fuel_type}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fuel_type: e.target.value,
                                    })
                                }
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
                        <h3 className="text-sm font-bold text-[#111]">
                            4. Tarif Sewa & Lokasi Pool
                        </h3>
                        <p className="text-xs text-stone-500">
                            Harga per hari dan titik penjemputan armada
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Tarif Sewa Harian (Rp/Hari){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                step="5000"
                                value={form.price_per_day}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        price_per_day: e.target.value,
                                    })
                                }
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold text-base"
                            />
                            {errors.price_per_day && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.price_per_day}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Lokasi Penjemputan / Pool
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Jakarta Barat"
                                value={form.pickup_location}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        pickup_location: e.target.value,
                                    })
                                }
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
                            placeholder="Contoh: AC dingin, audio bluetooth, kamera mundur."
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                        />
                    </div>
                </Card>

                {/* 5. Dokumen Legal Kendaraan (STNK & BPKB) */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            5. Dokumen Legal Kendaraan (STNK & BPKB)
                        </h3>
                        <p className="text-xs text-stone-500">
                            Wajib diunggah. Format JPG, PNG, WEBP, atau PDF maks. 10 MB.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nomor STNK
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor STNK / rangka"
                                value={documents.stnk_number}
                                onChange={(e) => handleDocumentChange("stnk_number", e.target.value)}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Upload STNK <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                required
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
                                placeholder="Nomor BPKB"
                                value={documents.bpkb_number}
                                onChange={(e) => handleDocumentChange("bpkb_number", e.target.value)}
                                className="w-full text-xs bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Upload BPKB <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                required
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
                        {processing ? "Menyimpan..." : "Simpan Unit Armada"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
