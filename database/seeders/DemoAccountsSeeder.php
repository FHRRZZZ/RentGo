<?php

namespace Database\Seeders;

use App\Models\AgentDocument;
use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

/**
 * Membuat 3 akun demo berdasarkan 3 role:
 *  - admin
 *  - mitra (agent)
 *  - customer
 *
 * Password semua akun: "password"
 * Aman dijalankan berulang (idempotent) karena memakai updateOrCreate.
 */
class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'name' => 'Admin RentGo',
                'email' => 'admin@rentgo.test',
                'role' => 'admin',
            ],
            [
                'name' => 'Mitra RentGo',
                'email' => 'mitra@rentgo.test',
                'role' => 'mitra',
            ],
            [
                'name' => 'Customer RentGo',
                'email' => 'customer@rentgo.test',
                'role' => 'customer',
            ],
        ];

        foreach ($accounts as $account) {
            // Pastikan role tersedia (seeder ini boleh dijalankan sendiri).
            $role = Role::firstOrCreate([
                'name' => $account['role'],
                'guard_name' => 'web',
            ]);

            $user = User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => 'password', // otomatis di-hash oleh cast model
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles([$role]);

            // Akun mitra wajib memiliki AgentProfile, jika tidak akses
            // dashboard mitra akan gagal dengan 403 "Profil mitra tidak ditemukan."
            if ($account['role'] === 'mitra') {
                $profile = AgentProfile::updateOrCreate(
                    ['user_id' => $user->id],
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
                    AgentDocument::updateOrCreate(
                        [
                            'agent_profile_id' => $profile->id,
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
            }

            $this->command?->info("Akun {$account['role']} dibuat: {$account['email']} / password");
        }
    }
}
