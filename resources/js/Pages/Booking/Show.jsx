import React, { useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import {
    StatusBadge,
    DataRow,
    Card,
    FailSafeImage,
} from "@/Components/RentGo/Ui";

// Tidak ada foto dummy: placeholder netral bila mitra belum mengunggah foto.
const NO_PHOTO =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f5f5f4"/><text x="50%" y="50%" fill="#a8a29e" font-family="sans-serif" font-size="24" text-anchor="middle">Foto unit belum tersedia</text></svg>`,
    );

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

const BOOKING_STATUS = {
    pending_payment: { label: "Menunggu Pembayaran", color: "bg-amber-100 text-amber-900 border-amber-300" },
    paid: { label: "Sudah Dibayar", color: "bg-blue-100 text-blue-900 border-blue-300" },
    waiting_agent_confirmation: { label: "Menunggu Konfirmasi Mitra", color: "bg-amber-100 text-amber-900 border-amber-300" },
    confirmed: { label: "Dikonfirmasi Mitra", color: "bg-blue-100 text-blue-800 border-blue-300" },
    ongoing: { label: "Sedang Berjalan", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    returned: { label: "Kendaraan Dikembalikan", color: "bg-purple-100 text-purple-800 border-purple-300" },
    completed: { label: "Selesai", color: "bg-stone-100 text-stone-700 border-stone-300" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-300" },
};

const PAYMENT_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-900 border-amber-300" },
    completed: { label: "Berhasil", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-300" },
};

const REFUND_STATUS = {
    pending: { label: "Menunggu", color: "bg-amber-100 text-amber-900 border-amber-300" },
    approved: { label: "Disetujui", color: "bg-blue-100 text-blue-800 border-blue-300" },
    completed: { label: "Selesai", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
};

// Urutan tahapan booking sesuai enum di migrasi bookings.status
const FLOW = [
    { key: "pending_payment", label: "Pembayaran" },
    { key: "paid", label: "Dibayar" },
    { key: "waiting_agent_confirmation", label: "Konfirmasi Mitra" },
    { key: "confirmed", label: "Dikonfirmasi" },
    { key: "ongoing", label: "Berjalan" },
    { key: "returned", label: "Dikembalikan" },
    { key: "completed", label: "Selesai" },
];

function flowIndex(status) {
    return FLOW.findIndex((step) => step.key === status);
}

export default function BookingDetail({
    auth = {},
    bookingNumber = "RG-2026-0914",
    booking: serverBooking = null,
}) {
    const booking = useMemo(() => {
        const raw = serverBooking || {};
        const v = raw.items?.[0]?.vehicle || raw.item?.vehicle;
        const ag = raw.agent_profile || raw.agentProfile;
        const pay = raw.payments?.[0] || raw.payment;
        return {
            ...raw,
            id: raw.id || 1,
            booking_number: raw.booking_number || bookingNumber,
            rental_start: raw.rental_start || new Date().toISOString(),
            rental_end: raw.rental_end || new Date().toISOString(),
            status: raw.status || 'pending_payment',
            rental_amount: Number(raw.rental_amount || 0),
            service_fee: Number(raw.service_fee || 0),
            delivery_fee: Number(raw.delivery_fee || 0),
            additional_fee: Number(raw.additional_fee || 0),
            deposit_amount: Number(raw.deposit_amount || 0),
            total_amount: Number(raw.total_amount || 0),
            item: {
                vehicle_id: v?.id || 1,
                rental_type: raw.delivery_type === 'delivery' ? 'Antar-Jemput' : 'Lepas Kunci',
                pickup_location: raw.pickup_location || 'Pool Mitra',
                return_location: raw.return_location || 'Pool Mitra',
            },
            vehicle: v,
            agent: ag,
            payment: pay ? {
                payment_number: pay.payment_number || `PAY-${pay.id}`,
                payment_method: pay.payment_method || 'transfer',
                amount: Number(pay.amount || 0),
                paid_at: pay.paid_at,
                status: pay.status || 'pending',
            } : null,
            checkout: raw.rental_checkout || raw.rentalCheckout,
            checkin: raw.rental_checkin || raw.rentalCheckin,
            cancellation: raw.cancellation,
        };
    }, [serverBooking, bookingNumber]);

    const vehicle = useMemo(() => {
        if (booking.vehicle) {
            return {
                id: booking.vehicle.id,
                name: booking.vehicle.name || `${booking.vehicle.brand || ''} ${booking.vehicle.model || ''}`.trim() || 'Kendaraan',
                license_plate: booking.vehicle.license_plate || '-',
                color: booking.vehicle.color || '-',
                year: booking.vehicle.year || '-',
                transmission: booking.vehicle.transmission === 'manual' ? 'Manual' : 'Matic',
                fuel_type: booking.vehicle.fuel_type || '-',
                vehicle_type: booking.vehicle.vehicle_type || 'car',
                seat_capacity: booking.vehicle.seat_capacity ?? null,
                img: (() => {
                    const photo = (booking.vehicle.photos || []).find(
                        (p) => p?.file_path || p?.photo_path,
                    );
                    const path = photo?.file_path || photo?.photo_path;
                    return path ? `/storage/${path}` : null;
                })(),
            };
        }
        return null;
    }, [booking]);

    const agent = useMemo(() => {
        if (booking.agent) {
            return {
                agency_name: booking.agent.agency_name || booking.agent.user?.name || '-',
                owner_name: booking.agent.user?.name || '-',
                phone: booking.agent.phone || booking.agent.user?.phone || '-',
                city: booking.agent.city || '-',
                province: booking.agent.province || '-',
                address: booking.agent.address || '-',
            };
        }
        return null;
    }, [booking]);

    const currentStep = flowIndex(booking.status);
    const isTerminal = ["cancelled", "rejected"].includes(booking.status);

    // Titik presisi yang ditandai customer saat memesan (metode yang dipakai).
    const mapCoordinate = useMemo(() => {
        const isDelivery = booking.fulfillment_type === 'delivery';
        const lat = isDelivery
            ? booking.delivery_latitude
            : booking.pickup_latitude;
        const lng = isDelivery
            ? booking.delivery_longitude
            : booking.pickup_longitude;
        return lat != null && lng != null
            ? { lat: Number(lat), lng: Number(lng), isDelivery }
            : null;
    }, [booking]);

    const mapLink = mapCoordinate
        ? `https://www.google.com/maps/search/?api=1&query=${mapCoordinate.lat},${mapCoordinate.lng}`
        : null;

    const biaya = [
        ["Sewa unit", booking.rental_amount],
        ["Biaya layanan", booking.service_fee],
        ["Biaya antar (delivery)", booking.delivery_fee],
        ["Biaya tambahan", booking.additional_fee],
    ];
    if (booking.cancellation) {
        biaya.push([
            "Refund (" + booking.cancellation.refund_percentage + "%)",
            -booking.cancellation.refund_amount,
        ]);
    }

    return (
        <CustomerLayout auth={auth} activeNav="pesanan" backHref="/pesanan" backLabel="Pesanan Saya">
            <Head title={`Pesanan ${booking.booking_number} - RentGo`} />

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-[11px] text-stone-500">
                <Link href="/pesanan" className="hover:text-[#111111]">
                    Pesanan Saya
                </Link>
                <span className="text-stone-300">/</span>
                <span className="font-mono font-semibold text-[#111111]">
                    {booking.booking_number}
                </span>
            </nav>

                    {/* Header ringkasan */}
                    <Card className="p-5 border mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                    Nomor Pesanan
                                </p>
                                <h1 className="text-lg font-semibold font-mono mt-1">
                                    {booking.booking_number}
                                </h1>
                                <p className="text-xs text-stone-500 mt-1">
                                    {formatTanggalJam(booking.rental_start)} —{" "}
                                    {formatTanggalJam(booking.rental_end)}
                                </p>
                            </div>
                            <div className="text-right">
                                <StatusBadge
                                    status={booking.status}
                                    map={BOOKING_STATUS}
                                    className="text-xs px-3 py-1"
                                />
                                <p className="text-lg font-semibold mt-2">
                                    {formatRupiah(booking.total_amount)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Progress flow */}
                    <Card className="p-5 border mb-6">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                            Status Penyewaan
                        </p>
                        {isTerminal ? (
                            <div className="flex items-center gap-3">
                                <StatusBadge
                                    status={booking.status}
                                    map={BOOKING_STATUS}
                                    className="text-xs px-3 py-1"
                                />
                                <span className="text-xs text-stone-500">
                                    {booking.status === "cancelled"
                                        ? "Pesanan ini telah dibatalkan."
                                        : "Pesanan ini ditolak mitra."}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center w-full">
                                {FLOW.map((step, index) => {
                                    const done = index <= currentStep;
                                    const active = index === currentStep;
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-col items-center shrink-0">
                                                <div
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                                                        done
                                                            ? "bg-[#111] text-[#F5B800] border-[#111]"
                                                            : "bg-white text-stone-300 border-stone-200"
                                                    } ${active ? "ring-4 ring-[#F5B800]/30" : ""}`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <span
                                                    className={`text-[10px] mt-1.5 text-center w-16 ${done ? "text-[#111] font-semibold" : "text-stone-400"}`}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                            {index < FLOW.length - 1 && (
                                                <div
                                                    className={`flex-1 h-0.5 mx-1 ${index < currentStep ? "bg-[#111]" : "bg-stone-200"}`}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Unit */}
                            <Card className="p-5 border">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                    Unit yang Disewa
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-28 h-24 rounded-sm overflow-hidden bg-stone-100 shrink-0">
                                        <FailSafeImage
                                            src={vehicle?.img || NO_PHOTO}
                                            alt={vehicle?.name || 'Unit kendaraan'}
                                            fallback={NO_PHOTO}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <h3 className="text-sm font-semibold">
                                            {vehicle?.name || 'Data unit tidak tersedia'}
                                        </h3>
                                        <p className="text-stone-500 font-mono">
                                            {vehicle?.license_plate || '-'}
                                        </p>
                                        <p className="text-stone-500">
                                            {vehicle?.transmission} ·{" "}
                                            {vehicle?.seat_capacity
                                                ? `${vehicle.seat_capacity} ${vehicle?.vehicle_type === "car" ? "Kursi" : "Orang"}`
                                                : "-"}
                                        </p>
                                        <p className="text-stone-500">
                                            {booking.item.rental_days} hari ×{" "}
                                            {formatRupiah(
                                                booking.item.price_per_day,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Jadwal & Serah terima */}
                            <Card className="p-5 border">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                    Jadwal & Serah Terima
                                </p>
                                <div className="space-y-2.5 text-xs">
                                    <DataRow
                                        label="Mulai sewa"
                                        value={formatTanggalJam(
                                            booking.rental_start,
                                        )}
                                    />
                                    <DataRow
                                        label="Selesai sewa"
                                        value={formatTanggalJam(
                                            booking.rental_end,
                                        )}
                                    />
                                    <DataRow
                                        label="Metode"
                                        value={
                                            booking.fulfillment_type ===
                                            "delivery"
                                                ? "Antar ke lokasi"
                                                : "Ambil sendiri"
                                        }
                                    />
                                    <DataRow
                                        label={
                                            booking.fulfillment_type ===
                                            "delivery"
                                                ? "Alamat antar"
                                                : "Titik ambil"
                                        }
                                        value={
                                            booking.delivery_address ||
                                            booking.pickup_location ||
                                            "-"
                                        }
                                        strong
                                    />
                                    {(booking.delivery_landmark ||
                                        booking.pickup_landmark) && (
                                        <DataRow
                                            label="Patokan"
                                            value={
                                                booking.delivery_landmark ||
                                                booking.pickup_landmark
                                            }
                                        />
                                    )}

                                    {/* Titik presisi: tombol navigasi ke Google Maps, ala Gojek. */}
                                    {mapLink && (
                                        <a
                                            href={mapLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 flex items-center justify-between gap-2 rounded-sm border-[#111] bg-white px-3 py-2.5 hover:bg-stone-50 transition-colors"
                                        >
                                            <span className="flex items-center gap-2 min-w-0">
                                                <svg
                                                    className="h-4 w-4 text-[#111] shrink-0"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                    />
                                                </svg>
                                                <span className="min-w-0">
                                                    <span className="block text-[11px] font-bold text-[#111]">
                                                        Lihat Titik Presisi
                                                    </span>
                                                    <span className="block text-[10px] text-stone-500 font-mono">
                                                        {Number(
                                                            mapCoordinate.lat,
                                                        ).toFixed(5)}
                                                        ,{" "}
                                                        {Number(
                                                            mapCoordinate.lng,
                                                        ).toFixed(5)}
                                                    </span>
                                                </span>
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#b38600] shrink-0">
                                                Buka Peta
                                            </span>
                                        </a>
                                    )}
                                    {booking.customer_note && (
                                        <DataRow
                                            label="Catatan Anda"
                                            value={booking.customer_note}
                                        />
                                    )}
                                    {booking.agent_note && (
                                        <DataRow
                                            label="Catatan mitra"
                                            value={booking.agent_note}
                                        />
                                    )}
                                </div>
                            </Card>

                            {/* Checkout / Checkin */}
                            {(booking.checkout || booking.checkin) && (
                                <Card className="p-5 border">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                        Serah Terima Unit
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-5 text-xs">
                                        {booking.checkout && (
                                            <div className="border border-stone-200 rounded-sm p-4">
                                                <p className="font-semibold text-stone-700 mb-2">
                                                    Check-out (Penyerahan)
                                                </p>
                                                <div className="space-y-1.5">
                                                    <DataRow
                                                        label="Waktu"
                                                        value={formatTanggalJam(
                                                            booking.checkout
                                                                .checkout_at,
                                                        )}
                                                    />
                                                    <DataRow
                                                        label="Odometer"
                                                        value={`${booking.checkout.odometer.toLocaleString("id-ID")} km`}
                                                    />
                                                    <DataRow
                                                        label="Bahan bakar"
                                                        value={
                                                            booking.checkout
                                                                .fuel_level
                                                        }
                                                    />
                                                    <DataRow
                                                        label="Konfirmasi"
                                                        value={
                                                            booking.checkout
                                                                .customer_confirmed
                                                                ? "Sudah"
                                                                : "Belum"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {booking.checkin && (
                                            <div className="border border-stone-200 rounded-sm p-4">
                                                <p className="font-semibold text-stone-700 mb-2">
                                                    Check-in (Pengembalian)
                                                </p>
                                                <div className="space-y-1.5">
                                                    <DataRow
                                                        label="Waktu"
                                                        value={formatTanggalJam(
                                                            booking.checkin
                                                                .checkin_at,
                                                        )}
                                                    />
                                                    <DataRow
                                                        label="Odometer"
                                                        value={`${booking.checkin.odometer.toLocaleString("id-ID")} km`}
                                                    />
                                                    <DataRow
                                                        label="Bahan bakar"
                                                        value={
                                                            booking.checkin
                                                                .fuel_level
                                                        }
                                                    />
                                                    <DataRow
                                                        label="Terlambat"
                                                        value={
                                                            booking.checkin
                                                                .is_late_return
                                                                ? formatRupiah(
                                                                      booking
                                                                          .checkin
                                                                          .late_return_fee,
                                                                  )
                                                                : "Tidak"
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar biaya & pembayaran */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="p-5 border">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                    Rincian Biaya
                                </p>
                                <div className="space-y-2 text-xs">
                                    {biaya.map(([label, value]) => (
                                        <DataRow
                                            key={label}
                                            label={label}
                                            value={formatRupiah(
                                                Math.abs(value),
                                            )}
                                        />
                                    ))}
                                    <div className="pt-2 border-t border-stone-200">
                                        <DataRow
                                            label="Deposit"
                                            value={formatRupiah(
                                                booking.deposit_amount,
                                            )}
                                        />
                                    </div>
                                    <div className="pt-2 border-t border-stone-200">
                                        <DataRow
                                            label="Total"
                                            value={formatRupiah(
                                                booking.total_amount,
                                            )}
                                            strong
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5 border">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                    Pembayaran
                                </p>
                                {booking.payment ? (
                                    <div className="space-y-2 text-xs">
                                        <DataRow
                                            label="No. Pembayaran"
                                            value={
                                                booking.payment.payment_number
                                            }
                                        />
                                        <DataRow
                                            label="Metode"
                                            value={
                                                booking.payment
                                                    .payment_method === "qris"
                                                    ? "QRIS"
                                                    : "Tunai"
                                            }
                                        />
                                        <DataRow
                                            label="Nominal"
                                            value={formatRupiah(
                                                booking.payment.amount,
                                            )}
                                        />
                                        {booking.payment.paid_at && (
                                            <DataRow
                                                label="Dibayar"
                                                value={formatTanggalJam(
                                                    booking.payment.paid_at,
                                                )}
                                            />
                                        )}
                                        <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                            <span className="text-stone-500">
                                                Status
                                            </span>
                                            <StatusBadge
                                                status={booking.payment.status}
                                                map={PAYMENT_STATUS}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-stone-400">
                                            Belum ada pembayaran.
                                        </p>
                                        {['pending_payment', 'waiting_payment', 'pending'].includes(booking.status) && (
                                            <Link
                                                href={`/payments/create/${booking.id || 1}`}
                                                className="block text-center bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-bold py-2.5 rounded-sm uppercase tracking-wider transition-colors"
                                            >
                                                Pilih Metode &amp; Bayar
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </Card>

                            {booking.cancellation && (
                                <Card className="p-5 border">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                        Pembatalan & Refund
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <DataRow
                                            label="Alasan"
                                            value={booking.cancellation.reason}
                                        />
                                        <DataRow
                                            label="Waktu"
                                            value={formatTanggalJam(
                                                booking.cancellation
                                                    .cancelled_at,
                                            )}
                                        />
                                        <DataRow
                                            label="Refund"
                                            value={`${booking.cancellation.refund_percentage}%`}
                                        />
                                        <DataRow
                                            label="Nominal"
                                            value={formatRupiah(
                                                booking.cancellation
                                                    .refund_amount,
                                            )}
                                        />
                                        <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                                            <span className="text-stone-500">
                                                Status refund
                                            </span>
                                            <StatusBadge
                                                status={
                                                    booking.cancellation
                                                        .refund_status
                                                }
                                                map={REFUND_STATUS}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Card className="p-5 border">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-4">
                                    Kontak Mitra
                                </p>
                                <p className="text-xs font-semibold">
                                    {agent?.agency_name || 'Data mitra belum tersedia'}
                                </p>
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                    {[agent?.owner_name, agent?.phone]
                                        .filter((v) => v && v !== '-')
                                        .join(' · ') || '-'}
                                </p>
                                {agent?.phone && agent.phone !== '-' ? (
                                    <a
                                        href={`https://wa.me/62${agent.phone.replace(/^0/, "")}?text=Halo%20RentGo,%20konfirmasi%20pesanan%20${booking.booking_number}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 block text-center bg-[#F5B800] hover:bg-[#e0a800] text-[#111] text-xs font-semibold py-2 rounded-sm"
                                    >
                                        Hubungi via WhatsApp
                                    </a>
                                ) : (
                                    <p className="mt-3 text-[11px] text-stone-400">
                                        Nomor kontak mitra belum tersedia.
                                    </p>
                                )}
                            </Card>
                        </div>
                    </div>
        </CustomerLayout>
    );
}
