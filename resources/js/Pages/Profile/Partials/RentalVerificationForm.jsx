import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

const FIELD_CLASS =
    'w-full text-sm bg-stone-50 border-stone-300 rounded-sm px-3 py-2.5 focus:bg-white focus:border-[#111] outline-none transition-colors';

const LABEL_CLASS = 'block text-xs font-medium text-stone-700 mb-1.5';

const HINT_CLASS = 'text-xs text-stone-400 mt-1';

export default function RentalVerificationForm({ className = '' }) {
    const page = usePage();
    const profile = page.props.customerProfile || {};
    const savedDocuments = page.props.customerDocuments || [];
    const isCustomer =
        (page.props.auth?.role || page.props.auth?.user?.role) === 'customer' &&
        Boolean(page.props.auth?.user?.id);

    // Ambil dokumen KTP & SIM yang sudah tersimpan supaya isian dan
    // preview file tetap tampil setelah pengguna pindah halaman lalu kembali.
    const savedKtp = savedDocuments.find((doc) => doc.document_type === 'ktp');
    const savedSim = savedDocuments.find((doc) => doc.document_type === 'sim');

    // Status kelengkapan versi SERVER — aturan yang sama dipakai saat
    // checkout, sehingga angka di sini tidak pernah menjanjikan "100%"
    // selama dokumen masih menunggu verifikasi admin.
    const compliance = page.props.compliance || null;

    const [formData, setFormData] = useState({
        nik: profile.identity_number || '',
        whatsapp: profile.phone || '',
        simType: profile.sim_type || 'SIM A (Mobil)',
        simNumber: savedSim?.document_number || '',
        simExpiry: savedSim?.expires_at || '',
        alamat: profile.address || '',
        emergencyName: profile.emergency_name || '',
        emergencyRelation: profile.emergency_relation || 'Keluarga',
        emergencyPhone: profile.emergency_phone || '',
    });

    const [ktpFile, setKtpFile] = useState(null);
    const [ktpPreview, setKtpPreview] = useState(savedKtp?.file_url || null);
    const [simFile, setSimFile] = useState(null);
    const [simPreview, setSimPreview] = useState(savedSim?.file_url || null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const calculateProgress = () => {
        let score = 0;
        if (formData.nik.length >= 16) score += 20;
        if (ktpPreview) score += 25;
        if (formData.whatsapp.length >= 10) score += 15;
        if (formData.simNumber.length >= 8) score += 15;
        if (simPreview) score += 15;
        if (formData.emergencyPhone.length >= 8) score += 10;
        return score;
    };

    const formProgress = calculateProgress();

    const rejectedDocuments = savedDocuments.filter(
        (doc) => doc.status === 'rejected'
    );
    const pendingDocuments = savedDocuments.filter(
        (doc) => doc.status && doc.status !== 'approved' && doc.status !== 'rejected'
    ).length;

    // Server hanya memblokir pemesanan bila data/dokumen belum diisi atau
    // dokumen ditolak. Status "pending" (menunggu verifikasi admin) TIDAK
    // memblokir — jadi bar di sini mengikuti status server tersebut.
    const serverComplete = compliance ? compliance.complete === true : null;
    const progress = serverComplete === null ? formProgress : serverComplete ? 100 : 0;

    const canBook = serverComplete === true;
    const progressMessage = canBook
        ? '✓ Data & dokumen tersimpan — siap memesan kendaraan'
        : rejectedDocuments.length > 0
          ? 'Dokumen ditolak admin. Unggah ulang lalu simpan kembali.'
          : 'Lengkapi KTP & SIM agar dapat memesan';

    const handleKtpUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setKtpFile(file);
            setKtpPreview(URL.createObjectURL(file));
        }
    };

    const handleSimUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSimFile(file);
            setSimPreview(URL.createObjectURL(file));
        }
    };

    const removeKtp = () => {
        setKtpFile(null);
        setKtpPreview(null);
    };

    const removeSim = () => {
        setSimFile(null);
        setSimPreview(null);
    };

    // Kirim satu permintaan multi-part: data pribadi + file KTP/SIM.
    // Semua dikirim lewat PATCH /profile agar tidak ada request per-file
    // yang harus berurutan (menghindari race condition).
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isCustomer) {
            setErrorMessage('Hanya akun penyewa (customer) yang dapat menyimpan dokumen sewa.');
            return;
        }

        if (!formData.nik || formData.nik.length < 16) {
            setErrorMessage('Nomor NIK harus 16 digit.');
            return;
        }

        if (!ktpFile && !savedKtp) {
            setErrorMessage('Foto KTP wajib diunggah.');
            return;
        }

        if (!simFile && !savedSim) {
            setErrorMessage('Foto SIM wajib diunggah.');
            return;
        }

        setErrorMessage(null);
        setIsSaving(true);

        const payload = {
            _method: 'patch',
            // Data akun (wajib di ProfileUpdateRequest)
            name: page.props.auth?.user?.name || '',
            email: page.props.auth?.user?.email || '',
            // Data pribadi penyewa
            phone: formData.whatsapp || null,
            identity_number: formData.nik || null,
            address: formData.alamat || null,
            // Data verifikasi sewa (SIM & kontak darurat)
            sim_type: formData.simType || null,
            emergency_name: formData.emergencyName || null,
            emergency_relation: formData.emergencyRelation || null,
            emergency_phone: formData.emergencyPhone || null,
            // Dokumen — hanya sertakan file yang benar-benar baru dipilih,
            // agar file lama yang sudah tersimpan tidak ikut terhapus.
            sim_number: formData.simNumber || null,
            sim_expires_at: formData.simExpiry || null,
        };

        if (ktpFile) {
            payload.ktp_file = ktpFile;
        }

        if (simFile) {
            payload.sim_file = simFile;
        }

        router.post(route('profile.update'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 5000);
            },
            onError: (errors) => {
                setIsSaving(false);
                setErrorMessage(
                    Object.values(errors).filter(Boolean).join(' ') ||
                        'Dokumen gagal disimpan. Periksa kembali data Anda.'
                );
            },
            onFinish: () => setIsSaving(false),
        });
    };

    return (
        <section className={className}>
            {/* Header Bagian Dokumen */}
            <div className="mb-7">
                <h1 className="text-xl font-semibold tracking-tight text-[#111]">Dokumen Verifikasi Identitas</h1>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    Wajib diisi lengkap sebelum pengambilan kunci kendaraan (KTP, SIM &amp; kontak darurat).
                </p>
            </div>
            {/* Progress Bar Kelengkapan */}
            <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-stone-700">Kelengkapan Dokumen</span>
                    <span className={`font-semibold ${canBook ? 'text-emerald-600' : 'text-[#111]'}`}>
                        {progress}%
                    </span>
                </div>
                <div className="w-full bg-stone-200 rounded-sm h-2 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${
                            canBook ? 'bg-emerald-500' : 'bg-[#F5B800]'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className={`text-xs mt-1 ${canBook ? 'text-stone-400' : 'text-amber-700'}`}>
                    {progressMessage}
                </p>
            </div>

            {/* Dokumen yang sudah tersimpan boleh langsung dipakai memesan.
                Verifikasi admin berjalan paralel dan bersifat pelengkap, bukan
                penghalang — verifikasi fisik tetap dilakukan mitra saat
                serah terima kendaraan. */}
            {canBook && pendingDocuments > 0 && (
                <div className="mb-6 text-xs font-medium text-stone-700 bg-stone-50 border-stone-200 rounded-sm px-3 py-2.5 leading-relaxed">
                    <span className="font-bold uppercase tracking-wider">
                        Dokumen Tersimpan
                    </span>
                    <br />
                    Data &amp; dokumen Anda sudah tersimpan, jadi Anda{' '}
                    <span className="font-semibold">sudah bisa memesan kendaraan</span>.
                    Verifikasi admin berjalan di belakang layar dan tidak
                    menghambat pemesanan.
                </div>
            )}

            {rejectedDocuments.length > 0 && (
                <div className="mb-6 text-xs font-medium text-red-700 bg-red-50 border-red-200 rounded-sm px-3 py-2.5 leading-relaxed">
                    <span className="font-bold uppercase tracking-wider">
                        Dokumen Ditolak
                    </span>
                    <br />
                    {rejectedDocuments
                        .map((doc) => `Dokumen ${doc.document_type.toUpperCase()}`)
                        .join(', ')}{' '}
                    ditolak admin. Unggah ulang file yang benar lalu simpan
                    kembali agar dapat diverifikasi.
                </div>
            )}

            {/* Banner Keamanan Data */}
            <div className="mb-6 text-xs font-medium text-green-700 bg-green-50 border-green-200 rounded-sm px-3 py-2.5 leading-relaxed">
                <span className="font-semibold text-black">Catatan Asuransi &amp; Serah Terima:</span> Dokumen Anda hanya digunakan oleh mitra penyedia armada RentGo untuk verifikasi fisik saat serah terima unit dan klaim asuransi perjalanan.
            </div>

            {!isCustomer && (
                <div className="mb-6 text-xs font-medium text-amber-900 bg-amber-50 border-amber-200 rounded-sm px-3 py-2.5 leading-relaxed">
                    Form ini khusus akun penyewa (customer). Akun mitra/admin tidak menyimpan dokumen sewa.
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 text-xs font-medium text-red-700 bg-red-50 border-red-200 rounded-sm px-3 py-2.5 leading-relaxed">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. KTP Section */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold tracking-tight text-[#111]">
                            1. Kartu Tanda Penduduk (KTP / Paspor)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nik" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Nomor NIK / KTP (16 Digit) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nik"
                                type="text"
                                maxLength="16"
                                value={formData.nik}
                                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="Contoh: 3201xxxxxxxxxxxx"
                                required
                            />
                            <p className="text-xs text-stone-400 mt-1">Nomor NIK harus sesuai dengan KTP asli.</p>
                        </div>

                        <div>
                            <label htmlFor="whatsapp" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="whatsapp"
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="Contoh: 081234567890"
                                required
                            />
                            <p className="text-xs text-stone-400 mt-1">Digunakan untuk koordinasi serah terima kendaraan.</p>
                        </div>
                    </div>

                    {/* Foto KTP */}
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1.5">
                            Foto KTP Asli (Jelas &amp; Terbaca) <span className="text-red-500">*</span>
                        </label>

                        {!ktpPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-white rounded-sm p-6 cursor-pointer transition-colors text-center">
                                <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                                <span className="text-xs font-medium text-black">Klik untuk Unggah Foto KTP</span>
                                <span className="text-xs text-stone-400 mt-0.5">Format JPG, PNG, atau WebP (Maksimal 5MB)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleKtpUpload}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-sm overflow-hidden border border-stone-300 bg-stone-900 max-w-sm">
                                <img src={ktpPreview} alt="Preview KTP" className="w-full h-44 object-cover" />
                                <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Foto KTP Terunggah
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeKtp}
                                        className="text-xs font-medium text-red-600 hover:text-red-700"
                                    >
                                        Ganti / Hapus
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. SIM Section */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold tracking-tight text-[#111]">
                            2. Surat Izin Mengemudi (SIM)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="simType" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Jenis SIM <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="simType"
                                value={formData.simType}
                                onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                                className={FIELD_CLASS}
                            >
                                <option value="SIM A (Mobil)">SIM A (Khusus Sewa Mobil)</option>
                                <option value="SIM C (Motor)">SIM C (Khusus Sewa Motor)</option>
                                <option value="SIM A & SIM C">SIM A &amp; SIM C (Mobil &amp; Motor)</option>
                                <option value="SIM Internasional">SIM Internasional (WNA)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="simNumber" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Nomor SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simNumber"
                                type="text"
                                value={formData.simNumber}
                                onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="Contoh: 1234-5678-9012"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="simExpiry" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Masa Berlaku SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simExpiry"
                                type="date"
                                value={formData.simExpiry}
                                onChange={(e) => setFormData({ ...formData, simExpiry: e.target.value })}
                                className={FIELD_CLASS}
                                required
                            />
                        </div>
                    </div>

                    {/* Foto SIM */}
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1.5">
                            Foto SIM Masih Berlaku <span className="text-red-500">*</span>
                        </label>

                        {!simPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-white rounded-sm p-6 cursor-pointer transition-colors text-center">
                                <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                </svg>
                                <span className="text-xs font-medium text-black">Klik untuk Unggah Foto SIM</span>
                                <span className="text-xs text-stone-400 mt-0.5">Pastikan masa berlaku dan nomor SIM terbaca</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSimUpload}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-sm overflow-hidden border border-stone-300 bg-stone-900 max-w-sm">
                                <img src={simPreview} alt="Preview SIM" className="w-full h-44 object-cover" />
                                <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Foto SIM Terunggah
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeSim}
                                        className="text-xs font-medium text-red-600 hover:text-red-700"
                                    >
                                        Ganti / Hapus
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Kontak Darurat */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold tracking-tight text-[#111]">
                            3. Kontak Darurat (Keluarga / Rekan)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="emergencyName" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Nama Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyName"
                                type="text"
                                value={formData.emergencyName}
                                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                className={FIELD_CLASS}
                                placeholder="Nama orang tua/pasangan"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="emergencyRelation" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Hubungan <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="emergencyRelation"
                                value={formData.emergencyRelation}
                                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                className={FIELD_CLASS}
                            >
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Pasangan (Suami/Istri)">Pasangan (Suami/Istri)</option>
                                <option value="Saudara Kandung">Saudara Kandung</option>
                                <option value="Teman / Rekan Kerja">Teman / Rekan Kerja</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="emergencyPhone" className="block text-xs font-medium text-stone-700 mb-1.5">
                                Nomor Telepon Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyPhone"
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                className={`${FIELD_CLASS} font-mono`}
                                placeholder="Contoh: 0821xxxxxxxx"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Alamat Domisili */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold tracking-tight text-[#111]">
                            4. Alamat Domisili / Tempat Singgah
                        </h3>
                    </div>

                    <div>
                        <label htmlFor="alamat" className="block text-xs font-medium text-stone-700 mb-1.5">
                            Alamat Tempat Tinggal / Hotel / Penginapan
                        </label>
                        <textarea
                            id="alamat"
                            rows="2"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            className={`${FIELD_CLASS} resize-none`}
                            placeholder="Alamat tempat tinggal Anda atau nama hotel/penginapan tujuan saat rental kendaraan"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-stone-200">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-[#F5B800] text-[#111] text-sm font-semibold py-3 rounded-sm hover:bg-[#e0a800] active:bg-[#c99600] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Mengunggah dokumen...
                            </>
                        ) : 'Simpan Dokumen Sewa'}
                    </button>

                    <Transition
                        show={isSaved}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveTo="opacity-0"
                    >
                        <span className="mt-3 text-xs font-semibold text-green-700 bg-green-50 border-green-200 rounded-sm px-3 py-2.5 flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Data pribadi &amp; dokumen berhasil disimpan
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
