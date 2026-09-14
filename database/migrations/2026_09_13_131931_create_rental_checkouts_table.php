<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_checkouts', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang sedang diserahkan
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Kendaraan yang diserahkan
             */
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            /*
             * Waktu checkout / serah-terima kendaraan
             */
            $table->timestamp('checkout_at');

            /*
             * Kondisi kendaraan saat diserahkan
             */
            $table->text('vehicle_condition')->nullable();

            /*
             * Foto kondisi kendaraan saat checkout
             *
             * Bisa menyimpan path JSON
             * jika nantinya terdapat banyak foto.
             */
            $table->json('photos')->nullable();

            /*
             * Odometer kendaraan
             */
            $table->unsignedInteger('odometer')->nullable();

            /*
             * Kondisi bahan bakar
             */
            $table->string('fuel_level')->nullable();

            /*
             * Perlengkapan kendaraan
             *
             * Contoh:
             * helm, STNK, toolkit, kunci cadangan, dll.
             */
            $table->json('equipment')->nullable();

            /*
             * Catatan tambahan agent
             */
            $table->text('notes')->nullable();

            /*
             * Customer mengonfirmasi bahwa
             * kendaraan sudah diterima.
             */
            $table->boolean('customer_confirmed')->default(false);

            /*
             * Waktu customer melakukan konfirmasi
             */
            $table->timestamp('customer_confirmed_at')->nullable();

            $table->timestamps();

            /*
             * Satu booking hanya memiliki
             * satu proses checkout.
             */
            $table->unique('booking_id');

            /*
             * Index kendaraan dan waktu checkout.
             */
            $table->index([
                'vehicle_id',
                'checkout_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_checkouts');
    }
};