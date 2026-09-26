<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel pendukung: ulasan, komplain, sengketa (dispute), dan audit log.
 *
 * Digabung dari:
 * - create_reviews_table
 * - create_complaints_table
 * - create_disputes_table
 * - update_booking_and_dispute_statuses_and_add_payment_deadline (bagian disputes)
 * - create_audit_logs_table
 */
return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // Ulasan
        // ------------------------------------------------------------------
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->unsignedTinyInteger('rating');
            $table->text('review')->nullable();

            $table->enum('status', [
                'pending',
                'published',
                'hidden',
                'rejected',
            ])->default('pending');

            $table->timestamp('published_at')->nullable();
            $table->text('moderation_note')->nullable();

            $table->foreignId('moderated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->unique(['booking_id', 'customer_id']);
            $table->index(['vehicle_id', 'status']);
            $table->index(['agent_profile_id', 'status']);
            $table->index(['customer_id', 'status']);
        });

        // ------------------------------------------------------------------
        // Komplain
        // ------------------------------------------------------------------
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('complainant_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('reported_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('subject');
            $table->text('description');

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

            $table->json('attachments')->nullable();

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent',
            ])->default('medium');

            $table->enum('status', [
                'open',
                'in_review',
                'resolved',
                'rejected',
                'closed',
            ])->default('open');

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['complainant_id', 'status']);
            $table->index(['reported_user_id', 'status']);
            $table->index(['status', 'priority']);
        });

        // ------------------------------------------------------------------
        // Sengketa (dispute)
        // ------------------------------------------------------------------
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->nullable()
                ->constrained('bookings')
                ->nullOnDelete();

            $table->foreignId('initiator_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('respondent_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('subject');
            $table->text('description');

            $table->enum('category', [
                'vehicle_damage',
                'payment',
                'refund',
                'booking',
                'cancellation',
                'deposit',
                'other',
            ])->default('other');

            $table->json('attachments')->nullable();

            // Status lengkap sesuai PRD.
            $table->enum('status', [
                'open',
                'investigating',
                'under_review',
                'awaiting_response',
                'waiting_customer',
                'waiting_agent',
                'resolved',
                'rejected',
                'closed',
            ])->default('open');

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('resolution')->nullable();

            $table->enum('resolution_party', [
                'initiator',
                'respondent',
                'shared',
                'none',
            ])->nullable();

            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->timestamp('resolved_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['initiator_id', 'status']);
            $table->index(['respondent_id', 'status']);
            $table->index(['status', 'category']);
        });

        // ------------------------------------------------------------------
        // Audit log
        // ------------------------------------------------------------------
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('action');
            $table->string('module')->nullable();

            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();

            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'action']);
            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['module', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('reviews');
    }
};
