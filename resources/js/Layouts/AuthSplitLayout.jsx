import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const TRUST_ITEMS = [
    {
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        text: 'Unit terverifikasi & terawat',
    },
    {
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
        text: 'Data & transaksi aman',
    },
    {
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
        ),
        text: 'Bantuan 24/7 siap membantu',
    },
];

const REVIEWS = [
    { name: 'Budi S.', kota: 'Jakarta', text: 'Prosesnya cepat, mobilnya bersih dan tepat waktu.', bintang: 5 },
    { name: 'Rina A.', kota: 'Surabaya', text: 'Sangat mudah, bisa booking dari HP kapan saja.', bintang: 5 },
];

export default function AuthSplitLayout({ children }) {
    const { component } = usePage();
    const isLogin = component === 'Auth/Login';

    const [panelOnLeft, setPanelOnLeft] = useState(isLogin);
    const [contentVisible, setContentVisible] = useState(true);
    const [reviewIdx, setReviewIdx] = useState(0);

    useEffect(() => {
        setContentVisible(false);
        const t1 = setTimeout(() => {
            setPanelOnLeft(isLogin);
        }, 80);
        const t2 = setTimeout(() => {
            setContentVisible(true);
        }, 420);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [component]);

    const panelContent = (
        <div className="relative z-10 flex flex-col justify-between h-full py-10 px-10 xl:px-14">
            <div>
                <div className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <ApplicationLogo theme="dark" />
                    </Link>
                    {isLogin ? (
                        <Link
                            href="/register"
                            className="text-xs font-medium border border-stone-600 hover:border-[#F5B800] text-stone-300 hover:text-[#F5B800] px-4 py-2 rounded-sm transition-colors"
                        >
                            Daftar Gratis
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="text-xs font-medium border border-stone-600 hover:border-[#F5B800] text-stone-300 hover:text-[#F5B800] px-4 py-2 rounded-sm transition-colors"
                        >
                            Masuk
                        </Link>
                    )}
                </div>

                <div
                    className="transition-all duration-300"
                    style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(10px)' }}
                >
                    <span className="text-[#F5B800] font-semibold text-xs uppercase tracking-wider block mb-4">
                        Sewa Mobil &amp; Motor Mudah
                    </span>
                    <h2 className="text-3xl xl:text-4xl font-semibold tracking-tight leading-tight text-white max-w-sm">
                        {isLogin
                            ? 'Masuk dan lanjutkan pemesanan Anda'
                            : 'Bergabung dan mulai sewa kendaraan hari ini'}
                    </h2>
                    <p className="text-stone-400 text-sm mt-4 leading-relaxed max-w-sm">
                        {isLogin
                            ? 'Akses riwayat sewa, kelola pesanan aktif, dan temukan unit terbaik dari mitra rental terverifikasi di seluruh Indonesia.'
                            : 'Buat akun gratis dan dapatkan akses ke ratusan unit mobil & motor dari mitra rental terverifikasi di berbagai kota besar Indonesia.'}
                    </p>

                    <div className="mt-8 space-y-3">
                        {TRUST_ITEMS.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-sm bg-[#F5B800] text-[#111111] flex items-center justify-center flex-shrink-0">
                                    {item.icon}
                                </div>
                                <span className="text-sm text-stone-300">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className="transition-all duration-300"
                style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(10px)' }}
            >
                <div className="border border-stone-700 rounded-sm p-5 bg-stone-900/60">
                    <div className="flex gap-1 mb-2">
                        {[...Array(REVIEWS[reviewIdx].bintang)].map((_, i) => (
                            <svg key={i} className="w-3.5 h-3.5 text-[#F5B800]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <p className="text-sm text-stone-300 leading-relaxed italic">"{REVIEWS[reviewIdx].text}"</p>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                            {REVIEWS[reviewIdx].name}{' '}
                            <span className="font-normal text-stone-500">· {REVIEWS[reviewIdx].kota}</span>
                        </span>
                        <div className="flex gap-1.5">
                            {REVIEWS.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setReviewIdx(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === reviewIdx ? 'bg-[#F5B800]' : 'bg-stone-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-700 grid grid-cols-3 gap-4 text-center text-xs text-stone-400">
                    <div>
                        <span className="block text-lg font-semibold text-white mb-0.5">500+</span>
                        Unit Tersedia
                    </div>
                    <div>
                        <span className="block text-lg font-semibold text-white mb-0.5">25+</span>
                        Kota
                    </div>
                    <div>
                        <span className="block text-lg font-semibold text-white mb-0.5">24/7</span>
                        Bantuan
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#111111] font-sans overflow-hidden relative">
            <div className="min-h-screen flex">

                <div
                    className="hidden lg:block absolute inset-y-0 w-1/2 bg-[#111111] overflow-hidden z-10"
                    style={{
                        left: panelOnLeft ? '0%' : '50%',
                        transition: 'left 0.65s cubic-bezier(0.77, 0, 0.175, 1)',
                    }}
                >
                    <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-end overflow-hidden">
                        <img
                            src="/landing-pagei-2-removebg-preview.png"
                            alt=""
                            className="w-[900px] max-w-none opacity-25 -translate-y-16 translate-x-8 object-contain"
                        />
                    </div>
                    {panelContent}
                </div>

                <div
                    className="hidden lg:block w-1/2 flex-shrink-0"
                    style={{
                        order: panelOnLeft ? 0 : 1,
                        transition: 'order 0s',
                    }}
                />

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 min-h-screen relative z-0">
                    <div className="w-full max-w-sm">
                        <div className="flex items-center justify-between mb-6 lg:hidden">
                            <Link href="/">
                                <ApplicationLogo theme="light" height="h-7" />
                            </Link>
                            {isLogin ? (
                                <Link
                                    href="/register"
                                    className="text-xs font-bold border border-stone-300 hover:border-[#111111] text-stone-700 hover:text-black px-3 py-1.5 rounded-sm transition-colors"
                                >
                                    Daftar Akun
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-xs font-bold border border-stone-300 hover:border-[#111111] text-stone-700 hover:text-black px-3 py-1.5 rounded-sm transition-colors"
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                        <div
                            style={{
                                opacity: contentVisible ? 1 : 0,
                                transform: contentVisible ? 'translateY(0)' : 'translateY(12px)',
                                transition: 'opacity 0.35s ease, transform 0.35s ease',
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
