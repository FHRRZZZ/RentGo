import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    StatusBadge,
    Card,
    SectionTitle,
    StatCard,
    FailSafeImage,
} from "@/Components/RentGo/Ui";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

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

const formatTanggalJam = (dateStr) => {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
};

const VEHICLE_STATUS = {
    available: { label: "Tersedia", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    rented: { label: "Disewa", color: "bg-blue-400/10 text-blue-400 border-blue-500/30" },
    maintenance: { label: "Servis", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    inactive: { label: "Nonaktif", color: "bg-stone-800 text-stone-400 border-stone-700" },
    pending_review: { label: "Menunggu Review", color: "bg-purple-400/10 text-purple-300 border-purple-500/30" },
};

const BOOKING_STATUS = {
    pending_payment: { label: "Menunggu Pembayaran", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    paid: { label: "Sudah Dibayar", color: "bg-blue-400/10 text-blue-400 border-blue-500/30" },
    waiting_agent_confirmation: { label: "Menunggu Mitra", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    confirmed: { label: "Dikonfirmasi", color: "bg-blue-400/10 text-blue-400 border-blue-500/30" },
    ongoing: { label: "Berjalan", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    returned: { label: "Dikembalikan", color: "bg-purple-400/10 text-purple-300 border-purple-500/30" },
    completed: { label: "Selesai", color: "bg-stone-800 text-stone-300 border-stone-700" },
    cancelled: { label: "Dibatalkan", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

const PAYMENT_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    completed: { label: "Berhasil", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    failed: { label: "Gagal", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

const DOC_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    approved: { label: "Disetujui", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "Ditolak", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

const ONBOARDING_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    approved: { label: "Aktif", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "Ditolak", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

const COMPLAINT_STATUS = {
    open: { label: "Terbuka", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    investigating: { label: "Diproses", color: "bg-blue-400/10 text-blue-400 border-blue-500/30" },
    resolved: { label: "Selesai", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    closed: { label: "Ditutup", color: "bg-stone-800 text-stone-400 border-stone-700" },
};

const DISPUTE_STATUS = {
    open: { label: "Terbuka", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    mediation: { label: "Mediasi", color: "bg-purple-400/10 text-purple-300 border-purple-500/30" },
    resolved: { label: "Selesai", color: "bg-emerald-400/10 text-emerald-400 border-emerald-500/30" },
    escalated: { label: "Eskalasi", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

const PRIORITY = {
    low: { label: "Rendah", color: "bg-stone-800 text-stone-400 border-stone-700" },
    medium: { label: "Sedang", color: "bg-amber-400/10 text-amber-300 border-amber-500/30" },
    high: { label: "Tinggi", color: "bg-orange-400/10 text-orange-300 border-orange-500/30" },
    urgent: { label: "Mendesak", color: "bg-red-400/10 text-red-400 border-red-500/30" },
};

export default function AdminDashboard({
    auth = {},
    stats: serverStats = null,
    recentBookings = [],
    pendingVehicles = [],
    activeDisputes = [],
    users = [],
    vehicles = [],
    categories = [],
    bookings = [],
    transactions = [],
    payouts = [],
    refunds = [],
    damages = [],
    reviews = [],
    complaints = [],
    agentDocs: propAgentDocs = [],
    customerDocs: propCustomerDocs = [],
    auditLogs = [],
}) {
    // Navigasi Tab Internal
    const [activeTab, setActiveTab] = useState("overview");

    // State data lokal yang responsif terhadap aksi admin (simulasi mutasi)
    const [usersList, setUsersList] = useState(users);
    const [vehiclesList, setVehiclesList] = useState(vehicles.length > 0 ? vehicles : pendingVehicles);
    const [payoutsList, setPayoutsList] = useState(payouts);
    const [complaintsList, setComplaintsList] = useState(complaints);
    const [disputesList, setDisputesList] = useState(activeDisputes.length > 0 ? activeDisputes : []);
    const [reviewsList, setReviewsList] = useState(reviews);
    const [agentDocs, setAgentDocs] = useState(propAgentDocs);
    const [customerDocs, setCustomerDocs] = useState(propCustomerDocs);
    const [auditList, setAuditList] = useState(auditLogs);

    const adminStats = {
        total_gmv: serverStats?.gmv || 0,
        platform_commission_revenue: serverStats?.total_commission || (serverStats?.gmv ? serverStats.gmv * 0.1 : 0),
        pending_payouts: serverStats?.pending_payouts || 0,
        total_users: (serverStats?.total_customers || 0) + (serverStats?.total_mitras || 0),
        total_agents: serverStats?.total_mitras || 0,
        total_customers: serverStats?.total_customers || 0,
        total_vehicles: serverStats?.total_vehicles || 0,
        active_vehicles: serverStats?.total_vehicles || 0,
        pending_vehicles: pendingVehicles?.length || 0,
    };
    const transactionsList = transactions;
    const categoriesList = categories.length > 0 ? categories : [
        { id: 1, name: "City Car", slug: "city-car" },
        { id: 2, name: "MPV", slug: "mpv" },
        { id: 3, name: "SUV", slug: "suv" },
        { id: 4, name: "Sedan", slug: "sedan" },
        { id: 5, name: "Matic", slug: "matic" },
        { id: 6, name: "Sport", slug: "sport" },
    ];
    const bookingsList = recentBookings.length > 0 ? recentBookings : bookings;
    const refundsList = refunds;
    const damagesList = damages;

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("all");
    const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
    const [notificationToast, setNotificationToast] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Modal states
    const [inspectUser, setInspectUser] = useState(null);
    const [inspectVehicle, setInspectVehicle] = useState(null);
    const [inspectPayout, setInspectPayout] = useState(null);
    const [inspectDispute, setInspectDispute] = useState(null);

    const showToast = (message, type = "success") => {
        setNotificationToast({ message, type });
        setTimeout(() => setNotificationToast(null), 3500);
    };

    // Handler Verifikasi Dokumen Mitra
    const handleVerifyAgentDoc = (docId, newStatus) => {
        setAgentDocs((prev) =>
            prev.map((d) =>
                d.id === docId
                    ? {
                          ...d,
                          status: newStatus,
                          verified_at: newStatus === "approved" ? new Date().toISOString() : null,
                      }
                    : d
            )
        );
        // Log ke audit
        const logEntry = {
            id: Date.now(),
            user: "Admin RentGo",
            action: newStatus === "approved" ? "approve" : "reject",
            module: "agent_document",
            description: `${newStatus === "approved" ? "Menyetujui" : "Menolak"} dokumen #${docId} mitra`,
            created_at: new Date().toISOString(),
        };
        setAuditList((prev) => [logEntry, ...prev]);
        showToast(
            `Dokumen mitra berhasil di-${newStatus === "approved" ? "setujui" : "tolak"}.`,
            newStatus === "approved" ? "success" : "danger"
        );
    };

    const handleVerifyMitra = (user, decision) => {
        if (!user?.agent_profile_id) return;

        setProcessing(true);

        router.post(`/admin/agents/${user.agent_profile_id}/verify`, {
            decision,
            rejection_reason: decision === "rejected"
                ? "Dokumen atau data pengajuan belum memenuhi persyaratan."
                : undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setUsersList((prev) => prev.map((item) => (
                    item.agent_profile_id === user.agent_profile_id
                        ? {
                              ...item,
                              role: decision === "approved" ? "mitra" : item.role,
                              verified: decision === "approved",
                              onboarding_status: decision,
                          }
                        : item
                )));
                setInspectUser(null);
                setProcessing(false);
                showToast(decision === "approved"
                    ? "Pengajuan mitra berhasil disetujui."
                    : "Pengajuan mitra berhasil ditolak.");
            },
            onError: (errors) => {
                setProcessing(false);
                showToast(errors?.decision || "Pengajuan belum dapat diproses. Periksa status dokumen terlebih dahulu.", "danger");
            },
        });
    };

    const handleVerifyMitraDocument = (document, status) => {
        setProcessing(true);
        router.post(`/admin/agents/documents/${document.id}/verify`, {
            status,
            rejection_reason: status === "rejected" ? "Dokumen tidak valid atau tidak terbaca." : undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const updateDocuments = (item) => item.agent_profile_id === inspectUser?.agent_profile_id
                    ? {
                          ...item,
                          agent_documents: (item.agent_documents || []).map((itemDocument) => (
                              itemDocument.id === document.id
                                  ? { ...itemDocument, status }
                                  : itemDocument
                          )),
                      }
                    : item;

                setUsersList((prev) => prev.map(updateDocuments));
                setInspectUser((current) => current ? updateDocuments(current) : current);
                setProcessing(false);
                showToast(status === "approved" ? "Dokumen disetujui." : "Dokumen ditolak.");
            },
            onError: () => {
                setProcessing(false);
                showToast("Status dokumen gagal diperbarui.", "danger");
            },
        });
    };

    // Handler Verifikasi Dokumen Customer
    const handleVerifyCustomerDoc = (docId, newStatus) => {
        setCustomerDocs((prev) =>
            prev.map((d) =>
                d.id === docId
                    ? {
                          ...d,
                          status: newStatus,
                          verified_at: newStatus === "approved" ? new Date().toISOString() : null,
                      }
                    : d
            )
        );
        const logEntry = {
            id: Date.now(),
            user: "Admin RentGo",
            action: newStatus === "approved" ? "approve" : "reject",
            module: "customer_document",
            description: `${newStatus === "approved" ? "Memverifikasi" : "Menolak"} dokumen customer #${docId}`,
            created_at: new Date().toISOString(),
        };
        setAuditList((prev) => [logEntry, ...prev]);
        showToast(`Dokumen customer berhasil diperbarui.`);
    };

    // Handler Persetujuan Armada Baru
    // Wajib memanggil endpoint verifikasi agar status tersimpan di server.
    // Tanpa request ini, perubahan hanya ada di state lokal dan hilang saat
    // halaman di-refresh (unit tetap pending_review di database).
    const handleApproveVehicle = (vehicleId, approve = true) => {
        setProcessing(true);
        router.post(`/admin/vehicles/${vehicleId}/verify`, {
            decision: approve ? "approved" : "rejected",
            rejection_reason: approve
                ? null
                : "Dokumen atau kondisi unit belum memenuhi standar kelayakan operasional.",
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setVehiclesList((prev) =>
                    prev.map((v) =>
                        v.id === vehicleId
                            ? { ...v, status: approve ? "available" : "rejected" }
                            : v
                    )
                );
                const logEntry = {
                    id: Date.now(),
                    user: "Admin RentGo",
                    action: approve ? "approve" : "reject",
                    module: "vehicle",
                    description: `${approve ? "Menyetujui publikasi" : "Menolak"} armada #${vehicleId}`,
                    created_at: new Date().toISOString(),
                };
                setAuditList((prev) => [logEntry, ...prev]);
                showToast(
                    approve
                        ? "Armada disetujui & live di katalog publik."
                        : "Armada ditolak publikasinya.",
                    approve ? "success" : "warning"
                );
                setInspectVehicle(null);
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                showToast(
                    errors?.decision || errors?.rejection_reason ||
                        "Verifikasi armada gagal diproses. Periksa kembali status unit.",
                    "danger"
                );
            },
        });
    };

    // Handler Pembayaran Payout Mitra
    const handleSettlePayout = (payoutId) => {
        setPayoutsList((prev) =>
            prev.map((p) =>
                p.id === payoutId
                    ? { ...p, status: "paid", paid_at: new Date().toISOString() }
                    : p
            )
        );
        const logEntry = {
            id: Date.now(),
            user: "Admin RentGo",
            action: "update",
            module: "agent_payout",
            description: `Menyelesaikan pencairan dana payout #${payoutId}`,
            created_at: new Date().toISOString(),
        };
        setAuditList((prev) => [logEntry, ...prev]);
        showToast("Pencairan dana (payout) berhasil ditandai selesai.");
        setInspectPayout(null);
    };

    // Handler Sengketa Deposit
    const handleResolveDispute = (disputeId, resolutionText) => {
        setDisputesList((prev) =>
            prev.map((item) =>
                item.id === disputeId
                    ? {
                          ...item,
                          status: "resolved",
                          resolution: resolutionText,
                          resolution_party: "Admin RentGo Arbitration",
                      }
                    : item
            )
        );
        const logEntry = {
            id: Date.now(),
            user: "Admin RentGo",
            action: "update",
            module: "dispute",
            description: `Menyelesaikan sengketa deposit #${disputeId}`,
            created_at: new Date().toISOString(),
        };
        setAuditList((prev) => [logEntry, ...prev]);
        showToast("Sengketa berhasil diselesaikan dengan keputusan arbitrase.");
        setInspectDispute(null);
    };

    // Handler Moderasi Review
    const handleToggleReviewStatus = (reviewId) => {
        setReviewsList((prev) =>
            prev.map((r) => {
                if (r.id === reviewId) {
                    const next = r.status === "published" ? "hidden" : "published";
                    return { ...r, status: next };
                }
                return r;
            })
        );
        showToast("Status moderasi review berhasil diperbarui.");
    };

    // Filtered Users
    const filteredUsers = useMemo(() => {
        return usersList.filter((u) => {
            const matchesRole =
                userRoleFilter === "all"
                    ? true
                    : userRoleFilter === "mitra_pending"
                    ? u.onboarding_status === "pending_verification"
                    : u.role === userRoleFilter;
            const matchesSearch =
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.agency_name &&
                    u.agency_name.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesRole && matchesSearch;
        });
    }, [usersList, userRoleFilter, searchQuery]);

    // Filtered Vehicles
    const filteredVehicles = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return vehiclesList.filter((v) => {
            const matchesStatus =
                vehicleStatusFilter === "all" ? true : v.status === vehicleStatusFilter;
            // Null-safe: kolom seperti brand/plat bisa kosong, jangan sampai
            // .toLowerCase() pada null membuat render tabel gagal total.
            const matchesSearch =
                (v.name || "").toLowerCase().includes(q) ||
                (v.license_plate || "").toLowerCase().includes(q) ||
                (v.brand || "").toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [vehiclesList, vehicleStatusFilter, searchQuery]);

    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <Head title="Admin Dashboard — RentGo" />

            {/* Toast Notifikasi Aksi */}
            {notificationToast && (
                <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5">
                    <div
                        className={`px-4 py-3 rounded-sm shadow-md border text-xs font-semibold flex items-center gap-2 ${
                            notificationToast.type === "danger"
                                ? "bg-red-50 text-red-900 border-red-200"
                                : notificationToast.type === "warning"
                                ? "bg-amber-50 text-amber-900 border-amber-200"
                                : "bg-[#111] text-[#F5B800] border-stone-800"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{notificationToast.message}</span>
                    </div>
                </div>
            )}

            {/* Header Ringkasan & Welcome Banner */}
            <div className="bg-white border border-stone-200 rounded-sm p-6 sm:p-7 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[#F5B800] text-[10px] font-bold uppercase tracking-[0.16em]">
                                Pusat Kontrol Administrator
                            </span>
                            <span className="text-stone-300">·</span>
                            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                Model Multi-Role: Admin, Mitra, Customer
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#111111] mt-1.5">
                            Panel Kendali Eksekutif RentGo
                        </h1>
                        <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                            Pantau metrik transaksi, verifikasi dokumen mitra & customer, validasi kelayakan unit armada, serta kelola komisi platform secara tersentral.
                        </p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                        <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-sm text-left">
                            <p className="text-[9px] uppercase font-bold tracking-wider text-stone-400">Total GMV</p>
                            <p className="text-xs font-bold text-[#111]">{formatRupiah(adminStats.total_gmv)}</p>
                        </div>
                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-sm text-left">
                            <p className="text-[9px] uppercase font-bold tracking-wider text-amber-800">Komisi RentGo (10%)</p>
                            <p className="text-xs font-bold text-amber-900">{formatRupiah(adminStats.platform_commission_revenue)}</p>
                        </div>
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-sm text-left">
                            <p className="text-[9px] uppercase font-bold tracking-wider text-red-700">Perlu Tindakan</p>
                            <p className="text-xs font-bold text-red-900">3 Pending</p>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs Interaktif (Selaras dengan Tema Login.jsx) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-6 mt-6 border-t border-stone-100 no-scrollbar">
                    {[
                        { id: "overview", label: "Ringkasan Platform" },
                        { id: "users", label: "Pengguna & Verifikasi", badge: "2" },
                        { id: "vehicles", label: "Katalog & Armada", badge: "1" },
                        { id: "finance", label: "Keuangan & Payout", badge: "1" },
                        { id: "bookings", label: "Pesanan & Sewa" },
                        { id: "disputes", label: "Sengketa & Review", badge: "1" },
                        { id: "logs", label: "Audit Log" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                                activeTab === tab.id
                                    ? "bg-[#111111] text-white shadow-sm"
                                    : "bg-stone-50 text-stone-600 hover:text-black hover:bg-stone-100 border border-stone-200"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span
                                    className={`px-1.5 py-0.2 rounded-sm text-[9px] font-bold ${
                                        activeTab === tab.id
                                            ? "bg-[#F5B800] text-[#111]"
                                            : "bg-stone-200 text-stone-700"
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB 1: OVERVIEW / RINGKASAN PLATFORM */}
            {activeTab === "overview" && (
                <div className="space-y-6">
                    {/* Baris Kartu Metrik Utama */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Pengguna"
                            value={adminStats.total_users}
                            hint={`${adminStats.total_agents} Mitra · ${adminStats.total_customers} Customer`}
                        />
                        <StatCard
                            label="Total Armada"
                            value={adminStats.total_vehicles}
                            hint={`${adminStats.active_vehicles} Aktif · ${adminStats.pending_vehicles} Pending Review`}
                        />
                        <StatCard
                            label="Pendapatan Komisi (10%)"
                            value={formatRupiah(adminStats.platform_commission_revenue)}
                            hint={`Dari GMV ${formatRupiah(adminStats.total_gmv)}`}
                            accent
                        />
                        <StatCard
                            label="Verifikasi & Sengketa"
                            value="3 Kasus"
                            hint="2 Dokumen · 1 Sengketa Deposit"
                        />
                    </div>

                    {/* Alert Banner Perlu Tindakan Mendesak */}
                    <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="p-1.5 bg-amber-200 text-amber-900 rounded-sm text-xs mt-0.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                                    Tindakan Mendesak yang Memerlukan Persetujuan
                                </h4>
                                <p className="text-xs text-amber-900 mt-0.5">
                                    Mitra baru <strong>Surya Trans Surabaya</strong> menunggu verifikasi SIUP, dan terdapat 1 sengketa deposit pada pesanan <strong>RG-2026-0712</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab("users")}
                                className="text-xs font-semibold px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-sm transition-colors"
                            >
                                Periksa Mitra
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("disputes")}
                                className="text-xs font-semibold px-3 py-1.5 bg-[#111] text-[#F5B800] rounded-sm transition-colors"
                            >
                                Buka Sengketa
                            </button>
                        </div>
                    </div>

                    {/* Pembagian Grid 2 Kolom: Aktivitas Transaksi & Log Audit */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Kolom 1: Transaksi Platform Terbaru */}
                        <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                            <SectionTitle
                                kicker="Keuangan Platform"
                                title="Transaksi & Komisi Terbaru"
                                description="Aliran dana pemesanan dan potongan komisi 10% RentGo."
                                action={
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("finance")}
                                        className="text-xs font-semibold text-[#111] hover:underline"
                                    >
                                        Kelola Keuangan →
                                    </button>
                                }
                            />
                            <div className="divide-y divide-stone-100">
                                {transactionsList.map((trx) => (
                                    <div key={trx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[#111]">{trx.transaction_number}</span>
                                                <StatusBadge
                                                    status={trx.status}
                                                    map={PAYMENT_STATUS}
                                                />
                                            </div>
                                            <p className="text-[11px] text-stone-500 mt-0.5">
                                                {trx.customer_name} · Pesanan {trx.booking_number}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[#111]">{formatRupiah(trx.total_amount)}</p>
                                            <p className="text-[10px] text-emerald-700 font-medium">
                                                Komisi: +{formatRupiah(trx.commission?.commission_amount || 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Kolom 2: Log Audit Keamanan Terbaru */}
                        <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                            <SectionTitle
                                kicker="Keamanan & Mutasi"
                                title="Log Audit Sistem"
                                description="Jejak digital tindakan pengguna dan administrator."
                                action={
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("logs")}
                                        className="text-xs font-semibold text-[#111] hover:underline"
                                    >
                                        Lihat Semua Log →
                                    </button>
                                }
                            />
                            <div className="divide-y divide-stone-100">
                                {auditList.slice(0, 5).map((log) => (
                                    <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[#111]">{log.user}</span>
                                                <span className="px-1.5 py-0.2 bg-stone-100 border border-stone-200 rounded-sm text-[9px] font-bold uppercase tracking-wider text-stone-600">
                                                    {log.action}
                                                </span>
                                                <span className="text-stone-400 text-[10px]">· {log.module}</span>
                                            </div>
                                            <p className="text-stone-600 text-[11px] mt-0.5">{log.description}</p>
                                        </div>
                                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                            {formatTanggalJam(log.created_at)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PENGGUNA & MITRA (USERS & VERIFICATION) */}
            {activeTab === "users" && (
                <div className="space-y-6">
                    {/* Filter & Kontrol Pencarian */}
                    <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setUserRoleFilter("all")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                                    userRoleFilter === "all"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Semua Role
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRoleFilter("mitra")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                                    userRoleFilter === "mitra"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Mitra ({usersList.filter((u) => u.role === "mitra").length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRoleFilter("mitra_pending")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                                    userRoleFilter === "mitra_pending"
                                        ? "bg-[#111] text-[#F5B800]"
                                        : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                                }`}
                            >
                                Pengajuan Mitra ({usersList.filter((u) => u.onboarding_status === "pending_verification").length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRoleFilter("customer")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                                    userRoleFilter === "customer"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Customer ({usersList.filter((u) => u.role === "customer").length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserRoleFilter("admin")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                                    userRoleFilter === "admin"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Admin
                            </button>
                        </div>

                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, email, agency..."
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm px-3 py-1.5 focus:bg-white focus:outline-none focus:border-[#111111]"
                            />
                        </div>
                    </div>

                    {/* Tabel Pengguna */}
                    <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3.5">Nama & Profil</th>
                                        <th className="p-3.5">Role</th>
                                        <th className="p-3.5">Kontak & Lokasi</th>
                                        <th className="p-3.5">Status Verifikasi</th>
                                        <th className="p-3.5">Bergabung</th>
                                        <th className="p-3.5 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-sm bg-[#F5B800] text-[#111] font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#111]">{user.name}</p>
                                                        <p className="text-[11px] text-stone-400">{user.email}</p>
                                                        {user.agency_name && (
                                                            <p className="text-[10px] text-stone-500 font-medium mt-0.5">
                                                                Mitra: {user.agency_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                                        user.role === "admin"
                                                            ? "bg-purple-100 text-purple-900 border border-purple-200"
                                                            : user.role === "mitra"
                                                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                                                            : "bg-stone-100 text-stone-800 border border-stone-200"
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3.5">
                                                <p>{user.phone || "-"}</p>
                                                <p className="text-[11px] text-stone-400">{user.city || "Indonesia"}</p>
                                            </td>
                                            <td className="p-3.5">
                                                {user.onboarding_status === "pending_verification" ? (
                                                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        Menunggu Verifikasi Mitra
                                                    </span>
                                                ) : user.verified ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        Menunggu Verifikasi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 text-stone-500">{formatTanggal(user.created_at)}</td>
                                            <td className="p-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectUser(user)}
                                                    className="px-2.5 py-1 bg-stone-100 hover:bg-[#F5B800] hover:text-[#111] text-stone-700 text-xs font-semibold rounded-sm transition-colors border border-stone-200"
                                                >
                                                    {user.onboarding_status === "pending_verification" ? "Tinjau Pengajuan" : "Periksa Dokumen"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: KATALOG & ARMADA (VEHICLES & CATEGORIES) */}
            {activeTab === "vehicles" && (
                <div className="space-y-6">
                    {/* Ringkasan Kategori */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {categoriesList.map((cat) => (
                            <div key={cat.id} className="bg-white border border-stone-200 rounded-sm p-3 shadow-sm text-center">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400">
                                    {cat.slug}
                                </p>
                                <p className="text-sm font-bold text-[#111] mt-1">{cat.name}</p>
                                <p className="text-[10px] text-stone-500 mt-0.5">{cat.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Filter Armada */}
                    <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Status:</span>
                            <button
                                type="button"
                                onClick={() => setVehicleStatusFilter("all")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                                    vehicleStatusFilter === "all"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => setVehicleStatusFilter("available")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                                    vehicleStatusFilter === "available"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Tersedia
                            </button>
                            <button
                                type="button"
                                onClick={() => setVehicleStatusFilter("pending_review")}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                                    vehicleStatusFilter === "pending_review"
                                        ? "bg-[#111] text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                                }`}
                            >
                                Menunggu Review
                            </button>
                        </div>

                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama mobil, plat nomor..."
                                className="w-full text-xs bg-stone-50 border border-stone-300 rounded-sm px-3 py-1.5 focus:bg-white focus:outline-none focus:border-[#111111]"
                            />
                        </div>
                    </div>

                    {/* Tabel Armada */}
                    <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3.5">Unit Armada</th>
                                        <th className="p-3.5">Kategori & Tipe</th>
                                        <th className="p-3.5">Plat Nomor</th>
                                        <th className="p-3.5">Tarif Harian</th>
                                        <th className="p-3.5">Status Unit</th>
                                        <th className="p-3.5 text-right">Tindakan Validasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                    {filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-stone-50/70 transition-colors">
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-3">
                                                    <FailSafeImage
                                                        src={vehicle.img}
                                                        alt={vehicle.name}
                                                        className="w-14 h-10 object-cover rounded-sm border border-stone-200 shrink-0"
                                                        fallback="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-[#111]">{vehicle.name}</p>
                                                        <p className="text-[11px] text-stone-400">
                                                            {vehicle.brand} · {vehicle.year} · {vehicle.transmission}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <span className="uppercase text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-sm">
                                                    {vehicle.vehicle_type === "car" ? "Mobil" : "Motor"}
                                                </span>
                                            </td>
                                            <td className="p-3.5 font-mono text-xs font-bold text-stone-800">
                                                {vehicle.license_plate}
                                            </td>
                                            <td className="p-3.5 font-semibold text-[#111]">
                                                {formatRupiah(vehicle.price_per_day)}/hari
                                            </td>
                                            <td className="p-3.5">
                                                <StatusBadge
                                                    status={vehicle.status}
                                                    map={VEHICLE_STATUS}
                                                />
                                            </td>
                                            <td className="p-3.5 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectVehicle(vehicle)}
                                                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-sm transition-colors border border-stone-200"
                                                >
                                                    Detail
                                                </button>
                                                {vehicle.status === "pending_review" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveVehicle(vehicle.id, true)}
                                                        className="px-2.5 py-1 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold rounded-sm transition-colors"
                                                    >
                                                        Setujui
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleApproveVehicle(
                                                                vehicle.id,
                                                                vehicle.status !== "available"
                                                            )
                                                        }
                                                        className="px-2.5 py-1 border border-stone-300 hover:border-black text-stone-700 text-xs font-medium rounded-sm transition-colors"
                                                    >
                                                        {vehicle.status === "available" ? "Nonaktifkan" : "Aktifkan"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: KEUANGAN & PAYOUT (FINANCE & COMMISSIONS) */}
            {activeTab === "finance" && (
                <div className="space-y-6">
                    {/* Ringkasan Finansial Platform */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Transaksi (GMV)</p>
                            <p className="text-xl font-bold text-[#111] mt-1">{formatRupiah(adminStats.total_gmv)}</p>
                            <p className="text-[11px] text-stone-500 mt-0.5">Seluruh pesanan masuk</p>
                        </div>
                        <div className="bg-amber-50/70 border border-amber-200 rounded-sm p-4 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Komisi Bersih RentGo (10%)</p>
                            <p className="text-xl font-bold text-amber-950 mt-1">{formatRupiah(adminStats.platform_commission_revenue)}</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">Pendapatan operasional platform</p>
                        </div>
                        <div className="bg-white border border-stone-200 rounded-sm p-4 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Permintaan Payout Mitra</p>
                            <p className="text-xl font-bold text-amber-900 mt-1">{formatRupiah(adminStats.pending_payouts)}</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">Permintaan menunggu transfer</p>
                        </div>
                    </div>

                    {/* Antrian Payout Mitra */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Pencairan Dana"
                            title="Permintaan Payout Mitra (Agent Payouts)"
                            description="Verifikasi rekening bank dan transfer bagi hasil pendapatan mitra."
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3">No. Payout</th>
                                        <th className="p-3">Nama Mitra & Rekening</th>
                                        <th className="p-3">Nominal Transfer</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Aksi Transfer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                    {payoutsList.map((po) => (
                                        <tr key={po.id} className="hover:bg-stone-50/70">
                                            <td className="p-3 font-semibold text-[#111]">
                                                {po.payout_number}
                                                <p className="text-[10px] text-stone-400 font-normal">
                                                    Ref: {po.transaction_number}
                                                </p>
                                            </td>
                                            <td className="p-3">
                                                <p className="font-semibold text-[#111]">{po.account_name}</p>
                                                <p className="text-[11px] text-stone-500">
                                                    {po.bank_name} · {po.account_number}
                                                </p>
                                            </td>
                                            <td className="p-3 font-bold text-[#111]">
                                                {formatRupiah(po.amount)}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                                                        po.status === "paid"
                                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                            : "bg-amber-50 text-amber-900 border-amber-200"
                                                    }`}
                                                >
                                                    {po.status === "paid" ? "Sudah Ditransfer" : "Menunggu Transfer"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                {po.status === "processing" ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSettlePayout(po.id)}
                                                        className="px-3 py-1.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] font-semibold text-xs rounded-sm transition-colors shadow-sm"
                                                    >
                                                        Konfirmasi Transfer
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-stone-400 italic">
                                                        Selesai ({formatTanggal(po.paid_at)})
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pengembalian Dana (Refunds) */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Kompensasi & Pembatalan"
                            title="Pengembalian Dana (Refunds)"
                            description="Riwayat refund dana pembatalan sewa kepada penyewa."
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3">No. Refund</th>
                                        <th className="p-3">Pesanan Terkait</th>
                                        <th className="p-3">Alasan Refund</th>
                                        <th className="p-3">Nominal</th>
                                        <th className="p-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                    {refundsList.map((rf) => (
                                        <tr key={rf.id} className="hover:bg-stone-50/70">
                                            <td className="p-3 font-semibold text-[#111]">{rf.refund_number}</td>
                                            <td className="p-3 font-medium text-stone-800">{rf.booking_number}</td>
                                            <td className="p-3 text-stone-600">{rf.reason}</td>
                                            <td className="p-3 font-bold text-red-700">{formatRupiah(rf.amount)}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm text-[10px] font-bold">
                                                    Berhasil Dikembalikan
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: PESANAN & SEWA (BOOKINGS & DAMAGES) */}
            {activeTab === "bookings" && (
                <div className="space-y-6">
                    {/* Tabel Pesanan Masuk */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Aktivitas Pemesanan"
                            title="Daftar Seluruh Pesanan (Bookings)"
                            description="Status real-time penyewaan kendaraan dari customer ke mitra."
                        />
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-3">No. Booking</th>
                                        <th className="p-3">Penyewa (Customer)</th>
                                        <th className="p-3">Unit Kendaraan</th>
                                        <th className="p-3">Durasi Sewa</th>
                                        <th className="p-3">Total Biaya</th>
                                        <th className="p-3">Status Booking</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-700">
                                    {bookingsList.map((bk) => (
                                        <tr key={bk.id} className="hover:bg-stone-50/70">
                                            <td className="p-3 font-semibold text-[#111]">{bk.booking_number}</td>
                                            <td className="p-3">
                                                <p className="font-semibold text-[#111]">{bk.customer_name}</p>
                                                <p className="text-[11px] text-stone-400">{bk.customer_phone}</p>
                                            </td>
                                            <td className="p-3 font-medium text-stone-800">{bk.vehicle_name}</td>
                                            <td className="p-3 text-stone-600">
                                                {formatTanggal(bk.start_date)} - {formatTanggal(bk.end_date)}
                                                <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                                                    {bk.rental_days} Hari
                                                </p>
                                            </td>
                                            <td className="p-3 font-bold text-[#111]">
                                                {formatRupiah(bk.total_amount)}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge
                                                    status={bk.status}
                                                    map={BOOKING_STATUS}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Kerusakan Rental (Rental Damages) */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Inspeksi Pengembalian"
                            title="Laporan Kerusakan & Klaim Deposit (Rental Damages)"
                            description="Data insiden saat pengembalian unit sewa dan pemotongan deposit."
                        />
                        <div className="divide-y divide-stone-100">
                            {damagesList.map((dmg) => (
                                <div key={dmg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#111]">{dmg.vehicle_name}</span>
                                            <span className="text-stone-400">· Booking {dmg.booking_number}</span>
                                            <span className="px-1.5 py-0.2 bg-red-100 text-red-900 border border-red-200 rounded-sm text-[10px] font-bold uppercase">
                                                {dmg.severity}
                                            </span>
                                        </div>
                                        <p className="text-stone-700 mt-1">
                                            <strong>Kerusakan:</strong> {dmg.description} (Lokasi: {dmg.location})
                                        </p>
                                        <p className="text-[11px] text-stone-500 mt-0.5">Catatan: {dmg.notes}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-stone-500">Biaya Perbaikan:</p>
                                        <p className="text-sm font-bold text-red-700">{formatRupiah(dmg.repair_cost)}</p>
                                        <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                                            Dipotong Deposit: {formatRupiah(dmg.customer_charge)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: SENGKETA & REVIEW (DISPUTES, COMPLAINTS, REVIEWS) */}
            {activeTab === "disputes" && (
                <div className="space-y-6">
                    {/* Sengketa Deposit Arbitrase */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Arbitrase Platform"
                            title="Sengketa Deposit Terbuka (Disputes)"
                            description="Perselisihan antara mitra dan customer mengenai penahanan dana deposit."
                        />
                        <div className="divide-y divide-stone-100">
                            {disputesList.map((dsp) => (
                                <div key={dsp.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#111]">{dsp.subject}</span>
                                            <StatusBadge
                                                status={dsp.status}
                                                map={DISPUTE_STATUS}
                                            />
                                            <span className="text-stone-400">· {dsp.booking_number}</span>
                                        </div>
                                        <p className="text-stone-600 mt-1">{dsp.description}</p>
                                        {dsp.resolution && (
                                            <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-900 text-[11px]">
                                                <strong>Keputusan Admin:</strong> {dsp.resolution}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-semibold text-stone-600">Tuntutan Refund:</p>
                                        <p className="text-sm font-bold text-[#111]">{formatRupiah(dsp.refund_amount)}</p>
                                        {dsp.status !== "resolved" && (
                                            <button
                                                type="button"
                                                onClick={() => setInspectDispute(dsp)}
                                                className="mt-2 px-3 py-1.5 bg-[#111] text-[#F5B800] text-xs font-semibold rounded-sm hover:bg-stone-800 transition-colors"
                                            >
                                                Putuskan Arbitrase
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Komplain Layanan */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Layanan Konsumen"
                            title="Keluhan & Tiket Bantuan (Complaints)"
                            description="Keluhan operasional terkait penyerahan unit atau kondisi armada."
                        />
                        <div className="divide-y divide-stone-100">
                            {complaintsList.map((cmp) => (
                                <div key={cmp.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#111]">{cmp.subject}</span>
                                            <StatusBadge
                                                status={cmp.status}
                                                map={COMPLAINT_STATUS}
                                            />
                                            <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-sm text-[10px] uppercase font-bold border border-stone-200">
                                                {cmp.category}
                                            </span>
                                        </div>
                                        <p className="text-stone-600 mt-1">{cmp.description}</p>
                                    </div>
                                    <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                        {formatTanggalJam(cmp.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Moderasi Ulasan / Review */}
                    <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm">
                        <SectionTitle
                            kicker="Umpan Balik Publik"
                            title="Moderasi Ulasan Pengguna (Reviews)"
                            description="Publikasikan atau sembunyikan ulasan pelanggan untuk menjaga kualitas rating."
                        />
                        <div className="divide-y divide-stone-100">
                            {reviewsList.map((rev) => (
                                <div key={rev.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[#111]">{rev.customer_name}</span>
                                            <span className="text-amber-700 font-bold">Skor: {rev.rating}/5</span>
                                            <span className="text-stone-400">· {rev.vehicle_name}</span>
                                            <span
                                                className={`px-1.5 py-0.2 rounded-sm text-[10px] font-bold border ${
                                                    rev.status === "published"
                                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                        : "bg-stone-100 text-stone-600 border-stone-200"
                                                }`}
                                            >
                                                {rev.status === "published" ? "Publik" : "Disembunyikan"}
                                            </span>
                                        </div>
                                        <p className="text-stone-600 mt-1 italic">"{rev.review}"</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleReviewStatus(rev.id)}
                                        className="px-2.5 py-1 text-xs font-semibold border border-stone-200 hover:border-black rounded-sm transition-colors"
                                    >
                                        {rev.status === "published" ? "Sembunyikan" : "Publikasikan"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 7: AUDIT LOG */}
            {activeTab === "logs" && (
                <div className="bg-white border border-stone-200 rounded-sm p-5 shadow-sm space-y-4">
                    <SectionTitle
                        kicker="Sistem & Keamanan"
                        title="Riwayat Jejak Audit Digital (Audit Logs)"
                        description="Seluruh aksi verifikasi, perubahan harga, dan transaksi yang tercatat di database."
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-3">Waktu Kejadian</th>
                                    <th className="p-3">Pelaku (User)</th>
                                    <th className="p-3">Aksi</th>
                                    <th className="p-3">Modul</th>
                                    <th className="p-3">Deskripsi Perubahan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-stone-700">
                                {auditList.map((log) => (
                                    <tr key={log.id} className="hover:bg-stone-50/70">
                                        <td className="p-3 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                                            {formatTanggalJam(log.created_at)}
                                        </td>
                                        <td className="p-3 font-semibold text-[#111]">{log.user}</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                                                    log.action === "approve"
                                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                                        : log.action === "reject"
                                                        ? "bg-red-100 text-red-900 border border-red-200"
                                                        : "bg-stone-100 text-stone-800 border border-stone-200"
                                                }`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono text-[11px] text-stone-600">{log.module}</td>
                                        <td className="p-3 text-stone-700">{log.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL INSPEKSI DOKUMEN (KTP, SIM, NPWP, SIUP) */}
            {inspectUser && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">

                        {/* Header — gradient + avatar */}
                        <div className="relative bg-gradient-to-br from-[#111] to-[#2a2a2a] px-6 py-5 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar initial */}
                                <div className="w-12 h-12 rounded-full bg-[#F5B800] flex items-center justify-center shrink-0 shadow-lg">
                                    <span className="text-[#111] font-extrabold text-lg leading-none">
                                        {inspectUser.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5B800]">
                                        {inspectUser.agent_profile_id ? "Verifikasi Pengajuan Mitra" : "Verifikasi Dokumen Customer"}
                                    </span>
                                    <h3 className="text-base font-bold text-white mt-0.5 leading-tight">{inspectUser.name}</h3>
                                    <p className="text-[11px] text-stone-400 mt-0.5">{inspectUser.email}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectUser(null)}
                                className="text-stone-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 mt-0.5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                            {inspectUser.agent_profile_id ? (
                                <>
                                    {/* Info Mitra */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: "Nama Usaha", value: inspectUser.agency_name },
                                            { label: "Telepon", value: inspectUser.phone },
                                            { label: "Kota", value: inspectUser.city },
                                            { label: "Status Pengajuan", value: inspectUser.onboarding_status },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">{label}</p>
                                                <p className="text-xs font-semibold text-amber-950 truncate">{value || "—"}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dokumen Legal Mitra */}
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">Dokumen Legal Usaha</p>
                                        <div className="space-y-2">
                                            {(inspectUser.agent_documents || []).map((doc) => (
                                                <div key={doc.id} className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                                                    <div className="flex items-center justify-between px-4 py-3">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-[#111] truncate">{doc.document_type}</p>
                                                            <p className="text-[11px] font-mono text-stone-400 mt-0.5">No: {doc.document_number || "—"}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                                            <StatusBadge status={doc.status} map={DOC_STATUS} />
                                                            {doc.status !== "approved" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={processing}
                                                                    onClick={() => handleVerifyMitraDocument(doc, "approved")}
                                                                    className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] rounded-md transition-colors disabled:opacity-50"
                                                                >
                                                                    ✓ Setujui
                                                                </button>
                                                            )}
                                                            {doc.status !== "rejected" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={processing}
                                                                    onClick={() => handleVerifyMitraDocument(doc, "rejected")}
                                                                    className="px-2.5 py-1 bg-stone-200 hover:bg-red-500 hover:text-white text-stone-600 font-semibold text-[11px] rounded-md transition-colors disabled:opacity-50"
                                                                >
                                                                    ✕ Tolak
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {doc.file_url && (
                                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="block border-t border-stone-200 hover:opacity-90 transition-opacity">
                                                            <img
                                                                src={doc.file_url}
                                                                alt={`Dokumen ${doc.document_type}`}
                                                                className="h-32 w-full object-contain bg-white"
                                                            />
                                                            <p className="text-center text-[10px] text-stone-400 py-1">Klik untuk buka gambar asli</p>
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Final Decision Mitra */}
                                    {inspectUser.onboarding_status === "pending_verification" && (
                                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3 text-center">Keputusan Final Pengajuan Mitra</p>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => handleVerifyMitra(inspectUser, "rejected")}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 bg-white hover:bg-red-600 hover:border-red-600 hover:text-white text-red-600 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Tolak Pengajuan
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={processing}
                                                    onClick={() => handleVerifyMitra(inspectUser, "approved")}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    Setujui Mitra
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Dokumen Customer */}
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Dokumen KTP &amp; SIM Penyewa</p>
                                    <div className="space-y-2">
                                        {customerDocs.map((doc) => (
                                            <div key={doc.id} className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                                                <div className="flex items-center justify-between px-4 py-3">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-[#111] truncate">{doc.document_type}</p>
                                                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">No: {doc.document_number || "—"}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                                        <StatusBadge status={doc.status} map={DOC_STATUS} />
                                                        {doc.status !== "approved" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerifyCustomerDoc(doc.id, "approved")}
                                                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] rounded-md transition-colors"
                                                            >
                                                                ✓ Setujui
                                                            </button>
                                                        )}
                                                        {doc.status !== "rejected" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleVerifyCustomerDoc(doc.id, "rejected")}
                                                                className="px-2.5 py-1 bg-stone-200 hover:bg-red-500 hover:text-white text-stone-600 font-semibold text-[11px] rounded-md transition-colors"
                                                            >
                                                                ✕ Tolak
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-stone-100 flex justify-end bg-stone-50">
                            <button
                                type="button"
                                onClick={() => setInspectUser(null)}
                                className="px-5 py-2 bg-[#111] hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL ARMADA */}
            {inspectVehicle && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B800]">
                                    Detail Armada Kendaraan
                                </span>
                                <h3 className="text-base font-bold text-[#111] mt-0.5">{inspectVehicle.name}</h3>
                                <p className="text-xs text-stone-500">Plat: {inspectVehicle.license_plate}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectVehicle(null)}
                                className="text-stone-400 hover:text-black p-1 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <FailSafeImage
                                src={inspectVehicle.img}
                                alt={inspectVehicle.name}
                                className="w-full h-44 object-cover rounded-sm border border-stone-200"
                                fallback="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
                            />
                            <div className="grid grid-cols-2 gap-2 text-stone-700 bg-stone-50 p-3 rounded-sm border border-stone-200">
                                <p><strong>Transmisi:</strong> {inspectVehicle.transmission}</p>
                                <p><strong>Kapasitas:</strong> {inspectVehicle.seat_capacity} Kursi</p>
                                <p><strong>Bahan Bakar:</strong> {inspectVehicle.fuel_type}</p>
                                <p><strong>Tarif:</strong> {formatRupiah(inspectVehicle.price_per_day)}/hari</p>
                                <p className="col-span-2"><strong>Lokasi Jemput:</strong> {inspectVehicle.pickup_location}</p>
                                <p className="col-span-2"><strong>Syarat Sewa:</strong> {inspectVehicle.rental_requirements}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => handleApproveVehicle(inspectVehicle.id, false)}
                                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-sm"
                            >
                                Tolak Publikasi
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApproveVehicle(inspectVehicle.id, true)}
                                className="px-4 py-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold rounded-sm"
                            >
                                Setujui & Terbitkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ARBITRASE SENGKETA DEPOSIT */}
            {inspectDispute && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white border border-stone-200 rounded-sm shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                                    Arbitrase Sengketa Deposit
                                </span>
                                <h3 className="text-base font-bold text-[#111] mt-0.5">{inspectDispute.subject}</h3>
                                <p className="text-xs text-stone-500">Ref: {inspectDispute.booking_number}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectDispute(null)}
                                className="text-stone-400 hover:text-black p-1 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-stone-700">{inspectDispute.description}</p>
                            <div className="p-3 bg-stone-50 border border-stone-200 rounded-sm">
                                <p className="text-xs font-semibold text-stone-700">Tuntutan Pengembalian:</p>
                                <p className="text-base font-bold text-red-700 mt-0.5">
                                    {formatRupiah(inspectDispute.refund_amount)}
                                </p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() =>
                                    handleResolveDispute(
                                        inspectDispute.id,
                                        "Klaim customer ditolak. Potongan deposit dinyatakan sah sesuai bukti kerusakan mitra."
                                    )
                                }
                                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-sm border border-stone-300"
                            >
                                Tolak Klaim Customer
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleResolveDispute(
                                        inspectDispute.id,
                                        "Klaim disetujui. Deposit Rp 150.000 dikembalikan penuh ke customer."
                                    )
                                }
                                className="px-4 py-2 bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold rounded-sm"
                            >
                                Kembalikan Dana Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
