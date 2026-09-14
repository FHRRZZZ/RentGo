<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }
};