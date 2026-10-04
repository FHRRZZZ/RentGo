<?php

/*
|--------------------------------------------------------------------------
| API Routes — RentGo Mobile
|--------------------------------------------------------------------------
|
| Semua route prefix /api.
| Auth  : Laravel Sanctum (Bearer Token)
| Format: JSON — { data, message, pagination? }
|
| Grup:
|   [PUBLIC]   Tidak perlu login  — katalog kendaraan, kota, dll.
|   [AUTH]     Harus login        — booking, payment, profil, notifikasi
|   [MITRA]    Harus login + role mitra — dashboard mitra, kelola pesanan
|
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
Route::get('/health', fn() => response()->json([
    'status'  => 'ok',
    'service' => 'RentGo API',
    'version' => '1.0.0',
    'time'    => now()->toISOString(),
]));

/*
|--------------------------------------------------------------------------
| [PUBLIC] Katalog Kendaraan (tidak perlu login)
|--------------------------------------------------------------------------
*/
Route::prefix('vehicles')->group(function () {
    Route::get('/',           [VehicleController::class, 'index']);    // GET  /api/vehicles
    Route::get('/featured',   [VehicleController::class, 'featured']); // GET  /api/vehicles/featured
    Route::get('/{vehicle}',  [VehicleController::class, 'show']);     // GET  /api/vehicles/{id}
    Route::get('/{vehicle}/reviews', [ReviewController::class, 'index']); // GET /api/vehicles/{id}/reviews
});

Route::get('/cities', [VehicleController::class, 'cities']);           // GET  /api/cities

/*
|--------------------------------------------------------------------------
| [PUBLIC] Autentikasi
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // POST /api/auth/register
    Route::post('/login',    [AuthController::class, 'login']);    // POST /api/auth/login
});

/*
|--------------------------------------------------------------------------
| [AUTH] Routes yang butuh login (Sanctum token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Profil & Sesi ──────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::get('/me',       [AuthController::class, 'me']);             // GET  /api/auth/me
        Route::post('/logout',  [AuthController::class, 'logout']);         // POST /api/auth/logout
        Route::put('/password', [AuthController::class, 'changePassword']); // PUT  /api/auth/password
    });

    // ── Booking (Customer) ─────────────────────────────────────────────
    Route::prefix('bookings')->group(function () {
        Route::get('/',       [BookingController::class, 'index']);  // GET  /api/bookings
        Route::post('/',      [BookingController::class, 'store']);  // POST /api/bookings
        Route::get('/{booking}',        [BookingController::class, 'show']);   // GET  /api/bookings/{id}
        Route::post('/{booking}/cancel',[BookingController::class, 'cancel']); // POST /api/bookings/{id}/cancel
    });

    // ── Payment (Customer) ─────────────────────────────────────────────
    Route::prefix('payments')->group(function () {
        Route::post('/',                    [PaymentController::class, 'store']);       // POST /api/payments
        Route::get('/{payment}',            [PaymentController::class, 'show']);        // GET  /api/payments/{id}
        Route::post('/{payment}/proof',     [PaymentController::class, 'uploadProof']); // POST /api/payments/{id}/proof
    });

    // ── Reviews (Customer) ─────────────────────────────────────────────
    Route::post('/reviews', [ReviewController::class, 'store']); // POST /api/reviews

    // ── Notifikasi ─────────────────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/',                          [NotificationController::class, 'index']);    // GET  /api/notifications
        Route::post('/read-all',                 [NotificationController::class, 'readAll']);  // POST /api/notifications/read-all
        Route::put('/{notification}/read',       [NotificationController::class, 'markRead']); // PUT  /api/notifications/{id}/read
    });

    /*
    |--------------------------------------------------------------------------
    | [MITRA] Routes khusus role mitra
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:mitra')->prefix('agent')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AgentController::class, 'dashboard']); // GET /api/agent/dashboard

        // Kelola Pesanan
        Route::get('/bookings',                          [AgentController::class, 'bookings']);       // GET  /api/agent/bookings
        Route::post('/bookings/{booking}/confirm',       [AgentController::class, 'confirmBooking']); // POST /api/agent/bookings/{id}/confirm
        Route::post('/bookings/{booking}/reject',        [AgentController::class, 'rejectBooking']);  // POST /api/agent/bookings/{id}/reject
        Route::post('/bookings/{booking}/approve-payment',[AgentController::class, 'approvePayment']);// POST /api/agent/bookings/{id}/approve-payment

        // Armada
        Route::get('/vehicles', [AgentController::class, 'vehicles']); // GET /api/agent/vehicles

        // Pajak Pemasaran
        Route::get('/marketing-tax', [AgentController::class, 'marketingTax']); // GET /api/agent/marketing-tax
    });
});
