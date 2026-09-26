/**
 * RentGo — Central mock dataset
 * ------------------------------------------------------------------
 * Struktur data di file ini SENGAJA dibuat meniru persis skema
 * migrasi & model yang sudah ada di backend, sehingga nanti saat
 * controller dibuat, tinggal ditukar dengan props dari Inertia
 * tanpa perlu mengubah nama field.
 *
 * Referensi skema:
 *  - vehicles, vehicle_categories, vehicle_photos, vehicle_prices,
 *    vehicle_availabilities, vehicle_documents
 *  - bookings, booking_items, booking_cancellations
 *  - payments, refunds, transactions, transaction_commissions
 *  - rental_checkouts, rental_checkins, rental_damages
 *  - reviews, complaints, disputes
 *  - agent_profiles, agent_documents, agent_payouts
 *  - customer_profiles, customer_documents
 *  - notifications, audit_logs
 */

export const formatRupiah = (value = 0) =>
    `Rp ${Number(value).toLocaleString('id-ID')}`;

export const formatTanggal = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatTanggalJam = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/* =============================================================
 * MASTER STATUS — diselaraskan dengan enum di migrasi
 * ============================================================= */

export const VEHICLE_STATUS = {
    draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    pending_review: { label: 'Menunggu Review', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    available: { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    booked: { label: 'Sudah Dipesan', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    rented: { label: 'Sedang Disewa', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    maintenance: { label: 'Perawatan', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    inactive: { label: 'Nonaktif', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

export const BOOKING_STATUS = {
    pending_payment: { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    paid: { label: 'Sudah Dibayar', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    waiting_agent_confirmation: { label: 'Menunggu Konfirmasi Mitra', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    ongoing: { label: 'Sedang Berjalan', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    returned: { label: 'Dikembalikan', color: 'bg-teal-100 text-teal-800 border-teal-300' },
    completed: { label: 'Selesai', color: 'bg-stone-100 text-stone-700 border-stone-300' },
};

export const PAYMENT_STATUS = {
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    paid: { label: 'Berhasil', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800 border-red-300' },
    expired: { label: 'Kedaluwarsa', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const REFUND_STATUS = {
    not_required: { label: 'Tidak Perlu', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    pending: { label: 'Menunggu', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    refunded: { label: 'Dana Dikembalikan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    completed: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800 border-red-300' },
    cancelled: { label: 'Dibatalkan', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const DOC_STATUS = {
    pending: { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    expired: { label: 'Kedaluwarsa', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    suspended: { label: 'Ditangguhkan', color: 'bg-red-100 text-red-800 border-red-300' },
};

export const ONBOARDING_STATUS = {
    pending_verification: { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    suspended: { label: 'Ditangguhkan', color: 'bg-red-100 text-red-800 border-red-300' },
};

export const REVIEW_STATUS = {
    pending: { label: 'Menunggu Moderasi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    published: { label: 'Terpublikasi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    hidden: { label: 'Disembunyikan', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
};

export const COMPLAINT_STATUS = {
    open: { label: 'Terbuka', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    in_review: { label: 'Sedang Ditinjau', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    resolved: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    closed: { label: 'Ditutup', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const DISPUTE_STATUS = {
    open: { label: 'Terbuka', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    investigating: { label: 'Investigasi', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    awaiting_response: { label: 'Menunggu Tanggapan', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    resolved: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800 border-red-300' },
    closed: { label: 'Ditutup', color: 'bg-stone-100 text-stone-600 border-stone-300' },
};

export const PRIORITY = {
    low: { label: 'Rendah', color: 'bg-stone-100 text-stone-600 border-stone-300' },
    medium: { label: 'Sedang', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    high: { label: 'Tinggi', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-800 border-red-300' },
};

export const RENTAL_DAYS = (start, end) => {
    if (!start || !end) return 0;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.round(ms / 86400000));
};

/* =============================================================
 * vehicle_categories
 * ============================================================= */
export const VEHICLE_CATEGORIES = [
    { id: 1, name: 'MPV', slug: 'mpv', description: 'Keluarga & rombongan', is_active: true },
    { id: 2, name: 'City Car', slug: 'city-car', description: 'Lincah di dalam kota', is_active: true },
    { id: 3, name: 'SUV', slug: 'suv', description: 'Tangguh untuk segala medan', is_active: true },
    { id: 4, name: 'Maxi Scooter', slug: 'maxi-scooter', description: 'Motor besar & nyaman', is_active: true },
    { id: 5, name: 'Scooter Klasik', slug: 'scooter-klasik', description: 'Gaya retro kekinian', is_active: true },
    { id: 6, name: 'Matic Harian', slug: 'matic-harian', description: 'Motor harian irit', is_active: true },
];

/* =============================================================
 * agent_profiles
 * ============================================================= */
export const AGENT_PROFILES = [
    {
        id: 1,
        user_id: 11,
        owner_name: 'Mitra Rental CGK',
        phone: '081299887766',
        agency_name: 'PT Rental CGK Prima',
        business_type: 'Rental Mobil & Motor',
        address: 'Jl. Raya Bandara No. 12',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        description: 'Mitra terpercaya area Bandara Soekarno-Hatta sejak 2015.',
        onboarding_status: 'approved',
        is_active: true,
    },
    {
        id: 2,
        user_id: 12,
        owner_name: 'Mitra RentGo Tugu',
        phone: '081388776655',
        agency_name: 'RentGo Tugu Jogja',
        business_type: 'Rental Motor',
        address: 'Jl. Malioboro No. 88',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        description: 'Spesialis motor matic area Malioboro & Stasiun Tugu.',
        onboarding_status: 'approved',
        is_active: true,
    },
    {
        id: 3,
        user_id: 13,
        owner_name: 'Mitra Armada Bali Jaya',
        phone: '081234567890',
        agency_name: 'Armada Bali Jaya',
        business_type: 'Rental Mobil',
        address: 'Jl. Sunset Road No. 45',
        description: 'Melayani area Kuta, Seminyak, dan Bandara Ngurah Rai.',
        onboarding_status: 'approved',
        is_active: true,
    },
    {
        id: 4,
        user_id: 14,
        owner_name: 'Surya Pratama',
        phone: '081223344556',
        agency_name: 'Surya Trans Surabaya',
        business_type: 'Rental Mobil',
        address: 'Jl. Pemuda No. 45',
        city: 'Surabaya',
        province: 'Jawa Timur',
        description: 'Penyedia armada sewa area Surabaya dan Bandara Juanda.',
        onboarding_status: 'pending_verification',
        is_active: false,
    },
];

/**
 * Helper simulasi status verifikasi mitra (Frontend Only).
 * Default 'pending_verification' agar alur persetujuan admin langsung terlihat.
 */
export const getSimulatedMitraStatus = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('rentgo_mitra_status');
        if (stored) return stored;
    }
    return 'pending_verification';
};

export const setSimulatedMitraStatus = (status) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('rentgo_mitra_status', status);
        window.dispatchEvent(new Event('rentgo_mitra_status_changed'));
    }
};

/* =============================================================
 * vehicles + relasi (category, photos, prices, availability)
 * ============================================================= */
export const VEHICLES = [
    {
        id: 1,
        agent_profile_id: 1,
        vehicle_category_id: 1,
        vehicle_type: 'car',
        name: 'Toyota Avanza 1.3 G',
        slug: 'toyota-avanza-13-g',
        brand: 'Toyota',
        model: 'Avanza',
        year: 2022,
        license_plate: 'B 1928 KZA',
        transmission: 'Matic',
        seat_capacity: 7,
        fuel_type: 'Bensin',
        color: 'Silver',
        description: 'MPV keluarga andalan, kabin lega dan irit bahan bakar.',
        pickup_location: 'Bandara Soekarno-Hatta (CGK) Terminal 3',
        rental_requirements: 'KTP asli, SIM A aktif, deposit Rp 500.000.',
        status: 'available',
        price_per_day: 400000,
        rating: 4.8,
        reviews_count: 124,
        img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 2,
        agent_profile_id: 2,
        vehicle_category_id: 2,
        vehicle_type: 'car',
        name: 'Honda Brio Satya E',
        slug: 'honda-brio-satya-e',
        brand: 'Honda',
        model: 'Brio',
        year: 2021,
        license_plate: 'AB 1701 CD',
        transmission: 'Matic',
        seat_capacity: 5,
        fuel_type: 'Bensin',
        color: 'Merah',
        description: 'City car lincah dan hemat, cocok untuk jalan dalam kota.',
        pickup_location: 'Sekitar Stasiun Tugu Yogyakarta',
        rental_requirements: 'KTP asli, SIM A aktif.',
        status: 'available',
        price_per_day: 300000,
        rating: 4.7,
        reviews_count: 89,
        img: 'https://images.unsplash.com/photo-1590362891988-f778047831d6?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1590362891988-f778047831d6?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 3,
        agent_profile_id: 1,
        vehicle_category_id: 1,
        vehicle_type: 'car',
        name: 'Mitsubishi Xpander Sport',
        slug: 'mitsubishi-xpander-sport',
        brand: 'Mitsubishi',
        model: 'Xpander',
        year: 2022,
        license_plate: 'D 1188 XYZ',
        transmission: 'Matic',
        seat_capacity: 7,
        fuel_type: 'Bensin',
        color: 'Putih',
        description: 'MPV modern dengan kabin senyap dan suspensi nyaman.',
        pickup_location: 'Stasiun Hall Bandung',
        rental_requirements: 'KTP asli, SIM A aktif, deposit Rp 500.000.',
        status: 'booked',
        price_per_day: 450000,
        rating: 4.9,
        reviews_count: 76,
        img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 4,
        agent_profile_id: 1,
        vehicle_category_id: 3,
        vehicle_type: 'car',
        name: 'Honda HR-V 1.5 E',
        slug: 'honda-hrv-15-e',
        brand: 'Honda',
        model: 'HR-V',
        year: 2023,
        license_plate: 'DK 1420 AB',
        transmission: 'Matic',
        seat_capacity: 5,
        fuel_type: 'Bensin',
        color: 'Hitam',
        description: 'SUV kompak premium, cocok untuk perjalanan jauh.',
        pickup_location: 'Bandara I Gusti Ngurah Rai (DPS) Bali',
        rental_requirements: 'KTP asli, SIM A aktif, deposit Rp 1.000.000.',
        status: 'available',
        price_per_day: 600000,
        rating: 4.8,
        reviews_count: 58,
        img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 5,
        agent_profile_id: 2,
        vehicle_category_id: 4,
        vehicle_type: 'motorcycle',
        name: 'Honda PCX 160',
        slug: 'honda-pcx-160',
        brand: 'Honda',
        model: 'PCX',
        year: 2023,
        license_plate: 'AB 3841 YZ',
        transmission: 'Matic',
        seat_capacity: 2,
        fuel_type: 'Bensin',
        color: 'Hitam',
        description: 'Maxi scooter nyaman untuk keliling kota.',
        pickup_location: 'Kawasan Malioboro, Yogyakarta',
        rental_requirements: 'KTP asli, SIM C aktif.',
        status: 'available',
        price_per_day: 120000,
        rating: 4.9,
        reviews_count: 210,
        img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 6,
        agent_profile_id: 3,
        vehicle_category_id: 4,
        vehicle_type: 'motorcycle',
        name: 'Yamaha NMAX 155',
        slug: 'yamaha-nmax-155',
        brand: 'Yamaha',
        model: 'NMAX',
        year: 2023,
        license_plate: 'DK 5521 NM',
        transmission: 'Matic',
        seat_capacity: 2,
        fuel_type: 'Bensin',
        color: 'Abu',
        description: 'Maxi scooter bertenaga, nyaman untuk jarak jauh.',
        pickup_location: 'Seminyak, Bali',
        rental_requirements: 'KTP asli, SIM C aktif.',
        status: 'rented',
        price_per_day: 110000,
        rating: 4.7,
        reviews_count: 143,
        img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 7,
        agent_profile_id: 2,
        vehicle_category_id: 5,
        vehicle_type: 'motorcycle',
        name: 'Vespa Primavera 150',
        slug: 'vespa-primavera-150',
        brand: 'Vespa',
        model: 'Primavera',
        year: 2022,
        license_plate: 'D 7788 VSP',
        transmission: 'Matic',
        seat_capacity: 2,
        fuel_type: 'Bensin',
        color: 'Hijau',
        description: 'Scooter klasik ikonik, favorit untuk foto wisata.',
        pickup_location: 'Dago, Bandung',
        rental_requirements: 'KTP asli, SIM C aktif.',
        status: 'maintenance',
        price_per_day: 180000,
        rating: 4.8,
        reviews_count: 67,
        img: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&w=1200&q=80',
        ],
    },
    {
        id: 8,
        agent_profile_id: 1,
        vehicle_category_id: 6,
        vehicle_type: 'motorcycle',
        name: 'Honda Vario 160',
        slug: 'honda-vario-160',
        brand: 'Honda',
        model: 'Vario',
        year: 2023,
        license_plate: 'B 6612 VRO',
        transmission: 'Matic',
        seat_capacity: 2,
        fuel_type: 'Bensin',
        color: 'Biru',
        description: 'Motor matic harian yang irit dan ringan.',
        pickup_location: 'Depok & Jakarta Selatan',
        rental_requirements: 'KTP asli, SIM C aktif.',
        status: 'available',
        price_per_day: 90000,
        rating: 4.6,
        reviews_count: 198,
        img: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=900&q=80',
        photos: [
            'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&w=1200&q=80',
        ],
    },
];

export const vehicleById = (id) => VEHICLES.find((v) => v.id === Number(id));
export const agentById = (id) => AGENT_PROFILES.find((a) => a.id === Number(id));
export const categoryById = (id) => VEHICLE_CATEGORIES.find((c) => c.id === Number(id));

/* =============================================================
 * bookings + booking_items
 * ============================================================= */
export const BOOKINGS = [
    {
        id: 1,
        booking_number: 'RG-2026-0914',
        customer_id: 1,
        agent_profile_id: 1,
        rental_start: '2026-09-14T09:00:00',
        rental_end: '2026-09-16T09:00:00',
        fulfillment_type: 'self_pickup',
        pickup_location: 'Bandara Soekarno-Hatta (CGK) Terminal 3',
        delivery_address: null,
        rental_amount: 800000,
        delivery_fee: 0,
        service_fee: 50000,
        additional_fee: 0,
        deposit_amount: 500000,
        total_amount: 850000,
        status: 'ongoing',
        customer_note: 'Tolong disiapkan air mineral dan tisu.',
        agent_note: 'Unit sudah diserahkan tepat waktu.',
        item: { vehicle_id: 1, rental_days: 2, price_per_day: 400000, rental_amount: 800000 },
        payment: { id: 1, payment_number: 'PAY-2026-0914-01', payment_method: 'qris', amount: 850000, status: 'paid', paid_at: '2026-09-13T20:11:00' },
        checkout: { checkout_at: '2026-09-14T09:02:00', odometer: 42150, fuel_level: 'Penuh', customer_confirmed: true },
        checkin: null,
        review: null,
    },
    {
        id: 2,
        booking_number: 'RG-2026-0918',
        customer_id: 1,
        agent_profile_id: 2,
        rental_start: '2026-09-18T10:00:00',
        rental_end: '2026-09-21T10:00:00',
        fulfillment_type: 'self_pickup',
        pickup_location: 'Stasiun Tugu Yogyakarta',
        delivery_address: null,
        rental_amount: 360000,
        delivery_fee: 0,
        service_fee: 30000,
        additional_fee: 0,
        deposit_amount: 200000,
        total_amount: 390000,
        status: 'pending_payment',
        customer_note: 'Siapkan 2 helm.',
        agent_note: null,
        item: { vehicle_id: 5, rental_days: 3, price_per_day: 120000, rental_amount: 360000 },
        payment: { id: 2, payment_number: 'PAY-2026-0918-01', payment_method: 'qris', amount: 390000, status: 'pending', paid_at: null },
        checkout: null,
        checkin: null,
        review: null,
    },
    {
        id: 3,
        booking_number: 'RG-2026-0820',
        customer_id: 1,
        agent_profile_id: 3,
        rental_start: '2026-08-20T12:00:00',
        rental_end: '2026-08-23T12:00:00',
        fulfillment_type: 'delivery',
        pickup_location: null,
        delivery_address: 'Hotel Kuta Central, Badung, Bali',
        rental_amount: 1800000,
        delivery_fee: 100000,
        service_fee: 75000,
        additional_fee: 0,
        deposit_amount: 1000000,
        total_amount: 1975000,
        status: 'completed',
        customer_note: null,
        agent_note: 'Unit dikembalikan bersih dan tepat waktu.',
        item: { vehicle_id: 4, rental_days: 3, price_per_day: 600000, rental_amount: 1800000 },
        payment: { id: 3, payment_number: 'PAY-2026-0820-01', payment_method: 'cash', amount: 1975000, status: 'paid', paid_at: '2026-08-20T11:40:00' },
        checkout: { checkout_at: '2026-08-20T12:05:00', odometer: 18900, fuel_level: 'Penuh', customer_confirmed: true },
        checkin: { checkin_at: '2026-08-23T11:50:00', odometer: 19420, fuel_level: '3/4', is_late_return: false, late_return_fee: 0, customer_confirmed: true },
        review: { id: 1, rating: 5, review: 'Unit bersih, proses cepat, mitra ramah!', status: 'published' },
    },
    {
        id: 4,
        booking_number: 'RG-2026-0905',
        customer_id: 1,
        agent_profile_id: 2,
        rental_start: '2026-09-05T08:00:00',
        rental_end: '2026-09-07T08:00:00',
        fulfillment_type: 'self_pickup',
        pickup_location: 'Kawasan Malioboro, Yogyakarta',
        delivery_address: null,
        rental_amount: 360000,
        delivery_fee: 0,
        service_fee: 30000,
        additional_fee: 0,
        deposit_amount: 200000,
        total_amount: 390000,
        status: 'cancelled',
        customer_note: null,
        agent_note: 'Dibatalkan oleh customer karena perubahan jadwal.',
        item: { vehicle_id: 5, rental_days: 3, price_per_day: 120000, rental_amount: 360000 },
        payment: { id: 4, payment_number: 'PAY-2026-0905-01', payment_method: 'qris', amount: 390000, status: 'paid', paid_at: '2026-09-04T18:20:00' },
        checkout: null,
        checkin: null,
        review: null,
        cancellation: {
            reason: 'Perubahan jadwal perjalanan dinas.',
            cancelled_at: '2026-09-04T19:00:00',
            refund_percentage: 50,
            refund_status: 'refunded',
            refund_amount: 175000,
        },
    },
];

export const bookingByNumber = (num) => BOOKINGS.find((b) => b.booking_number === num);

/* =============================================================
 * bookings untuk agent (pesanan masuk)
 * ============================================================= */
export const AGENT_BOOKINGS = [
    {
        id: 101,
        booking_number: 'RG-2026-0914',
        vehicle_id: 1,
        customer_name: 'Budi Santoso',
        customer_phone: '081311223344',
        rental_start: '2026-09-14T09:00:00',
        rental_end: '2026-09-16T09:00:00',
        total_amount: 850000,
        status: 'ongoing',
        needs_action: false,
    },
    {
        id: 102,
        booking_number: 'RG-2026-0921',
        vehicle_id: 3,
        customer_name: 'Citra Lestari',
        customer_phone: '081255667788',
        rental_start: '2026-09-21T07:00:00',
        rental_end: '2026-09-24T07:00:00',
        total_amount: 1350000,
        status: 'waiting_agent_confirmation',
        needs_action: true,
    },
    {
        id: 103,
        booking_number: 'RG-2026-0925',
        vehicle_id: 4,
        customer_name: 'Dewi Anggraini',
        customer_phone: '081399887755',
        rental_start: '2026-09-25T10:00:00',
        rental_end: '2026-09-27T10:00:00',
        total_amount: 1200000,
        status: 'paid',
        needs_action: true,
    },
];

/* =============================================================
 * transactions + transaction_commissions + agent_payouts
 * ============================================================= */
export const TRANSACTIONS = [
    {
        id: 1,
        transaction_number: 'TRX-2026-0820-01',
        booking_number: 'RG-2026-0820',
        customer_name: 'Budi Santoso',
        agent_profile_id: 3,
        rental_amount: 1800000,
        delivery_fee: 100000,
        service_fee: 75000,
        deposit_amount: 1000000,
        deposit_deduction: 0,
        deposit_refund: 1000000,
        total_amount: 1975000,
        status: 'completed',
        completed_at: '2026-08-23T12:00:00',
        commission: {
            commission_base_amount: 1800000,
            commission_percentage: 10,
            commission_amount: 180000,
            agent_net_amount: 1620000,
            status: 'paid',
        },
    },
    {
        id: 2,
        transaction_number: 'TRX-2026-0905-01',
        booking_number: 'RG-2026-0905',
        customer_name: 'Budi Santoso',
        agent_profile_id: 2,
        rental_amount: 360000,
        delivery_fee: 0,
        service_fee: 30000,
        deposit_amount: 200000,
        deposit_deduction: 0,
        deposit_refund: 200000,
        total_amount: 390000,
        status: 'refunded',
        completed_at: null,
        commission: {
            commission_base_amount: 360000,
            commission_percentage: 10,
            commission_amount: 36000,
            agent_net_amount: 324000,
            status: 'cancelled',
        },
    },
];

export const AGENT_PAYOUTS = [
    {
        id: 1,
        payout_number: 'PO-2026-0823-01',
        transaction_number: 'TRX-2026-0820-01',
        agent_profile_id: 3,
        amount: 1620000,
        payout_method: 'bank_transfer',
        account_name: 'Armada Bali Jaya',
        account_number: '1234567890',
        bank_name: 'BCA',
        status: 'paid',
        paid_at: '2026-08-25T14:00:00',
    },
    {
        id: 2,
        payout_number: 'PO-2026-0920-01',
        transaction_number: 'TRX-2026-0914-01',
        agent_profile_id: 1,
        amount: 720000,
        payout_method: 'bank_transfer',
        account_name: 'PT Rental CGK Prima',
        account_number: '9876543210',
        bank_name: 'Mandiri',
        status: 'processing',
        paid_at: null,
    },
];

/* =============================================================
 * refunds
 * ============================================================= */
export const REFUNDS = [
    {
        id: 1,
        refund_number: 'RFD-2026-0905-01',
        booking_number: 'RG-2026-0905',
        payment_number: 'PAY-2026-0905-01',
        amount: 175000,
        reason: 'Pembatalan oleh customer (refund 50%).',
        status: 'completed',
        refunded_at: '2026-09-06T10:00:00',
    },
];

/* =============================================================
 * rental_damages
 * ============================================================= */
export const RENTAL_DAMAGES = [
    {
        id: 1,
        booking_number: 'RG-2026-0820',
        vehicle_name: 'Honda HR-V 1.5 E',
        description: 'Baret halus pada bumper depan kanan.',
        location: 'Bumper depan kanan',
        severity: 'minor',
        repair_cost: 350000,
        customer_charge: 250000,
        deducted_from_deposit: true,
        status: 'resolved',
        notes: 'Dibebankan sebagian ke deposit customer.',
    },
];

/* =============================================================
 * reviews
 * ============================================================= */
export const REVIEWS = [
    {
        id: 1,
        booking_number: 'RG-2026-0820',
        vehicle_id: 4,
        vehicle_name: 'Honda HR-V 1.5 E',
        customer_name: 'Budi Santoso',
        rating: 5,
        review: 'Unit bersih, proses cepat, mitra ramah!',
        status: 'published',
        published_at: '2026-08-24T09:00:00',
    },
    {
        id: 2,
        booking_number: 'RG-2026-0788',
        vehicle_id: 1,
        vehicle_name: 'Toyota Avanza 1.3 G',
        customer_name: 'Rina Marlina',
        rating: 4,
        review: 'Mobil nyaman, hanya agak telat saat serah terima.',
        status: 'published',
        published_at: '2026-07-30T13:00:00',
    },
];

/* =============================================================
 * complaints + disputes
 * ============================================================= */
export const COMPLAINTS = [
    {
        id: 1,
        booking_number: 'RG-2026-0820',
        subject: 'Unit terlambat diserahkan',
        description: 'Serah terima mundur 45 menit dari jadwal yang disepakati.',
        category: 'pickup',
        priority: 'medium',
        status: 'resolved',
        resolution: 'Mitra memberi kompensasi diskon untuk sewa berikutnya.',
        created_at: '2026-08-20T13:00:00',
    },
    {
        id: 2,
        booking_number: 'RG-2026-0914',
        subject: 'AC kurang dingin',
        description: 'AC terasa kurang dingin saat perjalanan siang hari.',
        category: 'vehicle',
        priority: 'low',
        status: 'in_review',
        resolution: null,
        created_at: '2026-09-15T10:30:00',
    },
];

export const DISPUTES = [
    {
        id: 1,
        booking_number: 'RG-2026-0712',
        subject: 'Sengketa potongan deposit',
        description: 'Customer keberatan atas potongan deposit kerusakan yang dinilai berlebihan.',
        category: 'deposit',
        status: 'investigating',
        refund_amount: 150000,
        resolution: null,
        resolution_party: null,
        created_at: '2026-07-15T09:00:00',
    },
];

/* =============================================================
 * customer_profiles + customer_documents
 * ============================================================= */
export const CUSTOMER_PROFILE = {
    id: 1,
    user_id: 1,
    phone: '081311223344',
    identity_number: '3402************',
    date_of_birth: '1996-04-12',
    address: 'Jl. Kaliurang KM 5 No. 21',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    profile_photo_path: null,
    is_active: true,
};

export const CUSTOMER_DOCUMENTS = [
    { id: 1, document_type: 'KTP', document_number: '3402************', status: 'approved', expires_at: null, verified_at: '2026-08-01T09:00:00' },
    { id: 2, document_type: 'SIM A', document_number: '3402************', status: 'approved', expires_at: '2029-05-01', verified_at: '2026-08-01T09:05:00' },
    { id: 3, document_type: 'SIM C', document_number: '3402************', status: 'pending', expires_at: '2028-10-01', verified_at: null },
];

/* =============================================================
 * agent_documents
 * ============================================================= */
export const AGENT_DOCUMENTS = [
    { id: 1, document_type: 'KTP Pemilik', document_number: '3174************', status: 'approved', verified_at: '2026-06-10T09:00:00' },
    { id: 2, document_type: 'NPWP Usaha', document_number: '91.234.567.8-901.000', status: 'approved', verified_at: '2026-06-10T09:05:00' },
    { id: 3, document_type: 'Surat Izin Usaha', document_number: 'SIUP/2024/1123', status: 'pending', verified_at: null },
];

/* =============================================================
 * notifications
 * ============================================================= */
export const NOTIFICATIONS = [
    { id: 1, type: 'booking', title: 'Pembayaran diterima', message: 'Pesanan RG-2026-0914 telah dibayar.', channel: 'database', read_at: null, created_at: '2026-09-13T20:12:00' },
    { id: 2, type: 'booking', title: 'Unit siap diambil', message: 'Mitra Rental CGK sudah menyiapkan unit Anda.', channel: 'database', read_at: null, created_at: '2026-09-14T07:30:00' },
    { id: 3, type: 'payment', title: 'Menunggu pembayaran', message: 'Pesanan RG-2026-0918 menunggu pembayaran sebelum 18 Sep.', channel: 'database', read_at: '2026-09-15T08:00:00', created_at: '2026-09-14T10:00:00' },
];

/* =============================================================
 * audit_logs
 * ============================================================= */
export const AUDIT_LOGS = [
    { id: 1, user: 'Agent CGK', action: 'update', module: 'vehicle', description: 'Mengubah harga harian Toyota Avanza.', created_at: '2026-09-13T11:00:00' },
    { id: 2, user: 'Customer', action: 'create', module: 'booking', description: 'Membuat pesanan RG-2026-0918.', created_at: '2026-09-14T10:00:00' },
    { id: 3, user: 'Admin', action: 'approve', module: 'customer_document', description: 'Memverifikasi dokumen SIM A customer.', created_at: '2026-08-01T09:05:00' },
];

/* =============================================================
 * Statistik ringkas (untuk dashboard agent/admin)
 * ============================================================= */
export const AGENT_STATS = {
    total_vehicles: VEHICLES.filter((v) => v.agent_profile_id === 1).length,
    available: VEHICLES.filter((v) => v.status === 'available').length,
    rented: VEHICLES.filter((v) => v.status === 'rented').length,
    pending_bookings: AGENT_BOOKINGS.filter((b) => b.needs_action).length,
    monthly_revenue: 5230000,
    pending_payout: 720000,
};

/* =============================================================
 * Data Administrasi Sistem (Role: Admin)
 * ============================================================= */
export const ADMIN_USERS = [
    {
        id: 1,
        name: 'Admin RentGo',
        email: 'admin@rentgo.test',
        role: 'admin',
        phone: '081100001111',
        status: 'active',
        created_at: '2026-01-10T08:00:00',
        verified: true,
    },
    {
        id: 11,
        name: 'Mitra Rental CGK',
        email: 'mitra@rentgo.test',
        role: 'mitra',
        agency_name: 'PT Rental CGK Prima',
        phone: '081299887766',
        city: 'Jakarta',
        status: 'active',
        onboarding_status: 'approved',
        created_at: '2026-03-15T10:30:00',
        verified: true,
        vehicles_count: 3,
    },
    {
        id: 12,
        name: 'Mitra RentGo Tugu',
        email: 'tugu@rentgo.test',
        role: 'mitra',
        agency_name: 'RentGo Tugu Jogja',
        phone: '081388776655',
        city: 'Yogyakarta',
        status: 'active',
        onboarding_status: 'approved',
        created_at: '2026-04-20T14:10:00',
        verified: true,
        vehicles_count: 2,
    },
    {
        id: 13,
        name: 'Mitra Armada Bali Jaya',
        email: 'bali@rentgo.test',
        role: 'mitra',
        agency_name: 'Armada Bali Jaya',
        phone: '081234567890',
        city: 'Bali',
        status: 'active',
        onboarding_status: 'approved',
        created_at: '2026-05-12T09:45:00',
        verified: true,
        vehicles_count: 1,
    },
    {
        id: 14,
        name: 'Mitra Surya Trans Surabaya',
        email: 'surya.trans@rentgo.test',
        role: 'mitra',
        agency_name: 'Surya Trans Surabaya',
        phone: '081223344556',
        city: 'Surabaya',
        status: 'pending',
        onboarding_status: 'pending_verification',
        created_at: '2026-09-12T16:00:00',
        verified: false,
        vehicles_count: 0,
    },
    {
        id: 21,
        name: 'Customer RentGo',
        email: 'customer@rentgo.test',
        role: 'customer',
        phone: '081311223344',
        city: 'Yogyakarta',
        status: 'active',
        created_at: '2026-06-01T11:20:00',
        verified: true,
        bookings_count: 4,
    },
    {
        id: 22,
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        role: 'customer',
        phone: '081255667788',
        city: 'Jakarta',
        status: 'active',
        created_at: '2026-07-04T13:15:00',
        verified: true,
        bookings_count: 2,
    },
    {
        id: 23,
        name: 'Rina Marlina',
        email: 'rina.marlina@yahoo.com',
        role: 'customer',
        phone: '081788990011',
        city: 'Bandung',
        status: 'active',
        created_at: '2026-08-11T17:40:00',
        verified: false,
        bookings_count: 1,
    },
];

export const ADMIN_STATS = {
    total_users: 8,
    total_customers: 3,
    total_agents: 4,
    total_vehicles: 6,
    active_vehicles: 5,
    pending_vehicles: 1,
    total_bookings: 3,
    ongoing_rentals: 1,
    total_gmv: 4280000,
    platform_commission_revenue: 428000,
    pending_payouts: 720000,
    pending_agent_verifications: 1,
    pending_customer_verifications: 1,
    open_complaints: 1,
    open_disputes: 1,
};

