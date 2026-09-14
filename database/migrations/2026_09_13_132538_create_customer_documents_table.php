<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();

            /*
             * Customer pemilik dokumen
             */
            $table->foreignId('customer_profile_id')
                ->constrained('customer_profiles')
                ->cascadeOnDelete();

            /*
             * Jenis dokumen
             *
             * Contoh:
             * KTP, SIM, Passport
             */
            $table->string('document_type');

            /*
             * Nomor dokumen
             */
            $table->string('document_number')->nullable();

            /*
             * Lokasi file dokumen
             *
             * Sebaiknya disimpan pada
             * private storage.
             */
            $table->string('file_path');

            /*
             * Status verifikasi
             */
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'expired',
            ])->default('pending');

            /*
             * Waktu verifikasi
             */
            $table->timestamp('verified_at')->nullable();

            /*
             * User yang melakukan verifikasi
             *
             * Biasanya Management/Admin.
             */
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Alasan jika dokumen ditolak
             */
            $table->text('rejection_reason')->nullable();

            /*
             * Masa berlaku dokumen
             */
            $table->date('expires_at')->nullable();

            $table->timestamps();

            /*
             * Index untuk proses verifikasi
             */
            $table->index([
                'customer_profile_id',
                'status',
            ]);

            $table->index([
                'status',
                'expires_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');
    }
};