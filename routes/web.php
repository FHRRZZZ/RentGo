<?php

/*
|--------------------------------------------------------------------------
| Controllers â€” dikelompokkan peran
|--------------------------------------------------------------------------
| Admin/*     â†’ khusus portal admin
| Agent/*     â†’ khusus portal mitra
| Customer/*  â†’ khusus portal customer
| Shared/*    â†’ all-rounded (dipakai lintas peran)
|--------------------------------------------------------------------------
*/

// Admin
use App\Http\Controllers\Admin\AgentVerificationController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\SupportController;
use App\Http\Controllers\Admin\VehicleManagementController as AdminVehicleManagementController;

// Agent (Mitra)
use App\Http\Controllers\Agent\BookingController as AgentBookingController;
use App\Http\Controllers\Agent\DashboardController as AgentDashboardController;
use App\Http\Controllers\Agent\MitraApplicationController;
use App\Http\Controllers\Agent\ReviewController as AgentReviewController;
use App\Http\Controllers\Agent\VehicleManagementController as AgentVehicleManagementController;

// Customer
use App\Http\Controllers\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\Customer\WishlistController;

// Shared
use App\Http\Controllers\Shared\AgentPayoutController;
use App\Http\Controllers\Shared\AgentStorefrontController;
use App\Http\Controllers\Shared\ComplaintController;
use App\Http\Controllers\Shared\CustomerDocumentController;
use App\Http\Controllers\Shared\CustomerProfileController;
use App\Http\Controllers\Shared\DashboardController;
use App\Http\Controllers\Shared\DisputeController;
use App\Http\Controllers\Shared\MessageController;
use App\Http\Controllers\Shared\NotificationController;
use App\Http\Controllers\Shared\ProfileController;
use App\Http\Controllers\Shared\RefundController;
use App\Http\Controllers\Shared\RentalCheckinController;
use App\Http\Controllers\Shared\RentalCheckoutController;
use App\Http\Controllers\Shared\RentalDamageController;
use App\Http\Controllers\Shared\ReviewController;
use App\Http\Controllers\Shared\TransactionController;
use App\Http\Controllers\Shared\VehicleAvailabilityController;
use App\Http\Controllers\Shared\VehicleCatalogController;
use App\Http\Controllers\Shared\VehicleCategoryController;
use App\Http\Controllers\Shared\VehiclePriceController;
use App\Http\Controllers\Shared\VehicleSearchController;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes â€” RentGo
|--------------------------------------------------------------------------
*/

// Beranda (Welcome)
Route::get('/', function () {
    $vehicles = Vehicle::with(['agentProfile.user', 'vehicleCategory', 'photos', 'prices'])
        ->where('status', 'available')
        ->latest()
        ->get();

    $mobilPopuler = $vehicles->filter(fn($v) => in_array($v->vehicle_type ?? 'car', ['car', 'mobil', 'suv', 'minivan']))
        ->map(function ($v) {
            $price = $v->prices->first()?->price_per_day ?? $v->price_per_day ?? 350000;
            $photo = $v->photos->first()?->file_path ? '/storage/' . $v->photos->first()->file_path : null;
            return [
                'id' => $v->id,
                'nama' => $v->name ?: trim(($v->brand ?? '') . ' ' . ($v->model ?? '')),
                'kategori' => $v->vehicleCategory->name ?? 'Mobil',
                'transmisi' => ucfirst($v->transmission ?? 'Matic'),
                'kursi' => ($v->seat_capacity ?? 5) . ' Kursi',
                'bensin' => ucfirst($v->fuel_type ?? 'Bensin'),
                'harga' => (float) $price,
                'lokasi' => $v->agentProfile->city ?? $v->pickup_location ?? 'Jakarta',
                'lepasKunci' => true,
                'img' => $photo ?: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
            ];
        })
        ->values();

    $motorPilihan = $vehicles->filter(fn($v) => in_array($v->vehicle_type ?? '', ['motorcycle', 'motor', 'scooter']))
        ->map(function ($v) {
            $price = $v->prices->first()?->price_per_day ?? $v->price_per_day ?? 120000;
            $photo = $v->photos->first()?->file_path ? '/storage/' . $v->photos->first()->file_path : null;
            return [
                'id' => $v->id,
                'nama' => $v->name ?: trim(($v->brand ?? '') . ' ' . ($v->model ?? '')),
                'kategori' => $v->vehicleCategory->name ?? 'Motor',
                'transmisi' => ucfirst($v->transmission ?? 'Matic'),
                'cc' => '125-155 cc',
                'harga' => (float) $price,
                'lokasi' => $v->agentProfile->city ?? $v->pickup_location ?? 'Jakarta',
                'img' => $photo ?: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
            ];
        })
        ->values();

    // Titik lokasi mitra untuk peta "Sekitar Kita".
    // Satu entri per unit tersedia, membawa profil mitra (nama, alamat, kota,
    // dan koordinat presisi bila mitra sudah menandai lokasinya di peta).
    $mapUnits = $vehicles->map(function ($v) {
        $agent = $v->agentProfile;
        return [
            'id' => $v->id,
            'nama' => $v->name ?: trim($v->brand . ' ' . $v->model),
            'harga' => (float) ($v->prices->first()?->price_per_day ?? $v->price_per_day ?? 0),
            'tipe' => in_array($v->vehicle_type ?? '', ['motorcycle', 'motor', 'scooter']) ? 'motor' : 'mobil',
            // Info mitra pemilik unit.
            'mitraId' => $agent?->id,
            'mitra' => $agent?->agency_name ?: ($agent?->user?->name ?? 'Mitra RentGo'),
            'mitraAlamat' => $agent?->address,
            'mitraKota' => $agent?->city,
            'mitraLat' => $agent?->latitude,
            'mitraLng' => $agent?->longitude,
            // Fallback lokasi bila profil mitra belum lengkap.
            'lokasi' => $agent?->city ?? $v->pickup_location ?? 'Jakarta',
            'kota' => $agent?->city ?? $v->pickup_location ?? 'Jakarta',
        ];
    })->values();

    $dbCities = \App\Models\AgentProfile::whereNotNull('city')
        ->where('city', '!=', '')
        ->pluck('city')
        ->unique()
        ->values()
        ->toArray();

    $cities = !empty($dbCities) ? $dbCities : ['Jakarta', 'Bali', 'Bandung', 'Yogyakarta', 'Surabaya', 'Semarang', 'Medan'];
    if (!in_array('Semua Kota', $cities)) {
        array_unshift($cities, 'Semua Kota');
    }

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'vehicles' => $vehicles,
        'mobilPopuler' => $mobilPopuler,
        'motorPilihan' => $motorPilihan,
        'mapUnits' => $mapUnits,
        'cities' => $cities,
    ]);
})->name('home');

// Pencarian Armada
Route::get('/pencarian', [VehicleSearchController::class, 'index'])->name('unit.search');
Route::get('/search', [VehicleSearchController::class, 'index'])->name('vehicles.search');

// Detail Armada (Bisa diakses publik / customer)
Route::get('/vehicles/{vehicle}', [VehicleCatalogController::class, 'show'])->name('vehicles.show');

// Toko mitra publik — dibuka dari kotak lokasi peta "Sekitar Kita" di Welcome.
// Parameter dibatasi angka agar tidak bentrok dengan route portal mitra (/mitra/unit, dll.).
Route::get('/mitra/{agentProfile}', [AgentStorefrontController::class, 'show'])
    ->whereNumber('agentProfile')
    ->name('mitra.store');

// Ulasan publik unit ditangani Shared\ReviewController (route resource di bawah).

/*
|--------------------------------------------------------------------------
| Authenticated Common Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Dashboard cerdas: Mengarahkan tampilan sesuai role (admin, mitra, customer)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Pesanan Saya (Customer)
    Route::get('/pesanan', [CustomerBookingController::class, 'index'])->name('orders.index');

    // ==========================================
    // PESAN / CHAT (customer â†” mitra)
    // ==========================================
    Route::get('/message', [MessageController::class, 'index'])->name('message.index');
    Route::post('/message/booking/{booking}', [MessageController::class, 'startForBooking'])->name('message.start');
    Route::post('/message/{conversation}', [MessageController::class, 'store'])->name('message.store');
    Route::post('/message/{conversation}/read', [MessageController::class, 'markAsRead'])->name('message.read');

    // ==========================================
    // PENGAJUAN MITRA (Customer â†’ Mitra)
    // ==========================================
    Route::get('/mitra/daftar', [MitraApplicationController::class, 'create'])->name('mitra.apply.create');
    Route::post('/mitra/daftar', [MitraApplicationController::class, 'store'])->name('mitra.apply.store');
    Route::get('/mitra/daftar/terkirim', [MitraApplicationController::class, 'submitted'])->name('mitra.apply.submitted');

    // Mulai chat langsung dengan mitra (tanpa pesanan) dari halaman toko.
    Route::post('/mitra/{agentProfile}/chat', [MessageController::class, 'startForAgent'])
        ->whereNumber('agentProfile')
        ->name('mitra.chat');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ==========================================
    // BOOKINGS
    // ==========================================
    // Aksi customer: buat / lihat / ubah / batalkan pesanan.
    Route::resource('bookings', CustomerBookingController::class);
    Route::post('bookings/{booking}/cancel', [CustomerBookingController::class, 'cancel'])->name('bookings.cancel');
    // Aksi mitra: konfirmasi/tolak & tandai siap diambil.
    Route::post('bookings/{booking}/confirm', [AgentBookingController::class, 'confirm'])->name('bookings.confirm');
    Route::post('bookings/{booking}/ready-for-pickup', [AgentBookingController::class, 'readyForPickup'])->name('bookings.readyForPickup');
    // Aksi mitra: periksa & setujui/tolak pembayaran customer (bukti bayar QRIS / transfer bank).
    Route::get('bookings/{booking}/payment-proof', [AgentBookingController::class, 'paymentProof'])->name('bookings.payment.proof');
    Route::post('bookings/{booking}/payment/approve', [AgentBookingController::class, 'approvePayment'])->name('bookings.payment.approve');
    Route::post('bookings/{booking}/payment/reject', [AgentBookingController::class, 'rejectPayment'])->name('bookings.payment.reject');

    // ==========================================
    // PAYMENTS
    // ==========================================
    Route::get('payments/create/{booking}', [CustomerPaymentController::class, 'create'])->name('payments.create');
    Route::post('payments', [CustomerPaymentController::class, 'store'])->name('payments.store');
    // Struk pemesanan / bukti pembayaran (setelah memesan).
    Route::get('payments/{payment}/receipt', [CustomerPaymentController::class, 'receipt'])->name('payments.receipt');
    Route::get('payments/{payment}', [CustomerPaymentController::class, 'show'])->name('payments.show');
    Route::get('payments/{payment}/proof', [CustomerPaymentController::class, 'proof'])->name('payments.proof');
    // Verifikasi pembayaran oleh admin.
    Route::post('payments/{payment}/verify', [AdminPaymentController::class, 'verify'])->name('payments.verify');

    // ==========================================
    // SERAH TERIMA & RENTAL INSPECTION
    // ==========================================
    Route::get('rental/handover/{booking}', function (Booking $booking) {
        $booking->load([
            'customer',
            'agentProfile.user',
            'items.vehicle.photos',
            'rentalCheckout',
            'rentalCheckin',
            'rentalDamages',
        ]);
        return Inertia::render('Rental/Handover', [
            'booking' => $booking,
            'bookingNumber' => $booking->booking_number,
            'checkout' => $booking->rentalCheckout,
            'checkin' => $booking->rentalCheckin,
            'damages' => $booking->rentalDamages,
        ]);
    })->name('rental.handover');

    Route::resource('rental-checkouts', RentalCheckoutController::class);
    Route::resource('rental-checkins', RentalCheckinController::class);
    Route::resource('rental-damages', RentalDamageController::class);

    // ==========================================
    // VEHICLES (DATA PENDUKUNG)
    // CRUD kendaraan kini DIPISAH per-role:
    // - Admin â†’ route admin.vehicles.* (Admin\VehicleManagementController)
    // - Mitra â†’ route mitra.vehicles.* (Agent\VehicleManagementController)
    // ==========================================
    Route::resource('vehicle-availabilities', VehicleAvailabilityController::class);
    Route::resource('vehicle-prices', VehiclePriceController::class);
    Route::resource('vehicle-categories', VehicleCategoryController::class);

    // ==========================================
    // LAIN-LAIN (DOCUMENTS, REVIEWS, DISPUTES, ETC.)
    // ==========================================
    Route::resource('customer-documents', CustomerDocumentController::class);
    Route::get('customer-documents/{customerDocument}/file', [CustomerDocumentController::class, 'file'])->name('customer-documents.file');
    Route::post('customer-documents/{customerDocument}/verify', [CustomerDocumentController::class, 'verify'])->name('customer-documents.verify');
    Route::resource('customer-profiles', CustomerProfileController::class);

    // Ulasan milik customer (halaman + kirim ulasan baru).
    // Didaftarkan SEBELUM resource agar /ulasan tidak bentrok dengan /reviews/{id}.
    Route::get('/ulasan', [CustomerReviewController::class, 'index'])->name('reviews.mine');
    Route::post('/ulasan', [CustomerReviewController::class, 'store'])->name('reviews.mine.store');

    Route::resource('reviews', ReviewController::class);
    Route::post('reviews/{review}/moderate', [ReviewController::class, 'moderate'])->name('reviews.moderate');

    Route::resource('complaints', ComplaintController::class);
    Route::post('complaints/{complaint}/process', [ComplaintController::class, 'process'])->name('complaints.process');

    Route::resource('disputes', DisputeController::class);
    Route::post('disputes/{dispute}/process', [DisputeController::class, 'process'])->name('disputes.process');

    Route::resource('refunds', RefundController::class)->only(['index', 'show']);
    Route::post('refunds/{refund}/process', [RefundController::class, 'process'])->name('refunds.process');

    Route::resource('transactions', TransactionController::class)->only(['index', 'create', 'store', 'show']);
    Route::post('transactions/{transaction}/complete', [TransactionController::class, 'complete'])->name('transactions.complete');

    Route::resource('agent-payouts', AgentPayoutController::class)->only(['index', 'show']);
    Route::post('transaction-commissions/{commission}/payout', [AgentPayoutController::class, 'createFromCommission'])->name('transaction-commissions.payout');
    Route::post('agent-payouts/{agentPayout}/process', [AgentPayoutController::class, 'process'])->name('agent-payouts.process');

    Route::resource('notifications', NotificationController::class)->only(['index', 'show']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::resource('wishlists', WishlistController::class)->only(['index', 'store', 'destroy']);
    Route::resource('audit-logs', AuditLogController::class)->only(['index', 'show']);
});


/*
|--------------------------------------------------------------------------
| Admin Portal Routes (Role: admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::post('/agents/documents/{agentDocument}/verify', [AgentVerificationController::class, 'verifyDocument'])->name('agents.documents.verify');
    Route::get('/agents/documents/{agentDocument}/file', [AgentVerificationController::class, 'documentFile'])->name('agents.documents.file');

    Route::get('/users', function () {
        $users = User::with(['roles', 'agentProfile', 'customerProfile'])->latest()->paginate(20);
        $mappedUsers = collect($users->items())->map(function ($u) {
            $role = $u->roles->first()?->name ?? 'customer';
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $role,
                'avatar' => $u->avatar ?? null,
                'created_at' => $u->created_at?->toISOString(),
                'verified' => $u->agentProfile?->onboarding_status === 'approved',
                'onboarding_status' => $u->agentProfile?->onboarding_status,
                'status' => $u->agentProfile ? ($u->agentProfile->is_active ? 'active' : 'inactive') : 'active',
                'agent_profile' => $u->agentProfile,
                'customer_profile' => $u->customerProfile,
            ];
        })->values()->all();

        return Inertia::render('Admin/Users', [
            'users' => $mappedUsers,
            'pagination' => $users,
        ]);
    })->name('users');

    Route::get('/users/create', function () {
        return Inertia::render('Admin/CreateUser');
    })->name('users.create');

    Route::get('/users/{user}/edit', function (User $user) {
        $user->load(['roles', 'agentProfile']);
        return Inertia::render('Admin/EditUser', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? 'customer',
                'status' => $user->agentProfile ? ($user->agentProfile->is_active ? 'active' : 'inactive') : 'active',
                'agent_profile' => $user->agentProfile,
            ],
        ]);
    })->name('users.edit');

    Route::post('/users', function (Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,mitra,customer',
            'agency_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);

        if ($validated['role'] === 'mitra') {
            $user->agentProfile()->create([
                'agency_name' => $validated['agency_name'] ?: ($validated['name'] . ' Rental'),
                'phone' => $validated['phone'] ?? '-',
                'city' => $validated['city'] ?? 'Jakarta',
                'onboarding_status' => 'approved',
                'is_active' => true,
            ]);
        } elseif ($validated['role'] === 'customer') {
            $user->customerProfile()->create([
                'phone' => $validated['phone'] ?? '-',
                'is_verified' => true,
            ]);
        }

        return redirect()->back()->with('success', 'User baru berhasil ditambahkan.');
    })->name('users.store');

    Route::put('/users/{user}', function (Request $request, User $user) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string|in:admin,mitra,customer',
            'status' => 'nullable|string|in:active,inactive,rejected',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $user->syncRoles([$validated['role']]);

        if ($user->agentProfile) {
            $user->agentProfile->update([
                'is_active' => ($validated['status'] ?? 'active') === 'active',
                'onboarding_status' => ($validated['status'] ?? 'active') === 'active' ? 'approved' : 'rejected',
            ]);
        }

        return redirect()->back()->with('success', 'Data user berhasil diperbarui.');
    })->name('users.update');

    Route::delete('/users/{user}', function (Request $request, User $user) {
        if ($user->id === $request->user()->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->bookings()->exists()) {
            return redirect()->back()->with('error', 'User memiliki riwayat transaksi/pesanan dan tidak dapat dihapus.');
        }

        $user->delete();
        return redirect()->back()->with('success', 'User berhasil dihapus.');
    })->name('users.destroy');

    // Armada â€” CRUD & Verifikasi khusus Admin
    Route::get('/vehicles', [AdminVehicleManagementController::class, 'index'])->name('vehicles');
    Route::get('/vehicles/create', [AdminVehicleManagementController::class, 'create'])->name('vehicles.create');
    Route::post('/vehicles', [AdminVehicleManagementController::class, 'store'])->name('vehicles.store');
    Route::get('/vehicles/{vehicle}/edit', [AdminVehicleManagementController::class, 'edit'])->name('vehicles.edit');
    Route::put('/vehicles/{vehicle}', [AdminVehicleManagementController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{vehicle}', [AdminVehicleManagementController::class, 'destroy'])->name('vehicles.destroy');
    Route::post('/vehicles/{vehicle}/verify', [AdminVehicleManagementController::class, 'verify'])->name('vehicles.verify');

    Route::get('/finance', [AdminPaymentController::class, 'index'])->name('finance');
    Route::post('/payouts/{agentPayout}/process', [AdminPaymentController::class, 'processPayout'])->name('payouts.process');
    Route::post('/refunds/{refund}/process', [AdminPaymentController::class, 'processRefund'])->name('refunds.process');

    // Pusat penyelesaian masalah: sengketa, komplain, moderasi ulasan.
    Route::get('/disputes', [SupportController::class, 'index'])->name('disputes');
    Route::post('/disputes/{dispute}/process', [SupportController::class, 'processDispute'])->name('disputes.process');
    Route::post('/complaints/{complaint}/process', [SupportController::class, 'processComplaint'])->name('complaints.process');
    Route::post('/reviews/{review}/moderate', [SupportController::class, 'moderateReview'])->name('reviews.moderate');

    Route::post('/agents/{agentProfile}/verify', [AgentVerificationController::class, 'verify'])->name('agents.verify');
});

/*
|--------------------------------------------------------------------------
| Mitra Portal Routes (Role: mitra)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:mitra'])->prefix('mitra')->name('mitra.')->group(function () {
    Route::get('/', [AgentDashboardController::class, 'index'])->name('dashboard');
    // Armada â€” CRUD khusus Mitra
    Route::get('/unit', [AgentVehicleManagementController::class, 'index'])->name('vehicles');
    Route::get('/unit/tambah', [AgentVehicleManagementController::class, 'create'])->name('vehicles.create');
    Route::get('/unit/{vehicle}/edit', [AgentVehicleManagementController::class, 'edit'])->name('vehicles.edit');
    Route::post('/unit', [AgentVehicleManagementController::class, 'store'])->name('vehicles.store');
    Route::put('/unit/{vehicle}', [AgentVehicleManagementController::class, 'update'])->name('vehicles.update');
    Route::delete('/unit/{vehicle}', [AgentVehicleManagementController::class, 'destroy'])->name('vehicles.destroy');
    // Hapus satu foto/media unit tanpa menghapus unitnya.
    Route::delete('/unit/{vehicle}/foto/{photo}', [AgentVehicleManagementController::class, 'destroyPhoto'])->name('vehicles.photos.destroy');
    Route::get('/pesanan', [AgentBookingController::class, 'index'])->name('bookings');
    Route::get('/pesanan/{booking}', [AgentBookingController::class, 'show'])->name('bookings.show');
    // Tahap "Berjalan": form catat pengembalian (check-in).
    Route::get('/pesanan/{booking}/pengembalian', [AgentBookingController::class, 'checkin'])->name('bookings.checkin');
    // Tahap "Dikembalikan": selesaikan pesanan.
    Route::post('/pesanan/{booking}/selesaikan', [AgentBookingController::class, 'complete'])->name('bookings.complete');

    // Pesan customer â†” mitra (halaman chat sisi mitra).
    // Endpoint aksinya (kirim / tandai dibaca) tetap memakai route bersama
    // "message.store" & "message.read" agar tidak ada duplikasi.
    Route::get('/pesan', [MessageController::class, 'index'])->name('messages');

    // Ulasan customer pada unit mitra + balasan publik.
    Route::get('/ulasan', [AgentReviewController::class, 'index'])->name('reviews');
    Route::post('/ulasan/{review}/balas', [AgentReviewController::class, 'reply'])->name('reviews.reply');

    Route::get('/pendapatan', function () {
        return Inertia::render('Agent/Earnings');
    })->name('earnings');

    // Mitra boleh melihat file dokumennya sendiri (KTP / NIB) pada halaman profil.
    Route::get('/profil/dokumen/{agentDocument}/file', function (\App\Models\AgentDocument $agentDocument) {
        $agent = auth()->user()->agentProfile;
        abort_unless($agent && $agentDocument->agent_profile_id === $agent->id, 403);
        abort_unless($agentDocument->file_path, 404, 'File dokumen tidak ditemukan.');

        $disk = \Illuminate\Support\Facades\Storage::disk('private');
        abort_unless($disk->exists($agentDocument->file_path), 404, 'File dokumen tidak ditemukan.');

        return $disk->response($agentDocument->file_path);
    })->name('profile.document');

    Route::get('/profil', function () {
        $agent = auth()->user()->agentProfile;

        return Inertia::render('Agent/Profile', [
            'agent' => $agent,
            // Dokumen verifikasi mitra (KTP, NIB, dll.) wajib dikirim agar
            // daftar dokumen pada halaman profil tidak kosong.
            'documents' => $agent
                ? $agent->documents()->latest()->get()
                : [],
        ]);
    })->name('profile');

    Route::patch('/profil', function (Request $request) {
        $validated = $request->validate([
            'agency_name' => 'required|string|max:255',
            'owner_name' => ['nullable', 'string', 'max:255'],
            'phone' => 'required|string|max:30',
            'business_type' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'city' => 'required|string|max:100',
            'province' => 'nullable|string|max:100',
            // Koordinat presisi lokasi usaha dari peta (bila diubah di profil).
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'description' => 'nullable|string|max:1000',
        ]);

        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403, 'Profil mitra tidak ditemukan.');

        $agent->update($validated);

        return redirect()->back()->with('success', 'Profil kemitraan berhasil diperbarui.');
    })->name('profile.update');
});

require __DIR__.'/auth.php';
