<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_payouts', function (Blueprint $table) {
            $table->id();

            /*
             * Agent penerima payout
             */
            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            /*
             * Transaksi yang menjadi sumber payout
             */
            $table->foreignId('transaction_id')
                ->constrained('transactions')
                ->restrictOnDelete();

            /*
             * Komisi transaksi
             */
            $table->foreignId('transaction_commission_id')
                ->constrained('transaction_commissions')
                ->restrictOnDelete();

            /*
             * Nomor payout
             */
            $table->string('payout_number')->unique();

            /*
             * Jumlah yang dibayarkan kepada agent
             */
            $table->decimal('amount', 15, 2);

            /*
             * Metode pencairan
             *
             * Contoh:
             * bank_transfer
             * cash
             */
            $table->enum('payout_method', [
                'bank_transfer',
                'cash',
            ]);

            /*
             * Informasi rekening / tujuan payout.
             *
             * Tidak wajib diisi jika metode cash.
             */
            $table->string('account_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();

            /*
             * Status payout
             */
            $table->enum('status', [
                'pending',
                'processing',
                'paid',
                'failed',
                'cancelled',
            ])->default('pending');

            /*
             * Waktu payout berhasil
             */
            $table->timestamp('paid_at')->nullable();

            /*
             * User yang memproses payout
             *
             * Biasanya Management/Admin.
             */
            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Catatan payout
             */
            $table->text('notes')->nullable();

            $table->timestamps();

            /*
             * Index
             */
            $table->index([
                'agent_profile_id',
                'status',
            ]);

            $table->index([
                'transaction_id',
                'status',
            ]);

            $table->index([
                'status',
                'paid_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_payouts');
    }
};