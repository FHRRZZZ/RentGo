import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import UserAvatar from "@/Components/UserAvatar";

// Placeholder abu-abu bila foto unit belum diunggah mitra.
const NO_PHOTO =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="24" text-anchor="middle">Foto unit belum tersedia</text></svg>`,
    );

// Label & warna status unit — dipakai untuk menandai unit yang belum bisa disewa.
const UNIT_STATUS = {
    available: {
        label: "Tersedia",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    booked: {
        label: "Sudah Dipesan",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    rented: {
        label: "Sedang Disewa",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    maintenance: {
        label: "Servis",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    inactive: {
        label: "Nonaktif",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
    draft: {
        label: "Draft",
        color: "bg-stone-100 text-stone-600 border-stone-300",
    },
    pending_review: {
        label: "Menunggu Verifikasi",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
    },
};

const statusMeta = (status) =>
    UNIT_STATUS[status] || {
        label: status || "-",
        color: "bg-stone-100 text-stone-600 border-stone-300",
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

    // Nomor WhatsApp mitra (ubah awalan 0 menjadi 62).
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

    const availableTypes = useMemo(() => {
        const types = Array.from(
            new Set(units.map((u) => u.tipe).filter(Boolean)),
        );
        return ["Semua", ...types];
    }, [units]);

    const filteredUnits = useMemo(() => {
        if (filterTipe === "Semua") return units;
        return units.filter((u) => u.tipe === filterTipe);
    }, [units, filterTipe]);

    const tersediaUnits = units.filter((u) => u.tersedia);
    const mobilCount = tersediaUnits.filter((u) => u.tipe === "mobil").length;
    const motorCount = tersediaUnits.filter((u) => u.tipe === "motor").length;
    const siapSewa =
        availableCount !== null ? availableCount : tersediaUnits.length;
    const hargaMulai = tersediaUnits.length
        ? Math.min(...tersediaUnits.map((u) => Number(u.harga) || 0))
        : 0;

    const tipeLabel = (tipe) => (tipe === "motor" ? "Motor" : "Mobil");

    const lokasiToko = [agent.address, agent.city, agent.province]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#111] font-sans antialiased">
            <Head>
                <title>{`${agent.nama || "Toko Mitra"} - RentGo`}</title>
                <meta
                    name="description"
                    content={`Unit rental yang tersedia di ${agent.nama || "mitra RentGo"}${
                        agent.city ? ", " + agent.city : ""
                    }.`}
                />
            </Head>

            {/* Navbar ringkas — konsisten dengan halaman publik lain */}
            <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
                <div className="max-w-6xl mx-auto flex h-16 lg:h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6 min-w-0">
                        <Link href="/" className="shrink-0">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-5 text-[13px] lg:text-sm font-medium text-stone-600">
                            <Link href="/" className="hover:text-[#111]">
                                Beranda
                            </Link>
                            <Link href="/pencarian" className="hover:text-[#111]">
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
                            className="inline-flex items-center rounded-sm border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-[#111]"
                        >
                            &larr; Beranda
                        </Link>
                        {auth?.user ? (
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors"
                            >
                                <UserAvatar user={auth.user} className="w-7 h-7" />
                                <span className="text-xs font-semibold text-[#111] leading-tight max-w-[110px] truncate">
                                    {auth.user.name?.split(" ")[0]}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-sm bg-[#F5B800] px-4 py-1.5 text-xs font-semibold text-[#111] transition-colors hover:bg-[#e0a800]"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ====== Bagian Atas: Profil Toko Mitra ====== */}
                <section className="relative bg-[#111] text-white rounded-sm overflow-hidden">
                    {/* Gambar dekorasi transparan (unit mobil) di sisi kanan header toko. */}
                    <div className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-end overflow-hidden">
                        <img
                            src="/landing-pagei-2-removebg-preview.png"
                            alt=""
                            className="w-[420px] sm:w-[600px] lg:w-[760px] max-w-none opacity-20 sm:opacity-25 lg:opacity-30 -translate-y-6 sm:-translate-y-10 lg:-translate-y-14 translate-x-6 sm:translate-x-10 lg:translate-x-16 object-contain"
                        />
                    </div>

                    <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5B800] text-[#111] px-2 py-0.5 rounded-xs">
                                    Toko Mitra
                                </span>
                                {agent.isVerified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-xs">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Mitra Terverifikasi
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white break-words">
                                {agent.nama || "Mitra RentGo"}
                            </h1>

                            {ratingAvg !== null && (
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-[#F5B800]">
                                        {"★".repeat(
                                            Math.max(
                                                0,
                                                Math.min(
                                                    5,
                                                    Math.round(ratingAvg),
                                                ),
                                            ),
                                        )}
                                        <span className="text-stone-600">
                                            {"★".repeat(
                                                Math.max(
                                                    0,
                                                    5 - Math.round(ratingAvg),
                                                ),
                                            )}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-white">
                                        {ratingAvg}
                                    </span>
                                    <span className="text-stone-400 text-xs">
                                        ({reviewCount} ulasan)
                                    </span>
                                </div>
                            )}

                            <p className="text-sm text-stone-300 mt-3 max-w-2xl leading-relaxed">
                                {agent.description ||
                                    "Mitra penyedia unit rental RentGo dengan armada terawat dan siap disewa."}
                            </p>

                            {lokasiToko && (
                                <div className="mt-4 flex items-start gap-2 text-xs text-stone-300">
                                    <svg
                                        className="w-4 h-4 text-[#F5B800] shrink-0 mt-0.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                        />
                                    </svg>
                                    <span className="leading-relaxed">
                                        {lokasiToko}
                                    </span>
                                </div>
                            )}

                            {/* Aksi kontak: chat internal + WhatsApp mitra */}
                            {(canChat || waHref) && (
                                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                                    {canChat && (
                                        <button
                                            type="button"
                                            onClick={handleChat}
                                            className="inline-flex items-center gap-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
                                        >
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
                                                    d="M7.5 8.25h9m-9 3h6m-9.75 8.25 2.25-3h8.25A3.75 3.75 0 0018 12.75v-3A3.75 3.75 0 0014.25 6h-4.5A3.75 3.75 0 006 9.75v6.75z"
                                                />
                                            </svg>
                                            <span>Chat Mitra</span>
                                        </button>
                                    )}
                                    {waHref && (
                                        <a
                                            href={waHref}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.47-.01s-.43.06-.66.31c-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                                            </svg>
                                            <span>WhatsApp</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ringkasan statistik toko */}
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-3 shrink-0 md:w-44">
                            <div className="border border-stone-700/60 rounded-sm px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                                    Mobil
                                </p>
                                <p className="text-lg font-semibold text-white">
                                    {mobilCount}
                                </p>
                            </div>
                            <div className="border border-stone-700/60 rounded-sm px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                                    Motor
                                </p>
                                <p className="text-lg font-semibold text-white">
                                    {motorCount}
                                </p>
                            </div>
                            <div className="border border-stone-700/60 rounded-sm px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                                    Mulai
                                </p>
                                <p className="text-sm font-semibold text-[#F5B800] whitespace-nowrap">
                                    {tersediaUnits.length
                                        ? formatRupiah(hargaMulai)
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Kontak toko */}
                    {(agent.ownerName || agent.phone || agent.businessType) && (
                        <div className="relative z-10 border-t border-stone-800 px-6 sm:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone-400">
                            {agent.ownerName && (
                                <span>
                                    Pemilik:{" "}
                                    <span className="text-stone-200 font-medium">
                                        {agent.ownerName}
                                    </span>
                                </span>
                            )}
                            {agent.businessType && (
                                <span>
                                    Jenis usaha:{" "}
                                    <span className="text-stone-200 font-medium">
                                        {agent.businessType}
                                    </span>
                                </span>
                            )}
                            {agent.phone && (
                                <a
                                    href={`tel:${agent.phone}`}
                                    className="inline-flex items-center gap-1.5 text-[#F5B800] font-medium hover:underline"
                                >
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                                        />
                                    </svg>
                                    {agent.phone}
                                </a>
                            )}
                        </div>
                    )}
                </section>

                {/* ====== Bagian Bawah: Mapping Unit (tersedia & belum) ====== */}
                <section className="mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                        <div>
                            <span className="text-xs font-bold text-[#F5B800] bg-[#111] px-2 py-0.5 rounded-xs inline-block mb-1">
                                MAPPING UNIT
                            </span>
                            <h2 className="text-2xl font-semibold tracking-tight text-[#111]">
                                Mapping Unit Mitra
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">
                                {siapSewa} unit siap disewa
                                {units.length > siapSewa
                                    ? ` • ${units.length - siapSewa} unit belum tersedia`
                                    : ""}{" "}
                                dari mitra ini.
                            </p>
                        </div>

                        {availableTypes.length > 2 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {availableTypes.map((tipe) => (
                                    <button
                                        key={tipe}
                                        type="button"
                                        onClick={() => setFilterTipe(tipe)}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors whitespace-nowrap ${
                                            filterTipe === tipe
                                                ? "bg-[#111] text-[#F5B800] border-[#111]"
                                                : "bg-white text-stone-700 border-stone-300 hover:border-black"
                                        }`}
                                    >
                                        {tipe === "Semua"
                                            ? "Semua"
                                            : tipeLabel(tipe)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {filteredUnits.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-stone-300 rounded-sm bg-white">
                            <svg
                                className="w-9 h-9 text-stone-300 mx-auto mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                            <p className="text-stone-500 text-sm font-medium">
                                Belum ada unit pada mitra ini.
                            </p>
                            <Link
                                href="/pencarian"
                                className="inline-block mt-4 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                            >
                                Cari Unit Lain
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    className={`bg-white border rounded-sm overflow-hidden flex flex-col justify-between transition-colors ${
                                        unit.tersedia
                                            ? "border-stone-200 hover:border-stone-400"
                                            : "border-stone-200 opacity-90"
                                    }`}
                                >
                                    <div>
                                        <div className="h-48 bg-stone-100 relative overflow-hidden">
                                            <img
                                                src={unit.img || NO_PHOTO}
                                                alt={unit.nama}
                                                className={`w-full h-full object-cover ${
                                                    unit.tersedia
                                                        ? ""
                                                        : "grayscale"
                                                }`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = NO_PHOTO;
                                                }}
                                            />
                                            <span className="absolute top-2.5 left-2.5 bg-[#111] text-[#F5B800] text-[10px] font-medium px-2 py-0.5 rounded-xs">
                                                {tipeLabel(unit.tipe)}
                                            </span>
                                            {!unit.tersedia && (
                                                <span
                                                    className={`absolute top-2.5 right-2.5 text-[10px] font-semibold border px-2 py-0.5 rounded-xs ${
                                                        statusMeta(unit.status)
                                                            .color
                                                    }`}
                                                >
                                                    {
                                                        statusMeta(unit.status)
                                                            .label
                                                    }
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-base text-[#111]">
                                                {unit.nama}
                                            </h3>
                                            <p className="text-xs text-stone-500 mt-0.5">
                                                {unit.kategori}
                                                {unit.tahun
                                                    ? ` • ${unit.tahun}`
                                                    : ""}
                                            </p>

                                            <div className="flex items-center gap-3 text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100 flex-wrap">
                                                <span>{unit.transmisi}</span>
                                                <span className="text-stone-300">
                                                    &bull;
                                                </span>
                                                {unit.tipe === "motor" ? (
                                                    <span>{unit.bensin}</span>
                                                ) : (
                                                    <span>{unit.kursi}</span>
                                                )}
                                                {unit.merek && (
                                                    <>
                                                        <span className="text-stone-300">
                                                            &bull;
                                                        </span>
                                                        <span className="truncate max-w-[120px]">
                                                            {unit.merek}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 pt-0">
                                        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-stone-400 block">
                                                    Tarif Sewa
                                                </span>
                                                <span className="font-semibold text-base text-[#111]">
                                                    {unit.tersedia
                                                        ? formatRupiah(
                                                              unit.harga,
                                                          )
                                                        : "—"}
                                                </span>
                                                {unit.tersedia && (
                                                    <span className="text-[11px] text-stone-500">
                                                        {" "}
                                                        / hari
                                                    </span>
                                                )}
                                            </div>
                                            {unit.tersedia ? (
                                                <Link
                                                    href={`/vehicles/${unit.id}`}
                                                    className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold px-3.5 py-2 rounded-sm transition-colors"
                                                >
                                                    Sewa Unit
                                                </Link>
                                            ) : (
                                                <span
                                                    className="bg-stone-100 text-stone-400 text-xs font-semibold px-3.5 py-2 rounded-sm cursor-not-allowed"
                                                    title={
                                                        statusMeta(unit.status)
                                                            .label
                                                    }
                                                >
                                                    Belum Tersedia
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
