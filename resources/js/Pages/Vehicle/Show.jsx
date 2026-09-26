import React, { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import LocationPicker from "@/Components/LocationPicker";
import {
    StatusBadge,
    SectionTitle,
    Card,
    DataRow,
    FailSafeImage,
    Stars,
} from "@/Components/RentGo/Ui";

// Tidak ada gambar dummy: kalau foto unit belum diunggah mitra, tampilkan
// placeholder abu-abu bertuliskan keterangan (FailSafeImage butuh src).
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

const VEHICLE_STATUS = {
    available: { label: "Tersedia", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    booked: { label: "Sudah Dipesan", color: "bg-blue-100 text-blue-800 border-blue-300" },
    rented: { label: "Disewa", color: "bg-blue-100 text-blue-800 border-blue-300" },
    maintenance: { label: "Servis", color: "bg-amber-100 text-amber-900 border-amber-300" },
    inactive: { label: "Nonaktif", color: "bg-stone-100 text-stone-600 border-stone-300" },
    draft: { label: "Draft", color: "bg-stone-100 text-stone-600 border-stone-300" },
    pending_review: { label: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-900 border-amber-300" },
    rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-300" },
};

export default function VehicleDetail({
    auth = {},
    vehicleId = 1,
    vehicle: serverVehicle = null,
    agent: serverAgent = null,
    category: serverCategory = null,
    reviews: serverReviews = null,
    availabilities: serverAvailabilities = null,
    compliance = null,
}) {
    const vehicle = useMemo(() => {
        const raw = serverVehicle || {};
        // Tanpa harga dari mitra → tampilkan tanpa harga (tidak dikarang).
        const price =
            raw.search_price ?? raw.prices?.[0]?.price_per_day ?? raw.price_per_day ?? 0;
        const photos = (raw.photos || [])
            .filter((p) => p.file_path || p.photo_path)
            .map((p) => `/storage/${p.file_path || p.photo_path}`);
        return {
            id: raw.id || vehicleId,
            name: raw.name || `${raw.brand || ''} ${raw.model || ''}`.trim() || "Kendaraan",
            brand: raw.brand || "-",
            model: raw.model || "-",
            year: raw.year || "-",
            transmission: raw.transmission === "manual" ? "Manual" : "Matic",
            fuel_type: raw.fuel_type || "-",
            seat_capacity: raw.seat_capacity ?? null,
            price_per_day: Number(price),
            deposit_amount: Number(raw.deposit_amount || 0),
            status: raw.status || "available",
            description: raw.description || "Deskripsi unit belum diisi mitra.",
            rental_requirements:
                raw.rental_requirements || "Syarat sewa belum diisi mitra.",
            pickup_location:
                raw.pickup_location ||
                [raw.agent_profile?.address, raw.agent_profile?.city]
                    .filter(Boolean)
                    .join(", ") ||
                "Titik serah terima belum diisi mitra.",
            photos: photos.length > 0 ? photos : [NO_PHOTO],
            has_real_photo: photos.length > 0,
            vehicle_category_id: raw.vehicle_category_id,
            agent_profile_id: raw.agent_profile_id,
            vehicle_type: raw.vehicle_type || "car",
            license_plate: raw.license_plate || "-",
            color: raw.color || "-",
        };
    }, [serverVehicle, vehicleId]);

    // Mitra penyedia: hanya pakai data asli dari database.
    const agent = useMemo(() => {
        const ag =
            serverAgent || serverVehicle?.agent_profile || serverVehicle?.agentProfile;
        if (!ag) return null;
        return {
            id: ag.id,
            agency_name: ag.agency_name || ag.user?.name || "Mitra RentGo",
            city: ag.city || "-",
            province: ag.province || "-",
            address: ag.address || "-",
            phone: ag.phone || ag.user?.phone || "-",
            owner_name: ag.user?.name || "-",
            description: ag.description || "Deskripsi mitra belum diisi.",
            onboarding_status: ag.onboarding_status || "pending_verification",
        };
    }, [serverAgent, serverVehicle]);

    const category = useMemo(() => {
        const cat =
            serverCategory ||
            serverVehicle?.vehicle_category ||
            serverVehicle?.category;
        if (!cat) return null;
        return {
            id: cat.id,
            name: cat.name || "-",
            vehicle_type: cat.vehicle_type || "car",
        };
    }, [serverCategory, serverVehicle]);

    const [activePhoto, setActivePhoto] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [fulfillmentType, setFulfillmentType] = useState("self_pickup");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [customerNote, setCustomerNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Titik presisi "seperti Gojek": customer menunjuk lokasinya di peta.
    // Untuk Ambil Sendiri berarti titik pertemuan dengan mitra, untuk
    // Diantarkan berarti titik alamat pengantaran.
    const [point, setPoint] = useState({
        latitude: null,
        longitude: null,
        address: "",
        city: "",
        province: "",
    });
    const [landmark, setLandmark] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    // Tombol metode pengambilan: peta otomatis muncul saat "Diantarkan"
    // dipilih, dan disembunyikan lagi saat kembali ke "Ambil Sendiri".
    const chooseFulfillment = (type) => {
        setFulfillmentType(type);
        setShowPicker(type === 'delivery');
    };

    const hasPoint =
        point.latitude !== null && point.longitude !== null;

    // Alamat acuan awal: alamat mitra (ambil sendiri) atau alamat mitra sebagai
    // titik pusat peta ketika customer belum menandai apa pun.
    const referenceCoord = useMemo(() => {
        const ag =
            serverAgent ||
            serverVehicle?.agent_profile ||
            serverVehicle?.agentProfile;
        if (ag?.latitude != null && ag?.longitude != null) {
            return { lat: Number(ag.latitude), lng: Number(ag.longitude) };
        }
        return null;
    }, [serverAgent, serverVehicle]);

    const rentalDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
        return Math.max(0, Math.round(ms / 86400000));
    }, [startDate, endDate]);

    // Sesuaikan dengan BookingService::create()
    const rentalAmount = rentalDays * vehicle.price_per_day;
    const deliveryFee = fulfillmentType === 'delivery' ? 50000 : 0;
    const serviceFee = rentalAmount > 0 ? 10000 : 0;
    const depositAmount = rentalAmount > 0 ? 200000 : 0;
    const total = rentalAmount + deliveryFee + serviceFee + depositAmount;

    // Customer wajib melengkapi data & dokumen (KTP, SIM) sebelum memesan.
    const complianceBlocked =
        !!auth?.user && compliance !== null && compliance?.complete === false;

    // Mitra harus sudah terverifikasi sebelum unitnya bisa dipesan.
    const agentNotVerified =
        !!agent && agent.onboarding_status !== "approved";

    const canSubmitBooking =
        rentalDays > 0 &&
        !isSubmitting &&
        !agentNotVerified &&
        !complianceBlocked &&
        (fulfillmentType !== 'delivery' ||
            hasPoint);

    const handleBookingSubmit = () => {
        if (!auth?.user) {
            window.location.href = "/login";
            return;
        }
        if (complianceBlocked) {
            window.location.href = "/profile";
            return;
        }
        if (rentalDays <= 0) return;

        // Untuk metode diantar, titik presisi wajib ditandai di peta
        // agar mitra tahu lokasi persisnya. Bila ambil sendiri, peta
        // disembunyikan sehingga tidak perlu titik.
        if (fulfillmentType === 'delivery' && !hasPoint) {
            alert(
                'Tandai titik alamat pengantaran Anda di peta terlebih dahulu.',
            );
            setShowPicker(true);
            return;
        }
        if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
            alert('Masukkan alamat pengantaran terlebih dahulu.');
            return;
        }

        // Setelah booking dibuat, server mengarahkan ke halaman pemilihan
        // metode pembayaran (COD / QRIS / Transfer Bank), lalu struk.
        setIsSubmitting(true);
        router.post(
            "/bookings",
            {
                vehicle_id: vehicle.id,
                rental_start: startDate,
                rental_end: endDate,
                fulfillment_type: fulfillmentType,
                // Titik presisi dikirim untuk metode yang sedang dipilih saja.
                pickup_location:
                    fulfillmentType === 'self_pickup'
                        ? point.address || vehicle.pickup_location
                        : null,
                pickup_latitude:
                    fulfillmentType === 'self_pickup' ? point.latitude : null,
                pickup_longitude:
                    fulfillmentType === 'self_pickup' ? point.longitude : null,
                pickup_landmark:
                    fulfillmentType === 'self_pickup'
                        ? landmark || null
                        : null,
                delivery_address:
                    fulfillmentType === 'delivery' ? deliveryAddress : null,
                delivery_latitude:
                    fulfillmentType === 'delivery' ? point.latitude : null,
                delivery_longitude:
                    fulfillmentType === 'delivery' ? point.longitude : null,
                delivery_landmark:
                    fulfillmentType === 'delivery' ? landmark || null : null,
                customer_notes: customerNote || null,
            },
            {
                onError: (errors) => {
                    setIsSubmitting(false);
                    alert(Object.values(errors).join("\n") || "Gagal membuat pesanan.");
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };;

    // Ulasan: hanya dari database (serverReviews), tanpa data contoh.
    const vehicleReviews = useMemo(() => {
        const list = serverReviews || serverVehicle?.reviews || [];
        return list.map((r) => ({
            id: r.id,
            name: r.customer?.name || r.customer_name || "Penyewa RentGo",
            rating: Number(r.rating || 0),
            text: r.review || r.comment || "",
            date: r.published_at || r.created_at,
        }));
    }, [serverReviews, serverVehicle]);

    const ratingAverage = vehicleReviews.length
        ? (
              vehicleReviews.reduce((sum, r) => sum + r.rating, 0) /
              vehicleReviews.length
          ).toFixed(1)
        : "0.0";

    return (
        <CustomerLayout auth={auth} activeNav="" backHref="/pencarian" backLabel="Ubah Pencarian">
            <Head title={`${vehicle.name} - RentGo`} />

            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-[11px] text-stone-500">
                <Link href="/" className="hover:text-[#111111]">Beranda</Link>
                <span className="text-stone-300">/</span>
                <Link href="/pencarian" className="hover:text-[#111111]">Pencarian</Link>
                <span className="text-stone-300">/</span>
                <span className="font-semibold text-[#111111]">{vehicle.name}</span>
            </nav>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Galeri + Deskripsi */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="overflow-hidden border">
                                <div className="h-72 sm:h-96 bg-stone-100 relative">
                                    <FailSafeImage
                                        src={
                                            vehicle.photos[activePhoto] ||
                                            NO_PHOTO
                                        }
                                        alt={vehicle.name}
                                        fallback={NO_PHOTO}
                                        className="w-full h-full object-cover"
                                    />
                                    {!vehicle.has_real_photo && (
                                        <span className="absolute inset-x-0 bottom-0 bg-white/90 px-3 py-2 text-[11px] font-medium text-stone-600 border-t border-stone-200">
                                            Mitra belum mengunggah foto unit ini.
                                        </span>
                                    )}
                                    <span className="absolute top-4 left-4">
                                        <StatusBadge
                                            status={vehicle.status}
                                            map={VEHICLE_STATUS}
                                        />
                                    </span>
                                    <span className="absolute top-4 right-4 bg-[#111] text-[#F5B800] text-[10px] font-bold px-2.5 py-1 rounded-sm">
                                        {vehicle.license_plate}
                                    </span>
                                </div>
                                {vehicle.photos.length > 1 && (
                                    <div className="flex gap-2 p-3 bg-white border-t border-stone-200">
                                        {vehicle.photos.map((photo, index) => (
                                            <button
                                                key={photo}
                                                type="button"
                                                onClick={() =>
                                                    setActivePhoto(index)
                                                }
                                                className={`h-16 w-24 overflow-hidden rounded-sm border ${activePhoto === index ? "border-[#F5B800]" : "border-stone-200"}`}
                                            >
                                                <FailSafeImage
                                                    src={photo}
                                                    alt={`${vehicle.name} ${index + 1}`}
                                                    fallback={NO_PHOTO}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <Card className="p-5 border">
                                <SectionTitle
                                    kicker="Spesifikasi Unit"
                                    title={vehicle.name}
                                    description={[
                                        category?.name,
                                        `${vehicle.brand} ${vehicle.model}`.trim(),
                                        vehicle.year !== "-" ? vehicle.year : null,
                                    ]
                                        .filter((part) => part && part !== "-")
                                        .join(" · ") || undefined}
                                />
                                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                    {[
                                        [
                                            "Tipe",
                                            vehicle.vehicle_type === "car"
                                                ? "Mobil"
                                                : "Motor",
                                        ],
                                        ["Transmisi", vehicle.transmission],
                                        [
                                            "Kapasitas",
                                            vehicle.seat_capacity
                                                ? `${vehicle.seat_capacity} ${vehicle.vehicle_type === "car" ? "Kursi" : "Orang"}`
                                                : "-",
                                        ],
                                        ["Bahan Bakar", vehicle.fuel_type],
                                        ["Warna", vehicle.color],
                                        ["Tahun", vehicle.year],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="border border-stone-200 rounded-sm p-3"
                                        >
                                            <dt className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                                                {label}
                                            </dt>
                                            <dd className="font-semibold mt-1">
                                                {value || "-"}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="mt-5 pt-5 border-t border-stone-200 space-y-3 text-xs">
                                    <div>
                                        <p className="font-semibold text-stone-700 mb-1">
                                            Deskripsi
                                        </p>
                                        <p className="text-stone-600 leading-relaxed">
                                            {vehicle.description}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-700 mb-1">
                                            Syarat Sewa
                                        </p>
                                        <p className="text-stone-600 leading-relaxed">
                                            {vehicle.rental_requirements}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-700 mb-1">
                                            Titik Serah Terima
                                        </p>
                                        <p className="text-stone-600 leading-relaxed">
                                            {vehicle.pickup_location}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Ulasan (reviews) — hanya data asli dari database */}
                            <Card className="p-5 border">
                                <SectionTitle
                                    kicker="Ulasan Penyewa"
                                    title={
                                        vehicleReviews.length
                                            ? `${ratingAverage} dari 5.0`
                                            : "Belum ada ulasan"
                                    }
                                    description={
                                        vehicleReviews.length
                                            ? `${vehicleReviews.length} ulasan dari penyewa`
                                            : "Ulasan muncul setelah penyewa menyelesaikan pesanan."
                                    }
                                    action={
                                        vehicleReviews.length ? (
                                            <Stars
                                                rating={Number(ratingAverage)}
                                                className="text-lg"
                                            />
                                        ) : null
                                    }
                                />
                                <div className="space-y-4">
                                    {vehicleReviews.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border-b border-stone-100 last:border-0 pb-4 last:pb-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-[#111] text-[#F5B800] text-[11px] font-bold flex items-center justify-center">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-semibold">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <Stars rating={item.rating} />
                                            </div>
                                            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                                                {item.text}
                                            </p>
                                            <p className="text-[10px] text-stone-400 mt-1">
                                                {formatTanggalJam(item.date)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Panel Pemesanan */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-4">
                                <Card className="p-5 border">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold">
                                        Harga Sewa
                                    </p>
                                    <div className="flex items-end gap-1 mt-1">
                                        {vehicle.price_per_day > 0 ? (
                                            <>
                                                <span className="text-2xl font-semibold">
                                                    {formatRupiah(
                                                        vehicle.price_per_day,
                                                    )}
                                                </span>
                                                <span className="text-xs text-stone-400 mb-1">
                                                    / hari
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-sm font-semibold text-stone-500">
                                                Harga belum ditetapkan mitra
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <label className="block">
                                            <span className="text-[11px] font-semibold text-stone-600">
                                                Tanggal Mulai
                                            </span>
                                            <input
                                                type="date"
                                                value={startDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setStartDate(e.target.value)
                                                }
                                                className="mt-1 w-full text-xs border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none bg-white"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-[11px] font-semibold text-stone-600">
                                                Tanggal Selesai
                                            </span>
                                            <input
                                                type="date"
                                                value={endDate}
                                                min={startDate || new Date().toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setEndDate(e.target.value)
                                                }
                                                className="mt-1 w-full text-xs border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none bg-white"
                                            />
                                        </label>

                                        {/* Metode Pengambilan */}
                                        <div>
                                            <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                                                Metode Pengambilan
                                            </span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => chooseFulfillment('self_pickup')}
                                                    className={`py-2 px-3 text-xs rounded-sm border font-medium transition-colors ${
                                                        fulfillmentType === 'self_pickup'
                                                            ? 'bg-[#111] text-[#F5B800] border-[#111]'
                                                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                                                    }`}
                                                >
                                                    Ambil Sendiri
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => chooseFulfillment('delivery')}
                                                    className={`py-2 px-3 text-xs rounded-sm border font-medium transition-colors ${
                                                        fulfillmentType === 'delivery'
                                                            ? 'bg-[#111] text-[#F5B800] border-[#111]'
                                                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
                                                    }`}
                                                >
                                                    Diantarkan (+Rp 50.000)
                                                </button>
                                            </div>
                                        </div>

                                        {fulfillmentType === 'delivery' && (
                                            <label className="block">
                                                <span className="text-[11px] font-semibold text-stone-600">
                                                    Alamat Pengantaran
                                                </span>
                                                <textarea
                                                    value={deliveryAddress}
                                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                                    placeholder="Masukkan alamat lengkap pengantaran..."
                                                    rows={2}
                                                    className="mt-1 w-full text-xs border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none bg-white resize-none"
                                                />
                                            </label>
                                        )}

                                        {/* Titik presisi ala Gojek: hanya untuk metode diantar.
                                            Saat ambil sendiri, peta disembunyikan. */}
                                        {fulfillmentType === 'delivery' && (
                                        <div>
                                            <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                                                Titik Alamat di Peta{" "}
                                                <span className="text-red-500">*</span>
                                            </span>
                                            <p className="text-[10px] text-stone-500 mb-2 leading-relaxed">
                                                Tandai lokasi persis pengantaran agar mitra tidak tersesat — seperti titik jemput di Gojek.
                                            </p>

                                            {!hasPoint ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPicker(true)}
                                                    className="w-full py-2.5 text-xs font-bold rounded-sm border-2 border-dashed border-stone-300 text-stone-600 hover:border-[#F5B800] hover:text-[#111] transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                    </svg>
                                                    Tandai Titik di Peta
                                                </button>
                                            ) : (
                                                <div className="rounded-sm border-emerald-300 bg-emerald-50 p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                                                Titik Tersimpan
                                                            </p>
                                                            <p className="text-[11px] text-stone-700 mt-0.5 leading-snug break-words">
                                                                {point.address ||
                                                                    'Lokasi pada peta'}
                                                            </p>
                                                            <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                                                {Number(
                                                                    point.latitude,
                                                                ).toFixed(5)}
                                                                ,{" "}
                                                                {Number(
                                                                    point.longitude,
                                                                ).toFixed(5)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowPicker(
                                                                    !showPicker,
                                                                )
                                                            }
                                                            className="text-[10px] font-bold text-[#111] underline shrink-0"
                                                        >
                                                            {showPicker
                                                                ? 'Tutup'
                                                                : 'Ubah'}
                                                        </button>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={landmark}
                                                        onChange={(e) =>
                                                            setLandmark(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Patokan (mis. depan lobby, sebelah Indomaret)"
                                                        className="mt-2 w-full text-[11px] border-stone-300 rounded-sm px-2.5 py-1.5 focus:border-black outline-none bg-white"
                                                    />
                                                </div>
                                            )}

                                            {showPicker && (
                                                <div className="mt-3">
                                                    <LocationPicker
                                                        latitude={
                                                            point.latitude ??
                                                            referenceCoord?.lat ??
                                                            null
                                                        }
                                                        longitude={
                                                            point.longitude ??
                                                            referenceCoord?.lng ??
                                                            null
                                                        }
                                                        address={point.address}
                                                        city={point.city}
                                                        height={260}
                                                        hintText="Klik pada peta untuk menandai titik alamat pengantaran"
                                                        footerText="Titik ini jadi alamat pengantaran Anda — mitra akan mengantar unit ke lokasi ini."
                                                        onPick={(picked) =>
                                                            setPoint(
                                                                (prev) => ({
                                                                    latitude:
                                                                        picked.latitude ??
                                                                        prev.latitude,
                                                                    longitude:
                                                                        picked.longitude ??
                                                                        prev.longitude,
                                                                    address:
                                                                        picked.address ||
                                                                        prev.address,
                                                                    city:
                                                                        picked.city ||
                                                                        prev.city,
                                                                    province:
                                                                        picked.province ||
                                                                        prev.province,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                    {point.address &&
                                                        !deliveryAddress.trim() && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeliveryAddress(
                                                                        point.address,
                                                                    )
                                                                }
                                                                className="mt-2 w-full text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-sm transition-colors"
                                                            >
                                                                Pakai alamat ini untuk pengantaran
                                                            </button>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                        )}

                                        <label className="block">
                                            <span className="text-[11px] font-semibold text-stone-600">
                                                Catatan (opsional)
                                            </span>
                                            <textarea
                                                value={customerNote}
                                                onChange={(e) => setCustomerNote(e.target.value)}
                                                placeholder="Catatan atau permintaan khusus..."
                                                rows={2}
                                                className="mt-1 w-full text-xs border border-stone-300 rounded-sm px-3 py-2 focus:border-black outline-none bg-white resize-none"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-stone-200 space-y-2 text-xs">
                                        <DataRow
                                            label={`Sewa (${rentalDays || 0} hari)`}
                                            value={formatRupiah(rentalAmount)}
                                        />
                                        {fulfillmentType === 'delivery' && (
                                            <DataRow
                                                label="Biaya pengantaran"
                                                value={formatRupiah(deliveryFee)}
                                            />
                                        )}
                                        <DataRow
                                            label="Biaya layanan"
                                            value={rentalAmount > 0 ? formatRupiah(serviceFee) : '-'}
                                        />
                                        <DataRow
                                            label="Deposit (refundable)"
                                            value={rentalAmount > 0 ? formatRupiah(depositAmount) : '-'}
                                        />
                                        <div className="pt-2 border-t border-stone-200">
                                            <DataRow
                                                label="Total"
                                                value={formatRupiah(total)}
                                                strong
                                            />
                                        </div>
                                    </div>

                                    {agentNotVerified && (
                                        <div className="mt-4 rounded-sm border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                                            <p className="font-bold uppercase tracking-wider mb-1">
                                                Mitra belum terverifikasi
                                            </p>
                                            <p className="text-stone-700">
                                                Unit ini milik mitra yang belum lolos verifikasi admin, sehingga belum bisa dipesan.
                                            </p>
                                        </div>
                                    )}

                                    {complianceBlocked && (
                                        <div className="mt-4 rounded-sm border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                                            <p className="font-bold uppercase tracking-wider mb-1">
                                                {compliance?.rejected_documents?.length
                                                    ? "Dokumen ditolak admin"
                                                    : "Dokumen belum lengkap"}
                                            </p>
                                            <ul className="list-disc pl-4 space-y-0.5">
                                                {(compliance?.messages || []).map((msg, idx) => (
                                                    <li key={idx}>{msg}</li>
                                                ))}
                                            </ul>
                                            <a
                                                href="/profile"
                                                className="mt-2 inline-block font-bold text-[#111] underline"
                                            >
                                                Lihat status dokumen di halaman profil
                                            </a>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={!canSubmitBooking}
                                        onClick={handleBookingSubmit}
                                        className={`mt-4 w-full py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-colors ${
                                            !canSubmitBooking
                                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                                : "bg-[#F5B800] hover:bg-[#e0a800] text-[#111]"
                                        }`}
                                    >
                                        {isSubmitting
                                            ? "Memproses..."
                                            : agentNotVerified
                                              ? "Mitra Belum Terverifikasi"
                                              : rentalDays === 0
                                                ? "Pilih Tanggal Sewa"
                                                : fulfillmentType === 'delivery' &&
                                                    !hasPoint
                                                  ? "Tandai Titik Lokasi Dulu"
                                                  : complianceBlocked
                                                    ? "Lengkapi Dokumen Dulu"
                                                    : "Pesan & Bayar"}
                                    </button>
                                    <p className="text-[10px] text-stone-400 mt-2 text-center">
                                        Anda tidak akan dikenakan biaya sebelum
                                        pesanan dikonfirmasi mitra.
                                    </p>
                                </Card>

                                <Card className="p-5 border">
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 font-bold mb-3">
                                        Mitra Penyedia
                                    </p>
                                    {agent ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#111] text-[#F5B800] font-bold flex items-center justify-center text-xs">
                                                    {agent.owner_name?.charAt(0) || "M"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold">
                                                        {agent.agency_name}
                                                    </p>
                                                    <p className="text-[11px] text-stone-500">
                                                        {[agent.city, agent.province]
                                                            .filter((v) => v && v !== "-")
                                                            .join(", ") || "Lokasi belum diisi"}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
                                                {agent.description}
                                            </p>
                                            <StatusBadge
                                                status={agent.onboarding_status}
                                                map={{
                                                    approved: {
                                                        label: "Mitra Terverifikasi",
                                                        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
                                                    },
                                                    pending_verification: {
                                                        label: "Menunggu Verifikasi",
                                                        color: "bg-amber-100 text-amber-900 border-amber-300",
                                                    },
                                                    rejected: {
                                                        label: "Ditolak",
                                                        color: "bg-red-100 text-red-800 border-red-300",
                                                    },
                                                    suspended: {
                                                        label: "Ditangguhkan",
                                                        color: "bg-red-100 text-red-800 border-red-300",
                                                    },
                                                }}
                                                className="mt-3"
                                            />
                                        </>
                                    ) : (
                                        <p className="text-[11px] text-stone-500">
                                            Data mitra penyedia belum tersedia untuk unit ini.
                                        </p>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
        </CustomerLayout>
    );
}
