<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel domain MITRA (agent): profil mitra beserta dokumen verifikasinya.
 *
 * Digabung dari:
 * - create_agent_profiles_table
 * - create_agent_documents_table
 * - add_bank_account_to_agent_profiles_table
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('phone')->nullable();

            $table->string('agency_name')->nullable();
            $table->string('business_type')->nullable();

            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();

            $table->text('description')->nullable();

            // Rekening pencairan payout mitra.
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();

            $table->enum('onboarding_status', [
                'pending_verification',
                'approved',
                'rejected',
                'suspended',
            ])->default('pending_verification');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        Schema::create('agent_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->cascadeOnDelete();

            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->string('file_path');

            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'suspended',
            ])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_documents');
        Schema::dropIfExists('agent_profiles');
    }
};
