<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('agent_profile_id')
                ->constrained('agent_profiles')
                ->cascadeOnDelete();

            $table->foreignId('vehicle_category_id')
                ->constrained('vehicle_categories')
                ->restrictOnDelete();

            $table->enum('vehicle_type', [
                'car',
                'motorcycle',
            ]);

            $table->string('name');
            $table->string('slug')->unique();

            $table->string('brand')->nullable();
            $table->string('model')->nullable();

            $table->year('year')->nullable();

            $table->string('license_plate')->unique();

            $table->string('transmission')->nullable();
            $table->unsignedTinyInteger('seat_capacity')->nullable();
            $table->string('fuel_type')->nullable();
            $table->string('color')->nullable();

            $table->text('description')->nullable();

            $table->string('pickup_location')->nullable();
            $table->text('rental_requirements')->nullable();

            $table->enum('status', [
                'draft',
                'pending_review',
                'available',
                'booked',
                'rented',
                'maintenance',
                'inactive',
                'rejected',
            ])->default('draft');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};