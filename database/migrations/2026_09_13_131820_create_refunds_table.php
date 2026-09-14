<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang mendapatkan refund
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Payment yang direfund
             */
            $table->foreignId('payment_id')
                ->constrained('payments')
                ->restrictOnDelete();

            /*
             * Nomor refund
             */
            $table->string('refund_number')->unique();

            /*
             * Nominal refund
             */
            $table->decimal('amount', 15, 2);

            /*
             * Alasan refund
             */
            $table->text('reason')->nullable();

            /*
             * Status refund
             */
            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'failed',
                'cancelled',
            ])->default('pending');

            /*
             * Waktu refund berhasil
             */
            $table->timestamp('refunded_at')->nullable();

            /*
             * User yang memproses refund
             *
             * Biasanya Management/Admin.
             */
            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Catatan proses refund
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
                'payment_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};