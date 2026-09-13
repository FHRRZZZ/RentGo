import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import RentalVerificationForm from './Partials/RentalVerificationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'info' | 'security' | 'danger'
    const user = auth.user;

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(typeof route === 'function' ? route('logout') : '/logout');
    };

    return (
        <div className="min-h-screen bg-stone-100/60 text-[#111111] font-sans antialiased">
            <Head title="Pengaturan Profil - RentGo" />

            {/* Header Navbar */}
            <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <span className="hidden sm:inline-block text-stone-300">/</span>
                        <span className="hidden sm:inline-block text-xs font-bold text-stone-500 uppercase tracking-wider">
                            Pengaturan Akun
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-black px-3.5 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 bg-white transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                            <span className="hidden sm:inline">Keluar</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Profile Hero Header Banner */}
            <div className="bg-[#111111] text-white pt-10 pb-16 relative overflow-hidden border-b border-stone-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-stone-900 to-stone-800 text-[#F5B800] font-black flex items-center justify-center text-3xl sm:text-4xl uppercase tracking-wider ring-4 ring-[#F5B800] shadow-xl shadow-black/40">
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#111111] flex items-center justify-center text-white" title="Akun Aktif">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </span>
                        </div>

                        {/* User Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {user.name}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5B800]/20 text-[#F5B800] text-[10px] font-extrabold uppercase tracking-wider">
                                    <span>●</span> Member RentGo
                                </span>
                            </div>
                            <p className="text-stone-400 text-xs sm:text-sm font-medium">
                                {user.email}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-400">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-[#F5B800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Status Akun: Aktif</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                                    <svg className="w-3.5 h-3.5 text-[#F5B800]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <span>Syarat Rental: Lengkapi KTP &amp; SIM</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                    <span>Penyewa RentGo Indonesia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 pb-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Sidebar Navigation */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-sm">
                            <nav className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('verification')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                                        activeTab === 'verification'
                                            ? 'bg-[#111111] text-white shadow-sm'
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        activeTab === 'verification' ? 'bg-[#F5B800] text-[#111111]' : 'bg-amber-100 text-[#b38600]'
                                    }`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-2.48 7.442a9.006 9.006 0 01-5.02-2.128 9.008 9.008 0 01-2.498-5.362 9.008 9.008 0 012.498-5.362 9.006 9.006 0 015.02-2.128 9.006 9.006 0 015.02 2.128 9.008 9.008 0 012.498 5.362 9.008 9.008 0 01-2.498 5.362 9.006 9.006 0 01-5.02 2.128z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="leading-tight">Syarat &amp; Dokumen</p>
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                                                activeTab === 'verification' ? 'bg-[#F5B800] text-[#111111]' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                Wajib
                                            </span>
                                        </div>
                                        <p className={`text-[10px] font-normal mt-0.5 ${
                                            activeTab === 'verification' ? 'text-stone-400' : 'text-stone-400'
                                        }`}>KTP, SIM &amp; Kontak Sewa</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('info')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                                        activeTab === 'info'
                                            ? 'bg-[#111111] text-white shadow-sm'
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        activeTab === 'info' ? 'bg-[#F5B800] text-[#111111]' : 'bg-stone-100 text-stone-600'
                                    }`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="leading-tight">Informasi Akun</p>
                                        <p className={`text-[10px] font-normal mt-0.5 ${
                                            activeTab === 'info' ? 'text-stone-400' : 'text-stone-400'
                                        }`}>Nama &amp; Alamat Email</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                                        activeTab === 'security'
                                            ? 'bg-[#111111] text-white shadow-sm'
                                            : 'text-stone-600 hover:bg-stone-50 hover:text-black'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        activeTab === 'security' ? 'bg-[#F5B800] text-[#111111]' : 'bg-stone-100 text-stone-600'
                                    }`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="leading-tight">Kata Sandi &amp; Keamanan</p>
                                        <p className={`text-[10px] font-normal mt-0.5 ${
                                            activeTab === 'security' ? 'text-stone-400' : 'text-stone-400'
                                        }`}>Perbarui kata sandi akun</p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('danger')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                                        activeTab === 'danger'
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'text-red-600 hover:bg-red-50'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                        activeTab === 'danger' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="leading-tight">Hapus Akun</p>
                                        <p className={`text-[10px] font-normal mt-0.5 ${
                                            activeTab === 'danger' ? 'text-red-100' : 'text-red-400'
                                        }`}>Penghapusan data permanen</p>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Customer Support Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5">
                            <div className="flex items-center gap-2 text-[#b38600] text-xs font-extrabold uppercase tracking-wider mb-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                                <span>Bantuan RentGo</span>
                            </div>
                            <p className="text-xs text-stone-700 leading-relaxed mb-3">
                                Mengalami kendala akun atau butuh perubahan data khusus? Tim kami siap membantu 24/7.
                            </p>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-bold text-[#111111] hover:underline"
                            >
                                <span>Hubungi CS WhatsApp</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Right Form Panels */}
                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === 'verification' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm animate-fade-in">
                                <RentalVerificationForm />
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm animate-fade-in">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm animate-fade-in">
                                <UpdatePasswordForm />
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-red-200 shadow-sm animate-fade-in">
                                <DeleteUserForm />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
