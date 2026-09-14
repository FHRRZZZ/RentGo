<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_commissions', function (Blueprint $table) {
            $table->id();

            /*
             * Transaksi yang menjadi dasar komisi
             */
            $table->foreignId('transaction_id')
                ->unique()
                ->constrained('transactions')
                ->restrictOnDelete();

            /*
             * Agent yang menerima pendapatan
             */
            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->restrictOnDelete();

            /*
             * Nilai rental yang menjadi dasar komisi
             *
             * Tidak termasuk:
             * - deposit
             * - delivery fee
             */
            $table->decimal('commission_base_amount', 15, 2);

            /*
             * Persentase komisi platform
             *
             * Contoh: 10.00 = 10%
             */
            $table->decimal('commission_percentage', 5, 2);

            /*
             * Nominal komisi platform
             */
            $table->decimal('commission_amount', 15, 2);

            /*
             * Pendapatan bersih agent
             */
            $table->decimal('agent_net_amount', 15, 2);

            /*
             * Status komisi
             */
            $table->enum('status', [
                'pending',
                'calculated',
                'paid',
                'cancelled',
            ])->default('pending');

            /*
             * Waktu komisi dihitung
             */
            $table->timestamp('calculated_at')->nullable();

            /*
             * Catatan
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
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_commissions');
    }
};