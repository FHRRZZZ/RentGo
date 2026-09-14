import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function RentalVerificationForm({ className = '' }) {
    const [formData, setFormData] = useState({
        nik: '',
        whatsapp: '',
        simType: 'SIM A (Mobil)',
        simNumber: '',
        simExpiry: '',
        alamat: '',
        emergencyName: '',
        emergencyRelation: 'Keluarga',
        emergencyPhone: '',
    });

    const [ktpFile, setKtpFile] = useState(null);
    const [ktpPreview, setKtpPreview] = useState(null);
    const [simFile, setSimFile] = useState(null);
    const [simPreview, setSimPreview] = useState(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

    const progress = calculateProgress();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 4000);
        }, 500);
    };

    return (
        <section className={className}>
            {/* Header Bagian Dokumen */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-[#F5B800]"></span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            PERSYARATAN SEWA
                        </span>
                    </div>
                    <h2 className="text-lg font-semibold text-[#111111] tracking-tight">
                        Dokumen Verifikasi Identitas
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Wajib diisi lengkap sebelum pengambilan kunci kendaraan (KTP, SIM &amp; Kontak).
                    </p>
                </div>

                {/* Progress Bar Kelengkapan */}
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-sm sm:w-60 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-stone-700">Kelengkapan Dokumen</span>
                        <span className={progress === 100 ? 'text-emerald-600' : 'text-[#111111]'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-sm h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-[#F5B800]'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                        {progress === 100 ? '✓ Dokumen lengkap untuk sewa' : 'Lengkapi KTP & SIM agar dapat memesan'}
                    </p>
                </div>
            </div>

            {/* Banner Keamanan Data */}
            <div className="mb-6 p-4 bg-stone-50 border-l-4 border-[#F5B800] border-t border-r border-b border-stone-200 rounded-sm text-xs text-stone-700">
                <span className="font-semibold text-black">Catatan Asuransi &amp; Serah Terima:</span> Dokumen Anda hanya digunakan oleh mitra penyedia armada RentGo untuk verifikasi fisik saat serah terima unit dan klaim asuransi perjalanan.
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
                {/* 1. KTP Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                        <span className="w-2 h-2 bg-[#111111]"></span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            1. Kartu Tanda Penduduk (KTP / Paspor)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nik" className="block text-xs font-medium text-stone-700 mb-1">
                                Nomor NIK / KTP (16 Digit) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="nik"
                                type="text"
                                maxLength="16"
                                value={formData.nik}
                                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none font-mono"
                                placeholder="Contoh: 3201xxxxxxxxxxxx"
                                required
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Nomor NIK harus sesuai dengan KTP asli.</p>
                        </div>

                        <div>
                            <label htmlFor="whatsapp" className="block text-xs font-medium text-stone-700 mb-1">
                                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="whatsapp"
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none font-mono"
                                placeholder="Contoh: 081234567890"
                                required
                            />
                            <p className="text-[10px] text-stone-400 mt-1">Digunakan untuk koordinasi serah terima kendaraan.</p>
                        </div>
                    </div>

                    {/* Foto KTP */}
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                            Foto KTP Asli (Jelas &amp; Terbaca) <span className="text-red-500">*</span>
                        </label>
                        
                        {!ktpPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-black bg-stone-50 hover:bg-white rounded-sm p-6 cursor-pointer transition-colors text-center">
                                <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                                <span className="text-xs font-medium text-black">Klik untuk Unggah Foto KTP</span>
                                <span className="text-[11px] text-stone-500 mt-0.5">Format JPG, PNG, atau WebP (Maksimal 5MB)</span>
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
                <div className="space-y-4 pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                        <span className="w-2 h-2 bg-[#111111]"></span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            2. Surat Izin Mengemudi (SIM)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="simType" className="block text-xs font-bold text-stone-700 mb-1">
                                Jenis SIM <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="simType"
                                value={formData.simType}
                                onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                                className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                            >
                                <option value="SIM A (Mobil)">SIM A (Khusus Sewa Mobil)</option>
                                <option value="SIM C (Motor)">SIM C (Khusus Sewa Motor)</option>
                                <option value="SIM A & SIM C">SIM A &amp; SIM C (Mobil &amp; Motor)</option>
                                <option value="SIM Internasional">SIM Internasional (WNA)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="simNumber" className="block text-xs font-bold text-stone-700 mb-1">
                                Nomor SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simNumber"
                                type="text"
                                value={formData.simNumber}
                                onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none font-mono"
                                placeholder="Contoh: 1234-5678-9012"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="simExpiry" className="block text-xs font-bold text-stone-700 mb-1">
                                Masa Berlaku SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simExpiry"
                                type="date"
                                value={formData.simExpiry}
                                onChange={(e) => setFormData({ ...formData, simExpiry: e.target.value })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Foto SIM */}
                    <div>
                        <label className="block text-xs font-medium text-stone-700 mb-1">
                            Foto SIM Masih Berlaku <span className="text-red-500">*</span>
                        </label>
                        
                        {!simPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-black bg-stone-50 hover:bg-white rounded-sm p-6 cursor-pointer transition-colors text-center">
                                <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                </svg>
                                <span className="text-xs font-medium text-black">Klik untuk Unggah Foto SIM</span>
                                <span className="text-[11px] text-stone-500 mt-0.5">Pastikan masa berlaku dan nomor SIM terbaca</span>
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
                <div className="space-y-4 pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                        <span className="w-2 h-2 bg-[#111111]"></span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            3. Kontak Darurat (Keluarga / Rekan)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="emergencyName" className="block text-xs font-bold text-stone-700 mb-1">
                                Nama Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyName"
                                type="text"
                                value={formData.emergencyName}
                                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                                placeholder="Nama orang tua/pasangan"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="emergencyRelation" className="block text-xs font-bold text-stone-700 mb-1">
                                Hubungan <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="emergencyRelation"
                                value={formData.emergencyRelation}
                                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                            >
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Pasangan (Suami/Istri)">Pasangan (Suami/Istri)</option>
                                <option value="Saudara Kandung">Saudara Kandung</option>
                                <option value="Teman / Rekan Kerja">Teman / Rekan Kerja</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="emergencyPhone" className="block text-xs font-bold text-stone-700 mb-1">
                                Nomor Telepon Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyPhone"
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none font-mono"
                                placeholder="Contoh: 0821xxxxxxxx"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Alamat Domisili */}
                <div className="space-y-4 pt-4 border-t border-stone-200">
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                        <span className="w-2 h-2 bg-[#111111]"></span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                            4. Alamat Domisili / Tempat Singgah
                        </h3>
                    </div>

                    <div>
                        <label htmlFor="alamat" className="block text-xs font-bold text-stone-700 mb-1">
                            Alamat Tempat Tinggal / Hotel / Penginapan
                        </label>
                        <textarea
                            id="alamat"
                            rows="2"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none resize-none"
                            placeholder="Alamat tempat tinggal Anda atau nama hotel/penginapan tujuan saat rental kendaraan"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="text-xs font-medium bg-[#F5B800] text-[#111111] hover:bg-[#e0a800] px-6 py-3 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Menyimpan Dokumen...' : 'Simpan Dokumen Sewa'}
                    </button>

                    <Transition
                        show={isSaved}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-sm flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Dokumen berhasil disimpan
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
