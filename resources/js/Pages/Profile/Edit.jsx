import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import RentalVerificationForm from './Partials/RentalVerificationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'info' | 'security' | 'danger'
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const user = auth.user;

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(typeof route === 'function' ? route('logout') : '/logout');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased page-enter">
            <Head title="Profil &amp; Dokumen Sewa - RentGo" />

            {/* Header Navbar — Identik dengan Welcome.jsx */}
            <header className="border-b border-stone-200 bg-white sticky top-0 z-30 morph-navbar">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600 font-medium">
                            <Link href="/#armada-mobil" className="hover:text-black">Sewa Mobil</Link>
                            <Link href="/#armada-motor" className="hover:text-black">Sewa Motor</Link>
                            <Link href="/#keunggulan" className="hover:text-black">Cara Pesan</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-xs font-medium text-stone-600 hover:text-black px-3 py-2 border border-stone-200 rounded-sm hover:border-stone-400 transition-colors"
                        >
                            &larr; Kembali ke Beranda
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs font-medium bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 px-3 py-2 rounded-sm border border-stone-200 transition-colors"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            </header>

            <div className="morph-page-container">
                {/* Hero Section — RentGo Industrial Dark Theme */}
                <section className="bg-[#111111] text-white py-8 sm:py-12 border-b border-stone-800 morph-hero">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-[#F5B800]"></span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5B800]">
                            AKUN &amp; DOKUMEN PENYEWA
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#F5B800] text-[#111111] font-semibold flex items-center justify-center text-xl rounded-sm shadow-sm shrink-0">
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                                    {user.name}
                                </h1>
                                <p className="text-xs text-stone-400 font-mono mt-0.5">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-medium bg-stone-900 text-stone-300 px-3 py-1.5 rounded-sm border border-stone-700 uppercase tracking-wider">
                                Member RentGo
                            </span>
                            <span className="text-[11px] font-medium bg-[#F5B800] text-[#111111] px-3 py-1.5 rounded-sm uppercase tracking-wider">
                                Siap Pesan Kendaraan
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Segmented Tab Navigation — Sesuai Filter Bar di Welcome.jsx */}
                <div className="bg-white p-2 rounded-sm border border-stone-200 shadow-sm mb-6">
                    <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-sm">
                        <button
                            type="button"
                            onClick={() => setActiveTab('verification')}
                            className={`text-xs font-medium px-4 py-2.5 rounded-sm transition-colors ${
                                activeTab === 'verification'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-sm'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Dokumen Sewa (KTP &amp; SIM)
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-sm bg-[#F5B800] text-[#111111] font-semibold uppercase">
                                Wajib
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className={`text-xs font-medium px-4 py-2.5 rounded-sm transition-colors ${
                                activeTab === 'info'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-sm'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Informasi Akun
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`text-xs font-medium px-4 py-2.5 rounded-sm transition-colors ${
                                activeTab === 'security'
                                    ? 'bg-[#111111] text-[#F5B800] shadow-sm'
                                    : 'text-stone-600 hover:text-black'
                            }`}
                        >
                            Kata Sandi &amp; Keamanan
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('danger')}
                            className={`text-xs font-medium px-4 py-2.5 rounded-sm transition-colors ${
                                activeTab === 'danger'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'text-stone-600 hover:text-red-600'
                            }`}
                        >
                            Hapus Akun
                        </button>
                    </div>
                </div>

                {/* Tab Content Box */}
                <div className="bg-white p-5 sm:p-8 rounded-sm border border-stone-200 shadow-sm">
                    {activeTab === 'verification' && (
                        <RentalVerificationForm />
                    )}

                    {activeTab === 'info' && (
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    )}

                    {activeTab === 'security' && (
                        <UpdatePasswordForm />
                    )}

                    {activeTab === 'danger' && (
                        <DeleteUserForm />
                    )}
                </div>

                {/* Footer Info Box — Sesuai CTA di Welcome.jsx */}
                <div className="mt-8 p-5 bg-stone-100 rounded-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-[#111111]">Butuh Bantuan Pemesanan atau Perubahan Data?</p>
                        <p className="text-xs text-stone-500 mt-0.5">Hubungi customer service RentGo via WhatsApp untuk konsultasi rental dan serah terima kendaraan.</p>
                    </div>
                    <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium bg-[#F5B800] text-[#111111] hover:bg-[#e0a800] px-4 py-2.5 rounded-sm uppercase tracking-wider shrink-0 transition-colors"
                    >
                        Hubungi CS WhatsApp
                    </a>
                </div>
            </main>
        </div>
    </div>
);
}
