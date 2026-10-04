<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel sistem PAJAK PEMASARAN MITRA.
 *
 * Setiap mitra dikenakan biaya pemasaran tetap sebesar Rp 75.000 per bulan
 * dari awal bergabung sampai seterusnya.
 * Jika tagihan jatuh tempo & belum dibayar, akun mitra dinonaktifkan otomatis.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_taxes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->cascadeOnDelete();

            // Nomor tagihan unik, format: MTX-YYYYMM-XXXXX
            $table->string('tax_number')->unique();

            // Periode penagihan (tahun & bulan)
            $table->year('billing_year');
            $table->unsignedTinyInteger('billing_month'); // 1–12

            // Nominal tagihan (default 75.000)
            $table->decimal('amount', 15, 2)->default(75000);

            $table->enum('status', [
                'unpaid',           // Belum dibayar
                'awaiting_review',  // Mitra sudah upload bukti, menunggu konfirmasi admin
                'paid',             // Lunas / dikonfirmasi admin
                'overdue',          // Jatuh tempo & belum dibayar → akun dinonaktifkan
                'waived',           // Dibebaskan oleh admin (misal: mitra baru bulan pertama)
            ])->default('unpaid');

            // Jatuh tempo: 7 hari setelah tagihan diterbitkan
            $table->date('due_date');

            // Bukti pembayaran yang diunggah mitra
            $table->string('proof_file_path')->nullable();
            $table->timestamp('proof_uploaded_at')->nullable();

            // Konfirmasi admin
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            // Pastikan hanya ada 1 tagihan per mitra per bulan
            $table->unique(['agent_profile_id', 'billing_year', 'billing_month'], 'unique_agent_billing_period');

            $table->index(['agent_profile_id', 'status']);
            $table->index(['status', 'due_date']);
            $table->index(['billing_year', 'billing_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_taxes');
    }
};
