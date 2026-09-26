import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import LocationPicker from "@/Components/LocationPicker";

const FIELD_CLASS =
    "w-full text-sm bg-stone-50 border-stone-300 rounded-sm px-3 py-2.5 focus:bg-white focus:border-[#111] outline-none transition-colors";
const LABEL_CLASS = "block text-xs font-semibold text-stone-700 mb-1.5";

const ONBOARDING_STATUS = {
    pending_verification: {
        label: "Menunggu Verifikasi",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    approved: {
        label: "Disetujui",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
    },
    suspended: {
        label: "Ditangguhkan",
        color: "bg-stone-200 text-stone-700 border-stone-300",
    },
};

/**
 * Halaman pengajuan menjadi mitra.
 *
 * Customer mengisi data usaha dan mengunggah dokumen legal (KTP & NIB)
 * sebelum pengajuan diverifikasi oleh admin.
 */
export default function MitraApply({
    agentProfile = null,
    documents = [],
    compliance = null,
}) {
    const { auth } = usePage().props;
    const isMitra = auth?.user?.role === "mitra";

    const [form, setForm] = useState({
        agency_name: agentProfile?.agency_name || "",
        owner_name: auth?.user?.name || "",
        phone: agentProfile?.phone || "",
        business_type: agentProfile?.business_type || "Perorangan",
        address: agentProfile?.address || "",
        city: agentProfile?.city || "",
        province: agentProfile?.province || "",
        latitude: agentProfile?.latitude ?? "",
        longitude: agentProfile?.longitude ?? "",
        description: agentProfile?.description || "",
        bank_name: agentProfile?.bank_name || "",
        bank_account_number: agentProfile?.bank_account_number || "",
        bank_account_name: agentProfile?.bank_account_name || "",
        ktp_number: "",
        nib_number: "",
    });

    const [ktpFile, setKtpFile] = useState(null);
    const [nibFile, setNibFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const status = agentProfile?.onboarding_status;
    const alreadyApplied = !!agentProfile && status !== "rejected";

    const update = (key, value) => setForm({ ...form, [key]: value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Gunakan FormData karena ada unggahan file.
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            // Koordinat kosong tidak dikirim agar tidak memicu error validasi.
            if ((key === "latitude" || key === "longitude") && (value === "" || value === null || value === undefined)) {
                return;
            }
            payload.append(key, value);
        });
        if (ktpFile) payload.append("ktp_file", ktpFile);
        if (nibFile) payload.append("nib_file", nibFile);

        router.post("/mitra/daftar", payload, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <CustomerLayout
            auth={auth}
            activeNav="profil"
            backHref="/"
            backLabel="Beranda"
        >
            <Head title="Ajukan Jadi Mitra — RentGo" />

            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Kemitraan RentGo
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111]">
                    Pengajuan Menjadi Mitra
                </h1>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                    Lengkapi data usaha dan dokumen legal berikut. Pengajuan
                    akan ditinjau oleh Administrator RentGo sebelum akun mitra
                    Anda diaktifkan.
                </p>
            </div>

            {/* Banner status pengajuan (jika sudah pernah mengajukan) */}
            {agentProfile && (
                <div className="mb-6 rounded-sm border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold text-stone-700">
                                Status pengajuan saat ini
                            </p>
                            <p className="text-[11px] text-stone-500">
                                {agentProfile.agency_name || "Pengajuan mitra"}
                            </p>
                        </div>
                        <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-xs border ${
                                (
                                    ONBOARDING_STATUS[status] ||
                                    ONBOARDING_STATUS.pending_verification
                                ).color
                            }`}
                        >
                            {
                                (
                                    ONBOARDING_STATUS[status] ||
                                    ONBOARDING_STATUS.pending_verification
                                ).label
                            }
                        </span>
                    </div>

                    {status === "rejected" && (
                        <div className="mt-3 rounded-sm border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-900">
                            <p className="font-bold uppercase tracking-wider mb-1">
                                Pengajuan ditolak
                            </p>
                            {documents?.find((d) => d.rejection_reason)
                                ?.rejection_reason && (
                                <p>
                                    Alasan:{" "}
                                    {
                                        documents.find(
                                            (d) => d.rejection_reason,
                                        ).rejection_reason
                                    }
                                </p>
                            )}
                            <p className="mt-1">
                                Silakan perbaiki data &amp; unggah ulang dokumen
                                di bawah ini, lalu kirim pengajuan kembali.
                            </p>
                        </div>
                    )}

                    {status === "pending_verification" && (
                        <p className="mt-3 text-[11px] leading-relaxed text-amber-900">
                            Pengajuan Anda sedang menunggu verifikasi admin.
                            Anda akan menerima notifikasi begitu diproses.
                        </p>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Data Usaha */}
                <div className="rounded-sm border-stone-200 bg-white p-5 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            1. Data Usaha / Kemitraan
                        </h3>
                        <p className="text-xs text-stone-500">
                            Informasi identitas usaha rental kendaraan Anda
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>
                                Nama Agensi / Usaha{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.agency_name}
                                onChange={(e) =>
                                    update("agency_name", e.target.value)
                                }
                                className={FIELD_CLASS}
                                placeholder="Contoh: RentGo Motor & Car"
                                required
                            />
                            {errors.agency_name && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.agency_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS}>
                                Nama Pemilik / Penanggung Jawab{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.owner_name}
                                onChange={(e) =>
                                    update("owner_name", e.target.value)
                                }
                                className={FIELD_CLASS}
                                required
                            />
                            {errors.owner_name && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.owner_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>
                                Nomor Telepon / WhatsApp{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                    update("phone", e.target.value)
                                }
                                className={FIELD_CLASS}
                                placeholder="Contoh: 081234567890"
                                required
                            />
                            {errors.phone && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS}>Jenis Usaha</label>
                            <select
                                value={form.business_type}
                                onChange={(e) =>
                                    update("business_type", e.target.value)
                                }
                                className={FIELD_CLASS}
                            >
                                <option value="Perorangan">Perorangan</option>
                                <option value="CV">CV</option>
                                <option value="PT">PT</option>
                                <option value="Koperasi">Koperasi</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>
                            Alamat Usaha <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="2"
                            value={form.address}
                            onChange={(e) => update("address", e.target.value)}
                            className={FIELD_CLASS}
                            placeholder="Alamat lengkap lokasi pool / kantor usaha"
                            required
                        />
                        {errors.address && (
                            <p className="text-[11px] text-red-500 mt-1">
                                {errors.address}
                            </p>
                        )}
                    </div>

                    {/* Titik presisi lokasi usaha di peta */}
                    <div>
                        <label className={LABEL_CLASS}>
                            Titik Lokasi di Peta{" "}
                            <span className="font-normal text-stone-400">
                                (opsional, tapi sangat disarankan)
                            </span>
                        </label>
                        <p className="text-[11px] text-stone-500 mb-2 leading-relaxed">
                            Tandai lokasi persis pool / kantor usaha Anda. Titik
                            ini dipakai sebagai pin lokasi mitra pada peta
                            pencarian unit, sehingga penyewa bisa menemukan
                            armada Anda dengan presisi.
                        </p>
                        <LocationPicker
                            latitude={
                                form.latitude === ""
                                    ? null
                                    : Number(form.latitude)
                            }
                            longitude={
                                form.longitude === ""
                                    ? null
                                    : Number(form.longitude)
                            }
                            address={form.address}
                            city={form.city}
                            onPick={(point) =>
                                setForm((prev) => ({
                                    ...prev,
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                    address: point.address
                                        ? point.address
                                        : prev.address,
                                    city: point.city ? point.city : prev.city,
                                    province: point.province
                                        ? point.province
                                        : prev.province,
                                }))
                            }
                        />
                        {(errors.latitude || errors.longitude) && (
                            <p className="text-[11px] text-red-500 mt-1">
                                {errors.latitude || errors.longitude}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>
                                Kota Operasional{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => update("city", e.target.value)}
                                className={FIELD_CLASS}
                                placeholder="Contoh: Jakarta"
                                required
                            />
                            {errors.city && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.city}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS}>Provinsi</label>
                            <input
                                type="text"
                                value={form.province}
                                onChange={(e) =>
                                    update("province", e.target.value)
                                }
                                className={FIELD_CLASS}
                                placeholder="Contoh: DKI Jakarta"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={LABEL_CLASS}>Deskripsi Usaha</label>
                        <textarea
                            rows="2"
                            value={form.description}
                            onChange={(e) =>
                                update("description", e.target.value)
                            }
                            className={FIELD_CLASS}
                            placeholder="Ceritakan singkat tentang usaha rental Anda"
                        />
                    </div>

                    {/* Rekening pencairan payout mitra */}
                    <div className="border-t border-stone-100 pt-4">
                        <p className="text-xs font-semibold text-stone-700 mb-1">
                            Rekening Pencairan
                        </p>
                        <p className="text-[11px] text-stone-500 mb-3">
                            Hasil sewa unit Anda akan ditransfer ke rekening
                            berikut.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={LABEL_CLASS}>
                                    Nama Bank{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.bank_name}
                                    onChange={(e) =>
                                        update("bank_name", e.target.value)
                                    }
                                    className={FIELD_CLASS}
                                    placeholder="Contoh: BCA / BNI / Mandiri"
                                    required
                                />
                                {errors.bank_name && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.bank_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={LABEL_CLASS}>
                                    Nomor Rekening{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={form.bank_account_number}
                                    onChange={(e) =>
                                        update(
                                            "bank_account_number",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    className={`${FIELD_CLASS} font-mono`}
                                    placeholder="Contoh: 1234567890"
                                    required
                                />
                                {errors.bank_account_number && (
                                    <p className="text-[11px] text-red-500 mt-1">
                                        {errors.bank_account_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className={LABEL_CLASS}>
                                Nama Pemilik Rekening{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.bank_account_name}
                                onChange={(e) =>
                                    update("bank_account_name", e.target.value)
                                }
                                className={FIELD_CLASS}
                                placeholder="Nama sesuai buku tabungan"
                                required
                            />
                            {errors.bank_account_name && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.bank_account_name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Dokumen Legal */}
                <div className="rounded-sm border-stone-200 bg-white p-5 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">
                            2. Dokumen Legal
                        </h3>
                        <p className="text-xs text-stone-500">
                            KTP pemilik dan NIB / Akta Usaha (JPG, PNG, atau
                            PDF, maks 5 MB)
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>
                                Nomor KTP Pemilik{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength="16"
                                value={form.ktp_number}
                                onChange={(e) =>
                                    update(
                                        "ktp_number",
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="16 digit NIK"
                                required
                            />
                            {errors.ktp_number && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.ktp_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS}>
                                Foto KTP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) =>
                                    setKtpFile(e.target.files[0] || null)
                                }
                                className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                                required={!agentProfile}
                            />
                            {errors.ktp_file && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.ktp_file}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={LABEL_CLASS}>
                                Nomor NIB / Akta Usaha{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nib_number}
                                onChange={(e) =>
                                    update("nib_number", e.target.value)
                                }
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="Nomor NIB / Akta"
                                required
                            />
                            {errors.nib_number && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.nib_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={LABEL_CLASS}>
                                Dokumen NIB / Akta{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) =>
                                    setNibFile(e.target.files[0] || null)
                                }
                                className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                                required={!agentProfile}
                            />
                            {errors.nib_file && (
                                <p className="text-[11px] text-red-500 mt-1">
                                    {errors.nib_file}
                                </p>
                            )}
                        </div>
                    </div>

                    {errors.compliance && (
                        <p className="text-[11px] text-red-500">
                            {errors.compliance}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/"
                        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-50"
                    >
                        {processing
                            ? "Mengirim pengajuan..."
                            : alreadyApplied
                              ? "Perbarui Pengajuan"
                              : "Kirim Pengajuan Mitra"}
                    </button>
                </div>
            </form>
        </CustomerLayout>
    );
}
