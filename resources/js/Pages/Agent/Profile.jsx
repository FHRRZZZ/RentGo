import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import LocationPicker from "@/Components/LocationPicker";
import {
    StatusBadge,
    Card,
    SectionTitle,
    DataRow,
} from "@/Components/RentGo/Ui";

const ONBOARDING_STATUS = {
    incomplete: { label: 'Belum Lengkap', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    pending_review: { label: 'Menunggu Review', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const DOC_STATUS = {
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    verified: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

const formatTanggalJam = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Halaman Profil & Dokumen (Mitra).
 * Meniru skema: agent_profiles + agent_documents.
 * Props dari controller nanti: { agent, documents }
 */
function AgentProfile({ agent = {}, documents = [] }) {
    // Dokumen yang sedang dipratinjau (null = modal tertutup).
    const [previewDoc, setPreviewDoc] = useState(null);

    const initialLogoUrl = agent.logo
        ? (agent.logo.startsWith('http') ? agent.logo : `/storage/${agent.logo}`)
        : null;
    const [logoPreview, setLogoPreview] = useState(initialLogoUrl);

    const initialBannerUrl = agent.banner
        ? (agent.banner.startsWith('http') ? agent.banner : `/storage/${agent.banner}`)
        : null;
    const [bannerPreview, setBannerPreview] = useState(initialBannerUrl);

    const { data, setData, post, processing, errors } = useForm({
        agency_name: agent.agency_name || '',
        owner_name: agent.owner_name || '',
        phone: agent.phone || '',
        business_type: agent.business_type || '',
        address: agent.address || '',
        city: agent.city || '',
        province: agent.province || '',
        latitude: agent.latitude ?? null,
        longitude: agent.longitude ?? null,
        description: agent.description || '',
        logo: null,
        banner: null,
        remove_banner: false,
    });

    const update = (key, value) => setData(key, value);

    const handleLocationPicked = (loc) => {
        if (loc.latitude !== undefined) setData((prev) => ({ ...prev, latitude: loc.latitude }));
        if (loc.longitude !== undefined) setData((prev) => ({ ...prev, longitude: loc.longitude }));
        if (loc.address) setData((prev) => ({ ...prev, address: loc.address }));
        if (loc.city) setData((prev) => ({ ...prev, city: loc.city }));
        if (loc.province) setData((prev) => ({ ...prev, province: loc.province }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/mitra/profil', { preserveScroll: true });
    };

    const inputClass =
        "w-full text-sm bg-stone-50 border-stone-300 rounded-sm px-3 py-2.5 focus:bg-white focus:border-[#111] focus:outline-none transition-colors";
    const labelClass = "block text-xs font-medium text-stone-700 mb-1.5";

    return (
        <>
            <Head title="Profil & Dokumen — RentGo" />

            <SectionTitle
                kicker="Akun Mitra"
                title="Profil & Dokumen"
                description="Perbarui informasi usaha dan pastikan dokumen verifikasi tetap berlaku."
                action={
                    <div className="flex items-center gap-2 sm:gap-3">
                        {agent.id && (
                            <Link
                                href={`/mitra/${agent.id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-sm bg-[#111] text-[#F5B800] hover:bg-black transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Lihat Toko Publik</span>
                            </Link>
                        )}
                        <StatusBadge
                            status={agent.onboarding_status}
                            map={ONBOARDING_STATUS}
                            className="px-3 py-1 text-xs"
                        />
                    </div>
                }
            />

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Form profil */}
                <div className="lg:col-span-2">
                    <Card className="border p-6">
                        <h3 className="text-sm font-semibold mb-5">
                            Informasi Usaha
                        </h3>
                        <form
                            className="space-y-4"
                            onSubmit={handleSubmit}
                        >
                            {/* Upload Logo / Foto Profil Usaha */}
                            <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-sm border border-stone-200">
                                <div className="w-16 h-16 rounded-sm bg-white border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Usaha" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-stone-300 flex flex-col items-center">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-xs font-semibold text-stone-900 mb-1">
                                        Logo / Foto Profil Usaha
                                    </label>
                                    <p className="text-[11px] text-stone-500 mb-2">
                                        Format PNG, JPG, WEBP, atau SVG maks 3MB. Ditampilkan di halaman katalog & toko mitra.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData("logo", file);
                                                setLogoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#111] file:text-[#F5B800] hover:file:bg-black cursor-pointer"
                                    />
                                    {errors.logo && (
                                        <p className="text-xs text-red-600 mt-1">{errors.logo}</p>
                                    )}
                                </div>
                            </div>

                            {/* Upload Banner / Foto Sampul Header Toko */}
                            <div className="p-3 bg-stone-50 rounded-sm border border-stone-200">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-900">
                                            Banner / Foto Sampul Header Toko
                                        </label>
                                        <p className="text-[11px] text-stone-500">
                                            Format PNG, JPG, WEBP maks 5MB. Ditampilkan pada banner hitam header etalase toko mitra Anda.
                                        </p>
                                    </div>
                                    {bannerPreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData((prev) => ({ ...prev, banner: null, remove_banner: true }));
                                                setBannerPreview(null);
                                            }}
                                            className="text-[11px] font-medium text-red-600 hover:text-red-700 hover:underline shrink-0"
                                        >
                                            Hapus Banner
                                        </button>
                                    )}
                                </div>

                                {/* Banner Preview Box */}
                                <div className="relative w-full h-28 sm:h-32 rounded-sm bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] border border-stone-300 overflow-hidden mb-3 flex flex-col justify-between p-3.5">
                                    <img
                                        src={bannerPreview || "/images/mitra-banner-cars.jpg"}
                                        alt="Pratinjau Banner Toko"
                                        className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 via-45% to-black/30 pointer-events-none" />
                                    
                                    {/* Yellow corner accents */}
                                    <div className="absolute top-0 right-0 w-24 h-12 pointer-events-none overflow-hidden opacity-90">
                                        <div className="absolute -top-4 -right-4 w-20 h-10 bg-[#F5B800] -skew-x-[35deg]" />
                                        <div className="absolute -top-4 right-8 w-4 h-10 bg-[#F5B800] -skew-x-[35deg]" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-24 h-12 pointer-events-none overflow-hidden opacity-90">
                                        <div className="absolute -bottom-4 -right-4 w-20 h-10 bg-[#F5B800] -skew-x-[35deg]" />
                                        <div className="absolute -bottom-4 right-8 w-4 h-10 bg-[#F5B800] -skew-x-[35deg]" />
                                    </div>

                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-md p-1 shadow-md border border-white/40 flex items-center justify-center overflow-hidden shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-stone-900 text-[#F5B800] flex items-center justify-center font-bold text-xs rounded-xs">
                                                    RM
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center gap-1 bg-[#F5B800] text-[#111] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs">
                                                Official Partner
                                            </span>
                                            <p className="text-white font-extrabold text-xs mt-0.5 leading-tight">
                                                Mitra Resmi Penyedia <span className="text-[#F5B800]">Rental Terdaftar</span> di RentGo
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex items-center gap-3 text-[10px] text-stone-300 pt-2 border-t border-white/10">
                                        <span className="flex items-center gap-1 font-semibold text-white">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                            Aman & Terpercaya
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold text-white">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                            Kendaraan Berkualitas
                                        </span>
                                        <span className="hidden sm:flex items-center gap-1 font-semibold text-white">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                            Layanan 24 Jam
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 h-1 bg-[#F5B800]" />
                                </div>

                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setData((prev) => ({ ...prev, banner: file, remove_banner: false }));
                                                setBannerPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="text-xs text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-[#111] file:text-[#F5B800] hover:file:bg-black cursor-pointer"
                                    />
                                    {errors.banner && (
                                        <p className="text-xs text-red-600 mt-1">{errors.banner}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>
                                        Nama Badan Usaha
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.agency_name}
                                        onChange={(e) =>
                                            update(
                                                "agency_name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Nama Pemilik
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.owner_name}
                                        onChange={(e) =>
                                            update("owner_name", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Nomor Telepon
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.phone}
                                        onChange={(e) =>
                                            update("phone", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Jenis Usaha
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.business_type}
                                        onChange={(e) =>
                                            update(
                                                "business_type",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Peta Pemilih Titik Usaha (Leaflet + GPS) */}
                            <div className="pt-2">
                                <label className={labelClass}>
                                    Titik Lokasi Usaha (Peta Leaflet & Deteksi GPS Perangkat)
                                </label>
                                <p className="text-xs text-stone-500 mb-2">
                                    Gunakan tombol GPS untuk mendeteksi lokasi perangkat saat ini secara otomatis, atau klik/geser pin pada peta. Alamat dan kota akan otomatis terisi.
                                </p>
                                <div className="border border-stone-200 rounded-sm overflow-hidden shadow-xs">
                                    <LocationPicker
                                        latitude={data.latitude}
                                        longitude={data.longitude}
                                        address={data.address}
                                        city={data.city}
                                        onPick={handleLocationPicked}
                                        height={280}
                                        hintText="Klik peta atau gunakan GPS untuk menetapkan titik lokasi usaha mitra"
                                        footerText="Titik pin ini ditampilkan pada peta pencarian armada 'Sekitar Kita' di halaman utama RentGo."
                                    />
                                </div>
                                {data.latitude && data.longitude && (
                                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Pin aktif: {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setData((prev) => ({ ...prev, latitude: null, longitude: null }))}
                                            className="text-stone-400 hover:text-red-500 underline font-sans"
                                        >
                                            Reset Titik
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Alamat Lengkap</label>
                                <input
                                    className={inputClass}
                                    value={data.address}
                                    placeholder="Contoh: Jl. Diponegoro No. 45, Coblong"
                                    onChange={(e) =>
                                        update("address", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Kota</label>
                                    <input
                                        className={inputClass}
                                        value={data.city}
                                        onChange={(e) =>
                                            update("city", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Provinsi
                                    </label>
                                    <input
                                        className={inputClass}
                                        value={data.province}
                                        onChange={(e) =>
                                            update("province", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Deskripsi Usaha
                                </label>
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    value={data.description}
                                    onChange={(e) =>
                                        update("description", e.target.value)
                                    }
                                />
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors"
                                >
                                    Simpan Perubahan
                                </button>
                                <button
                                    type="button"
                                    className="text-sm font-medium border-stone-300 hover:border-[#111] text-stone-700 hover:text-black px-5 py-2.5 rounded-sm transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Dokumen */}
                    <Card className="border p-6 mt-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-semibold">
                                Dokumen Verifikasi
                            </h3>
                            <button
                                type="button"
                                className="text-xs font-semibold text-[#111] hover:underline"
                            >
                                + Unggah Dokumen
                            </button>
                        </div>
                        <div className="space-y-3">
                            {documents.length === 0 && (
                                <p className="text-xs text-stone-500 border-dashed border-stone-300 rounded-sm p-4 text-center">
                                    Belum ada dokumen verifikasi yang diunggah.
                                    Dokumen KTP &amp; NIB diunggah saat pengajuan
                                    mitra dan akan tampil di sini.
                                </p>
                            )}
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="border border-stone-200 rounded-sm p-4 flex-wrap items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-sm bg-stone-100 border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500">
                                            {doc.document_type
                                                .replace(/[^A-Za-z]/g, "")
                                                .slice(0, 3)
                                                .toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold">
                                                {doc.document_type}
                                            </p>
                                            <p className="text-[11px] text-stone-500 font-mono">
                                                {doc.document_number || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            status={doc.status}
                                            map={DOC_STATUS}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewDoc(
                                                    previewDoc?.id === doc.id
                                                        ? null
                                                        : doc,
                                                )
                                            }
                                            className="text-[11px] font-medium border-stone-300 hover:bg-stone-50 px-3 py-1.5 rounded-sm transition-colors"
                                        >
                                            {previewDoc?.id === doc.id
                                                ? "Sembunyikan"
                                                : doc.status === "pending"
                                                  ? "Lengkapi"
                                                  : "Lihat"}
                                        </button>
                                    </div>

                                    {/* Pratinjau inline: file privat hanya bisa diakses
                                        pemiliknya lewat route mitra. */}
                                    {previewDoc?.id === doc.id && (
                                        <div className="mt-4 pt-4 border-t border-stone-200 w-full">
                                            <div className="bg-stone-50 border-stone-200 rounded-sm p-2 max-h-[70vh] overflow-auto">
                                                <img
                                                    src={`/mitra/profil/dokumen/${doc.id}/file`}
                                                    alt={`Dokumen ${doc.document_type}`}
                                                    className="w-full h-auto rounded-sm"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display =
                                                            "none";
                                                        const note =
                                                            e.currentTarget.nextElementSibling;
                                                        if (note)
                                                            note.style.display =
                                                                "block";
                                                    }}
                                                />
                                                <p
                                                    style={{ display: "none" }}
                                                    className="text-xs text-stone-500 text-center py-8"
                                                >
                                                    Pratinjau gambar tidak
                                                    tersedia untuk jenis file
                                                    ini (mis. PDF).{" "}
                                                    <a
                                                        href={`/mitra/profil/dokumen/${doc.id}/file`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-semibold text-[#111] underline"
                                                    >
                                                        Buka / unduh dokumen
                                                    </a>
                                                </p>
                                            </div>
                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                <a
                                                    href={`/mitra/profil/dokumen/${doc.id}/file`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-sm transition-colors"
                                                >
                                                    Buka di tab baru
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewDoc(null)
                                                    }
                                                    className="text-[11px] font-bold bg-[#F5B800] hover:bg-[#e0a800] text-[#111] px-3 py-2 rounded-sm transition-colors"
                                                >
                                                    Tutup
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Ringkasan sisi kanan */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#111] text-[#F5B800] font-bold flex items-center justify-center">
                                {agent.agency_name?.charAt(0) || 'M'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {agent.agency_name}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                    Kode AGT-{String(agent.id).padStart(4, "0")}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-stone-100 space-y-2.5 text-xs">
                            <DataRow
                                label="Status"
                                value={
                                    ONBOARDING_STATUS[agent.onboarding_status]
                                        ?.label || "-"
                                }
                            />
                            <DataRow label="Kota" value={agent.city} />
                            <DataRow label="Provinsi" value={agent.province} />
                            <DataRow
                                label="Akun Aktif"
                                value={agent.is_active ? "Ya" : "Tidak"}
                            />
                        </div>
                    </Card>

                    <Card className="border p-5">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-3">
                            Tips Verifikasi
                        </p>
                        <ul className="space-y-2.5 text-[11px] text-stone-600 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-[#F5B800] font-bold">
                                    1.
                                </span>{" "}
                                Pastikan foto dokumen jelas dan tidak terpotong.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#F5B800] font-bold">
                                    2.
                                </span>{" "}
                                Nomor dokumen harus sesuai dengan data yang
                                diisi.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#F5B800] font-bold">
                                    3.
                                </span>{" "}
                                Dokumen kedaluwarsa akan ditolak otomatis oleh
                                sistem.
                            </li>
                        </ul>
                    </Card>

                    {documents.find((d) => d.verified_at) && (
                        <Card className="border p-5">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-3">
                                Riwayat Verifikasi
                            </p>
                            <div className="space-y-2 text-[11px] text-stone-600">
                                {documents.filter(
                                    (d) => d.verified_at,
                                ).map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between border-b border-stone-100 last:border-0 pb-2 last:pb-0"
                                    >
                                        <span>{d.document_type}</span>
                                        <span className="text-stone-400">
                                            {formatTanggalJam(d.verified_at)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

        </>
    );
}

AgentProfile.layout = (page) => (
    <AgentLayout active="/mitra/profil" title="Profil & Dokumen">
        {page}
    </AgentLayout>
);

export default AgentProfile;
