<?php

namespace Database\Seeders;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RentGoSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        $admin = User::firstOrCreate(
            ['email' => 'admin@rentgo.test'],
            [
                'name' => 'Admin RentGo',
                'password' => Hash::make('password'),
            ]
        );

        $admin->syncRoles(['admin']);

        /*
        |--------------------------------------------------------------------------
        | MITRA
        |--------------------------------------------------------------------------
        */

        $mitra = User::firstOrCreate(
            ['email' => 'mitra@rentgo.test'],
            [
                'name' => 'Mitra RentGo',
                'password' => Hash::make('password'),
            ]
        );

        $mitra->syncRoles(['mitra']);

        /*
        |--------------------------------------------------------------------------
        | CUSTOMER
        |--------------------------------------------------------------------------
        */

        $customer = User::firstOrCreate(
            ['email' => 'customer@rentgo.test'],
            [
                'name' => 'Customer RentGo',
                'password' => Hash::make('password'),
            ]
        );

        $customer->syncRoles(['customer']);

        /*
        |--------------------------------------------------------------------------
        | MITRA PROFILE
        |--------------------------------------------------------------------------
        */

        $agentProfile = AgentProfile::firstOrCreate(
            ['user_id' => $mitra->id],
            [
                'phone' => '081234567890',
                'agency_name' => 'RentGo Motor & Car',
                'business_type' => 'Rental Kendaraan',
                'address' => 'Jakarta',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'description' => 'Mitra rental kendaraan RentGo.',
                'onboarding_status' => 'approved',
                'is_active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | VEHICLE CATEGORIES
        |--------------------------------------------------------------------------
        */

        $carCategory = VehicleCategory::firstOrCreate(
            ['slug' => 'mobil'],
            [
                'name' => 'Mobil',
                'description' => 'Kategori kendaraan roda empat.',
                'is_active' => true,
            ]
        );

        $motorcycleCategory = VehicleCategory::firstOrCreate(
            ['slug' => 'motor'],
            [
                'name' => 'Motor',
                'description' => 'Kategori kendaraan roda dua.',
                'is_active' => true,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | VEHICLES
        |--------------------------------------------------------------------------
        */

        Vehicle::firstOrCreate(
            ['slug' => 'toyota-avanza'],
            [
                'agent_profile_id' => $agentProfile->id,
                'vehicle_category_id' => $carCategory->id,
                'vehicle_type' => 'car',
                'name' => 'Toyota Avanza',
                'brand' => 'Toyota',
                'model' => 'Avanza',
                'year' => 2024,
                'license_plate' => 'B 1234 RGO',
                'transmission' => 'Automatic',
                'seat_capacity' => 7,
                'fuel_type' => 'Bensin',
                'color' => 'Hitam',
                'description' => 'Toyota Avanza nyaman untuk perjalanan keluarga.',
                'pickup_location' => 'Jakarta',
                'rental_requirements' => 'KTP dan SIM wajib diserahkan saat pengambilan.',
                'status' => 'available',
            ]
        );

        Vehicle::firstOrCreate(
            ['slug' => 'honda-vario-160'],
            [
                'agent_profile_id' => $agentProfile->id,
                'vehicle_category_id' => $motorcycleCategory->id,
                'vehicle_type' => 'motorcycle',
                'name' => 'Honda Vario 160',
                'brand' => 'Honda',
                'model' => 'Vario 160',
                'year' => 2024,
                'license_plate' => 'B 5678 RGO',
                'transmission' => 'Automatic',
                'seat_capacity' => 2,
                'fuel_type' => 'Bensin',
                'color' => 'Merah',
                'description' => 'Honda Vario 160 cocok untuk mobilitas dalam kota.',
                'pickup_location' => 'Jakarta',
                'rental_requirements' => 'KTP dan SIM wajib diserahkan saat pengambilan.',
                'status' => 'available',
            ]
        );

        $this->command->info('RentGo development data berhasil dibuat.');
        $this->command->info('Admin    : admin@rentgo.test / password');
        $this->command->info('Mitra    : mitra@rentgo.test / password');
        $this->command->info('Customer : customer@rentgo.test / password');
    }
}