<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Data pribadi customer harus benar-benar tersimpan saat disimpan dari
 * halaman /profile (tab "Informasi Akun" dan "Dokumen Sewa (KTP & SIM)").
 */
class CustomerProfileFromProfilePageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    private function customer(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        return $user;
    }

    public function test_profile_page_shares_customer_profile_to_frontend(): void
    {
        $user = $this->customer();
        $user->customerProfile()->create([
            'phone' => '081234567890',
            'identity_number' => '3201234567890001',
        ]);

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
        $response->assertInertia(
            fn($page) => $page
                ->component('Profile/Edit')
                ->where('auth.role', 'customer')
                ->where('customerProfile.phone', '081234567890')
        );
    }

    public function test_customer_personal_data_is_persisted_from_informasi_akun(): void
    {
        $user = $this->customer();

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => 'Penyewa RentGo',
            'email' => 'penyewa@example.com',
            'phone' => '081298765432',
            'identity_number' => '3201234567890002',
            'date_of_birth' => '1995-05-20',
            'address' => 'Jl. Merdeka No. 10',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect('/profile');

        $profile = $user->fresh()->customerProfile;

        $this->assertNotNull($profile, 'customer_profiles harus dibuat otomatis.');
        $this->assertSame('081298765432', $profile->phone);
        $this->assertSame('3201234567890002', $profile->identity_number);
        $this->assertSame('1995-05-20', $profile->date_of_birth->toDateString());
        $this->assertSame('Jl. Merdeka No. 10', $profile->address);
        $this->assertSame('Bandung', $profile->city);
        $this->assertSame('Jawa Barat', $profile->province);
    }

    public function test_existing_profile_is_updated_not_duplicated(): void
    {
        $user = $this->customer();
        $user->customerProfile()->create(['phone' => '0811111']);

        $this->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '0822222',
                'city' => 'Surabaya',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame(1, $user->customerProfile()->count());
        $this->assertSame('0822222', $user->fresh()->customerProfile->phone);
    }

    public function test_saving_documents_does_not_wipe_existing_personal_data(): void
    {
        Storage::fake('private');

        $user = $this->customer();
        $user->customerProfile()->create([
            'phone' => '081200000',
            'identity_number' => '3201234567890005',
            'date_of_birth' => '1992-02-02',
            'address' => 'Jl. Lama No. 5',
            'city' => 'Medan',
            'province' => 'Sumatera Utara',
        ]);

        // Submit hanya dari tab "Dokumen Sewa": tidak mengirim city/province
        // maupun date_of_birth. Data lama tidak boleh hilang.
        $this->actingAs($user)
            ->post('/profile', [
                '_method' => 'patch',
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '081200000',
                'identity_number' => '3201234567890005',
                'address' => 'Jl. Lama No. 5',
                'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
                'sim_file' => UploadedFile::fake()->image('sim.jpg'),
                'sim_number' => '1234-5678-9012',
                'sim_expires_at' => '2030-01-01',
            ])
            ->assertSessionHasNoErrors();

        $profile = $user->fresh()->customerProfile;

        // Data yang tidak dikirim harus tetap utuh.
        $this->assertSame('1992-02-02', $profile->date_of_birth?->toDateString());
        $this->assertSame('Medan', $profile->city);
        $this->assertSame('Sumatera Utara', $profile->province);
    }

    public function test_updating_profile_info_does_not_deactivate_account(): void
    {
        $user = $this->customer();
        $user->customerProfile()->create([
            'phone' => '0811111',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->patch('/customer-profiles/' . $user->customerProfile->id, [
                'phone' => '0822222',
            ])
            ->assertSessionHasNoErrors();

        $profile = $user->fresh()->customerProfile;

        $this->assertSame('0822222', $profile->phone);
        $this->assertTrue((bool) $profile->is_active, 'is_active tidak boleh berubah saat tidak dikirim.');
    }

    public function test_duplicate_identity_number_is_rejected(): void
    {
        $other = $this->customer();
        $other->customerProfile()->create(['identity_number' => '3201234567890009']);

        $user = $this->customer();

        $this->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => $user->email,
                'identity_number' => '3201234567890009',
            ])
            ->assertSessionHasErrors('identity_number');

        $this->assertNull($user->fresh()->customerProfile);
    }

    public function test_ktp_and_sim_documents_are_stored_from_dokumen_sewa_tab(): void
    {
        Storage::fake('private');

        $user = $this->customer();

        $this->actingAs($user)
            ->post('/profile', [
                '_method' => 'patch',
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '081200112233',
                'identity_number' => '3201234567890003',
                'address' => 'Jl. Sudirman No. 1',
                'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
                'sim_file' => UploadedFile::fake()->image('sim.jpg'),
                'sim_number' => '1234-5678-9012',
                'sim_expires_at' => '2030-01-01',
            ])
            ->assertSessionHasNoErrors();

        $profile = $user->fresh()->customerProfile;

        $this->assertNotNull($profile);
        $this->assertSame('3201234567890003', $profile->identity_number);

        $ktp = $profile->documents()->where('document_type', 'ktp')->first();
        $sim = $profile->documents()->where('document_type', 'sim')->first();

        $this->assertNotNull($ktp, 'Dokumen KTP harus tersimpan.');
        $this->assertNotNull($sim, 'Dokumen SIM harus tersimpan.');

        $this->assertSame('pending', $ktp->status);
        $this->assertSame('3201234567890003', $ktp->document_number);
        $this->assertSame('1234-5678-9012', $sim->document_number);
        $this->assertSame('2030-01-01', $sim->expires_at->toDateString());

        Storage::disk('private')->assertExists($ktp->file_path);
        Storage::disk('private')->assertExists($sim->file_path);
    }

    public function test_rental_verification_fields_are_persisted_and_reloaded(): void
    {
        Storage::fake('private');

        $user = $this->customer();

        // Simpan dari tab "Dokumen Sewa" (persis seperti form mengirim).
        $this->actingAs($user)->post('/profile', [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '081200998877',
            'identity_number' => '3201234567890099',
            'address' => 'Jl. Merdeka No. 99',
            'sim_type' => 'SIM C (Motor)',
            'emergency_name' => 'Siti Aminah',
            'emergency_relation' => 'Orang Tua',
            'emergency_phone' => '082199887766',
            'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
            'sim_file' => UploadedFile::fake()->image('sim.jpg'),
            'sim_number' => '1234-5678-9012',
            'sim_expires_at' => '2030-01-01',
        ])->assertSessionHasNoErrors();

        $profile = $user->fresh()->customerProfile;

        $this->assertSame('SIM C (Motor)', $profile->sim_type);
        $this->assertSame('Siti Aminah', $profile->emergency_name);
        $this->assertSame('Orang Tua', $profile->emergency_relation);
        $this->assertSame('082199887766', $profile->emergency_phone);

        // Buka ulang halaman: data harus tersedia untuk mengisi ulang form
        // (tanpa ini, isian hilang saat pengguna kembali ke halaman).
        $this->actingAs($user)->get('/profile')->assertInertia(
            fn ($page) => $page
                ->where('customerProfile.sim_type', 'SIM C (Motor)')
                ->where('customerProfile.emergency_name', 'Siti Aminah')
                ->where('customerProfile.emergency_relation', 'Orang Tua')
                ->where('customerProfile.emergency_phone', '082199887766')
                ->where('customerDocuments.0.document_type', 'ktp')
                ->has('customerDocuments', 2)
        );
    }

    public function test_sim_metadata_updates_without_reuploading_photo(): void
    {
        Storage::fake('private');

        $user = $this->customer();

        $this->actingAs($user)->post('/profile', [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '081200112233',
            'identity_number' => '3201234567890088',
            'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
            'sim_file' => UploadedFile::fake()->image('sim.jpg'),
            'sim_number' => '1111-2222-3333',
            'sim_expires_at' => '2030-01-01',
        ])->assertSessionHasNoErrors();

        // Simpan ulang tanpa memilih file baru: hanya nomor & masa berlaku
        // SIM yang diubah, file lama tetap ada.
        $this->actingAs($user)->post('/profile', [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '081200112233',
            'identity_number' => '3201234567890088',
            'sim_number' => '9999-8888-7777',
            'sim_expires_at' => '2032-12-31',
        ])->assertSessionHasNoErrors();

        $sim = $user->fresh()->customerProfile->documents()
            ->where('document_type', 'sim')
            ->first();

        $this->assertSame('9999-8888-7777', $sim->document_number);
        $this->assertSame('2032-12-31', $sim->expires_at->toDateString());
        Storage::disk('private')->assertExists($sim->file_path);
    }

    public function test_saving_documents_removes_all_compliance_blockers(): void
    {
        Storage::fake('private');

        $user = $this->customer();
        $complianceService = app(\App\Services\ComplianceService::class);

        // Sebelum mengisi apa pun, customer belum boleh memesan.
        $before = $complianceService->customerStatus($user);
        $this->assertFalse($before['complete']);
        $this->assertContains('Profil penyewa (data diri dasar)', $before['missing_profile']);
        $this->assertContains('Kartu Tanda Penduduk (KTP)', $before['missing_documents']);
        $this->assertContains('Surat Izin Mengemudi (SIM)', $before['missing_documents']);

        $this->actingAs($user)->post('/profile', [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '081200112233',
            'identity_number' => '3201234567890004',
            'date_of_birth' => '1990-01-01',
            'address' => 'Jl. Asia Afrika No. 2',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
            'sim_file' => UploadedFile::fake()->image('sim.jpg'),
            'sim_number' => '9876-5432-1098',
            'sim_expires_at' => '2031-01-01',
        ])->assertSessionHasNoErrors();

        $after = $complianceService->customerStatus($user->fresh());

        // Semua penghalang hilang: tidak ada data profil maupun dokumen
        // yang masih kurang / ditolak.
        $this->assertSame([], $after['missing_profile'], 'Data profil tidak boleh kurang lagi.');
        $this->assertSame([], $after['missing_documents'], 'Dokumen tidak boleh kurang lagi.');
        $this->assertSame([], $after['rejected_documents']);

        // KTP & SIM tersimpan sebagai 'pending' sehingga masih menunggu
        // verifikasi admin (bukan hilang seperti sebelum perbaikan),
        // tetapi status itu TIDAK memblokir pemesanan.
        $this->assertNotEmpty($after['pending_documents']);

        // ATURAN: begitu data diri + dokumen sudah diisi & disimpan,
        // customer langsung boleh memesan tanpa menunggu approve admin.
        $this->assertTrue(
            $after['complete'],
            'Customer dengan data + dokumen tersimpan (pending) harus boleh memesan.'
        );

        $this->assertTrue(
            $complianceService->customerCanBook($user->fresh()),
            'Dokumen pending tidak boleh menghalangi pemesanan.'
        );

        // Setelah admin menyetujui keduanya, status tetap lengkap.
        $user->fresh()->customerProfile->documents()->update([
            'status' => 'approved',
            'verified_at' => now(),
        ]);

        $this->assertTrue(
            $complianceService->customerCanBook($user->fresh()),
            'Customer dengan data + dokumen approved harus lolos compliance.'
        );
    }

    public function test_rejected_documents_still_block_booking(): void
    {
        Storage::fake('private');

        $user = $this->customer();
        $complianceService = app(\App\Services\ComplianceService::class);

        $this->actingAs($user)->post('/profile', [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'phone' => '081200112233',
            'identity_number' => '3201234567890005',
            'date_of_birth' => '1990-01-01',
            'address' => 'Jl. Asia Afrika No. 3',
            'ktp_file' => UploadedFile::fake()->image('ktp.jpg'),
            'sim_file' => UploadedFile::fake()->image('sim.jpg'),
            'sim_number' => '9876-5432-1099',
            'sim_expires_at' => '2031-01-01',
        ])->assertSessionHasNoErrors();

        // Admin menolak dokumen KTP → customer harus unggah ulang dulu.
        $user->fresh()->customerProfile->documents()
            ->where('document_type', 'ktp')
            ->update(['status' => 'rejected', 'rejection_reason' => 'Foto blur.']);

        $after = $complianceService->customerStatus($user->fresh());

        $this->assertFalse($after['complete']);
        $this->assertNotEmpty($after['rejected_documents']);
        $this->assertFalse(
            $complianceService->customerCanBook($user->fresh()),
            'Dokumen yang ditolak admin harus tetap menghalangi pemesanan.'
        );
    }
}
