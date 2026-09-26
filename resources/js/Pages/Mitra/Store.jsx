import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import UserAvatar from "@/Components/UserAvatar";

// Placeholder bila foto unit belum diunggah mitra.
const NO_PHOTO =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="20" font-weight="500" text-anchor="middle">Foto unit belum tersedia</text></svg>`,
    );

// Label & warna status unit
const UNIT_STATUS = {
    available: {
        label: "Tersedia",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    booked: {
        label: "Sudah Dipesan",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
    },
    rented: {
        label: "Sedang Disewa",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dot: "bg-indigo-500",
    },
    maintenance: {
        label: "Servis",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-500",
    },
    inactive: {
        label: "Nonaktif",
        badge: "bg-stone-100 text-stone-600 border-stone-200",
        dot: "bg-stone-400",
    },
    draft: {
        label: "Draft",
        badge: "bg-stone-100 text-stone-600 border-stone-200",
        dot: "bg-stone-400",
    },
    pending_review: {
        label: "Verifikasi",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-500",
    },
    rejected: {
        label: "Ditolak",
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
    },
};

const statusMeta = (status) =>
    UNIT_STATUS[status] || {
        label: status || "-",
        badge: "bg-stone-100 text-stone-600 border-stone-200",
        dot: "bg-stone-400",
    };

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

export default function MitraStore({
    auth = {},
    agent = {},
    ratingAvg = null,
    reviewCount = 0,
    units = [],
    availableCount = null,
}) {
    const [filterTipe, setFilterTipe] = useState("Semua");

    const isAdmin =
        auth?.user?.role === "admin" ||
        auth?.user?.email === "admin@rentgo.test";
    const isMitra =
        auth?.user?.role === "mitra" ||
        auth?.user?.email === "mitra@rentgo.test";

    // Chat internal hanya untuk customer/pengunjung yang sudah login.
    const canChat = Boolean(auth?.user) && !isMitra && !isAdmin;

    // Nomor WhatsApp mitra
    const waNumber = (agent.phone || "")
        .replace(/[^0-9]/g, "")
        .replace(/^0/, "62");
    const waHref = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Halo ${agent.nama || "Mitra RentGo"}, saya ingin bertanya tentang unit rental Anda di RentGo.`,
          )}`
        : null;

    const handleChat = () => {
        router.post(`/mitra/${agent.id}/chat`);
    };

    const filteredUnits = useMemo(() => {
        if (filterTipe === "Semua") return units;
        return units.filter((u) => u.tipe === filterTipe);
    }, [units, filterTipe]);

    const tersediaUnits = units.filter((u) => u.tersedia);
    const mobilCount = units.filter((u) => u.tipe === "mobil").length;
    const motorCount = units.filter((u) => u.tipe === "motor").length;
    const siapSewa =
        availableCount !== null ? availableCount : tersediaUnits.length;
    const hargaMulai = tersediaUnits.length
        ? Math.min(...tersediaUnits.map((u) => Number(u.harga) || 0))
        : 0;

    const lokasiToko = [agent.address, agent.city, agent.province]
        .filter(Boolean)
        .join(", ");

    // Inisial untuk fallback logo jika belum upload foto
    const initials = (agent.nama || "Mitra")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="min-h-screen bg-white text-stone-900 font-sans antialiased flex flex-col">
            <Head>
                <title>{`${agent.nama || "Toko Mitra"} - Katalog Armada RentGo`}</title>
                <meta
                    name="description"
                    content={`Katalog unit rental resmi ${agent.nama || "mitra RentGo"}${
                        agent.city ? " di " + agent.city : ""
                    }. Sewa mobil & motor mudah, terawat, dan terpercaya.`}
                />
            </Head>

            {/* Navbar Utama */}
            <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                        <Link href="/" className="shrink-0">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-stone-600">
                            <Link href="/" className="hover:text-black transition-colors">
                                Beranda
                            </Link>
                            <Link href="/pencarian" className="text-black font-semibold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                Katalog Unit
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="hidden sm:inline-flex items-center gap-1 rounded-sm bg-[#111] text-[#F5B800] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                            >
                                Admin Panel
                            </Link>
                        )}
                        {isMitra && (
                            <Link
                                href="/mitra"
                                className="hidden sm:inline-flex items-center gap-1 rounded-sm bg-[#F5B800] text-[#111] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#e0a800] transition-colors"
                            >
                                Portal Mitra
                            </Link>
                        )}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 rounded-sm border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-black"
                        >
                            &larr; <span className="hidden sm:inline">Kembali ke</span> Beranda
                        </Link>
                        {auth?.user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
                            >
                                <UserAvatar user={auth.user} className="w-7 h-7" />
                                <span className="text-xs font-semibold text-stone-800 leading-tight max-w-[100px] truncate">
                                    {auth.user.name?.split(" ")[0]}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-sm bg-[#F5B800] px-3.5 py-1.5 text-xs font-semibold text-[#111] transition-colors hover:bg-[#e0a800]"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* ====== Banner & Profil Toko Mitra ====== */}
                <section className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden mb-8">
                    {/* Top Decorative Banner — Desain Otomotif Premium RentGo */}
                    <div className="relative bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#111111] overflow-hidden min-h-[220px] sm:min-h-[260px] md:min-h-[285px] p-5 sm:p-7 md:p-8 flex flex-col justify-between">
                        {/* Background Fleet / Custom Banner */}
                        <img
                            src={agent.banner || "/images/mitra-banner-cars.jpg"}
                            alt={agent.nama ? `Banner ${agent.nama}` : "Banner Mitra"}
                            className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
                        />

                        {/* Dual Dark Gradient Overlay for Maximum Readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 via-45% to-black/30 pointer-events-none" />
                        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                        {/* Yellow racing stripes / chevrons top-right & bottom-right */}
                        <div className="absolute top-0 right-0 w-36 h-20 pointer-events-none overflow-hidden opacity-90 hidden sm:block">
                            <div className="absolute -top-6 -right-6 w-28 h-14 bg-[#F5B800] -skew-x-[35deg]" />
                            <div className="absolute -top-6 right-10 w-7 h-14 bg-[#F5B800] -skew-x-[35deg]" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none overflow-hidden opacity-90 hidden sm:block">
                            <div className="absolute -bottom-6 -right-6 w-28 h-14 bg-[#F5B800] -skew-x-[35deg]" />
                            <div className="absolute -bottom-6 right-10 w-7 h-14 bg-[#F5B800] -skew-x-[35deg]" />
                        </div>

                        {/* Top / Main Banner Content */}
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
                            {/* Logo Card (White Box with rounded corners) */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-lg p-2.5 sm:p-3 shadow-xl border border-white/40 shrink-0 flex items-center justify-center overflow-hidden">
                                {agent.logo ? (
                                    <img
                                        src={agent.logo}
                                        alt={agent.nama || "Logo Mitra"}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.style.display = "none";
                                            if (e.currentTarget.nextElementSibling) {
                                                e.currentTarget.nextElementSibling.style.display = "flex";
                                            }
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="w-full h-full bg-gradient-to-br from-stone-900 to-black text-[#F5B800] flex flex-col items-center justify-center font-bold text-2xl tracking-wider rounded-md"
                                    style={{ display: agent.logo ? 'none' : 'flex' }}
                                >
                                    <span>{initials}</span>
                                    <span className="text-[9px] font-semibold tracking-normal text-stone-400 uppercase mt-0.5">
                                        Mitra
                                    </span>
                                </div>
                            </div>

                            {/* Headline & Official Partner */}
                            <div className="flex-1 min-w-0">
                                <span className="inline-flex items-center gap-1.5 bg-[#F5B800] text-[#111] text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xs shadow-xs mb-2">
                                    Official Partner
                                </span>
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                                    <span>Mitra Resmi Penyedia </span>
                                    <span className="text-[#F5B800]">Rental Terdaftar</span>
                                    <span className="block sm:inline"> di RentGo</span>
                                </h1>
                                <p className="text-stone-300 text-xs sm:text-sm font-normal mt-2 max-w-lg leading-relaxed drop-shadow-sm">
                                    {agent.description || "Pilihan kendaraan terbaik untuk perjalanan Anda yang lebih aman & nyaman."}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Feature Badges (4 Badges) */}
                        <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {/* 1. Aman & Terpercaya */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F5B800] text-[#111] flex items-center justify-center shrink-0 shadow-sm font-bold">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">Aman & Terpercaya</p>
                                    <p className="text-[10px] text-stone-400">Legalitas terverifikasi</p>
                                </div>
                            </div>

                            {/* 2. Kendaraan Berkualitas */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F5B800] text-[#111] flex items-center justify-center shrink-0 shadow-sm font-bold">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zm-11-2h14a1 1 0 001-1v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a1 1 0 001 1zm2-7l2.5-3.5h7L17 8H7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">Kendaraan Berkualitas</p>
                                    <p className="text-[10px] text-stone-400">Unit terawat & prima</p>
                                </div>
                            </div>

                            {/* 3. Layanan 24 Jam */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F5B800] text-[#111] flex items-center justify-center shrink-0 shadow-sm font-bold">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">Layanan 24 Jam</p>
                                    <p className="text-[10px] text-stone-400">Respon cepat & ramah</p>
                                </div>
                            </div>

                            {/* 4. Harga Bersaing */}
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#F5B800] text-[#111] flex items-center justify-center shrink-0 shadow-sm font-bold">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">Harga Bersaing</p>
                                    <p className="text-[10px] text-stone-400">Tarif jujur & transparan</p>
                                </div>
                            </div>
                        </div>

                        {/* Gold accent strip */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#F5B800]" />
                    </div>

                    {/* Profile Header Details (Bar info toko di bawah banner) */}
                    <div className="p-6 sm:p-7">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-stone-100">
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 break-words">
                                        {agent.nama || "Mitra RentGo"}
                                    </h2>
                                    {agent.isVerified && (
                                        <span
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs"
                                            title="Mitra telah melalui verifikasi dokumen legalitas resmi oleh RentGo"
                                        >
                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Terverifikasi
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                                    {agent.ownerName && (
                                        <span>
                                            Pengelola: <strong className="font-semibold text-stone-700">{agent.ownerName}</strong>
                                        </span>
                                    )}
                                    {agent.businessType && (
                                        <>
                                            <span className="text-stone-300">&bull;</span>
                                            <span className="capitalize">{agent.businessType}</span>
                                        </>
                                    )}
                                    {agent.city && (
                                        <>
                                            <span className="text-stone-300">&bull;</span>
                                            <span className="text-stone-700 font-medium">{agent.city}</span>
                                        </>
                                    )}
                                    <span className="text-stone-300">&bull;</span>
                                    <span className="text-emerald-700 font-semibold">
                                        {availableCount !== null ? `${availableCount} Unit Tersedia` : `${units.length} Unit Armada`}
                                    </span>
                                </div>
                            </div>

                            {/* Tombol Kontak (Chat / WA / Telp / Edit) */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                                {isMitra && auth?.user?.id === agent.userId && (
                                    <Link
                                        href="/mitra/profil"
                                        className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-black text-[#F5B800] text-xs font-bold px-3.5 py-2.5 rounded-sm transition-colors shadow-xs"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                        <span>Atur Banner & Profil</span>
                                    </Link>
                                )}

                                {canChat && (
                                    <button
                                        type="button"
                                        onClick={handleChat}
                                        className="inline-flex items-center gap-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h6m-9.75 8.25 2.25-3h8.25A3.75 3.75 0 0018 12.75v-3A3.75 3.75 0 0014.25 6h-4.5A3.75 3.75 0 006 9.75v6.75z" />
                                        </svg>
                                        <span>Chat Mitra</span>
                                    </button>
                                )}

                                {waHref && (
                                    <a
                                        href={waHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.47-.01s-.43.06-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                                        </svg>
                                        <span>WhatsApp</span>
                                    </a>
                                )}

                                {agent.phone && (
                                    <a
                                        href={`tel:${agent.phone}`}
                                        className="inline-flex items-center gap-1.5 border border-stone-300 hover:border-stone-400 bg-white text-stone-700 text-xs font-semibold px-3 py-2.5 rounded-sm transition-colors"
                                        title={`Telepon: ${agent.phone}`}
                                    >
                                        <svg className="w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                        <span>{agent.phone}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Description & Address */}
                        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-stone-100">
                            <div className="md:col-span-2">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                                    Tentang Toko
                                </h2>
                                <p className="text-sm text-stone-600 leading-relaxed">
                                    {agent.description ||
                                        "Mitra resmi penyedia armada rental terawat di RentGo. Melayani sewa harian, mingguan, maupun bulanan dengan proses serah terima mudah dan transparan."}
                                </p>

                                {lokasiToko && (
                                    <div className="mt-3 flex items-start gap-2 text-xs text-stone-500">
                                        <svg className="w-4 h-4 text-[#F5B800] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        <span className="leading-relaxed">{lokasiToko}</span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-stone-50 border border-stone-200/80 rounded-sm p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                        Siap Sewa
                                    </span>
                                    <span className="text-xl font-black text-stone-900">
                                        {siapSewa}
                                    </span>
                                    <span className="text-[11px] text-stone-500 block">
                                        dari {units.length} unit
                                    </span>
                                </div>

                                <div className="bg-stone-50 border border-stone-200/80 rounded-sm p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                        Mulai Dari
                                    </span>
                                    <span className="text-sm font-bold text-stone-900 block truncate">
                                        {tersediaUnits.length ? formatRupiah(hargaMulai) : "-"}
                                    </span>
                                    <span className="text-[11px] text-stone-500 block">
                                        / hari
                                    </span>
                                </div>

                                <div className="bg-stone-50 border border-stone-200/80 rounded-sm p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                        Mobil
                                    </span>
                                    <span className="text-lg font-bold text-stone-900">
                                        {mobilCount} Unit
                                    </span>
                                </div>

                                <div className="bg-stone-50 border border-stone-200/80 rounded-sm p-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                                        Motor
                                    </span>
                                    <span className="text-lg font-bold text-stone-900">
                                        {motorCount} Unit
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ====== Katalog Armada Toko Mitra ====== */}
                <section className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]"></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                    Katalog Armada
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                                Armada Rental Tersedia
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                Pilih armada yang sesuai dengan kebutuhan perjalanan Anda.
                            </p>
                        </div>

                        {/* Filter Tipe (Semua / Mobil / Motor) */}
                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-sm border border-stone-200 shrink-0">
                            <button
                                type="button"
                                onClick={() => setFilterTipe("Semua")}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors ${
                                    filterTipe === "Semua"
                                        ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                                        : "text-stone-600 hover:text-black"
                                }`}
                            >
                                Semua ({units.length})
                            </button>
                            {mobilCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFilterTipe("mobil")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors ${
                                        filterTipe === "mobil"
                                            ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                                            : "text-stone-600 hover:text-black"
                                    }`}
                                >
                                    Mobil ({mobilCount})
                                </button>
                            )}
                            {motorCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFilterTipe("motor")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-xs transition-colors ${
                                        filterTipe === "motor"
                                            ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                                            : "text-stone-600 hover:text-black"
                                    }`}
                                >
                                    Motor ({motorCount})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grid Daftar Kendaraan */}
                    {filteredUnits.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-stone-300 rounded-sm bg-stone-50/50">
                            <svg className="w-10 h-10 text-stone-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-stone-700 text-sm font-semibold">
                                Belum ada unit dalam kategori ini
                            </p>
                            <p className="text-stone-400 text-xs mt-1">
                                Silakan pilih kategori lain atau lihat seluruh katalog.
                            </p>
                            <button
                                type="button"
                                onClick={() => setFilterTipe("Semua")}
                                className="mt-4 inline-block bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold px-4 py-2 rounded-sm transition-colors"
                            >
                                Tampilkan Semua Unit
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUnits.map((unit) => {
                                const status = statusMeta(unit.status);
                                return (
                                    <article
                                        key={unit.id}
                                        className="bg-white border border-stone-200 rounded-sm hover:border-stone-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Photo Container */}
                                            <div className="h-48 sm:h-52 bg-stone-100 relative overflow-hidden">
                                                <img
                                                    src={unit.img || NO_PHOTO}
                                                    alt={unit.nama}
                                                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                                        unit.tersedia ? "" : "grayscale opacity-80"
                                                    }`}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = NO_PHOTO;
                                                    }}
                                                />

                                                {/* Tipe Badge */}
                                                <span className="absolute top-3 left-3 bg-[#111] text-[#F5B800] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs shadow-xs">
                                                    {unit.tipe === "motor" ? "Motor" : "Mobil"}
                                                </span>

                                                {/* Status Badge */}
                                                <span
                                                    className={`absolute top-3 right-3 text-[10px] font-semibold border px-2 py-0.5 rounded-xs flex items-center gap-1.5 shadow-xs ${
                                                        unit.rented_until
                                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                            : status.badge
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${unit.rented_until ? 'bg-blue-600 animate-pulse' : status.dot}`}></span>
                                                    {unit.rented_until ? `Disewa s/d ${unit.rented_until}` : status.label}
                                                </span>
                                            </div>

                                            {/* Vehicle Info */}
                                            <div className="p-4">
                                                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                                                    {unit.kategori} {unit.tahun ? `• ${unit.tahun}` : ""}
                                                </div>

                                                <h3 className="font-bold text-base text-stone-900 group-hover:text-black line-clamp-1">
                                                    {unit.nama}
                                                </h3>

                                                {/* Specs pills */}
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 flex-wrap">
                                                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs text-[11px]">
                                                        {unit.transmisi}
                                                    </span>
                                                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs text-[11px]">
                                                        {unit.tipe === "motor" ? unit.bensin : unit.kursi}
                                                    </span>
                                                    {unit.merek && (
                                                        <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-xs text-[11px] truncate max-w-[110px]">
                                                            {unit.merek}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing & CTA */}
                                        <div className="p-4 pt-0">
                                            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                                                <div>
                                                    <span className="text-[10px] text-stone-400 block font-medium">
                                                        Tarif Sewa
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="font-extrabold text-base text-stone-900">
                                                            {formatRupiah(unit.harga)}
                                                        </span>
                                                        <span className="text-[11px] text-stone-500 font-medium">
                                                            / hari
                                                        </span>
                                                    </div>
                                                    {unit.rented_until && (
                                                        <span className="text-[10px] font-semibold text-blue-700 block mt-0.5">
                                                            Tersedia {unit.rented_until}
                                                        </span>
                                                    )}
                                                </div>

                                                {unit.tersedia ? (
                                                    <Link
                                                        href={`/vehicles/${unit.id}`}
                                                        className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold px-3.5 py-2 rounded-sm transition-colors shadow-xs shrink-0"
                                                    >
                                                        Sewa Unit &rarr;
                                                    </Link>
                                                ) : unit.rented_until ? (
                                                    <Link
                                                        href={`/vehicles/${unit.id}`}
                                                        className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold px-3 py-2 rounded-sm transition-colors shrink-0"
                                                        title="Unit sedang jalan, klik untuk sewa tanggal berikutnya"
                                                    >
                                                        Cek Kalender &rarr;
                                                    </Link>
                                                ) : (
                                                    <span className="bg-stone-100 text-stone-400 text-xs font-medium px-3 py-2 rounded-sm cursor-not-allowed shrink-0">
                                                        Belum Tersedia
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ====== Keunggulan & Jaminan Transaksi ====== */}
                <section className="bg-stone-50 border border-stone-200 rounded-sm p-6 sm:p-8 mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                        Jaminan Layanan Mitra RentGo
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] text-[#F5B800] flex items-center justify-center shrink-0 text-sm font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900">
                                    Armada Terawat
                                </h4>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                    Setiap unit dicek berkala, bersih, dan siap jalan untuk kenyamanan perjalanan Anda.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] text-[#F5B800] flex items-center justify-center shrink-0 text-sm font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900">
                                    Transaksi Aman & Resmi
                                </h4>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                    Pembayaran dilindungi sistem RentGo dengan struk dan verifikasi booking otomatis.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] text-[#F5B800] flex items-center justify-center shrink-0 text-sm font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-stone-900">
                                    Serah Terima Fleksibel
                                </h4>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                    Bisa diambil langsung di garasi mitra atau diantar sesuai kesepakatan titik jemput.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
                <div className="max-w-6xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} RentGo. Seluruh hak cipta dilindungi.</p>
                </div>
            </footer>
        </div>
    );
}
