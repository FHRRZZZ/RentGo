import { useRef } from 'react';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <div className="pb-5 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-[#F5B800]"></span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
                        KEAMANAN AKUN
                    </span>
                </div>
                <h2 className="text-lg font-black text-[#111111] tracking-tight">
                    Perbarui Kata Sandi
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Gunakan kombinasi minimal 8 karakter dengan huruf dan angka untuk keamanan maksimal.
                </p>
            </div>

            <form onSubmit={updatePassword} className="space-y-5">
                <div>
                    <label htmlFor="current_password" className="block text-xs font-bold text-stone-700 mb-1">
                        Kata Sandi Saat Ini
                    </label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-bold text-stone-700 mb-1">
                        Kata Sandi Baru
                    </label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-bold text-stone-700 mb-1">
                        Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-black outline-none transition-colors"
                        autoComplete="new-password"
                        placeholder="Ketik ulang kata sandi baru"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="text-xs font-bold bg-[#111111] text-[#F5B800] hover:bg-black px-6 py-2.5 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
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
                            ✓ Kata sandi berhasil diperbarui
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
