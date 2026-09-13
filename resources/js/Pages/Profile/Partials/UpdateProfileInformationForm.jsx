import InputError from '@/Components/InputError';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <div className="pb-5 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-[#F5B800]"></span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
                        DATA PENGGUNA
                    </span>
                </div>
                <h2 className="text-lg font-black text-[#111111] tracking-tight">
                    Informasi Akun Pribadi
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Perbarui nama lengkap dan alamat email utama akun RentGo Anda.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold text-stone-700 mb-1">
                        Nama Lengkap
                    </label>
                    <input
                        id="name"
                        type="text"
                        className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Nama lengkap sesuai KTP"
                    />
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-stone-700 mb-1">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="nama@email.com"
                    />
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm text-xs text-amber-900">
                        Alamat email belum diverifikasi.{' '}
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="font-bold underline hover:text-black"
                        >
                            Kirim ulang email verifikasi.
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-1.5 font-bold text-emerald-700">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-xs font-bold bg-[#F5B800] text-[#111111] hover:bg-[#e0a800] px-6 py-2.5 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm">
                            ✓ Berhasil disimpan
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
