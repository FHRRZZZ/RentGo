import InputError from '@/Components/InputError';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const page = usePage();
    const user = page.props.auth?.user || {};
    const profile = page.props.customerProfile || {};

    // Customer menyimpan dua hal sekaligus:
    //  1. akun (nama + email)  → PATCH /profile
    //  2. data pribadi penyewa → POST/PATCH /customer-profiles
    const isCustomer =
        (page.props.auth?.role || user.role) === 'customer' && Boolean(user.id);

    const { data, setData, patch, post, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        // Data pribadi penyewa (customer_profiles)
        phone: profile.phone || '',
        identity_number: profile.identity_number || '',
        date_of_birth: profile.date_of_birth ? String(profile.date_of_birth).slice(0, 10) : '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (!isCustomer) {
            patch(route('profile.update'));
            return;
        }

        const profilePayload = {
            phone: data.phone || null,
            identity_number: data.identity_number || null,
            date_of_birth: data.date_of_birth || null,
            address: data.address || null,
            city: data.city || null,
            province: data.province || null,
        };

        // Simpan data akun lalu data pribadi (berurutan agar state server konsisten).
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                if (profile.id) {
                    patch(`/customer-profiles/${profile.id}`, {
                        ...profilePayload,
                        preserveScroll: true,
                    });
                    return;
                }

                post('/customer-profiles', profilePayload, {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <section className={className}>
            <div className="pb-5 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-[#F5B800]"></span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                        DATA PENGGUNA
                    </span>
                </div>
                <h2 className="text-lg font-semibold text-[#111111] tracking-tight">
                    Informasi Akun Pribadi
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Perbarui nama, email, dan data pribadi penyewa (nomor WhatsApp, NIK, tanggal lahir,
                    serta alamat domisili) yang dipakai saat memesan kendaraan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-xs font-medium text-stone-700 mb-1">
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
                    <label htmlFor="email" className="block text-xs font-medium text-stone-700 mb-1">
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
                            className="font-medium underline hover:text-black"
                        >
                            Kirim ulang email verifikasi.
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-1.5 font-medium text-emerald-700">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                {isCustomer && (
                    <>
                        <div className="pt-2 mt-2 border-t border-stone-200">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 bg-[#F5B800]"></span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                                    DATA PRIBADI PENYEWA
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                                Data ini dipakai mitra untuk verifikasi identitas saat serah terima unit
                                dan menjadi syarat sebelum Anda dapat membuat pesanan.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-xs font-medium text-stone-700 mb-1">
                                        Nomor WhatsApp Aktif
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors font-mono"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Contoh: 081234567890"
                                    />
                                    <InputError className="mt-1" message={errors.phone} />
                                </div>

                                <div>
                                    <label htmlFor="identity_number" className="block text-xs font-medium text-stone-700 mb-1">
                                        Nomor Identitas / NIK
                                    </label>
                                    <input
                                        id="identity_number"
                                        type="text"
                                        maxLength="16"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors font-mono"
                                        value={data.identity_number}
                                        onChange={(e) =>
                                            setData('identity_number', e.target.value.replace(/\D/g, ''))
                                        }
                                        placeholder="16 digit NIK sesuai KTP"
                                    />
                                    <InputError className="mt-1" message={errors.identity_number} />
                                </div>

                                <div>
                                    <label htmlFor="date_of_birth" className="block text-xs font-medium text-stone-700 mb-1">
                                        Tanggal Lahir
                                    </label>
                                    <input
                                        id="date_of_birth"
                                        type="date"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                    />
                                    <InputError className="mt-1" message={errors.date_of_birth} />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-xs font-medium text-stone-700 mb-1">
                                        Kota / Kabupaten
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Jakarta Selatan"
                                    />
                                    <InputError className="mt-1" message={errors.city} />
                                </div>

                                <div>
                                    <label htmlFor="province" className="block text-xs font-medium text-stone-700 mb-1">
                                        Provinsi
                                    </label>
                                    <input
                                        id="province"
                                        type="text"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="Contoh: DKI Jakarta"
                                    />
                                    <InputError className="mt-1" message={errors.province} />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-xs font-medium text-stone-700 mb-1">
                                        Alamat Domisili
                                    </label>
                                    <textarea
                                        id="address"
                                        rows="2"
                                        className="w-full text-xs font-medium bg-stone-50 border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors resize-none"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Alamat tempat tinggal sesuai KTP"
                                    />
                                    <InputError className="mt-1" message={errors.address} />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-xs font-medium bg-[#F5B800] text-[#111111] hover:bg-[#e0a800] px-6 py-2.5 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {processing
                            ? 'Menyimpan...'
                            : isCustomer
                              ? 'Simpan Perubahan & Data Pribadi'
                              : 'Simpan Perubahan'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm">
                            ✓ Berhasil disimpan
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
