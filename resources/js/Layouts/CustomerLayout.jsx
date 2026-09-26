import React from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

/**
 * Layout bersama untuk semua halaman sisi Customer.
 * Navbar, dropdown user, dan footer seragam — konsisten dengan Login.jsx.
 *
 * Props:
 *  - auth        : { user } dari Inertia
 *  - activeNav   : string — key tab aktif ('pesanan' | 'pesan' | 'profil' | 'beranda')
 *  - backHref    : string — href tombol kembali (default '/')
 *  - backLabel   : string — label tombol kembali (default 'Beranda')
 *  - children    : React.ReactNode
 */
export default function CustomerLayout({
    auth = {},
    activeNav = '',
    backHref = '/',
    backLabel = 'Beranda',
    maxWidth = 'max-w-6xl',
    mainClassName = '',
    children,
}) {
    const user = auth?.user;
    const isAdmin = user?.role === 'admin' || user?.email === 'admin@rentgo.test';
    const isMitra = user?.role === 'mitra' || user?.email === 'mitra@rentgo.test';

    const navLinks = [
        { id: 'beranda', label: 'Beranda', href: '/' },
        { id: 'unit', label: 'Katalog Unit', href: '/pencarian' },
        { id: 'pesanan', label: 'Pesanan Saya', href: '/pesanan' },
        { id: 'pesan', label: 'Pesan', href: '/message' },
        { id: 'ulasan', label: 'Ulasan', href: '/ulasan' },
        { id: 'profil', label: 'Profil', href: '/profile' },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
            {/* Navbar */}
            <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
                <div className={`mx-auto flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8 ${maxWidth}`}>
                    {/* Kiri: Logo + Nav */}
                    <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                        <Link href="/" className="shrink-0">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden items-center gap-1 text-[13px] lg:text-sm font-medium text-stone-600 md:flex">
                            {navLinks.filter((l) => l.id !== 'beranda').map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    className={
                                        activeNav === link.id
                                            ? 'flex items-center gap-1.5 rounded-sm bg-stone-100 px-3 py-2 font-semibold text-[#111111] transition-colors'
                                            : 'rounded-sm px-3 py-2 transition-colors hover:bg-stone-100 hover:text-[#111111]'
                                    }
                                >
                                    {activeNav === link.id && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#F5B800]" />
                                    )}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Kanan: Tombol back + User dropdown */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="hidden sm:inline-flex items-center gap-1 rounded-sm bg-[#111111] text-[#F5B800] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                            >
                                Admin Panel
                            </Link>
                        )}
                        {isMitra && (
                            <Link
                                href="/mitra"
                                className="hidden sm:inline-flex items-center gap-1 rounded-sm bg-[#F5B800] text-[#111111] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#e0a800] transition-colors"
                            >
                                Portal Mitra
                            </Link>
                        )}
                        <Link
                            href={backHref}
                            className="hidden rounded-sm border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-[#111111] sm:inline-flex"
                        >
                            &larr; {backLabel}
                        </Link>

                        {!user && (
                            <Link
                                href="/login"
                                className="rounded-sm bg-[#F5B800] px-4 py-1.5 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#e0a800]"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Konten halaman */}
            <main className={`mx-auto px-4 py-8 sm:px-6 lg:px-8 ${maxWidth} ${mainClassName}`}>
                {children}
            </main>
        </div>
    );
}
