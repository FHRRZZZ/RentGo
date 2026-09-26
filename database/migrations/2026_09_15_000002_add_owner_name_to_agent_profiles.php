<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah kolom owner_name (nama pemilik / penanggung jawab) pada profil mitra.
 *
 * Kolom ini sudah dikirim oleh form pengajuan mitra (StoreMitraApplicationRequest)
 * dan form profil mitra, namun belum pernah ada di tabel sehingga datanya hilang
 * saat disimpan. Ditambahkan di sini agar nama pemilik benar-benar tersimpan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->string('owner_name')->nullable()->after('agency_name');
        });
    }

    public function down(): void
    {
        Schema::table('agent_profiles', function (Blueprint $table) {
            $table->dropColumn('owner_name');
        });
    }
};
