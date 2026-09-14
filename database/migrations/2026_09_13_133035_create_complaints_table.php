<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang berkaitan dengan keluhan
             */
            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            /*
             * User yang membuat complaint
             *
             * Bisa Customer atau Agent.
             */
            $table->foreignId('complainant_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
             * User yang menjadi pihak terlapor
             *
             * Bisa Customer atau Agent.
             */
            $table->foreignId('reported_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Judul complaint
             */
            $table->string('subject');

            /*
             * Isi complaint
             */
            $table->text('description');

            /*
             * Kategori complaint
             */
            $table->enum('category', [
                'vehicle',
                'booking',
                'payment',
                'pickup',
                'return',
                'agent',
                'customer',
                'other',
            ])->default('other');

            /*
             * Bukti pendukung complaint
             *
             * Dapat berisi beberapa path file.
             */
            $table->json('attachments')->nullable();

            /*
             * Prioritas complaint
             */
            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent',
            ])->default('medium');

            /*
             * Status complaint
             */
            $table->enum('status', [
                'open',
                'in_review',
                'resolved',
                'rejected',
                'closed',
            ])->default('open');

            /*
             * User yang menangani complaint
             */
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Waktu complaint diselesaikan
             */
            $table->timestamp('resolved_at')->nullable();

            /*
             * Hasil penyelesaian complaint
             */
            $table->text('resolution')->nullable();

            $table->timestamps();

            /*
             * Index
             */
            $table->index([
                'booking_id',
                'status',
            ]);

            $table->index([
                'complainant_id',
                'status',
            ]);

            $table->index([
                'reported_user_id',
                'status',
            ]);

            $table->index([
                'status',
                'priority',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};