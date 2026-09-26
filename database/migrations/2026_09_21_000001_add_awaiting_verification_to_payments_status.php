<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tambah status 'awaiting_verification' pada kolom enum payments.status.
 *
 * Alur pembayaran RentGo meminta customer mengunggah bukti bayar (QRIS /
 * transfer bank) yang kemudian diperiksa mitra. Status perantara itu bernilai
 * 'awaiting_verification' (lihat Payment::STATUS_AWAITING_VERIFICATION), namun
 * enum kolom 'status' pada migrasi awal belum memuatnya sehingga MySQL
 * men-truncate nilai tersebut (Warning 1265: Data truncated for column
 * 'status'). Migrasi ini melengkapi daftar enum agar penyimpanan status valid.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE `payments`
            MODIFY COLUMN `status`
            ENUM('pending', 'awaiting_verification', 'paid', 'failed', 'expired', 'cancelled')
            NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        // Kembalikan baris lama yang tidak lagi valid ke default sebelum
        // memperkecil enum agar tidak terjadi truncate/penolakan MODIFY COLUMN.
        DB::table('payments')
            ->where('status', 'awaiting_verification')
            ->update(['status' => 'pending']);

        DB::statement("
            ALTER TABLE `payments`
            MODIFY COLUMN `status`
            ENUM('pending', 'paid', 'failed', 'expired', 'cancelled')
            NOT NULL DEFAULT 'pending'
        ");
    }
};
