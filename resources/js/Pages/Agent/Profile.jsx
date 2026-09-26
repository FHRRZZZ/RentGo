import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
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

    const { data, setData, patch, processing } = useForm({
        agency_name: agent.agency_name || '',
        owner_name: agent.owner_name || '',
        phone: agent.phone || '',
        business_type: agent.business_type || '',
        address: agent.address || '',
        city: agent.city || '',
        province: agent.province || '',
        description: agent.description || '',
    });

    const update = (key, value) => setData(key, value);

    const handleSubmit = (e) => {
        e.preventDefault();
        patch('/mitra/profil', { preserveScroll: true });
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
                    <StatusBadge
                        status={agent.onboarding_status}
                        map={ONBOARDING_STATUS}
                        className="px-3 py-1 text-xs"
                    />
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

                            <div>
                                <label className={labelClass}>Alamat</label>
                                <input
                                    className={inputClass}
                                    value={data.address}
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
