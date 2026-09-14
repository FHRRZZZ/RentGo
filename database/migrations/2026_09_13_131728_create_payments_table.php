<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang dibayar
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Nomor pembayaran
             */
            $table->string('payment_number')->unique();

            /*
             * Metode pembayaran
             *
             * MVP:
             * - cash
             * - qris
             */
            $table->enum('payment_method', [
                'cash',
                'qris',
            ]);

            /*
             * Nominal pembayaran
             */
            $table->decimal('amount', 15, 2);

            /*
             * Status pembayaran
             */
            $table->enum('status', [
                'pending',
                'paid',
                'failed',
                'expired',
                'cancelled',
            ])->default('pending');

            /*
             * Bukti pembayaran
             *
             * Digunakan terutama untuk
             * pembayaran manual/QRIS.
             */
            $table->string('proof_file_path')->nullable();

            /*
             * Waktu pembayaran berhasil
             */
            $table->timestamp('paid_at')->nullable();

            /*
             * User yang melakukan verifikasi pembayaran
             *
             * Biasanya Agent atau Management.
             */
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Waktu verifikasi
             */
            $table->timestamp('verified_at')->nullable();

            /*
             * Catatan pembayaran
             */
            $table->text('notes')->nullable();

            $table->timestamps();

            /*
             * Index untuk pencarian pembayaran
             */
            $table->index([
                'booking_id',
                'status',
            ]);

            $table->index([
                'payment_method',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};