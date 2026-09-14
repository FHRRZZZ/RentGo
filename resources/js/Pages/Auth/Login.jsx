import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';

export default function Login({ status, canResetPassword = true }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk — RentGo" />

            <div className="bg-white border border-stone-200 rounded-sm p-6 sm:p-7 shadow-sm">
                <div className="mb-7">
                    <h1 className="text-xl font-semibold tracking-tight text-[#111111]">Masuk ke akun Anda</h1>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                        Masukkan email dan kata sandi untuk mengakses dashboard RentGo.
                    </p>
                </div>

                {status && (
                    <div className="mb-5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-sm px-3 py-2.5">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-stone-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            className={`w-full text-sm bg-stone-50 border rounded-sm px-3 py-2.5 focus:bg-white focus:outline-none transition-colors ${
                                errors.email ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-[#111111]'
                            }`}
                        />
                        {errors.email && <p className="text-xs text-red-600 font-medium mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="block text-xs font-medium text-stone-700">
                                Kata Sandi
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-medium text-stone-400 hover:text-black transition-colors"
                                >
                                    Lupa kata sandi?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className={`w-full text-sm bg-stone-50 border rounded-sm px-3 py-2.5 pr-10 focus:bg-white focus:outline-none transition-colors ${
                                    errors.password ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-[#111111]'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-400 hover:text-stone-700 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 font-medium mt-1">{errors.password}</p>}
                    </div>

                    <div className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#111111] cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-xs text-stone-600 cursor-pointer select-none">
                            Ingat saya di perangkat ini
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#F5B800] text-[#111111] text-sm font-semibold py-3 rounded-sm hover:bg-[#e0a800] active:bg-[#c99600] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </>
                        ) : 'Masuk'}
                    </button>
                </form>

                <div className="mt-5 pt-5 border-t border-stone-100 text-center">
                    <p className="text-xs text-stone-500">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-semibold text-[#111111] hover:underline underline-offset-2">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

Login.layout = (page) => <AuthSplitLayout>{page}</AuthSplitLayout>;