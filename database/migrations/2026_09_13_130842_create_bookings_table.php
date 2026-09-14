<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // Customer yang melakukan booking
            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Agent pemilik kendaraan
            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            // Nomor booking
            $table->string('booking_number')->unique();

            // Periode rental
            $table->dateTime('rental_start');
            $table->dateTime('rental_end');

            // Pickup / delivery
            $table->enum('fulfillment_type', [
                'self_pickup',
                'delivery',
            ])->default('self_pickup');

            $table->string('pickup_location')->nullable();
            $table->string('delivery_address')->nullable();

            // Harga rental
            $table->decimal('rental_amount', 15, 2);

            // Biaya tambahan
            $table->decimal('delivery_fee', 15, 2)->default(0);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->decimal('additional_fee', 15, 2)->default(0);

            // Deposit dipisahkan dari pendapatan rental
            $table->decimal('deposit_amount', 15, 2)->default(0);

            // Total yang harus dibayar customer
            $table->decimal('total_amount', 15, 2);

            // Status booking
            $table->enum('status', [
                'pending_payment',
                'paid',
                'waiting_agent_confirmation',
                'confirmed',
                'rejected',
                'cancelled',
                'ongoing',
                'returned',
                'completed',
            ])->default('pending_payment');

            // Catatan customer
            $table->text('customer_note')->nullable();

            // Catatan agent
            $table->text('agent_note')->nullable();

            $table->timestamps();

            $table->index([
                'customer_id',
                'status',
            ]);

            $table->index([
                'agent_profile_id',
                'status',
            ]);

            $table->index([
                'rental_start',
                'rental_end',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};