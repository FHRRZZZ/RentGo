<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel domain PEMBAYARAN: pembayaran, refund, transaksi, komisi, payout mitra.
 *
 * Digabung dari:
 * - create_payments_table
 * - add_bank_transfer_method_to_payments_table
 * - create_refunds_table
 * - create_transactions_table
 * - create_transaction_commissions_table
 * - create_agent_payouts_table
 */
return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // Pembayaran
        // ------------------------------------------------------------------
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->string('payment_number')->unique();

            $table->enum('payment_method', [
                'cash',
                'qris',
                'bank_transfer',
            ]);

            // Virtual Account (bank transfer).
            $table->string('va_number', 40)->nullable();
            $table->string('bank_code', 20)->nullable();
            $table->integer('unique_code')->nullable();

            $table->decimal('amount', 15, 2);

            $table->enum('status', [
                'pending',
                'paid',
                'failed',
                'expired',
                'cancelled',
            ])->default('pending');

            $table->string('proof_file_path')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('verified_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['payment_method', 'status']);
        });

        // ------------------------------------------------------------------
        // Refund
        // ------------------------------------------------------------------
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('payment_id')
                ->constrained('payments')
                ->restrictOnDelete();

            $table->string('refund_number')->unique();
            $table->decimal('amount', 15, 2);
            $table->text('reason')->nullable();

            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'failed',
                'cancelled',
            ])->default('pending');

            $table->timestamp('refunded_at')->nullable();

            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['payment_id', 'status']);
        });

        // ------------------------------------------------------------------
        // Transaksi
        // ------------------------------------------------------------------
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->unique()
                ->constrained('bookings')
                ->restrictOnDelete();

            $table->foreignId('customer_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            $table->string('transaction_number')->unique();

            $table->decimal('rental_amount', 15, 2);
            $table->decimal('delivery_fee', 15, 2)->default(0);
            $table->decimal('service_fee', 15, 2)->default(0);
            $table->decimal('additional_fee', 15, 2)->default(0);

            $table->decimal('deposit_amount', 15, 2)->default(0);
            $table->decimal('deduction_amount', 15, 2)->default(0);
            $table->decimal('refund_amount', 15, 2)->default(0);

            $table->decimal('total_amount', 15, 2);

            $table->enum('status', [
                'pending',
                'completed',
                'cancelled',
                'refunded',
            ])->default('pending');

            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['customer_id', 'status']);
            $table->index(['agent_profile_id', 'status']);
            $table->index(['status', 'completed_at']);
        });

        // ------------------------------------------------------------------
        // Komisi transaksi
        // ------------------------------------------------------------------
        Schema::create('transaction_commissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transaction_id')
                ->unique()
                ->constrained('transactions')
                ->restrictOnDelete();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            $table->decimal('commission_base', 15, 2);
            $table->decimal('commission_percentage', 5, 2);
            $table->decimal('commission_amount', 15, 2);
            $table->decimal('net_amount', 15, 2);

            $table->enum('status', [
                'pending',
                'calculated',
                'paid',
                'cancelled',
            ])->default('pending');

            $table->timestamp('calculated_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['agent_profile_id', 'status']);
        });

        // ------------------------------------------------------------------
        // Payout mitra
        // ------------------------------------------------------------------
        Schema::create('agent_payouts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            $table->foreignId('transaction_id')
                ->constrained('transactions')
                ->restrictOnDelete();

            $table->foreignId('transaction_commission_id')
                ->constrained('transaction_commissions')
                ->restrictOnDelete();

            $table->string('payout_number')->unique();
            $table->decimal('amount', 15, 2);

            $table->enum('payout_method', [
                'bank_transfer',
                'cash',
            ]);

            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();

            $table->enum('status', [
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled',
            ])->default('pending');

            $table->timestamp('paid_at')->nullable();

            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['agent_profile_id', 'status']);
            $table->index(['transaction_id', 'status']);
            $table->index(['status', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_payouts');
        Schema::dropIfExists('transaction_commissions');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
    }
};
