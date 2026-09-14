<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            /*
             * Booking yang menjadi sumber review
             */
            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            /*
             * Customer yang memberikan review
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
             * Kendaraan yang disewa
             */
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            /*
             * Rating 1 - 5
             */
            $table->unsignedTinyInteger('rating');

            /*
             * Isi review
             */
            $table->text('review')->nullable();

            /*
             * Status review
             */
            $table->enum('status', [
                'pending',
                'published',
                'hidden',
                'rejected',
            ])->default('pending');

            /*
             * Waktu review dipublikasikan
             */
            $table->timestamp('published_at')->nullable();

            /*
             * Catatan moderation
             */
            $table->text('moderation_note')->nullable();

            /*
             * User yang melakukan moderation
             */
            $table->foreignId('moderated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            /*
             * Satu booking hanya dapat memiliki
             * satu review dari customer.
             */
            $table->unique([
                'booking_id',
                'customer_id',
            ]);

            /*
             * Index untuk menampilkan rating kendaraan
             */
            $table->index([
                'vehicle_id',
                'status',
            ]);

            /*
             * Index untuk rating agent
             */
            $table->index([
                'agent_profile_id',
                'status',
            ]);

            /*
             * Index customer
             */
            $table->index([
                'customer_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};