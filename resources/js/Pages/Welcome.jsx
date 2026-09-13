import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const CARS = [
    {
        id: 1,
        nama: 'Toyota Avanza 1.3 G',
        kategori: 'MPV',
        transmisi: 'Matic',
        kursi: '7 Kursi',
        bensin: 'Bensin',
        harga: 400000,
        lokasi: 'Jakarta & Bandara Soetta',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 2,
        nama: 'Honda Brio Satya E',
        kategori: 'City Car',
        transmisi: 'Matic',
        kursi: '5 Kursi',
        bensin: 'Bensin',
        harga: 300000,
        lokasi: 'Yogyakarta & Stasiun Tugu',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1590362891988-f778047831d6?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 3,
        nama: 'Mitsubishi Xpander Sport',
        kategori: 'MPV',
        transmisi: 'Matic',
        kursi: '7 Kursi',
        bensin: 'Bensin',
        harga: 450000,
        lokasi: 'Bandung Kota',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 4,
        nama: 'Toyota Innova Reborn 2.4 G',
        kategori: 'MPV',
        transmisi: 'Matic',
        kursi: '7 Kursi',
        bensin: 'Diesel',
        harga: 650000,
        lokasi: 'Surabaya & Juanda',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 5,
        nama: 'Honda HR-V 1.5 E',
        kategori: 'SUV',
        transmisi: 'Matic',
        kursi: '5 Kursi',
        bensin: 'Bensin',
        harga: 600000,
        lokasi: 'Bali (Kuta & Bandara DPS)',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 6,
        nama: 'Toyota Fortuner VRZ 4x2',
        kategori: 'SUV',
        transmisi: 'Matic',
        kursi: '7 Kursi',
        bensin: 'Diesel',
        harga: 1100000,
        lokasi: 'Jakarta Selatan',
        lepasKunci: true,
        img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    },
];

const MOTORS = [
    {
        id: 1,
        nama: 'Yamaha NMAX 155',
        kategori: 'Maxi Scooter',
        transmisi: 'Matic',
        cc: '155 cc',
        harga: 110000,
        lokasi: 'Bali (Kuta & Seminyak)',
        img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 2,
        nama: 'Honda PCX 160',
        kategori: 'Maxi Scooter',
        transmisi: 'Matic',
        cc: '160 cc',
        harga: 120000,
        lokasi: 'Yogyakarta',
        img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 3,
        nama: 'Vespa Primavera 150',
        kategori: 'Scooter Klasik',
        transmisi: 'Matic',
        cc: '150 cc',
        harga: 180000,
        lokasi: 'Bandung & Canggu Bali',
        img: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 4,
        nama: 'Honda Vario 160',
        kategori: 'Matic Harian',
        transmisi: 'Matic',
        cc: '160 cc',
        harga: 90000,
        lokasi: 'Jakarta & Depok',
        img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=800&q=80',
    },
];

const CITIES = [
    'Semua Kota',
    'Jakarta & Sekitarnya',
    'Bali (Denpasar, Kuta, Airport)',
    'Bandung Kota',
    'Yogyakarta',
    'Surabaya',
    'Semarang',
    'Medan',
];

export default function Welcome({
    auth = {},
    flash = {},
    mobilPopuler = [],
    motorPilihan = [],
    canLogin = true,
    canRegister = true,
}) {
    const [kendaraanTipe, setKendaraanTipe] = useState('mobil');
    const [layananOpsi, setLayananOpsi] = useState('lepas-kunci');
    const [kota, setKota] = useState('Semua Kota');
    const [kategoriFilter, setKategoriFilter] = useState('Semua');
    const [toast, setToast] = useState(flash?.success || null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (flash?.success) {
            setToast(flash.success);
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

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

    const displayCars = mobilPopuler && mobilPopuler.length > 0 ? mobilPopuler : CARS;
    const displayMotors = motorPilihan && motorPilihan.length > 0 ? motorPilihan : MOTORS;

    const filteredCars = displayCars.filter((car) => {
        if (kategoriFilter === 'Semua') return true;
        return car.kategori === kategoriFilter;
    });

    const formatRupiah = (val) => {
        if (typeof val === 'number') {
            return `Rp ${val.toLocaleString('id-ID')}`;
        }
        return val;
    };

    const loginUrl = typeof route === 'function' ? route('login') : '/login';
    const registerUrl = typeof route === 'function' ? route('register') : '/register';

    return (
        <div className="min-h-screen bg-white text-[#111111] font-sans overflow-x-hidden">
            <Head>
                <title>RentGo - Rental Mobil &amp; Motor di Indonesia</title>
                <meta name="description" content="Sewa mobil dan motor lepas kunci atau dengan supir dari mitra lokal terpercaya di berbagai kota di Indonesia." />
            </Head>

            <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/">
                            <ApplicationLogo theme="light" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600 font-medium">
                            <a href="#armada-mobil" className="hover:text-black">Sewa Mobil</a>
                            <a href="#armada-motor" className="hover:text-black">Sewa Motor</a>
                            <a href="#keunggulan" className="hover:text-black">Cara Pesan</a>
                            <a href="#mitra" className="hover:text-black">Jadi Mitra</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    id="user-menu-button"
                                    onClick={() => setDropdownOpen((v) => !v)}
                                    className="flex items-center gap-2.5 py-1.5 pl-2 pr-3.5 rounded-full border border-stone-200 bg-white hover:border-[#F5B800] hover:shadow-md hover:shadow-stone-200/50 transition-all duration-200 focus:outline-none"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#111111] text-[#F5B800] font-black flex items-center justify-center text-xs tracking-wider shadow-sm ring-2 ring-[#F5B800]">
                                        {auth.user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="hidden sm:flex flex-col text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-[#111111] leading-tight">
                                                {auth.user.name?.split(' ')[0]}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                        </div>
                                        <span className="text-[10px] text-stone-400 font-medium leading-none">Member RentGo</span>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-black' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-stone-100 rounded-2xl shadow-2xl shadow-stone-900/15 z-50 overflow-hidden ring-1 ring-black/5">
                                        <div className="p-4 bg-gradient-to-br from-stone-900 to-[#111111] text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#F5B800] text-[#111111] font-black flex items-center justify-center text-sm uppercase shrink-0 shadow-inner">
                                                    {auth.user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-white truncate">{auth.user.name}</p>
                                                    <p className="text-[11px] text-stone-400 truncate mt-0.5">{auth.user.email}</p>
                                                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5B800]/20 text-[#F5B800] text-[9px] font-extrabold uppercase tracking-wider">
                                                        <span>●</span> Member Terverifikasi
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <Link
                                                href={typeof route === 'function' ? route('profile.edit') : '/profile'}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-black transition-colors group"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-[#F5B800]/20 group-hover:text-[#b38600] transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="leading-none">Profil &amp; Akun</p>
                                                    <p className="text-[10px] text-stone-400 mt-0.5 font-normal">Kelola data &amp; kata sandi</p>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="p-2 border-t border-stone-100">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                                    </svg>
                                                </div>
                                                <span className="leading-none">Keluar dari Akun</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={loginUrl}
                                        className="text-xs font-bold text-stone-600 hover:text-black px-3 py-2 transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={registerUrl}
                                        className="text-xs font-bold bg-[#F5B800] text-[#111111] hover:bg-[#e0a800] px-4 py-2 rounded-sm transition-colors"
                                    >
                                        Daftar Gratis
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {toast && (
                <div
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#111111] text-white text-xs font-semibold px-5 py-3 rounded-sm shadow-xl border border-stone-700 animate-fade-in"
                    style={{ animation: 'slideDown 0.3s ease' }}
                >
                    <svg className="w-4 h-4 text-[#F5B800] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{toast}</span>
                    <button type="button" onClick={() => setToast(null)} className="ml-2 text-stone-400 hover:text-white transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <section className="bg-[#111111] text-white py-14 sm:py-20 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none select-none z-0 flex items-center justify-end overflow-hidden">
                    <img
                        src="/landing-pagei-2-removebg-preview.png"
                        alt=""
                        className="w-[650px] sm:w-[900px] lg:w-[1250px] max-w-none opacity-30 sm:opacity-35 lg:opacity-40 -translate-y-14 sm:-translate-y-24 lg:-translate-y-36 translate-x-4 sm:translate-x-8 lg:translate-x-12 object-contain"
                    />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-3xl mb-10 sm:mb-12">
                        <span className="text-[#F5B800] font-bold text-xs uppercase tracking-wider block mb-2">
                            Sewa Mobil &amp; Motor Mudah
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                            Pesan kendaraan untuk liburan dan kebutuhan dinas Anda.
                        </h1>
                        <p className="text-stone-300 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                            Pilihan unit terawat dari mitra rental lokal terverifikasi di berbagai kota besar di Indonesia. Pilih lepas kunci atau dengan supir.
                        </p>
                    </div>

                    <div className="bg-white text-[#111111] p-5 sm:p-6 rounded-sm shadow-xl border border-stone-200">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
                            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-sm">
                                <button
                                    type="button"
                                    onClick={() => setKendaraanTipe('mobil')}
                                    className={`text-xs font-bold px-4 py-2 rounded-sm transition-colors ${
                                        kendaraanTipe === 'mobil'
                                            ? 'bg-[#111111] text-[#F5B800]'
                                            : 'text-stone-600 hover:text-black'
                                    }`}
                                >
                                    Sewa Mobil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setKendaraanTipe('motor')}
                                    className={`text-xs font-bold px-4 py-2 rounded-sm transition-colors ${
                                        kendaraanTipe === 'motor'
                                            ? 'bg-[#111111] text-[#F5B800]'
                                            : 'text-stone-600 hover:text-black'
                                    }`}
                                >
                                    Sewa Motor
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-stone-500 font-medium">Layanan:</span>
                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                                    <input
                                        type="radio"
                                        name="layanan"
                                        checked={layananOpsi === 'lepas-kunci'}
                                        onChange={() => setLayananOpsi('lepas-kunci')}
                                        className="text-[#111111] focus:ring-[#F5B800]"
                                    />
                                    Lepas Kunci
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold ml-2">
                                    <input
                                        type="radio"
                                        name="layanan"
                                        checked={layananOpsi === 'supir'}
                                        onChange={() => setLayananOpsi('supir')}
                                        className="text-[#111111] focus:ring-[#F5B800]"
                                    />
                                    Dengan Supir
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 items-end">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Kota Penjemputan
                                </label>
                                <select
                                    value={kota}
                                    onChange={(e) => setKota(e.target.value)}
                                    className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                                >
                                    {CITIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                    Durasi Sewa
                                </label>
                                <select
                                    defaultValue="1 Hari"
                                    className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none"
                                >
                                    <option value="1 Hari">1 Hari (24 Jam)</option>
                                    <option value="2 Hari">2 Hari</option>
                                    <option value="3 Hari">3 Hari</option>
                                    <option value="5 Hari">5 Hari</option>
                                    <option value="7 Hari">1 Minggu</option>
                                    <option value="30 Hari">1 Bulan</option>
                                </select>
                            </div>

                            <div>
                                <a
                                    href={kendaraanTipe === 'mobil' ? '#armada-mobil' : '#armada-motor'}
                                    className="w-full bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] font-bold text-xs p-2.5 rounded-sm flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Cari Kendaraan</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-stone-200 bg-[#F5F5F0] py-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111111] text-[#F5B800] flex items-center justify-center font-bold shrink-0">
                                01
                            </div>
                            <div>
                                <h2 className="font-bold text-sm text-[#111111]">Unit Terawat &amp; Bersih</h2>
                                <p className="text-stone-600 mt-0.5">Armada diperiksa kondisi rem, ban, AC, dan surat-suratnya sebelum diserahkan.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111111] text-[#F5B800] flex items-center justify-center font-bold shrink-0">
                                02
                            </div>
                            <div>
                                <h2 className="font-bold text-sm text-[#111111]">Antar-Jemput Fleksibel</h2>
                                <p className="text-stone-600 mt-0.5">Unit siap diantar ke bandara, stasiun, hotel, atau alamat tujuan Anda.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111111] text-[#F5B800] flex items-center justify-center font-bold shrink-0">
                                03
                            </div>
                            <div>
                                <h2 className="font-bold text-sm text-[#111111]">Harga Jelas di Awal</h2>
                                <p className="text-stone-600 mt-0.5">Tanpa biaya tak terduga saat pengembalian unit. Pilihan asuransi tersedia.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="armada-mobil" className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                    <div>
                        <span className="text-xs font-bold text-[#F5B800] bg-[#111111] px-2 py-0.5 rounded-xs inline-block mb-1">
                            PILIHAN ARMADA
                        </span>
                        <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Pilihan Mobil Populer</h2>
                        <p className="text-xs text-stone-500 mt-0.5">Koleksi mobil yang paling sering disewa untuk keperluan keluarga dan pekerjaan.</p>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {['Semua', 'MPV', 'City Car', 'SUV'].map((kategori) => (
                            <button
                                key={kategori}
                                type="button"
                                onClick={() => setKategoriFilter(kategori)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-sm border transition-colors ${
                                    kategoriFilter === kategori
                                        ? 'bg-[#111111] text-[#F5B800] border-[#111111]'
                                        : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                                }`}
                            >
                                {kategori}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCars.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white border border-stone-200 hover:border-stone-400 rounded-sm overflow-hidden flex flex-col justify-between"
                        >
                            <div>
                                <div className="h-48 bg-stone-100 relative overflow-hidden">
                                    <img
                                        src={car.img}
                                        alt={car.nama}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                    <span className="absolute top-2.5 left-2.5 bg-[#111111] text-[#F5B800] text-[10px] font-bold px-2 py-0.5 rounded-xs">
                                        {car.kategori}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-base text-[#111111]">{car.nama}</h3>
                                    <p className="text-xs text-stone-500 mt-0.5">{car.lokasi}</p>

                                    <div className="flex items-center gap-4 text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100">
                                        <span>{car.transmisi}</span>
                                        <span>&bull;</span>
                                        <span>{car.kursi}</span>
                                        <span>&bull;</span>
                                        <span>{car.bensin}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-0">
                                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-stone-400 block">Tarif Sewa</span>
                                        <span className="font-extrabold text-base text-[#111111]">
                                            {formatRupiah(car.harga)}
                                        </span>
                                        <span className="text-[11px] text-stone-500"> / hari</span>
                                    </div>
                                    <Link
                                        href={canLogin ? loginUrl : '#'}
                                        className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-xs font-bold px-3.5 py-2 rounded-sm transition-colors"
                                    >
                                        Pilih Unit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="armada-motor" className="bg-[#F5F5F0] py-12 border-y border-stone-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                        <div>
                            <span className="text-xs font-bold text-[#F5B800] bg-[#111111] px-2 py-0.5 rounded-xs inline-block mb-1">
                                MOTORCYCLE RENTAL
                            </span>
                            <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Pilihan Sewa Motor</h2>
                            <p className="text-xs text-stone-600 mt-0.5">Solusi praktis dan hemat untuk menjelajahi area kota dan rute padat.</p>
                        </div>
                        <span className="text-xs text-stone-600 font-medium">
                            Termasuk 2 Helm SNI + Jas Hujan
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {displayMotors.map((moto) => (
                            <div
                                key={moto.id}
                                className="bg-white border border-stone-200 hover:border-stone-400 rounded-sm overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-40 bg-stone-100 relative overflow-hidden">
                                        <img
                                            src={moto.img}
                                            alt={moto.nama}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80';
                                            }}
                                        />
                                        <span className="absolute top-2 left-2 bg-[#111111] text-[#F5B800] text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                                            {moto.kategori}
                                        </span>
                                    </div>

                                    <div className="p-3.5">
                                        <h3 className="font-bold text-sm text-[#111111]">{moto.nama}</h3>
                                        <p className="text-xs text-stone-500 mt-0.5">{moto.lokasi}</p>
                                        <p className="text-xs text-stone-600 mt-2 font-medium">{moto.transmisi} &bull; {moto.cc}</p>
                                    </div>
                                </div>

                                <div className="p-3.5 pt-0">
                                    <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-sm text-[#111111]">
                                                {formatRupiah(moto.harga)}
                                            </span>
                                            <span className="text-[10px] text-stone-500"> / hari</span>
                                        </div>
                                        <Link
                                            href={canLogin ? loginUrl : '#'}
                                            className="bg-[#111111] hover:bg-stone-800 text-[#F5B800] text-xs font-bold px-3 py-1.5 rounded-sm"
                                        >
                                            Sewa
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="keunggulan" className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <span className="text-xs font-bold text-[#F5B800] bg-[#111111] px-2 py-0.5 rounded-xs inline-block mb-1">
                        CARA PEMESANAN
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Bagaimana Cara Sewa di RentGo?</h2>
                    <p className="text-xs text-stone-500 mt-0.5">Empat langkah mudah untuk memulai perjalanan Anda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-stone-200 p-4 rounded-sm bg-white">
                        <span className="text-xs font-black text-[#111111] bg-[#F5B800] px-2 py-1 rounded-xs inline-block mb-3">
                            Langkah 1
                        </span>
                        <h3 className="font-bold text-sm text-[#111111]">Pilih Armada</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Cari mobil atau motor yang sesuai kapasitas dan kota tujuan penjemputan Anda.
                        </p>
                    </div>

                    <div className="border border-stone-200 p-4 rounded-sm bg-white">
                        <span className="text-xs font-black text-[#111111] bg-[#F5B800] px-2 py-1 rounded-xs inline-block mb-3">
                            Langkah 2
                        </span>
                        <h3 className="font-bold text-sm text-[#111111]">Verifikasi Identitas</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Unggah foto KTP dan SIM secara digital. Verifikasi berlangsung cepat secara online.
                        </p>
                    </div>

                    <div className="border border-stone-200 p-4 rounded-sm bg-white">
                        <span className="text-xs font-black text-[#111111] bg-[#F5B800] px-2 py-1 rounded-xs inline-block mb-3">
                            Langkah 3
                        </span>
                        <h3 className="font-bold text-sm text-[#111111]">Serah Terima</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Mitra kami mengantar unit langsung ke bandara, stasiun, hotel, atau alamat Anda.
                        </p>
                    </div>

                    <div className="border border-stone-200 p-4 rounded-sm bg-white">
                        <span className="text-xs font-black text-[#111111] bg-[#F5B800] px-2 py-1 rounded-xs inline-block mb-3">
                            Langkah 4
                        </span>
                        <h3 className="font-bold text-sm text-[#111111]">Mulai Perjalanan</h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            Kendaraan siap dipakai dengan dukungan tim bantuan darurat 24 jam jika dibutuhkan.
                        </p>
                    </div>
                </div>
            </section>

            <section id="mitra" className="bg-[#111111] text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <span className="text-xs font-bold text-[#F5B800] uppercase tracking-wider block mb-1">
                            Gabung Sebagai Mitra
                        </span>
                        <h2 className="text-2xl font-bold text-white">Memiliki Usaha Rental atau Kendaraan yang Jarang Dipakai?</h2>
                        <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                            Daftarkan armada Anda di platform RentGo untuk mendapatkan calon penyewa terverifikasi dan kelola jadwal sewa dengan mudah.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={canRegister ? registerUrl : '#'}
                            className="bg-[#F5B800] hover:bg-[#e0a800] text-[#111111] text-xs font-bold px-5 py-3 rounded-sm transition-colors"
                        >
                            Daftar Mitra Rental
                        </Link>
                        <a
                            href="https://wa.me/"
                            target="_blank"
                            rel="noreferrer"
                            className="border border-stone-700 hover:border-white text-white text-xs font-semibold px-4 py-3 rounded-sm transition-colors"
                        >
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </section>

            <footer className="border-t border-stone-200 bg-white py-10 text-xs text-stone-600">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-1 space-y-2">
                            <ApplicationLogo theme="light" iconSize="w-7 h-7" />
                            <p className="text-stone-500 leading-relaxed">
                                Platform penyewaan mobil dan motor di Indonesia dengan mitra lokal terverifikasi.
                            </p>
                            <p className="text-stone-800 font-semibold pt-1">
                                CS: 0812-3456-7890
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#111111] mb-2 uppercase tracking-wide text-[11px]">Layanan</h4>
                            <ul className="space-y-1.5">
                                <li><a href="#armada-mobil" className="hover:text-black">Sewa Mobil Lepas Kunci</a></li>
                                <li><a href="#armada-mobil" className="hover:text-black">Sewa Mobil dengan Supir</a></li>
                                <li><a href="#armada-motor" className="hover:text-black">Sewa Motor Harian</a></li>
                                <li><a href="#keunggulan" className="hover:text-black">Antar Jemput Bandara</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#111111] mb-2 uppercase tracking-wide text-[11px]">Kota Populer</h4>
                            <ul className="space-y-1.5">
                                <li><a href="#armada-mobil" className="hover:text-black">Rental Mobil Bali</a></li>
                                <li><a href="#armada-mobil" className="hover:text-black">Rental Mobil Jakarta</a></li>
                                <li><a href="#armada-mobil" className="hover:text-black">Rental Mobil Jogja</a></li>
                                <li><a href="#armada-mobil" className="hover:text-black">Rental Mobil Bandung</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-[#111111] mb-2 uppercase tracking-wide text-[11px]">Bantuan &amp; Mitra</h4>
                            <ul className="space-y-1.5">
                                <li><a href="#mitra" className="hover:text-black">Daftar Mitra Rental</a></li>
                                <li><a href="#keunggulan" className="hover:text-black">Syarat &amp; Ketentuan</a></li>
                                <li><a href="#keunggulan" className="hover:text-black">Kebijakan Privasi</a></li>
                                <li><a href="#keunggulan" className="hover:text-black">Pusat Bantuan</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-[11px]">
                        <p>&copy; {new Date().getFullYear()} RentGo Indonesia. Hak cipta dilindungi.</p>
                        <p>Pembayaran resmi: Transfer Bank, VA, &amp; QRIS</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}