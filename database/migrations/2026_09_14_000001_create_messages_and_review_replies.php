<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fitur komunikasi:
 * - Percakapan (conversations) antara customer dan mitra per pesanan (booking).
 * - Pesan (messages) di dalam percakapan.
 * - Balasan mitra atas ulasan (reviews.reply, replied_at).
 *
 * Tabel dipisah dari migrasi support agar perubahan tidak menyentuh migrasi lama.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // Percakapan
        // ------------------------------------------------------------------
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->cascadeOnDelete();

            $table->string('subject')->nullable();
            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();

            // Satu percakapan per pesanan untuk pasangan mitra–customer.
            $table->unique(['booking_id', 'customer_id', 'agent_profile_id'], 'conversations_booking_pair_unique');
            $table->index(['customer_id', 'last_message_at']);
            $table->index(['agent_profile_id', 'last_message_at']);
        });

        // ------------------------------------------------------------------
        // Pesan
        // ------------------------------------------------------------------
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')
                ->constrained('conversations')
                ->cascadeOnDelete();

            $table->foreignId('sender_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('sender_role', ['customer', 'mitra', 'admin'])
                ->default('customer');

            $table->text('body');

            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });

        // ------------------------------------------------------------------
        // Balasan ulasan oleh mitra
        // ------------------------------------------------------------------
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'reply')) {
                $table->text('reply')->nullable()->after('moderation_note');
            }
            if (!Schema::hasColumn('reviews', 'replied_at')) {
                $table->timestamp('replied_at')->nullable()->after('reply');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'replied_at')) {
                $table->dropColumn('replied_at');
            }
            if (Schema::hasColumn('reviews', 'reply')) {
                $table->dropColumn('reply');
            }
        });

        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
    }
};
