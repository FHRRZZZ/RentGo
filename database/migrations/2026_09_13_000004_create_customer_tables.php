<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel domain CUSTOMER (penyewa): profil penyewa dan dokumen verifikasinya.
 *
 * Digabung dari:
 * - create_customer_profiles_table
 * - create_customer_documents_table
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('phone')->nullable();
            $table->string('identity_number')->nullable();
            $table->date('date_of_birth')->nullable();

            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();

            $table->string('profile_photo_path')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        Schema::create('customer_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_profile_id')
                ->constrained('customer_profiles')
                ->cascadeOnDelete();

            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->string('file_path');

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'expired',
            ])->default('pending');

            $table->timestamp('verified_at')->nullable();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('rejection_reason')->nullable();
            $table->date('expires_at')->nullable();

            $table->timestamps();

            $table->index(['customer_profile_id', 'status']);
            $table->index(['status', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_documents');
        Schema::dropIfExists('customer_profiles');
    }
};
