import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";

/**
 * Layout khusus Mitra (Agent).
 * Gaya diselaraskan dengan halaman Auth/Login.jsx:
 *  - kartu putih, border-stone-200, rounded-sm
 *  - aksen #F5B800 + #111
 *  - label kecil uppercase tracking-wider
 *
 * Layout ini murni presentational (tanpa route backend baru),
 * dipakai sebagai page.layout agar konsisten dengan pola Login.jsx.
 */

const NAV = [
    {
        href: "/mitra",
        label: "Dashboard",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6"
                />
            </svg>
        ),
    },
    {
        href: "/mitra/unit",
        label: "Kelola Unit",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13l1.5-4.5A2 2 0 016.4 7h11.2a2 2 0 011.9 1.5L21 13v5h-3v-2H6v2H3v-5z"
                />
                <circle cx="7" cy="15.5" r="1" />
                <circle cx="17" cy="15.5" r="1" />
            </svg>
        ),
    },
    {
        href: "/mitra/pesanan",
        label: "Pesanan Masuk",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6m-6 4h6m-6 4h4"
                />
            </svg>
        ),
    },
    {
        href: "/mitra/pesan",
        label: "Pesan Customer",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
            </svg>
        ),
    },
    {
        href: "/mitra/ulasan",
        label: "Ulasan Customer",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.5a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557L3.04 10.386a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
            </svg>
        ),
    },
    {
        href: "/mitra/pendapatan",
        label: "Pendapatan",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
    {
        href: "/mitra/profil",
        label: "Profil & Dokumen",
        icon: (
            <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        ),
    },
];

export default function AgentLayout({
    children,
    active = "/mitra",
    title = "Dashboard Mitra",
}) {
    const { auth, flash } = usePage().props;
    const successMessage = flash?.success;
    const errorMessage = flash?.error;
    const initialStatus =
        auth?.user?.agent_profile?.onboarding_status ||
        auth?.user?.agentProfile?.onboarding_status ||
        "approved";
    const [mobileOpen, setMobileOpen] = useState(false);
    const [onboardingStatus, setOnboardingStatus] = useState(initialStatus);
    const agent = auth?.user?.agent_profile || auth?.user?.agentProfile || {
        id: auth?.user?.id || 1,
        agency_name: auth?.user?.name || "Mitra RentGo",
    };

    const handleLogout = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.post(typeof route === "function" ? route("logout") : "/logout");
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#111] font-sans">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-[#111] text-white flex-shrink-0 flex flex-col transition-transform lg:translate-x-0 ${
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="h-16 flex items-center px-5 border-b border-stone-800">
                        <Link href="/">
                            <ApplicationLogo theme="dark" height="h-7" />
                        </Link>
                    </div>

                    <div className="px-5 py-4 border-b border-stone-800">
                        <div className="flex items-center justify-between">
                            <span className="text-[#F5B800] text-[10px] font-semibold uppercase tracking-[0.16em]">
                                Portal Mitra
                            </span>
                        </div>
                        <p className="text-sm font-semibold mt-1 truncate">
                            {agent.agency_name}
                        </p>
                        <p className="text-[11px] text-stone-500">
                            Kode AGT-{String(agent.id).padStart(4, "0")}
                        </p>

                        <div className="mt-2.5">
                            {onboardingStatus === "approved" ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Mitra Terverifikasi
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-amber-950/80 text-[#F5B800] border border-amber-800 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] animate-pulse"></span>
                                    Menunggu Persetujuan
                                </span>
                            )}
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-3">
                        {NAV.map((item) => {
                            const isActive = active === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                                        isActive
                                            ? "bg-stone-800 text-[#F5B800] font-semibold border-l-2 border-[#F5B800]"
                                            : "text-stone-400 hover:text-white hover:bg-stone-900 border-l-2 border-transparent"
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-stone-800">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#F5B800] text-[#111] font-bold flex items-center justify-center text-xs">
                                {(auth?.user?.name || agent.owner_name).charAt(
                                    0,
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">
                                    {auth?.user?.name || agent.owner_name}
                                </p>
                                <p className="text-[10px] text-stone-500 truncate">
                                    {auth?.user?.email || "mitra@rentgo.id"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full text-left text-xs font-medium text-stone-400 hover:text-red-400 transition-colors"
                        >
                            Keluar
                        </button>
                    </div>
                </aside>

                {mobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Konten */}
                <div className="flex-1 min-w-0 flex-col">
                    <header className="h-16 bg-white border-b border-stone-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 text-stone-600 hover:text-black"
                                aria-label="Buka menu"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-sm font-semibold tracking-tight">
                                {title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Demo Status Switcher */}
                            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-sm border border-stone-200">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1 hidden md:inline">
                                    Simulasi Status:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setOnboardingStatus("pending_verification")}
                                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-xs transition ${
                                        onboardingStatus === "pending_verification"
                                            ? "bg-[#111] text-[#F5B800] shadow-xs"
                                            : "text-stone-500 hover:text-black"
                                    }`}
                                    title="Uji tampilan mitra saat belum disetujui admin"
                                >
                                    ⏳ Menunggu Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOnboardingStatus("approved")}
                                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-xs transition ${
                                        onboardingStatus === "approved"
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "text-stone-500 hover:text-black"
                                    }`}
                                    title="Uji tampilan mitra saat sudah disetujui admin"
                                >
                                    Disetujui
                                </button>
                            </div>

                            <Link
                                href="/"
                                className="hidden sm:inline-flex text-xs font-medium border border-stone-300 hover:border-[#111] text-stone-700 hover:text-black px-3 py-1.5 rounded-sm transition-colors"
                            >
                                Lihat Situs
                            </Link>
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <div className="max-w-6xl mx-auto">
                            {/* Pesan hasil aksi mitra (flash session). */}
                            {(successMessage || errorMessage) && (
                                <div
                                    className={`mb-6 rounded-sm border p-4 text-xs font-medium shadow-xs ${
                                        errorMessage
                                            ? "border-red-300 bg-red-50 text-red-800"
                                            : "border-emerald-300 bg-emerald-50 text-emerald-800"
                                    }`}
                                >
                                    {errorMessage || successMessage}
                                </div>
                            )}

                            {/* Alert Banner jika mitra belum disetujui */}
                            {onboardingStatus !== "approved" && (
                                <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-sm bg-[#F5B800] text-[#111] flex items-center justify-center shrink-0 text-base font-bold shadow-xs">
                                            ⏳
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h3 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                                                    Pendaftaran Kemitraan Menunggu Persetujuan Admin
                                                </h3>
                                                <span className="px-2.5 py-0.5 rounded-sm bg-amber-200/90 text-amber-900 text-[10px] font-bold border border-amber-300">
                                                    Status: Belum Disetujui
                                                </span>
                                            </div>
                                            <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
                                                Pengajuan akun mitra Anda sedang dalam proses verifikasi berkas oleh Administrator RentGo. Selama masa peninjauan ini, <strong>fitur pengelolaan armada (tambah unit, edit, atur ketersediaan)</strong> serta transaksi sewa belum dapat digunakan.
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                                                <span className="inline-flex items-center gap-1.5 bg-white/90 border border-amber-300 px-2.5 py-1 rounded-sm text-stone-700 text-[11px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                    Tahap 1: Verifikasi Dokumen Usaha & KTP
                                                </span>
                                                <Link
                                                    href="/mitra/profil"
                                                    className="text-amber-900 hover:text-black font-semibold underline underline-offset-2 text-[11px]"
                                                >
                                                    Lihat Dokumen Verifikasi &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
