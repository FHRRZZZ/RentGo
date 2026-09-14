<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang menjadi sumber transaksi
             */
            $table->foreignId('booking_id')
                ->unique()
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Customer
             */
            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Agent pemilik kendaraan
             */
            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            /*
             * Nomor transaksi
             */
            $table->string('transaction_number')->unique();

            /*
             * Nilai rental kendaraan
             *
             * Deposit dan delivery fee tidak
             * termasuk dalam dasar komisi.
             */
            $table->decimal('rental_amount', 15, 2);

            /*
             * Biaya delivery
             */
            $table->decimal('delivery_fee', 15, 2)->default(0);

            /*
             * Service fee
             */
            $table->decimal('service_fee', 15, 2)->default(0);

            /*
             * Biaya tambahan
             */
            $table->decimal('additional_fee', 15, 2)->default(0);

            /*
             * Deposit customer
             *
             * Dicatat terpisah karena bukan
             * pendapatan rental.
             */
            $table->decimal('deposit_amount', 15, 2)->default(0);

            /*
             * Potongan deposit karena kerusakan
             */
            $table->decimal('deposit_deduction', 15, 2)->default(0);

            /*
             * Deposit yang dikembalikan
             */
            $table->decimal('deposit_refund', 15, 2)->default(0);

            /*
             * Total transaksi
             */
            $table->decimal('total_amount', 15, 2);

            /*
             * Status transaksi
             */
            $table->enum('status', [
                'pending',
                'completed',
                'cancelled',
                'refunded',
            ])->default('pending');

            /*
             * Waktu transaksi selesai
             */
            $table->timestamp('completed_at')->nullable();

            /*
             * Catatan transaksi
             */
            $table->text('notes')->nullable();

            $table->timestamps();

            /*
             * Index untuk laporan
             */
            $table->index([
                'customer_id',
                'status',
            ]);

            $table->index([
                'agent_profile_id',
                'status',
            ]);

            $table->index([
                'status',
                'completed_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};