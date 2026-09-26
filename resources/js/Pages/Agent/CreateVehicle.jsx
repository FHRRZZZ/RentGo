import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import { Card, SectionTitle } from "@/Components/RentGo/Ui";

export default function CreateVehicle({ categories = [], agentProfile = {} }) {
    const isApproved = agentProfile?.onboarding_status === "approved";

    const [form, setForm] = useState({
        name: "",
        brand: "Toyota",
        model: "",
        license_plate: "",
        vehicle_category_id: categories[0]?.id || 1,
        vehicle_type: "car",
        year: new Date().getFullYear(),
        transmission: "Matic",
        seat_capacity: 5,
        fuel_type: "Bensin",
        price_per_day: "400000",
        pickup_location: agentProfile?.city || "Pool Utama",
        description: "",
        rental_requirements: "",
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [mediaFiles, setMediaFiles] = useState([]);
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
        mediaFiles.forEach((file) => payload.append("photos[]", file));
        payload.append("stnk_number", documents.stnk_number ?? "");
        payload.append("bpkb_number", documents.bpkb_number ?? "");
        if (documents.stnk_file) payload.append("stnk_file", documents.stnk_file);
        if (documents.bpkb_file) payload.append("bpkb_file", documents.bpkb_file);

        router.post("/mitra/unit", payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <>
            <Head title="Tambah Unit Baru — RentGo" />

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Link href="/mitra/unit" className="hover:text-black transition-colors flex items-center gap-1">
                    <span>← Kembali ke Kelola Unit</span>
                </Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">Pendaftaran Unit Baru</span>
            </div>

            <SectionTitle
                kicker="Formulir Armada"
                title="Daftarkan Unit Kendaraan Baru"
                description="Lengkapi spesifikasi teknis, nomor polisi, dan tarif sewa harian untuk ditinjau oleh Administrator."
            />

            {!isApproved && (
                <div className="mb-6 bg-white border border-amber-300 rounded-sm p-4 flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-sm bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-sm">
                        !
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                            Pendaftaran Unit Dibatasi
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Akun kemitraan Anda masih berstatus <strong>Menunggu Persetujuan Admin</strong>. Unit yang Anda daftarkan baru akan dapat diaktifkan setelah akun kemitraan resmi disetujui.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Informasi Dasar Kendaraan */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">1. Identitas & Model Kendaraan</h3>
                        <p className="text-xs text-stone-500">Nama lengkap dan nomor plat registrasi resmi</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nama Model Kendaraan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Toyota Avanza 1.3 G"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
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
                                placeholder="B 1234 XYZ"
                                value={form.license_plate}
                                onChange={(e) => setForm({ ...form, license_plate: e.target.value.toUpperCase() })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none uppercase font-mono font-bold"
                            />
                            {errors.license_plate && <p className="text-[11px] text-red-500 mt-1">{errors.license_plate}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Jenis Kendaraan
                            </label>
                            <select
                                value={form.vehicle_type}
                                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="car">Mobil (Car)</option>
                                <option value="motorcycle">Sepeda Motor (Motorcycle)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kategori Armada
                            </label>
                            <select
                                value={form.vehicle_category_id}
                                onChange={(e) => setForm({ ...form, vehicle_category_id: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                {categories.length === 0 && (
                                    <option value="">- Tidak ada kategori tersedia -</option>
                                )}
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.vehicle_category_id && (
                                <p className="text-[11px] text-red-500 mt-1">{errors.vehicle_category_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Tahun Pembuatan
                            </label>
                            <input
                                type="number"
                                min="2010"
                                max={new Date().getFullYear() + 1}
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. Spesifikasi Teknis */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">2. Spesifikasi Teknis</h3>
                        <p className="text-xs text-stone-500">Transmisi, kapasitas tempat duduk, dan konsumsi BBM</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Transmisi
                            </label>
                            <select
                                value={form.transmission}
                                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="Matic">Matic (Otomatis)</option>
                                <option value="Manual">Manual</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kapasitas Kursi / Penumpang
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={form.seat_capacity}
                                onChange={(e) => setForm({ ...form, seat_capacity: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Jenis Bahan Bakar
                            </label>
                            <select
                                value={form.fuel_type}
                                onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            >
                                <option value="Bensin">Bensin (Pertalite / Pertamax)</option>
                                <option value="Diesel">Diesel (Solar / Dexlite)</option>
                                <option value="Listrik">Listrik (EV Battery)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* 3. Tarif & Lokasi Penjemputan */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">3. Tarif Sewa & Alamat Pool</h3>
                        <p className="text-xs text-stone-500">Harga per hari dan titik serah terima armada</p>
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
                                placeholder="400000"
                                value={form.price_per_day}
                                onChange={(e) => setForm({ ...form, price_per_day: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold text-base"
                            />
                            {errors.price_per_day && <p className="text-[11px] text-red-500 mt-1">{errors.price_per_day}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Lokasi Penjemputan / Pool Garasi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Jakarta Barat / Stasiun Gambir"
                                value={form.pickup_location}
                                onChange={(e) => setForm({ ...form, pickup_location: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Fasilitas & Keterangan Tambahan
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Contoh: AC dingin double blower, kamera parkir, audio bluetooth, 2 helm SNI & jas hujan (untuk motor)."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                        />
                    </div>
                </Card>

                {/* 4. Dokumen Legal Kendaraan (STNK & BPKB) */}
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">4. Dokumen Legal Kendaraan (STNK & BPKB)</h3>
                        <p className="text-xs text-stone-500">Wajib diunggah sebagai bukti kepemilikan dan legalitas unit. Format JPG, PNG, WEBP, atau PDF maks. 10 MB.</p>
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
                            {errors.stnk_file && <p className="text-[11px] text-red-500">{errors.stnk_file}</p>}
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
                            {errors.bpkb_file && <p className="text-[11px] text-red-500">{errors.bpkb_file}</p>}
                        </div>
                    </div>
                </Card>

                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">5. Foto & Video Unit</h3>
                        <p className="text-xs text-stone-500">Upload beberapa foto atau video kondisi kendaraan sekaligus.</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                        onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                        className="block w-full text-xs text-stone-600 file:mr-3 file:rounded-sm file:border-0 file:bg-[#111] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                    />
                    {mediaFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {mediaFiles.map((file) => (
                                <div key={`${file.name}-${file.lastModified}`} className="overflow-hidden border border-stone-200 bg-stone-50 p-2 text-[10px] text-stone-600">
                                    <p className="truncate font-semibold">{file.name}</p>
                                    <p>{file.type.startsWith("video/") ? "Video" : "Foto"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.photos && <p className="text-[11px] text-red-500">{errors.photos}</p>}
                </Card>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/mitra/unit"
                        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-50"
                    >
                        {processing ? "Mendaftarkan..." : "Daftarkan Unit Kendaraan"}
                    </button>
                </div>
            </form>
        </>
    );
}

CreateVehicle.layout = (page) => (
    <AgentLayout active="/mitra/unit" title="Tambah Unit">
        {page}
    </AgentLayout>
);
