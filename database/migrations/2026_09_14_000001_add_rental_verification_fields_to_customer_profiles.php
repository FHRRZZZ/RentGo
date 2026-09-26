<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambahan data verifikasi sewa yang sebelumnya hilang saat halaman
 * "Lengkapi Data" (Dokumen Sewa) dimuat ulang:
 * - Jenis SIM (SIM A / SIM C / Internasional)
 * - Kontak darurat (nama, hubungan, nomor telepon)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_profiles', function (Blueprint $table) {
            $table->string('sim_type')->nullable()->after('identity_number');
            $table->string('emergency_name')->nullable()->after('sim_type');
            $table->string('emergency_relation')->nullable()->after('emergency_name');
            $table->string('emergency_phone')->nullable()->after('emergency_relation');
        });
    }

    public function down(): void
    {
        Schema::table('customer_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'sim_type',
                'emergency_name',
                'emergency_relation',
                'emergency_phone',
            ]);
        });
    }
};
