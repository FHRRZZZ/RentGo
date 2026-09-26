import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Card, SectionTitle } from "@/Components/RentGo/Ui";

export default function EditUser({ user = {} }) {
    const [form, setForm] = useState({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "customer",
        status: user.status || "active",
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.put(`/admin/users/${user.id}`, form, {
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <AdminLayout activeTab="users">
            <Head title={`Edit Pengguna: ${user.name} — Admin RentGo`} />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <Link href="/admin/users" className="hover:text-black transition-colors flex items-center gap-1">
                    <span>← Kembali ke Manajemen Pengguna</span>
                </Link>
                <span>/</span>
                <span className="text-stone-800 font-semibold">Edit Pengguna: {user.name}</span>
            </div>

            <SectionTitle
                kicker="Pembaruan Akun"
                title={`Perbarui Akun: ${user.name}`}
                description="Ubah identitas akun, hak akses role sistem, serta status keaktifan pengguna."
            />

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <Card className="border p-6 space-y-4">
                    <div className="border-b border-stone-100 pb-3">
                        <h3 className="text-sm font-bold text-[#111]">1. Data Profil & Akun</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
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
                                Peran Akun (Role)
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

                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Status Keaktifan Akun
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm p-2.5 focus:bg-white focus:border-[#111] outline-none font-semibold"
                            >
                                <option value="active">Aktif (Dapat Login & Transaksi)</option>
                                <option value="inactive">Nonaktifkan (Akses Dibekukan)</option>
                                <option value="rejected">Tolak / Tangguhkan Kemitraan</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {user.agent_profile && (
                    <Card className="border border-amber-200 bg-amber-50/20 p-6 space-y-2 text-xs">
                        <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                            Informasi Badan Usaha Mitra
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-stone-700 pt-1">
                            <p><strong>Nama Usaha:</strong> {user.agent_profile.agency_name}</p>
                            <p><strong>Kota:</strong> {user.agent_profile.city || "-"}</p>
                            <p><strong>Telepon:</strong> {user.agent_profile.phone || "-"}</p>
                            <p><strong>Status Onboarding:</strong> {user.agent_profile.onboarding_status}</p>
                        </div>
                    </Card>
                )}

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
                        {processing ? "Memperbarui..." : "Simpan Perubahan Akun"}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
