import React, { useState } from 'react';
import { Transition } from '@headlessui/react';

export default function RentalVerificationForm({ className = '' }) {
    // State form frontend
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

    // Hitung progress kelengkapan (0 - 100%)
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

        // Simulasi frontend save (siap dihubungkan ke backend nanti)
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 4000);
        }, 600);
    };

    return (
        <section className={className}>
            {/* Header Bagian */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F5B800]/20 text-[#b38600] flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.48 7.442a9.006 9.006 0 01-5.02-2.128 9.008 9.008 0 01-2.498-5.362 9.008 9.008 0 012.498-5.362 9.006 9.006 0 015.02-2.128 9.006 9.006 0 015.02 2.128 9.008 9.008 0 012.498 5.362 9.008 9.008 0 01-2.498 5.362 9.006 9.006 0 01-5.02 2.128z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-bold text-[#111111]">Dokumen &amp; Syarat Sewa</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800">
                            Wajib Pemesanan
                        </span>
                    </div>
                    <p className="mt-1.5 text-xs text-stone-500">
                        Data ini wajib dilengkapi sebelum melakukan sewa lepas kunci demi verifikasi asuransi dan serah terima unit kendaraan.
                    </p>
                </div>

                {/* Progress Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 sm:w-56 shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                        <span className="text-stone-600">Kelengkapan Data</span>
                        <span className={progress === 100 ? 'text-emerald-600' : 'text-[#b38600]'}>{progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${
                                progress === 100 ? 'bg-emerald-500' : 'bg-[#F5B800]'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                        {progress === 100 ? '✓ Dokumen lengkap & siap sewa' : 'Lengkapi KTP & SIM untuk sewa'}
                    </p>
                </div>
            </div>

            {/* Info Box Keamanan */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold">Keamanan Data Terjamin:</span> Foto identitas dan dokumen Anda dienkripsi aman serta hanya digunakan saat serah terima kendaraan oleh mitra resmi RentGo.
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. KTP Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                        <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F5B800] text-[11px] font-black flex items-center justify-center">1</span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">Identitas KTP (Kartu Tanda Penduduk)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Input NIK */}
                        <div>
                            <label htmlFor="nik" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Nomor NIK / KTP (16 Digit) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="nik"
                                    type="text"
                                    maxLength="16"
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                                    className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all font-mono"
                                    placeholder="Contoh: 3201234567890001"
                                    required
                                />
                                {formData.nik.length === 16 && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-500">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1">Pastikan 16 digit NIK sesuai dengan KTP asli Anda.</p>
                        </div>

                        {/* Input Nomor WhatsApp */}
                        <div>
                            <label htmlFor="whatsapp" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                                    placeholder="Contoh: 081234567890"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-stone-400 mt-1">Driver/admin akan menghubungi melalui WhatsApp untuk serah terima.</p>
                        </div>
                    </div>

                    {/* Upload Foto KTP */}
                    <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                            Foto KTP Asli <span className="text-red-500">*</span>
                        </label>
                        
                        {!ktpPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#F5B800] bg-stone-50/50 hover:bg-stone-50 rounded-2xl p-6 cursor-pointer transition-all group">
                                <div className="w-12 h-12 rounded-full bg-white shadow-xs group-hover:bg-[#F5B800]/20 flex items-center justify-center text-stone-500 group-hover:text-[#b38600] transition-colors mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-stone-800">Klik untuk unggah foto KTP</span>
                                <span className="text-[11px] text-stone-400 mt-0.5">Format JPG, PNG atau WebP (Maks. 5MB). Pastikan tulisan terbaca jelas.</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleKtpUpload}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-w-sm">
                                <img src={ktpPreview} alt="Preview KTP" className="w-full h-44 object-cover opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-3">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={removeKtp}
                                            className="p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                                            title="Hapus foto"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        <span>Foto KTP Terunggah</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. SIM Section */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                        <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F5B800] text-[11px] font-black flex items-center justify-center">2</span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">Surat Izin Mengemudi (SIM)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Jenis SIM */}
                        <div>
                            <label htmlFor="simType" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Jenis SIM <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="simType"
                                value={formData.simType}
                                onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                            >
                                <option value="SIM A (Mobil)">SIM A (Khusus Sewa Mobil)</option>
                                <option value="SIM C (Motor)">SIM C (Khusus Sewa Motor)</option>
                                <option value="SIM A & SIM C">SIM A &amp; SIM C (Mobil &amp; Motor)</option>
                                <option value="SIM Internasional">SIM Internasional (Turis Asing)</option>
                            </select>
                        </div>

                        {/* Nomor SIM */}
                        <div>
                            <label htmlFor="simNumber" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Nomor SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simNumber"
                                type="text"
                                value={formData.simNumber}
                                onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all font-mono"
                                placeholder="Contoh: 1234-5678-9012"
                                required
                            />
                        </div>

                        {/* Masa Berlaku */}
                        <div>
                            <label htmlFor="simExpiry" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Masa Berlaku SIM <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="simExpiry"
                                type="date"
                                value={formData.simExpiry}
                                onChange={(e) => setFormData({ ...formData, simExpiry: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Upload Foto SIM */}
                    <div>
                        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                            Foto SIM Masih Berlaku <span className="text-red-500">*</span>
                        </label>
                        
                        {!simPreview ? (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#F5B800] bg-stone-50/50 hover:bg-stone-50 rounded-2xl p-6 cursor-pointer transition-all group">
                                <div className="w-12 h-12 rounded-full bg-white shadow-xs group-hover:bg-[#F5B800]/20 flex items-center justify-center text-stone-500 group-hover:text-[#b38600] transition-colors mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold text-stone-800">Klik untuk unggah foto SIM</span>
                                <span className="text-[11px] text-stone-400 mt-0.5">Pastikan nomor SIM dan masa berlaku terlihat jelas.</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSimUpload}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-w-sm">
                                <img src={simPreview} alt="Preview SIM" className="w-full h-44 object-cover opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-3">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={removeSim}
                                            className="p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                                            title="Hapus foto"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        <span>Foto SIM Terunggah</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Kontak Darurat Section */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                        <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F5B800] text-[11px] font-black flex items-center justify-center">3</span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">Kontak Darurat (Keluarga / Kerabat)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label htmlFor="emergencyName" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Nama Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyName"
                                type="text"
                                value={formData.emergencyName}
                                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                                placeholder="Nama orang tua/pasangan"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="emergencyRelation" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Hubungan <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="emergencyRelation"
                                value={formData.emergencyRelation}
                                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                            >
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Pasangan (Suami/Istri)">Pasangan (Suami/Istri)</option>
                                <option value="Saudara Kandung">Saudara Kandung</option>
                                <option value="Teman / Rekan Kerja">Teman / Rekan Kerja</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="emergencyPhone" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                Nomor Telepon Kerabat <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="emergencyPhone"
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all"
                                placeholder="Contoh: 0821xxxxxxxx"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Alamat Domisili */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                        <span className="w-5 h-5 rounded-full bg-[#111111] text-[#F5B800] text-[11px] font-black flex items-center justify-center">4</span>
                        <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">Alamat Domisili Saat Ini</h3>
                    </div>

                    <div>
                        <label htmlFor="alamat" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                            Alamat Lengkap (Tempat Tinggal / Hotel / Penginapan)
                        </label>
                        <textarea
                            id="alamat"
                            rows="2"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm text-stone-900 bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] focus:border-[#F5B800] transition-all resize-none"
                            placeholder="Tuliskan alamat lengkap Anda atau nama penginapan/hotel selama berlibur"
                        />
                    </div>
                </div>

                {/* Submit & Status */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-100">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5B800] hover:bg-[#e0a800] active:scale-[0.99] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span>Menyimpan Dokumen...</span>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span>Simpan Dokumen Sewa</span>
                            </>
                        )}
                    </button>

                    <Transition
                        show={isSaved}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-2"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-x-2"
                    >
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Dokumen berhasil disimpan (Siap untuk pemesanan armada)
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
