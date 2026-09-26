<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel domain UNIT (kendaraan): kategori, unit, foto, dokumen,
 * ketersediaan, dan harga. Semua dalam satu file migrasi "unit".
 *
 * Digabung dari:
 * - create_vehicle_categories_table
 * - create_vehicles_table
 * - create_vehicle_photos_table
 * - add_media_type_to_vehicle_photos_table
 * - create_vehicle_documents_table
 * - create_vehicle_availabilities_table
 * - create_vehicle_prices_table
 */
return new class extends Migration
{
    public function up(): void
    {
        // ------------------------------------------------------------------
        // Kategori kendaraan
        // ------------------------------------------------------------------
        Schema::create('vehicle_categories', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });

        // ------------------------------------------------------------------
        // Unit kendaraan
        // ------------------------------------------------------------------
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

        // ------------------------------------------------------------------
        // Foto / media unit
        // ------------------------------------------------------------------
        Schema::create('vehicle_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->string('file_path');
            $table->string('media_type')->default('image');
            $table->string('caption')->nullable();

            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);

            $table->timestamps();
        });

        // ------------------------------------------------------------------
        // Dokumen unit (STNK, pajak, dll.)
        // ------------------------------------------------------------------
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->string('document_type');
            $table->string('document_number')->nullable();
            $table->string('file_path');

            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'expired',
            ])->default('pending');

            $table->text('rejection_reason')->nullable();

            $table->timestamps();
        });

        // ------------------------------------------------------------------
        // Ketersediaan unit
        // ------------------------------------------------------------------
        Schema::create('vehicle_availabilities', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->date('start_date');
            $table->date('end_date');

            $table->enum('status', [
                'available',
                'unavailable',
                'maintenance',
            ])->default('available');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index([
                'vehicle_id',
                'start_date',
                'end_date',
            ]);
        });

        // ------------------------------------------------------------------
        // Harga unit
        // ------------------------------------------------------------------
        Schema::create('vehicle_prices', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnDelete();

            $table->decimal('price_per_day', 15, 2);

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index([
                'vehicle_id',
                'start_date',
                'end_date',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_prices');
        Schema::dropIfExists('vehicle_availabilities');
        Schema::dropIfExists('vehicle_documents');
        Schema::dropIfExists('vehicle_photos');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('vehicle_categories');
    }
};
