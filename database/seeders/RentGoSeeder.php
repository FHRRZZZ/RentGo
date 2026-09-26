<?php

namespace Database\Seeders;

use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
                'address' => 'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                // Koordinat presisi lokasi usaha (Kemang, Jakarta Selatan) agar
                // tampil sebagai pin akurat di peta "Sekitar Kita".
                'latitude' => -6.2615,
                'longitude' => 106.8106,
                'description' => 'Mitra rental kendaraan RentGo.',
                'onboarding_status' => 'approved',
                'is_active' => true,
            ]
        );

        // Dokumen legal wajib mitra (KTP & NIB). Tanpa dokumen ini,
        // ComplianceService menganggap profil belum lengkap sehingga CRUD
        // unit di portal mitra akan selalu ditolak server-side.
        foreach (['ktp', 'nib'] as $documentType) {
            AgentDocument::firstOrCreate(
                [
                    'agent_profile_id' => $agentProfile->id,
                    'document_type' => $documentType,
                ],
                [
                    'document_number' => '-',
                    'file_path' => 'agent-documents/demo-' . $documentType . '.pdf',
                    'status' => 'approved',
                    'verified_at' => now(),
                ]
            );
        }

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

        $avanza = Vehicle::firstOrCreate(
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

        $vario = Vehicle::firstOrCreate(
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

        $xpander = Vehicle::firstOrCreate(
            ['slug' => 'mitsubishi-xpander'],
            [
                'agent_profile_id' => $agentProfile->id,
                'vehicle_category_id' => $carCategory->id,
                'vehicle_type' => 'car',
                'name' => 'Mitsubishi Xpander Ultimate',
                'brand' => 'Mitsubishi',
                'model' => 'Xpander',
                'year' => 2024,
                'license_plate' => 'B 9876 RGO',
                'transmission' => 'Automatic',
                'seat_capacity' => 7,
                'fuel_type' => 'Bensin',
                'color' => 'Putih',
                'description' => 'MPV premium dengan suspensi nyaman dan kabin senyap.',
                'pickup_location' => 'Jakarta',
                'rental_requirements' => 'KTP dan SIM A wajib saat serah terima unit.',
                'status' => 'available',
            ]
        );

        $nmax = Vehicle::firstOrCreate(
            ['slug' => 'yamaha-nmax-155'],
            [
                'agent_profile_id' => $agentProfile->id,
                'vehicle_category_id' => $motorcycleCategory->id,
                'vehicle_type' => 'motorcycle',
                'name' => 'Yamaha NMAX 155 Connected',
                'brand' => 'Yamaha',
                'model' => 'NMAX 155',
                'year' => 2024,
                'license_plate' => 'B 4321 RGO',
                'transmission' => 'Automatic',
                'seat_capacity' => 2,
                'fuel_type' => 'Bensin',
                'color' => 'Hitam Matte',
                'description' => 'Maxi skuter bertenaga dengan bagasi luas untuk perjalanan harian.',
                'pickup_location' => 'Jakarta',
                'rental_requirements' => 'KTP dan SIM C aktif wajib disiapkan.',
                'status' => 'available',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | FOTO KENDARAAN
        |--------------------------------------------------------------------------
        | Unit demo harus punya foto asli (bukan gambar dummy) supaya tampil
        | di halaman customer. Foto dibuat lokal via GD lalu disimpan ke disk
        | "public" agar dapat diakses lewat /storage.
        */
        $this->seedPhoto($avanza, 'Toyota Avanza', '#1f2937');
        $this->seedPhoto($vario, 'Honda Vario 160', '#b91c1c');
        $this->seedPhoto($xpander, 'Mitsubishi Xpander', '#2563eb');
        $this->seedPhoto($nmax, 'Yamaha NMAX 155', '#0f172a');

        /*
        |--------------------------------------------------------------------------
        | HARGA SEWA
        |--------------------------------------------------------------------------
        | Tanpa harga aktif, unit tidak akan tampil pada pencarian berbasis tanggal.
        */
        $this->seedPrice($avanza, 350000);
        $this->seedPrice($vario, 90000);
        $this->seedPrice($xpander, 450000);
        $this->seedPrice($nmax, 130000);

        $this->command->info('RentGo development data berhasil dibuat.');
        $this->command->info('Admin    : admin@rentgo.test / password');
        $this->command->info('Mitra    : mitra@rentgo.test / password');
        $this->command->info('Customer : customer@rentgo.test / password');
    }

    /**
     * Buat & lampirkan satu foto utama untuk kendaraan.
     * Idempotent: tidak membuat ulang bila foto sudah ada.
     */
    private function seedPhoto(Vehicle $vehicle, string $label, string $hexColor): void
    {
        if ($vehicle->photos()->exists()) {
            return;
        }

        $relativePath = 'vehicles/' . $vehicle->id . '/photos/demo.png';
        $disk = Storage::disk('public');

        if (!$disk->exists($relativePath) && function_exists('imagecreatetruecolor')) {
            [$r, $g, $b] = sscanf($hexColor, '#%02x%02x%02x');

            $image = imagecreatetruecolor(900, 600);
            $bg = imagecolorallocate($image, $r, $g, $b);
            $fg = imagecolorallocate($image, 245, 184, 0);
            imagefill($image, 0, 0, $bg);

            // Kotak aksen + label nama kendaraan.
            imagefilledrectangle($image, 0, 520, 900, 600, $fg);
            imagestring($image, 5, 30, 545, $label, imagecolorallocate($image, 17, 17, 17));

            ob_start();
            imagepng($image);
            $binary = ob_get_clean();
            imagedestroy($image);

            $disk->put($relativePath, $binary);
        }

        $vehicle->photos()->create([
            'file_path' => $relativePath,
            'media_type' => 'image',
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }

    /**
     * Lampirkan harga sewa harian aktif bila belum ada.
     */
    private function seedPrice(Vehicle $vehicle, float $pricePerDay): void
    {
        if ($vehicle->prices()->exists()) {
            return;
        }

        $vehicle->prices()->create([
            'price_per_day' => $pricePerDay,
            'is_active' => true,
        ]);
    }
}