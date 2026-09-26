<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel domain BOOKING: pemesanan, item, pembatalan, wishlist,
 * dan proses serah-terima (checkout / check-in / kerusakan).
 *
 * Digabung dari:
 * - create_bookings_table
 * - update_booking_and_dispute_statuses_and_add_payment_deadline (bagian bookings)
 * - create_booking_items_table
 * - create_booking_cancellations_table
 * - create_wishlists_table
 * - create_rental_checkouts_table
 * - create_rental_checkins_table
 * - create_rental_damages_table
 */
return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // Booking
        // ------------------------------------------------------------------
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            $table->string('booking_number')->unique();

            $table->dateTime('rental_start');
            $table->dateTime('rental_end');
            $table->dateTime('payment_deadline')->nullable();

            $table->enum('fulfillment_type', [
                'self_pickup',
                'delivery',
            ])->default('self_pickup');

            $table->string('pickup_location')->nullable();
            $table->string('delivery_address')->nullable();

            $table->decimal('rental_amount', 15, 2);

            $table->decimal('delivery_fee', 15, 2)->default(0);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->decimal('additional_fee', 15, 2)->default(0);

            $table->decimal('deposit_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);

            // Status lengkap sesuai PRD.
            $table->enum('status', [
                'pending',
                'pending_payment',
                'waiting_payment',
                'paid',
                'waiting_agent_confirmation',
                'confirmed',
                'ready_for_pickup',
                'ongoing',
                'returned',
                'completed',
                'cancelled',
                'rejected',
                'expired',
                'refund_pending',
                'refunded',
                'disputed',
            ])->default('waiting_payment');

            $table->text('customer_note')->nullable();
            $table->text('agent_note')->nullable();

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['agent_profile_id', 'status']);
            $table->index(['rental_start', 'rental_end']);
        });

        // ------------------------------------------------------------------
        // Item booking
        // ------------------------------------------------------------------
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->dateTime('rental_start');
            $table->dateTime('rental_end');

            $table->unsignedInteger('rental_days');

            // Snapshot harga agar histori booking tidak berubah.
            $table->decimal('price_per_day', 15, 2);
            $table->decimal('rental_amount', 15, 2);

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['vehicle_id', 'rental_start', 'rental_end']);
        });

        // ------------------------------------------------------------------
        // Pembatalan booking
        // ------------------------------------------------------------------
        Schema::create('booking_cancellations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('actor_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->text('reason');
            $table->timestamp('cancelled_at');

            $table->decimal('refund_percentage', 5, 2)->default(0);

            $table->enum('refund_status', [
                'not_required',
                'pending',
                'processing',
                'refunded',
                'failed',
            ])->default('not_required');

            $table->decimal('refund_amount', 15, 2)->default(0);

            $table->timestamps();

            $table->index(['booking_id', 'cancelled_at']);
            $table->index(['actor_id', 'cancelled_at']);
        });

        // ------------------------------------------------------------------
        // Wishlist
        // ------------------------------------------------------------------
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['user_id', 'vehicle_id']);
            $table->index('user_id');
            $table->index('vehicle_id');
        });

        // ------------------------------------------------------------------
        // Serah terima: checkout
        // ------------------------------------------------------------------
        Schema::create('rental_checkouts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->timestamp('checkout_at');

            $table->text('vehicle_condition')->nullable();
            $table->json('photos')->nullable();
            $table->unsignedInteger('odometer')->nullable();
            $table->string('fuel_level')->nullable();
            $table->json('equipment')->nullable();
            $table->text('notes')->nullable();

            $table->boolean('customer_confirmed')->default(false);
            $table->timestamp('customer_confirmed_at')->nullable();

            $table->timestamps();

            $table->unique('booking_id');
            $table->index(['vehicle_id', 'checkout_at']);
        });

        // ------------------------------------------------------------------
        // Serah terima: check-in
        // ------------------------------------------------------------------
        Schema::create('rental_checkins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->timestamp('checkin_at');

            $table->text('vehicle_condition')->nullable();
            $table->json('photos')->nullable();
            $table->unsignedInteger('odometer')->nullable();
            $table->string('fuel_level')->nullable();
            $table->json('equipment')->nullable();
            $table->text('notes')->nullable();

            $table->boolean('is_late_return')->default(false);
            $table->decimal('late_return_fee', 15, 2)->default(0);

            $table->boolean('customer_confirmed')->default(false);
            $table->timestamp('customer_confirmed_at')->nullable();

            $table->timestamps();

            $table->unique('booking_id');
            $table->index(['vehicle_id', 'checkin_at']);
        });

        // ------------------------------------------------------------------
        // Kerusakan saat pengembalian
        // ------------------------------------------------------------------
        Schema::create('rental_damages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->foreignId('rental_checkin_id')
                ->constrained('rental_checkins')
                ->restrictOnDelete();

            $table->text('description');
            $table->string('location')->nullable();

            $table->enum('severity', [
                'minor',
                'moderate',
                'major',
            ])->default('minor');

            $table->json('photos')->nullable();

            $table->decimal('repair_cost', 15, 2)->default(0);
            $table->decimal('customer_charge', 15, 2)->default(0);

            $table->boolean('deducted_from_deposit')->default(false);

            $table->enum('status', [
                'reported',
                'verified',
                'resolved',
                'rejected',
            ])->default('reported');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['vehicle_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_damages');
        Schema::dropIfExists('rental_checkins');
        Schema::dropIfExists('rental_checkouts');
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('booking_cancellations');
        Schema::dropIfExists('booking_items');
        Schema::dropIfExists('bookings');
    }
};
