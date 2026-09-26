<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tambah koordinat presisi titik serah terima pada pemesanan.
 *
 * Kolom pickup_* dipakai untuk metode "Ambil Sendiri" (customer menunjuk titik
 * lokasi persisnya di peta, mis. depan lobby hotel), sedangkan delivery_*
 * untuk metode "Diantarkan" (titik alamat pengantaran). Kolom teks
 * pickup_location & delivery_address tetap dipertahankan sebagai alamat
 * yang bisa dibaca manusia.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('pickup_latitude', 10, 7)->nullable()->after('pickup_location');
            $table->decimal('pickup_longitude', 10, 7)->nullable()->after('pickup_latitude');

            $table->decimal('delivery_latitude', 10, 7)->nullable()->after('delivery_address');
            $table->decimal('delivery_longitude', 10, 7)->nullable()->after('delivery_latitude');

            // Catatan titik: patokan/detail lokasi (mis. "depan lobby, sebelah Indomaret").
            $table->string('pickup_landmark')->nullable()->after('pickup_longitude');
            $table->string('delivery_landmark')->nullable()->after('delivery_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_latitude',
                'pickup_longitude',
                'pickup_landmark',
                'delivery_latitude',
                'delivery_longitude',
                'delivery_landmark',
            ]);
        });
    }
};
