<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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

            $table->enum('onboarding_status', [
                'pending_verification',
                'approved',
                'rejected',
                'suspended',
            ])->default('pending_verification');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};