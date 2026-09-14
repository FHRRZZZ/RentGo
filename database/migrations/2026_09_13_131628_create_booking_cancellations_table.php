<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_cancellations', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang dibatalkan
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            /*
             * User yang melakukan pembatalan
             *
             * Bisa:
             * - Customer
             * - Agent
             * - Management
             */
            $table->foreignId('actor_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Alasan pembatalan
             */
            $table->text('reason');

            /*
             * Waktu pembatalan
             */
            $table->timestamp('cancelled_at');

            /*
             * Persentase refund berdasarkan
             * kebijakan pembatalan.
             *
             * Contoh:
             * 100 = refund penuh
             * 50  = refund 50%
             * 0   = tidak ada refund
             */
            $table->decimal('refund_percentage', 5, 2)->default(0);

            /*
             * Status refund
             */
            $table->enum('refund_status', [
                'not_required',
                'pending',
                'processing',
                'refunded',
                'failed',
            ])->default('not_required');

            /*
             * Nominal refund
             */
            $table->decimal('refund_amount', 15, 2)->default(0);

            $table->timestamps();

            /*
             * Index untuk histori pembatalan
             */
            $table->index([
                'booking_id',
                'cancelled_at',
            ]);

            $table->index([
                'actor_id',
                'cancelled_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_cancellations');
    }
};