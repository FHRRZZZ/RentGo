import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, SectionTitle } from "@/Components/RentGo/Ui";

export default function CreateUser() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
        agency_name: "",
        phone: "",
        city: "Jakarta",
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post("/admin/users", form, {
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <AdminLayout activeTab="users">
            <Head title="Tambah Pengguna Baru — Admin RentGo" />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Link href="/admin/users" className="hover:text-black transition-colors flex items-center gap-1">
                    <span>← Kembali ke Manajemen Pengguna</span>
                </Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">Tambah Akun Baru</span>
            </div>

            <SectionTitle
                kicker="Pendaftaran Akun"
                title="Buat Akun Pengguna Baru"
                description="Tambahkan pengguna baru ke sistem dengan hak akses Administrator, Mitra Rental, atau Customer."
            />

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">1. Informasi Akun & Kredensial</h3>
                        <p className="text-xs text-stone-500">Nama lengkap, alamat email aktif, dan kata sandi</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Budi Santoso"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Alamat Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="email@domain.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Password (Min. 8 Karakter) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                            />
                            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Peran / Hak Akses (Role) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold"
                            >
                                <option value="customer">Customer (Penyewa)</option>
                                <option value="mitra">Mitra Rental (Agent)</option>
                                <option value="admin">Administrator (Super Admin)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Bagian Khusus Mitra jika memilih role Mitra */}
                {form.role === "mitra" && (
                    <Card className="border border-amber-200 bg-amber-50/30 p-6 space-y-4">
                        <div className="border-b border-amber-200 pb-3">
                            <h3 className="text-sm font-bold text-amber-950">2. Profil Usaha Kemitraan</h3>
                            <p className="text-xs text-stone-500">Informasi badan usaha atau nama rental</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                    Nama Badan Usaha / Rental
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: RentGo Bali Express"
                                    value={form.agency_name}
                                    onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
                                    className="w-full text-xs bg-white border border-stone-300 rounded-sm p-2.5 focus:border-[#111] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-1">
                                    Kota Operasional
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Denpasar / Jakarta"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    className="w-full text-xs bg-white border border-stone-300 rounded-sm p-2.5 focus:border-[#111] outline-none"
                                />
                            </div>
                        </div>
                    </Card>
                )}

                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">Kontak & Komunikasi</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Nomor Telepon / WhatsApp
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: 081234567890"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none"
                        />
                    </div>
                </Card>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/users"
                        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Buat Akun Pengguna"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
