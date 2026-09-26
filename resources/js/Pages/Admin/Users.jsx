import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { StatusBadge, SectionTitle } from "@/Components/RentGo/Ui";

const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

const DOC_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    approved: { label: "Disetujui", color: "bg-emerald-400/10 text-emerald-300 border-emerald-500/30" },
    rejected: { label: "Ditolak", color: "bg-red-400/10 text-red-300 border-red-500/30" },
};

export default function AdminUsersPage({
    users = [],
}) {
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [inspectUser, setInspectUser] = useState(null);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form data for creating a new user
    const [newUserForm, setNewUserForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
        agency_name: "",
        phone: "",
        city: "Jakarta",
    });

    // Form data for editing user
    const [editUserForm, setEditUserForm] = useState({
        name: "",
        email: "",
        role: "customer",
        status: "active",
    });

    const pendingMitraCount = useMemo(
        () => users.filter((u) => u.agent_profile?.onboarding_status === "pending_verification").length,
        [users]
    );

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            let matchesRole = true;
            if (roleFilter === "mitra_pending") {
                matchesRole = u.agent_profile?.onboarding_status === "pending_verification";
            } else if (roleFilter === "mitra_approved") {
                matchesRole = u.role === "mitra" && (u.verified && u.onboarding_status === "approved");
            } else if (roleFilter !== "all") {
                matchesRole = u.role === roleFilter;
            }

            const matchesSearch =
                (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.agent_profile?.agency_name || "").toLowerCase().includes(searchQuery.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [users, roleFilter, searchQuery]);

    const handleApproveMitra = (agentProfileId) => {
        if (!agentProfileId) return;
        setProcessing(true);
        router.post(`/admin/agents/${agentProfileId}/verify`, {
            decision: "approved",
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInspectUser(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleRejectMitra = (agentProfileId) => {
        if (!agentProfileId) return;
        setProcessing(true);
        router.post(`/admin/agents/${agentProfileId}/verify`, {
            decision: "rejected",
            rejection_reason: "Dokumen profil badan usaha belum lengkap atau tidak valid.",
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setInspectUser(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleAddUserSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post("/admin/users", newUserForm, {
            preserveScroll: true,
            onSuccess: () => {
                setAddUserModalOpen(false);
                setNewUserForm({
                    name: "",
                    email: "",
                    password: "",
                    role: "customer",
                    agency_name: "",
                    phone: "",
                    city: "Jakarta",
                });
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleEditUserClick = (user) => {
        setSelectedUser(user);
        setEditUserForm({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "customer",
            status: user.status || "active",
        });
        setEditUserModalOpen(true);
    };

    const handleEditUserSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setProcessing(true);
        router.put(`/admin/users/${selectedUser.id}`, editUserForm, {
            preserveScroll: true,
            onSuccess: () => {
                setEditUserModalOpen(false);
                setSelectedUser(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleDeleteUserConfirm = () => {
        if (!selectedUser) return;
        setProcessing(true);
        router.delete(`/admin/users/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteUserModalOpen(false);
                setSelectedUser(null);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout activeTab="users">
            <Head title="Kelola Pengguna & Mitra — Admin RentGo" />

            <div className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm mb-6">
                <SectionTitle
                    kicker="Manajemen Akun & Hak Akses"
                    title="Pengguna & Verifikasi Identitas"
                    description="Kelola seluruh akun dalam ekosistem RentGo serta setujui calon mitra baru agar dapat mengoperasikan armada."
                    action={
                        <button
                            type="button"
                            onClick={() => setAddUserModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] font-semibold text-xs rounded-sm shadow-xs transition-colors"
                        >
                            <span>+ Tambah Pengguna</span>
                        </button>
                    }
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                        {[
                            { key: "all", label: "Semua Pengguna" },
                            {
                                key: "mitra_pending",
                                label: `Menunggu Persetujuan ${pendingMitraCount > 0 ? `(${pendingMitraCount})` : ""}`,
                                highlight: pendingMitraCount > 0,
                            },
                            { key: "mitra", label: "Semua Mitra" },
                            { key: "customer", label: "Customer" },
                            { key: "admin", label: "Admin" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setRoleFilter(tab.key)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap ${
                                    roleFilter === tab.key
                                        ? "bg-[#111111] text-[#F5B800] border border-[#111111]"
                                        : tab.highlight
                                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama, email, agency..."
                            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-sm px-3 py-1.5 text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-[#F5B800] transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-3.5">Nama Akun</th>
                                <th className="p-3.5">Role</th>
                                <th className="p-3.5">Kontak</th>
                                <th className="p-3.5">Status Akses / Verifikasi</th>
                                <th className="p-3.5">Terdaftar</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-stone-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-stone-500">
                                        Tidak ada pengguna yang cocok dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isMitra = user.role === "mitra";
                                    const hasMitraApplication = Boolean(user.agent_profile);
                                    const isPendingMitra = user.agent_profile?.onboarding_status === "pending_verification";

                                    return (
                                        <tr key={user.id} className={`hover:bg-stone-50/70 transition-colors ${isPendingMitra ? "bg-amber-50/50" : ""}`}>
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-sm bg-[#F5B800] text-[#111] font-bold flex items-center justify-center text-xs shrink-0 uppercase shadow-xs">
                                                        {user.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#111111]">{user.name}</p>
                                                        <p className="text-[11px] text-stone-500">{user.email}</p>
                                                        {user.agent_profile?.agency_name && (
                                                            <p className="text-[10px] text-stone-600 font-medium">
                                                                Mitra: {user.agent_profile.agency_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                                                        : user.role === 'mitra'
                                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                                        : 'bg-stone-100 text-stone-700 border-stone-200'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3.5">
                                                <p className="text-stone-800">{user.agent_profile?.phone || user.customer_profile?.phone || "-"}</p>
                                                <p className="text-[11px] text-stone-500">{user.agent_profile?.city || "Indonesia"}</p>
                                            </td>
                                            <td className="p-3.5">
                                                {hasMitraApplication ? (
                                                    user.verified && user.onboarding_status === "approved" ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                            Disetujui (CRUD Aktif)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-sm font-semibold text-[10px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                                            {user.onboarding_status === "rejected" ? "Ditolak" : "Menunggu Persetujuan"}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                        Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 text-stone-500">{formatTanggal(user.created_at)}</td>
                                            <td className="p-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {isPendingMitra && user.agent_profile && (
                                                        <button
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => handleApproveMitra(user.agent_profile.id)}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-sm transition-colors shadow-xs"
                                                            title="Setujui mitra agar bisa CRUD unit"
                                                        >
                                                            Setujui
                                                        </button>
                                                    )}
                                                    {hasMitraApplication && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setInspectUser(user)}
                                                            className="px-2.5 py-1 bg-stone-100 hover:bg-[#F5B800] hover:text-[#111] text-stone-700 text-xs font-semibold rounded-sm transition-colors border border-stone-200"
                                                        >
                                                            Tinjau
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditUserClick(user)}
                                                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm border border-stone-200 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setDeleteUserModalOpen(true);
                                                        }}
                                                        className="px-2 py-1 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-sm transition-colors"
                                                        title="Hapus Akun"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Pengguna Baru */}
            {addUserModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#111111]">+ Tambah Pengguna Baru</h3>
                                <p className="text-xs text-stone-500">Buat akun untuk admin, mitra, atau customer</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddUserModalOpen(false)}
                                className="text-stone-400 hover:text-stone-800 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    value={newUserForm.name}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Email *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="email@example.com"
                                    value={newUserForm.email}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Password (Min. 8 Karakter) *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={newUserForm.password}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Peran / Role *</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                >
                                    <option value="customer">Customer (Penyewa)</option>
                                    <option value="mitra">Mitra (Rental Agent)</option>
                                    <option value="admin">Administrator (Super Admin)</option>
                                </select>
                            </div>

                            {newUserForm.role === "mitra" && (
                                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-sm space-y-2">
                                    <div>
                                        <label className="block font-semibold mb-1 text-amber-900">Nama Usaha Rental</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: RentGo Bali Express"
                                            value={newUserForm.agency_name}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, agency_name: e.target.value })}
                                            className="w-full bg-white border border-stone-300 rounded-sm p-1.5 text-stone-900 placeholder-stone-400 focus:border-[#F5B800] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-1 text-amber-900">Kota Operasional</label>
                                        <input
                                            type="text"
                                            placeholder="Jakarta / Bali / Bandung"
                                            value={newUserForm.city}
                                            onChange={(e) => setNewUserForm({ ...newUserForm, city: e.target.value })}
                                            className="w-full bg-white border border-stone-300 rounded-sm p-1.5 text-stone-900 placeholder-stone-400 focus:border-[#F5B800] outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Nomor Telepon / WhatsApp</label>
                                <input
                                    type="text"
                                    placeholder="081234567890"
                                    value={newUserForm.phone}
                                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 placeholder-stone-400 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setAddUserModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm font-semibold border border-stone-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] rounded-sm font-bold shadow-xs disabled:opacity-50 transition-colors"
                                >
                                    {processing ? "Menyimpan..." : "Buat Akun"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Pengguna */}
            {editUserModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#111111]">Edit Pengguna: {selectedUser.name}</h3>
                                <p className="text-xs text-stone-500">{selectedUser.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditUserModalOpen(false)}
                                className="text-stone-400 hover:text-stone-800 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={editUserForm.name}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={editUserForm.email}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Peran / Role</label>
                                <select
                                    value={editUserForm.role}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="mitra">Mitra Rental</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-1 text-stone-700">Status Akun</label>
                                <select
                                    value={editUserForm.status}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-300 rounded-sm p-2 text-stone-900 focus:bg-white focus:border-[#F5B800] outline-none transition-colors"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktifkan</option>
                                    <option value="rejected">Tolak / Tangguhkan</option>
                                </select>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                                <button
                                    type="button"
                                    onClick={() => setEditUserModalOpen(false)}
                                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm font-semibold border border-stone-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] rounded-sm font-bold shadow-xs disabled:opacity-50 transition-colors"
                                >
                                    {processing ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Pengguna */}
            {deleteUserModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-md w-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center text-xl font-bold mb-3 border border-red-200">
                            !
                        </div>
                        <h3 className="text-base font-bold text-[#111111]">Hapus Akun Pengguna?</h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                            Apakah Anda yakin ingin menghapus akun <strong className="text-stone-900">{selectedUser.name}</strong> ({selectedUser.email})? Pengguna yang memiliki riwayat pesanan aktif tidak dapat dihapus demi keamanan transaksi.
                        </p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteUserModalOpen(false)}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm border border-stone-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleDeleteUserConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-sm disabled:opacity-50 transition-colors shadow-xs"
                            >
                                {processing ? "Menghapus..." : "Ya, Hapus Akun"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tinjau & Persetujuan Dokumen Kemitraan */}
            {inspectUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-[#111111]">
                                    Pengajuan Kemitraan: {inspectUser.name}
                                </h3>
                                <p className="text-xs text-stone-500">
                                    {inspectUser.agent_profile?.agency_name ? `${inspectUser.agent_profile.agency_name} · ` : ""}
                                    {inspectUser.email}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectUser(null)}
                                className="text-stone-400 hover:text-stone-800 font-bold p-1 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {inspectUser.agent_profile && (
                            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-sm space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2 text-stone-600">
                                    <p><span className="text-stone-400">Nama Usaha:</span> <span className="text-stone-900 font-medium">{inspectUser.agent_profile.agency_name}</span></p>
                                    <p><span className="text-stone-400">Kota:</span> <span className="text-stone-900 font-medium">{inspectUser.agent_profile.city || "-"}</span></p>
                                    <p><span className="text-stone-400">Telepon:</span> <span className="text-stone-900 font-medium">{inspectUser.agent_profile.phone || "-"}</span></p>
                                    <p><span className="text-stone-400">Jenis Usaha:</span> <span className="text-stone-900 font-medium">{inspectUser.agent_profile.business_type || "Perorangan / Rental"}</span></p>
                                </div>
                                {inspectUser.agent_profile.address && (
                                    <p className="text-stone-600"><span className="text-stone-400">Alamat:</span> <span className="text-stone-900">{inspectUser.agent_profile.address}</span></p>
                                )}
                                {inspectUser.agent_profile.description && (
                                    <p className="text-stone-600"><span className="text-stone-400">Keterangan:</span> <span className="text-stone-900">{inspectUser.agent_profile.description}</span></p>
                                )}
                            </div>
                        )}

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setInspectUser(null)}
                                className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm border border-stone-200 transition-colors"
                            >
                                Tutup
                            </button>

                            {inspectUser.agent_profile && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleRejectMitra(inspectUser.agent_profile.id)}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-sm transition-colors border border-red-200"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleApproveMitra(inspectUser.agent_profile.id)}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-sm transition-colors shadow-xs"
                                    >
                                        Setujui Kemitraan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
