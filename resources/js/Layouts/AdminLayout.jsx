import React, { useState, useRef, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";

/**
 * Layout Khusus Role Admin RentGo dengan Navigasi Sidebar.
 * Tema gelap premium selaras dengan halaman Login & Register:
 *  - Background: #0D0D0D (near-black) dengan aksen emas #F5B800
 *  - Sidebar: #111111 dengan border stone-800
 *  - Topbar: #111111 / stone-900 dengan glassmorphism subtle
 *  - Cards: bg-stone-900 border-stone-800
 *  - Responsif: Sidebar drawer di perangkat mobile & tablet
 */

const ADMIN_NAV = [
    {
        href: "/admin",
        key: "dashboard",
        label: "Ringkasan",
        badge: null,
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        href: "/admin/users",
        key: "users",
        label: "Pengguna & Mitra",
        badge: "2 Verifikasi",
        badgeColor: "bg-amber-400/15 text-[#F5B800] border-amber-500/30",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        href: "/admin/vehicles",
        key: "vehicles",
        label: "Katalog Armada",
        badge: "1 Baru",
        badgeColor: "bg-blue-400/15 text-blue-400 border-blue-500/30",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 16l-1.5-4.5A2 2 0 0015.6 10H8.4a2 2 0 00-1.9 1.5L5 16m14 0v3a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H8v1a1 1 0 01-1 1H6a1 1 0 01-1-1v-3m14 0H5m14 0a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2" />
            </svg>
        ),
    },
    {
        href: "/admin/finance",
        key: "finance",
        label: "Keuangan & Payout",
        badge: "1 Payout",
        badgeColor: "bg-emerald-400/15 text-emerald-400 border-emerald-500/30",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        href: "/admin/disputes",
        key: "disputes",
        label: "Sengketa & Review",
        badge: "1 Sengketa",
        badgeColor: "bg-red-400/15 text-red-400 border-red-500/30",
        icon: (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
];

export default function AdminLayout({ children, activeTab = null, onTabChange = null }) {
    const page = usePage() || {};
    const url = page.url || "/admin";
    const auth = page.props?.auth || {};
    const user = auth.user || { name: "Admin RentGo", email: "admin@rentgo.test" };

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const userMenuRef = useRef(null);
    const notifRef = useRef(null);

    // Menutup dropdown ketika klik di luar area
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Deteksi menu/tab aktif
    const isCurrent = (item) => {
        if (activeTab) return activeTab === item.key;
        if (item.href === "/admin") return url === "/admin";
        return url.startsWith(item.href);
    };

    const handleNavClick = (item, e) => {
        if (onTabChange) {
            e.preventDefault();
            onTabChange(item.key);
            setMobileOpen(false);
        } else {
            setMobileOpen(false);
        }
    };

    const handleLogout = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.post(typeof route === "function" ? route("logout") : "/logout");
    };

    // Label tab yang sedang aktif untuk breadcrumb topbar
    const activeItem = ADMIN_NAV.find((item) => isCurrent(item)) || ADMIN_NAV[0];

    return (
        <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex">
            {/* ======================================================== */}
            {/* SIDEBAR (Desktop Fixed & Mobile Drawer)                   */}
            {/* ======================================================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-[#111111] text-stone-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 border-r border-stone-800/80 ${
                    mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* Header Sidebar: Logo & Badge */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-stone-800 shrink-0">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <ApplicationLogo theme="dark" height="h-7" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1 text-stone-400 hover:text-white rounded-sm"
                        aria-label="Tutup sidebar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Sub-Header: Identitas Role Admin Panel */}
                <div className="px-6 py-4 border-b border-stone-800/80 bg-stone-900/40 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B800] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5B800]"></span>
                        </span>
                        <span className="text-[#F5B800] text-[11px] font-bold uppercase tracking-[0.18em]">
                            Admin Control Center
                        </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">RentGo Platform Central</p>
                </div>

                {/* Navigasi Utama Sidebar */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-600 mb-2">
                            Menu Navigasi
                        </p>
                        <nav className="space-y-1">
                            {ADMIN_NAV.map((item) => {
                                const active = isCurrent(item);
                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        onClick={(e) => handleNavClick(item, e)}
                                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold transition-all group ${
                                            active
                                                ? "bg-stone-800 text-[#F5B800] shadow-sm border-l-2 border-[#F5B800]"
                                                : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-200 border-l-2 border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={active ? "text-[#F5B800]" : "text-stone-500 group-hover:text-stone-300"}>
                                                {item.icon}
                                            </span>
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${item.badgeColor || "bg-stone-800 text-stone-400 border-stone-700"}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Pintasan Eksternal */}
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-600 mb-2">
                            Akses Cepat
                        </p>
                        <div className="space-y-1">
                            <Link
                                href="/"
                                className="flex items-center gap-3 px-3.5 py-2 rounded-sm text-xs font-medium text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-colors"
                            >
                                <svg className="w-4 h-4 shrink-0 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Kunjungi Website Utama</span>
                            </Link>
                            <Link
                                href="/message"
                                className="flex items-center gap-3 px-3.5 py-2 rounded-sm text-xs font-medium text-stone-500 hover:text-stone-200 hover:bg-stone-800/60 transition-colors"
                            >
                                <svg className="w-4 h-4 shrink-0 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Pusat Pesan</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Sidebar: Profil Admin & Logout */}
                <div className="p-4 border-t border-stone-800 bg-stone-950/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-sm bg-[#F5B800] text-[#111111] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {user.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate leading-tight">
                                {user.name}
                            </p>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                                {user.email}
                            </p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#F5B800]/10 text-[#F5B800] text-[9px] font-bold tracking-wider uppercase rounded-sm border border-[#F5B800]/20">
                                Super Admin
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-stone-500 hover:text-red-400 hover:bg-stone-800/60 rounded-sm border border-stone-800 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Keluar Sistem</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Backdrop Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ======================================================== */}
            {/* AREA UTAMA (Topbar + Main Content + Footer)              */}
            {/* ======================================================== */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="bg-white border-b border-stone-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
                    {/* Kiri: Hamburger Toggle (Mobile) + Breadcrumb Context */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-sm text-stone-500 hover:text-black hover:bg-stone-100 border border-stone-200 transition-colors"
                            aria-label="Buka navigasi sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-xs text-stone-400 font-medium">
                                Admin Panel
                            </span>
                            <span className="hidden sm:inline text-stone-300">/</span>
                            <span className="text-sm font-bold text-[#111111] tracking-tight">
                                {activeItem.label}
                            </span>
                        </div>
                    </div>

                    {/* Tengah: Quick Search input */}
                    <div className="hidden md:flex items-center max-w-sm w-full mx-4">
                        <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Cari data pengguna, armada, pesanan..."
                                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-sm pl-9 pr-3 py-2 text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#F5B800] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Kanan: Link Publik, Notifikasi & User Dropdown */}
                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black px-3 py-1.5 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 rounded-sm transition-colors shadow-xs"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Situs Publik</span>
                        </Link>

                        {/* Notifikasi Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative p-2 rounded-sm text-stone-500 hover:text-black hover:bg-stone-100 border border-stone-200 transition-colors"
                                title="Notifikasi Sistem"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F5B800] ring-2 ring-white"></span>
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-sm shadow-xl p-3 z-50">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Pemberitahuan Admin</span>
                                        <span className="text-[10px] text-stone-400">3 Menunggu Tindakan</span>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-sm">
                                            <p className="font-semibold text-amber-900">Mitra Baru Menunggu Verifikasi</p>
                                            <p className="text-[11px] text-amber-800 mt-0.5">Surya Trans Surabaya mengunggah SIUP & NPWP.</p>
                                        </div>
                                        <div className="p-2 bg-stone-50 border border-stone-200 rounded-sm">
                                            <p className="font-semibold text-stone-800">Pencairan Dana (Payout) Diajukan</p>
                                            <p className="text-[11px] text-stone-500 mt-0.5">PT Rental CGK meminta payout Rp 720.000 ke Mandiri.</p>
                                        </div>
                                        <div className="p-2 bg-red-50 border border-red-200 rounded-sm">
                                            <p className="font-semibold text-red-900">Sengketa Deposit Baru</p>
                                            <p className="text-[11px] text-red-700 mt-0.5">Customer RG-2026-0712 mengajukan arbitrase potongan sewa.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profil Topbar Dropdown */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-sm border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 transition-colors shadow-xs"
                            >
                                <div className="w-7 h-7 rounded-sm bg-[#F5B800] text-[#111111] text-xs font-bold flex items-center justify-center">
                                    {user.name?.charAt(0)?.toUpperCase() || "A"}
                                </div>
                                <div className="hidden sm:flex flex-col text-left">
                                    <span className="text-xs font-semibold text-[#111111] leading-none">{user.name}</span>
                                    <span className="text-[10px] text-stone-500 mt-0.5 leading-none">Super Administrator</span>
                                </div>
                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-sm shadow-xl p-2 z-50">
                                    <div className="px-3 py-2 border-b border-stone-100">
                                        <p className="text-xs font-semibold text-[#111111]">{user.name}</p>
                                        <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#F5B800]/20 text-[#111111] text-[9px] font-bold uppercase rounded-sm border border-[#F5B800]/40">
                                            Role: Super Admin
                                        </span>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/admin"
                                            className="block px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 hover:text-black rounded-sm font-medium transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Dashboard Admin
                                        </Link>
                                        <Link
                                            href="/"
                                            className="block px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 hover:text-black rounded-sm transition-colors"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Kembali ke Beranda
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-sm font-medium transition-colors"
                                        >
                                            Keluar (Sign Out)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Konten Halaman Admin */}
                <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px]">
                    {children}
                </main>

                {/* Footer Admin */}
                <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
                        <p>© 2026 RentGo Platform · Panel Kendali Administrator</p>
                        <p className="flex items-center gap-3">
                            <span>Role: Super Admin</span>
                            <span>·</span>
                            <span className="text-stone-400 font-medium">Sistem Terhubung (3 Role Model: Admin, Mitra, Customer)</span>
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
