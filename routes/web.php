<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CustomerDocumentController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\VehicleAvailabilityController;
use App\Http\Controllers\VehicleCategoryController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\AgentPayoutController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\RentalCheckoutController;
use App\Http\Controllers\RentalCheckinController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\VehiclePriceController;
use App\Http\Controllers\VehicleSearchController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\RentalDamageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AgentVerificationController;
use App\Http\Controllers\WishlistController;

Route::middleware('auth')->group(function () {

    // =========================
    // DASHBOARD
    // =========================

    Route::get(
        '/dashboard',
        [DashboardController::class, 'index']
    )->name('dashboard');

    Route::get('/', [DashboardController::class, 'index'])
        ->name('home');

    // =========================
    // PROFILE
    // =========================

    Route::get(
        '/profile',
        [ProfileController::class, 'edit']
    )->name('profile.edit');

    Route::patch(
        '/profile',
        [ProfileController::class, 'update']
    )->name('profile.update');

    Route::delete(
        '/profile',
        [ProfileController::class, 'destroy']
    )->name('profile.destroy');


    // =========================
    // AUDIT LOGS
    // =========================

    Route::resource(
        'audit-logs',
        AuditLogController::class
    )->only([
        'index',
        'show',
    ])->parameters([
        'audit-logs' => 'auditLog',
    ]);


    // =========================
    // NOTIFICATION
    // =========================

    Route::get(
        'notifications',
        [NotificationController::class, 'index']
    )->name('notifications.index');

    Route::get(
        'notifications/{notification}',
        [NotificationController::class, 'show']
    )->name('notifications.show');

    Route::post(
        'notifications/{notification}/read',
        [NotificationController::class, 'markAsRead']
    )->name('notifications.read');

    Route::post(
        'notifications/read-all',
        [NotificationController::class, 'markAllAsRead']
    )->name('notifications.readAll');

    Route::delete(
        'notifications/{notification}',
        [NotificationController::class, 'destroy']
    )->name('notifications.destroy');


    // =========================
    // REFUNDS
    // =========================

    Route::get(
        'refunds',
        [RefundController::class, 'index']
    )->name('refunds.index');

    Route::get(
        'refunds/{refund}',
        [RefundController::class, 'show']
    )->name('refunds.show');

    Route::post(
        'refunds/{refund}/process',
        [RefundController::class, 'process']
    )->name('refunds.process');


    // =========================
    // DISPUTES
    // =========================

    Route::resource(
        'disputes',
        DisputeController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'disputes' => 'dispute',
    ]);

    Route::post(
        'disputes/{dispute}/process',
        [DisputeController::class, 'process']
    )->name('disputes.process');


    // =========================
    // PAYMENTS
    // =========================

    Route::get(
        'payments',
        [PaymentController::class, 'index']
    )->name('payments.index');

    Route::get(
        'payments/create/{booking}',
        [PaymentController::class, 'create']
    )->name('payments.create');

    Route::post(
        'payments',
        [PaymentController::class, 'store']
    )->name('payments.store');

    Route::get(
        'payments/{payment}',
        [PaymentController::class, 'show']
    )->name('payments.show');

    Route::get(
        'payments/{payment}/proof',
        [PaymentController::class, 'proof']
    )->name('payments.proof');

    Route::post(
        'payments/{payment}/verify',
        [PaymentController::class, 'verify']
    )->name('payments.verify');


    // =========================
    // TRANSACTIONS
    // =========================

    Route::resource(
        'transactions',
        TransactionController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'transactions' => 'transaction',
    ]);

    Route::post(
        'transactions/{transaction}/complete',
        [TransactionController::class, 'complete']
    )->name('transactions.complete');


    // =========================
    // AGENT PAYOUTS
    // =========================

    Route::get(
        'agent-payouts',
        [AgentPayoutController::class, 'index']
    )->name('agent-payouts.index');

    Route::get(
        'agent-payouts/{agentPayout}',
        [AgentPayoutController::class, 'show']
    )->name('agent-payouts.show');

    Route::post(
        'transaction-commissions/{commission}/payout',
        [AgentPayoutController::class, 'createFromCommission']
    )->name('transaction-commissions.payout');

    Route::post(
        'agent-payouts/{agentPayout}/process',
        [AgentPayoutController::class, 'process']
    )->name('agent-payouts.process');


    // =========================
    // REVIEWS
    // =========================

    Route::resource(
        'reviews',
        ReviewController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'reviews' => 'review',
    ]);

    Route::post(
        'reviews/{review}/moderate',
        [ReviewController::class, 'moderate']
    )->name('reviews.moderate');


    // =========================
    // COMPLAINTS
    // =========================

    Route::resource(
        'complaints',
        ComplaintController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'complaints' => 'complaint',
    ]);

    Route::post(
        'complaints/{complaint}/process',
        [ComplaintController::class, 'process']
    )->name('complaints.process');


    // =========================
    // RENTAL CHECKOUT
    // =========================

    Route::resource(
        'rental-checkouts',
        RentalCheckoutController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'rental-checkouts' => 'rentalCheckout',
    ]);


    // =========================
    // RENTAL CHECKIN
    // =========================

    Route::resource(
        'rental-checkins',
        RentalCheckinController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'rental-checkins' => 'rentalCheckin',
    ]);


    // =========================
    // RENTAL DAMAGES
    // =========================

    Route::resource(
        'rental-damages',
        RentalDamageController::class
    )->only([
        'index',
        'create',
        'store',
        'show',
    ])->parameters([
        'rental-damages' => 'rentalDamage',
    ]);


    // =========================
    // VEHICLE
    // =========================

    Route::resource(
        'vehicles',
        VehicleController::class
    );

    // Verifikasi kendaraan oleh admin (PRD §8.3, BR-02)
    Route::post(
        'vehicles/{vehicle}/verify',
        [VehicleController::class, 'verify']
    )->name('vehicles.verify');


    // =========================
    // VEHICLE AVAILABILITY
    // =========================

    Route::resource(
        'vehicle-availabilities',
        VehicleAvailabilityController::class
    )->parameters([
        'vehicle-availabilities' =>
            'vehicleAvailability',
    ]);


    // =========================
    // VEHICLE PRICE
    // =========================

    Route::resource(
        'vehicle-prices',
        VehiclePriceController::class
    )->parameters([
        'vehicle-prices' =>
            'vehiclePrice',
    ]);


    // =========================
    // VEHICLE CATEGORY
    // =========================

    Route::resource(
        'vehicle-categories',
        VehicleCategoryController::class
    );


    // =========================
    // CUSTOMER PROFILE
    // =========================

    Route::resource(
        'customer-profiles',
        CustomerProfileController::class
    );


    // =========================
    // CUSTOMER DOCUMENT
    // =========================

    Route::resource(
        'customer-documents',
        CustomerDocumentController::class
    )->parameters([
        'customer-documents' =>
            'customerDocument',
    ]);

    Route::get(
        'customer-documents/{customerDocument}/file',
        [CustomerDocumentController::class, 'file']
    )->name('customer-documents.file');

    Route::post(
        'customer-documents/{customerDocument}/verify',
        [CustomerDocumentController::class, 'verify']
    )->name('customer-documents.verify');


    // =========================
    // VEHICLE SEARCH
    // =========================

    Route::get(
        'search',
        [VehicleSearchController::class, 'index']
    )->name('vehicles.search');


    // =========================
    // BOOKING
    // =========================

    Route::resource(
        'bookings',
        BookingController::class
    );

    /*
    |--------------------------------------------------------------------------
    | Booking Confirm / Reject
    |--------------------------------------------------------------------------
    */

    Route::post(
        'bookings/{booking}/confirm',
        [BookingController::class, 'confirm']
    )->name('bookings.confirm');

    Route::post(
        'bookings/{booking}/ready-for-pickup',
        [BookingController::class, 'readyForPickup']
    )->name('bookings.readyForPickup');

    Route::post(
        'bookings/{booking}/cancel',
        [BookingController::class, 'cancel']
    )->name('bookings.cancel');

    // =========================
    // AGENT VERIFICATION (ADMIN)
    // =========================

    Route::post(
        'admin/agents/{agentProfile}/verify',
        [AgentVerificationController::class, 'verify']
    )->name('admin.agents.verify');

    // =========================
    // WISHLIST
    // =========================

    Route::resource('wishlists', WishlistController::class)->only([
        'index',
        'store',
        'destroy',
    ]);
});


require __DIR__ . '/auth.php';