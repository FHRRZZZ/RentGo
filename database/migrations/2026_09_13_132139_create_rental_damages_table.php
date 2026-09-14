<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rental_damages', function (Blueprint $table) {
            $table->id();

            /*
             * Booking tempat kerusakan ditemukan
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Kendaraan yang mengalami kerusakan
             */
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            /*
             * Check-in tempat kerusakan ditemukan
             */
            $table->foreignId('rental_checkin_id')
                ->constrained('rental_checkins')
                ->restrictOnDelete();

            /*
             * Deskripsi kerusakan
             */
            $table->text('description');

            /*
             * Lokasi kerusakan pada kendaraan
             *
             * Contoh:
             * body depan, bumper, kaca, spion, dll.
             */
            $table->string('location')->nullable();

            /*
             * Tingkat kerusakan
             */
            $table->enum('severity', [
                'minor',
                'moderate',
                'major',
            ])->default('minor');

            /*
             * Foto kerusakan
             */
            $table->json('photos')->nullable();

            /*
             * Estimasi biaya perbaikan
             */
            $table->decimal('repair_cost', 15, 2)->default(0);

            /*
             * Jumlah yang dibebankan kepada customer
             *
             * Bisa berbeda dari repair_cost,
             * misalnya berdasarkan kebijakan deposit.
             */
            $table->decimal('customer_charge', 15, 2)->default(0);

            /*
             * Apakah biaya kerusakan dipotong
             * dari deposit
             */
            $table->boolean('deducted_from_deposit')->default(false);

            /*
             * Status kerusakan
             */
            $table->enum('status', [
                'reported',
                'verified',
                'resolved',
                'rejected',
            ])->default('reported');

            /*
             * Catatan tambahan
             */
            $table->text('notes')->nullable();

            $table->timestamps();

            /*
             * Index
             */
            $table->index([
                'booking_id',
                'status',
            ]);

            $table->index([
                'vehicle_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_damages');
    }
};