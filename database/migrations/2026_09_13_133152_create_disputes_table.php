<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang menjadi sumber perselisihan
             */
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            /*
             * Pihak pertama
             *
             * Customer atau Agent
             */
            $table->foreignId('initiator_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * Pihak yang disengketakan
             */
            $table->foreignId('respondent_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Judul dispute
             */
            $table->string('subject');

            /*
             * Penjelasan perselisihan
             */
            $table->text('description');

            /*
             * Jenis dispute
             */
            $table->enum('category', [
                'vehicle_damage',
                'payment',
                'refund',
                'booking',
                'cancellation',
                'deposit',
                'other',
            ])->default('other');

            /*
             * Bukti pendukung
             */
            $table->json('attachments')->nullable();

            /*
             * Status dispute
             */
            $table->enum('status', [
                'open',
                'investigating',
                'awaiting_response',
                'resolved',
                'rejected',
                'closed',
            ])->default('open');

            /*
             * User Management/Admin yang menangani dispute
             */
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Keputusan penyelesaian
             */
            $table->text('resolution')->nullable();

            /*
             * Pihak yang dimenangkan
             *
             * null jika belum diputuskan.
             */
            $table->enum('resolution_party', [
                'initiator',
                'respondent',
                'shared',
                'none',
            ])->nullable();

            /*
             * Nominal yang diputuskan untuk dikembalikan
             */
            $table->decimal('refund_amount', 15, 2)->default(0);

            /*
             * Waktu dispute diselesaikan
             */
            $table->timestamp('resolved_at')->nullable();

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
                'initiator_id',
                'status',
            ]);

            $table->index([
                'respondent_id',
                'status',
            ]);

            $table->index([
                'status',
                'category',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};