<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();

            /*
             * Booking
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            /*
             * Vehicle yang disewa
             */
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            /*
             * Periode rental
             */
            $table->dateTime('rental_start');
            $table->dateTime('rental_end');

            /*
             * Jumlah hari rental
             */
            $table->unsignedInteger('rental_days');

            /*
             * Snapshot harga kendaraan
             *
             * Harga disimpan di booking item agar
             * perubahan harga kendaraan di kemudian hari
             * tidak mengubah histori booking lama.
             */
            $table->decimal('price_per_day', 15, 2);
            $table->decimal('rental_amount', 15, 2);

            /*
             * Catatan item
             */
            $table->text('notes')->nullable();

            $table->timestamps();

            /*
             * Index untuk pencarian availability
             * dan pengecekan double booking.
             */
            $table->index([
                'vehicle_id',
                'rental_start',
                'rental_end',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};