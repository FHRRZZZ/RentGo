import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import {
    StatusBadge,
    SectionTitle,
    Card,
    DataRow,
    EmptyState,
} from "@/Components/RentGo/Ui";

const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(val || 0);

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

const SEVERITY = {
    minor: {
        label: "Ringan",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    moderate: {
        label: "Sedang",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    major: { label: "Berat", color: "bg-red-100 text-red-800 border-red-300" },
};

const DAMAGE_STATUS = {
    reported: {
        label: "Dilaporkan",
        color: "bg-amber-100 text-amber-900 border-amber-300",
    },
    verified: {
        label: "Terverifikasi",
        color: "bg-blue-100 text-blue-800 border-blue-300",
    },
    resolved: {
        label: "Selesai",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    rejected: {
        label: "Ditolak",
        color: "bg-red-100 text-red-800 border-red-300",
    },
};

export default function RentalHandover({
    auth = {},
    bookingNumber = "RG-2026-0820",
    booking: serverBooking = null,
    checkout: serverCheckout = null,
    checkin: serverCheckin = null,
    damages: serverDamages = [],
}) {
    const rawCheckout = serverCheckout || serverBooking?.rental_checkout || serverBooking?.rentalCheckout;
    const rawCheckin = serverCheckin || serverBooking?.rental_checkin || serverBooking?.rentalCheckin;

    const booking = {
        ...(serverBooking || {}),
        id: serverBooking?.id || 1,
        booking_number: serverBooking?.booking_number || bookingNumber,
        rental_start: serverBooking?.rental_start || new Date().toISOString(),
        rental_end: serverBooking?.rental_end || new Date().toISOString(),
        pickup_location: serverBooking?.pickup_location || "Pool Mitra",
        return_location: serverBooking?.return_location || "Pool Mitra",
        checkout: rawCheckout,
        checkin: rawCheckin,
    };

    const vehicle = serverBooking?.items?.[0]?.vehicle || serverBooking?.item?.vehicle || {
        name: "Kendaraan Rental",
        license_plate: "-",
        vehicle_type: "car",
        fuel_type: "Bensin",
    };

    const [equipment, setEquipment] = useState({
        stnk: true,
        toolkit: true,
        helm: vehicle?.vehicle_type === "motorcycle",
        kunci_cadangan: true,
    });

    const damages = serverDamages?.length > 0 ? serverDamages : (serverBooking?.damages || []);

    return (
        <CustomerLayout auth={auth} activeNav="pesanan" backHref="/pesanan" backLabel="Pesanan">
            <Head title={`Serah Terima ${booking.booking_number} - RentGo`} />

            {/* Page Header */}
            <div className="mb-6">
                <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#F5B800]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b38600]">
                        Berita Acara
                    </span>
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
                    Serah Terima Unit
                </h1>
                <p className="mt-1 text-xs text-stone-500">
                    Checklist kondisi kendaraan untuk pesanan {booking.booking_number}.
                </p>
            </div>

                    {/* Info unit */}
                    <Card className="p-5 border mb-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                    Unit
                                </p>
                                <p className="text-sm font-semibold mt-1">
                                    {vehicle?.name}
                                </p>
                                <p className="text-stone-500 font-mono">
                                    {vehicle?.license_plate}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                    Jadwal
                                </p>
                                <p className="mt-1">
                                    {formatTanggalJam(booking.rental_start)}
                                </p>
                                <p className="text-stone-500">
                                    s/d {formatTanggalJam(booking.rental_end)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                    Titik
                                </p>
                                <p className="mt-1">
                                    {booking.pickup_location ||
                                        booking.delivery_address}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Checkout */}
                        <Card className="p-5 border">
                            <SectionTitle
                                kicker="Tahap 1"
                                title="Check-out (Penyerahan)"
                            />
                            {booking.checkout ? (
                                <div className="space-y-2.5 text-xs">
                                    <DataRow
                                        label="Waktu serah terima"
                                        value={formatTanggalJam(
                                            booking.checkout.checkout_at,
                                        )}
                                    />
                                    <DataRow
                                        label="Odometer"
                                        value={`${booking.checkout.odometer.toLocaleString("id-ID")} km`}
                                    />
                                    <DataRow
                                        label="Bahan bakar"
                                        value={booking.checkout.fuel_level}
                                    />
                                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                        <span className="text-stone-500">
                                            Konfirmasi customer
                                        </span>
                                        <StatusBadge
                                            status={
                                                booking.checkout
                                                    .customer_confirmed
                                                    ? "approved"
                                                    : "pending"
                                            }
                                            map={{
                                                approved: {
                                                    label: "Sudah dikonfirmasi",
                                                    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
                                                },
                                                pending: {
                                                    label: "Belum",
                                                    color: "bg-amber-100 text-amber-900 border-amber-300",
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-stone-200">
                                        <p className="font-semibold text-stone-700 mb-2">
                                            Kelengkapan Unit
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                ["stnk", "STNK"],
                                                ["toolkit", "Toolkit"],
                                                [
                                                    "helm",
                                                    vehicle?.vehicle_type ===
                                                    "motorcycle"
                                                        ? "Helm"
                                                        : "Dongkrak",
                                                ],
                                                [
                                                    "kunci_cadangan",
                                                    "Kunci Cadangan",
                                                ],
                                            ].map(([key, label]) => (
                                                <label
                                                    key={key}
                                                    className="flex items-center gap-2 text-[11px] text-stone-600"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={equipment[key]}
                                                        onChange={(e) =>
                                                            setEquipment(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [key]: e
                                                                        .target
                                                                        .checked,
                                                                }),
                                                            )
                                                        }
                                                        className="rounded-sm border-stone-300 text-[#111] focus:ring-[#F5B800]"
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    title="Belum ada check-out"
                                    description="Serah terima unit belum dilakukan."
                                />
                            )}
                        </Card>

                        {/* Checkin */}
                        <Card className="p-5 border">
                            <SectionTitle
                                kicker="Tahap 2"
                                title="Check-in (Pengembalian)"
                            />
                            {booking.checkin ? (
                                <div className="space-y-2.5 text-xs">
                                    <DataRow
                                        label="Waktu pengembalian"
                                        value={formatTanggalJam(
                                            booking.checkin.checkin_at,
                                        )}
                                    />
                                    <DataRow
                                        label="Odometer"
                                        value={`${booking.checkin.odometer.toLocaleString("id-ID")} km`}
                                    />
                                    <DataRow
                                        label="Bahan bakar"
                                        value={booking.checkin.fuel_level}
                                    />
                                    <DataRow
                                        label="Terlambat"
                                        value={
                                            booking.checkin.is_late_return
                                                ? "Ya"
                                                : "Tidak"
                                        }
                                    />
                                    <DataRow
                                        label="Denda keterlambatan"
                                        value={formatRupiah(
                                            booking.checkin.late_return_fee,
                                        )}
                                    />
                                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                        <span className="text-stone-500">
                                            Konfirmasi customer
                                        </span>
                                        <StatusBadge
                                            status={
                                                booking.checkin
                                                    .customer_confirmed
                                                    ? "approved"
                                                    : "pending"
                                            }
                                            map={{
                                                approved: {
                                                    label: "Sudah dikonfirmasi",
                                                    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
                                                },
                                                pending: {
                                                    label: "Belum",
                                                    color: "bg-amber-100 text-amber-900 border-amber-300",
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    title="Belum ada check-in"
                                    description="Unit belum dikembalikan oleh penyewa."
                                />
                            )}
                        </Card>
                    </div>

                    {/* Kerusakan */}
                    <div className="mt-6">
                        <SectionTitle
                            kicker="Temuan"
                            title="Catatan Kerusakan"
                            description="Kerusakan yang ditemukan saat pengembalian unit dan dampaknya pada deposit."
                        />
                        {damages.length === 0 ? (
                            <EmptyState
                                title="Tidak ada kerusakan"
                                description="Unit dikembalikan dalam kondisi baik."
                            />
                        ) : (
                            <div className="space-y-4">
                                {damages.map((damage) => (
                                    <Card
                                        key={damage.id}
                                        className="border p-5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-semibold bg-stone-200/80 px-2 py-0.5 rounded-sm">
                                                    #{damage.id}
                                                </span>
                                                <span className="text-[11px] text-stone-500">
                                                    {damage.vehicle_name} ·{" "}
                                                    {damage.booking_number}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    status={damage.severity}
                                                    map={SEVERITY}
                                                />
                                                <StatusBadge
                                                    status={damage.status}
                                                    map={DAMAGE_STATUS}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {damage.description}
                                        </p>
                                        <div className="grid sm:grid-cols-4 gap-2 mt-3 text-[11px] text-stone-500">
                                            <span>
                                                Lokasi:{" "}
                                                <span className="font-semibold text-[#111]">
                                                    {damage.location}
                                                </span>
                                            </span>
                                            <span>
                                                Estimasi:{" "}
                                                <span className="font-semibold text-[#111]">
                                                    {formatRupiah(
                                                        damage.repair_cost,
                                                    )}
                                                </span>
                                            </span>
                                            <span>
                                                Beban customer:{" "}
                                                <span className="font-semibold text-[#111]">
                                                    {formatRupiah(
                                                        damage.customer_charge,
                                                    )}
                                                </span>
                                            </span>
                                            <span>
                                                Dipotong deposit:{" "}
                                                <span className="font-semibold text-[#111]">
                                                    {damage.deducted_from_deposit
                                                        ? "Ya"
                                                        : "Tidak"}
                                                </span>
                                            </span>
                                        </div>
                                        {damage.notes && (
                                            <p className="text-[11px] text-stone-400 mt-3 pt-3 border-t border-stone-100">
                                                {damage.notes}
                                            </p>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
        </CustomerLayout>
    );
}
