<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();

            /*
             * User yang memiliki profile customer
             */
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            /*
             * Informasi kontak
             */
            $table->string('phone')->nullable();

            /*
             * Informasi identitas dasar
             */
            $table->string('identity_number')->nullable();

            $table->date('date_of_birth')->nullable();

            /*
             * Alamat customer
             */
            $table->text('address')->nullable();

            $table->string('city')->nullable();

            $table->string('province')->nullable();

            /*
             * Foto profil
             */
            $table->string('profile_photo_path')->nullable();

            /*
             * Status profile customer
             */
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
    }
};