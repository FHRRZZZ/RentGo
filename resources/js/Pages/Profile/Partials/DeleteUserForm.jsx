import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={className}>
            <div className="pb-5 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-red-600"></span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
                        ZONA BERBAHAYA
                    </span>
                </div>
                <h2 className="text-lg font-black text-[#111111] tracking-tight">
                    Hapus Akun Pengguna
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Setelah akun dihapus, seluruh data pemesanan dan dokumen sewa Anda akan dimusnahkan secara permanen.
                </p>
            </div>

            <div className="p-4 bg-red-50/60 border border-red-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-stone-700 leading-relaxed">
                    Pastikan tidak ada transaksi sewa aktif sebelum Anda menghapus akun. Tindakan ini tidak dapat dibatalkan.
                </p>
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-sm uppercase tracking-wider shrink-0 transition-colors"
                >
                    Hapus Akun Saya
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 bg-white rounded-sm">
                    <h2 className="text-base font-black text-[#111111] tracking-tight">
                        Konfirmasi Hapus Akun Permanen
                    </h2>

                    <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                        Masukkan kata sandi Anda untuk memastikan bahwa Anda benar-benar pemilik sah akun ini.
                    </p>

                    <div className="mt-4">
                        <label htmlFor="delete-password" className="block text-xs font-bold text-stone-700 mb-1">
                            Kata Sandi Akun
                        </label>
                        <input
                            id="delete-password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full text-xs font-medium bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-red-600 outline-none transition-colors"
                            placeholder="Ketik kata sandi Anda"
                            autoFocus
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-stone-100 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-sm transition-colors"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
