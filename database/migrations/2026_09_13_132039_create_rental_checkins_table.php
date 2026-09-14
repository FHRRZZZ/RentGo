<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_checkins', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang dikembalikan
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Kendaraan yang dikembalikan
             */
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            /*
             * Waktu kendaraan dikembalikan
             */
            $table->timestamp('checkin_at');

            /*
             * Kondisi kendaraan saat dikembalikan
             */
            $table->text('vehicle_condition')->nullable();

            /*
             * Foto kondisi kendaraan saat check-in
             */
            $table->json('photos')->nullable();

            /*
             * Odometer saat kendaraan dikembalikan
             */
            $table->unsignedInteger('odometer')->nullable();

            /*
             * Kondisi bahan bakar
             */
            $table->string('fuel_level')->nullable();

            /*
             * Perlengkapan kendaraan
             */
            $table->json('equipment')->nullable();

            /*
             * Catatan tambahan
             */
            $table->text('notes')->nullable();

            /*
             * Apakah kendaraan mengalami keterlambatan
             */
            $table->boolean('is_late_return')->default(false);

            /*
             * Biaya keterlambatan
             */
            $table->decimal('late_return_fee', 15, 2)->default(0);

            /*
             * Customer mengonfirmasi pengembalian
             */
            $table->boolean('customer_confirmed')->default(false);

            /*
             * Waktu konfirmasi customer
             */
            $table->timestamp('customer_confirmed_at')->nullable();

            $table->timestamps();

            /*
             * Satu booking hanya memiliki
             * satu proses check-in.
             */
            $table->unique('booking_id');

            /*
             * Index kendaraan dan waktu check-in
             */
            $table->index([
                'vehicle_id',
                'checkin_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_checkins');
    }
};