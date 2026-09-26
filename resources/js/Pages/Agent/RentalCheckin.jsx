import React, { useMemo, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AgentLayout from "@/Layouts/AgentLayout";
import {
    Card,
    DataRow,
    FailSafeImage,
    SectionTitle,
} from "@/Components/RentGo/Ui";

// Placeholder netral bila mitra belum mengunggah foto unit.
const NO_PHOTO =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="24" text-anchor="middle">Foto unit belum tersedia</text></svg>`,
    );

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

// Format nilai datetime-local (lokal) untuk default input waktu check-in.
const toLocalInputValue = (value) => {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Form Catat Pengembalian (check-in kendaraan) untuk mitra.
 *
 * Dibuka dari tahap "Berjalan" pada tracker pesanan. Menyimpan data lewat
 * route rental-checkins.store; booking otomatis berubah menjadi "returned".
 */
export default function AgentRentalCheckin({
    booking: serverBooking = {},
    bookingNumber = "",
    checkout = null,
}) {
    const booking = serverBooking || {};

    const vehicle = useMemo(() => {
        const v = booking.items?.[0]?.vehicle || booking.item?.vehicle;
        if (!v) return null;
        return {
            id: v.id,
            name:
                v.name ||
                `${v.brand || ""} ${v.model || ""}`.trim() ||
                "Kendaraan",
            license_plate: v.license_plate || "-",
            vehicle_type: v.vehicle_type || "car",
            fuel_type: v.fuel_type || "Bensin",
        };
    }, [booking]);

    const checkoutData = checkout || booking.rentalCheckout || null;

    const [previews, setPreviews] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        booking_id: booking.id,
        vehicle_id: vehicle?.id || "",
        checkin_at: toLocalInputValue(new Date()),
        odometer: checkoutData?.odometer ? String(checkoutData.odometer) : "",
        fuel_level: "100",
        vehicle_condition: "",
        customer_confirmed: false,
        notes: "",
        photos: [],
    });

    const handlePhotos = (files) => {
        const list = Array.from(files || []);
        setData("photos", list);
        setPreviews(list.map((file) => URL.createObjectURL(file)));
    };

    const submit = (e) => {
        e.preventDefault();
        post("/rental-checkins", { forceFormData: true });
    };

    const err = (key) => errors?.[key];

    return (
        <>
            <Head
                title={`Catat Pengembalian ${booking.booking_number || bookingNumber} — RentGo`}
            />

            <nav className="mb-4 flex items-center gap-2 text-[11px] text-stone-500">
                <Link href="/mitra/pesanan" className="hover:text-[#111]">
                    Pesanan Masuk
                </Link>
                <span className="text-stone-300">/</span>
                <Link
                    href={`/mitra/pesanan/${booking.id}`}
                    className="hover:text-[#111] font-mono font-semibold"
                >
                    {booking.booking_number || bookingNumber}
                </Link>
                <span className="text-stone-300">/</span>
                <span className="text-[#111] font-semibold">
                    Catat Pengembalian
                </span>
            </nav>

            <SectionTitle
                kicker="Tahap Berjalan"
                title="Catat Pengembalian Unit"
                description="Isi kondisi unit saat dikembalikan penyewa. Setelah disimpan, status pesanan berubah menjadi Dikembalikan."
            />

            <div className="grid lg:grid-cols-3 gap-6">
                <form
                    onSubmit={submit}
                    className="lg:col-span-2 space-y-6"
                    encType="multipart/form-data"
                >
                    {/* Waktu & kondisi */}
                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Data Pengembalian
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                            <label className="block">
                                <span className="block font-semibold text-stone-700 mb-1">
                                    Waktu check-in
                                </span>
                                <input
                                    type="datetime-local"
                                    value={data.checkin_at}
                                    onChange={(e) =>
                                        setData("checkin_at", e.target.value)
                                    }
                                    className="w-full border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5B800]/40"
                                />
                                {err("checkin_at") && (
                                    <span className="text-[11px] text-red-600 mt-1 block">
                                        {err("checkin_at")}
                                    </span>
                                )}
                            </label>

                            <label className="block">
                                <span className="block font-semibold text-stone-700 mb-1">
                                    Odometer (km)
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.odometer}
                                    onChange={(e) =>
                                        setData("odometer", e.target.value)
                                    }
                                    className="w-full border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5B800]/40"
                                />
                                {checkoutData?.odometer != null && (
                                    <span className="text-[11px] text-stone-400 mt-1 block">
                                        Odometer saat checkout:{" "}
                                        {Number(
                                            checkoutData.odometer || 0,
                                        ).toLocaleString("id-ID")}{" "}
                                        km
                                    </span>
                                )}
                                {err("odometer") && (
                                    <span className="text-[11px] text-red-600 mt-1 block">
                                        {err("odometer")}
                                    </span>
                                )}
                            </label>

                            <label className="block">
                                <span className="block font-semibold text-stone-700 mb-1">
                                    Level bahan bakar (%)
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.fuel_level}
                                    onChange={(e) =>
                                        setData("fuel_level", e.target.value)
                                    }
                                    className="w-full border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5B800]/40"
                                />
                                {err("fuel_level") && (
                                    <span className="text-[11px] text-red-600 mt-1 block">
                                        {err("fuel_level")}
                                    </span>
                                )}
                            </label>
                        </div>

                        <label className="block mt-4 text-xs">
                            <span className="block font-semibold text-stone-700 mb-1">
                                Kondisi kendaraan
                            </span>
                            <textarea
                                rows={4}
                                value={data.vehicle_condition}
                                onChange={(e) =>
                                    setData("vehicle_condition", e.target.value)
                                }
                                placeholder="Deskripsikan kondisi unit saat dikembalikan (body, ban, interior, kebersihan, kelengkapan, dsb)."
                                className="w-full border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5B800]/40"
                            />
                            {err("vehicle_condition") && (
                                <span className="text-[11px] text-red-600 mt-1 block">
                                    {err("vehicle_condition")}
                                </span>
                            )}
                        </label>

                        <label className="block mt-4 text-xs">
                            <span className="block font-semibold text-stone-700 mb-1">
                                Catatan tambahan (opsional)
                            </span>
                            <textarea
                                rows={2}
                                value={data.notes}
                                onChange={(e) =>
                                    setData("notes", e.target.value)
                                }
                                className="w-full border-stone-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5B800]/40"
                            />
                            {err("notes") && (
                                <span className="text-[11px] text-red-600 mt-1 block">
                                    {err("notes")}
                                </span>
                            )}
                        </label>
                    </Card>

                    {/* Foto */}
                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Foto Kondisi Unit
                        </p>
                        <input
                            type="file"
                            accept="image/jpg,image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(e) => handlePhotos(e.target.files)}
                            className="block w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-[#111] file:text-[#F5B800] hover:file:bg-stone-800"
                        />
                        <p className="text-[11px] text-stone-400 mt-2">
                            Opsional. Format JPG/PNG/WEBP, maksimal 5 MB per
                            foto.
                        </p>
                        {err("photos") && (
                            <span className="text-[11px] text-red-600 mt-1 block">
                                {err("photos")}
                            </span>
                        )}

                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                                {previews.map((src, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-sm overflow-hidden border-stone-200 bg-stone-100"
                                    >
                                        <img
                                            src={src}
                                            alt={`Foto ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <label className="flex items-start gap-2 text-xs bg-stone-50 border-stone-200 rounded-sm p-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.customer_confirmed}
                            onChange={(e) =>
                                setData("customer_confirmed", e.target.checked)
                            }
                            className="mt-0.5 rounded-sm border-stone-300 text-[#111] focus:ring-[#F5B800]"
                        />
                        <span className="text-stone-700">
                            Penyewa sudah mengonfirmasi kondisi unit saat
                            pengembalian.
                            {err("customer_confirmed") && (
                                <span className="text-[11px] text-red-600 block mt-1">
                                    {err("customer_confirmed")}
                                </span>
                            )}
                        </span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-[#F5B800] hover:bg-[#e0a800] disabled:opacity-60 text-[#111] text-xs font-bold py-2.5 px-6 rounded-sm uppercase tracking-wider transition-colors"
                        >
                            {processing
                                ? "Menyimpan..."
                                : "Simpan Pengembalian"}
                        </button>
                        <Link
                            href={`/mitra/pesanan/${booking.id}`}
                            className="text-xs font-semibold border-stone-300 hover:bg-stone-50 py-2.5 px-6 rounded-sm transition-colors"
                        >
                            Batal
                        </Link>
                    </div>
                </form>

                {/* Ringkasan unit */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Unit Disewa
                        </p>
                        <div className="w-full h-32 rounded-sm overflow-hidden bg-stone-100 mb-3">
                            <FailSafeImage
                                src={
                                    booking.items?.[0]?.vehicle?.photos?.[0]
                                        ?.file_path
                                        ? `/storage/${booking.items[0].vehicle.photos[0].file_path}`
                                        : NO_PHOTO
                                }
                                alt={vehicle?.name || "Unit kendaraan"}
                                fallback={NO_PHOTO}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-2 text-xs">
                            <DataRow
                                label="Unit"
                                value={vehicle?.name || "-"}
                                strong
                            />
                            <DataRow
                                label="Plat"
                                value={vehicle?.license_plate || "-"}
                            />
                            <DataRow
                                label="Mulai sewa"
                                value={formatTanggalJam(booking.rental_start)}
                            />
                            <DataRow
                                label="Selesai sewa"
                                value={formatTanggalJam(booking.rental_end)}
                            />
                        </div>
                    </Card>

                    <Card className="p-5 border">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Data Check-out
                        </p>
                        {checkoutData ? (
                            <div className="space-y-2 text-xs">
                                <DataRow
                                    label="Waktu"
                                    value={formatTanggalJam(
                                        checkoutData.checkout_at,
                                    )}
                                />
                                <DataRow
                                    label="Odometer"
                                    value={`${Number(
                                        checkoutData.odometer || 0,
                                    ).toLocaleString("id-ID")} km`}
                                />
                                <DataRow
                                    label="Bahan bakar"
                                    value={checkoutData.fuel_level || "-"}
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-stone-400">
                                Belum ada data check-out.
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}

AgentRentalCheckin.layout = (page) => (
    <AgentLayout active="/mitra/pesanan" title="Catat Pengembalian">
        {page}
    </AgentLayout>
);
