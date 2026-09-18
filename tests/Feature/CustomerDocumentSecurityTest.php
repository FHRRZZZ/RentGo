<?php

namespace Tests\Feature;

use App\Models\CustomerDocument;
use App\Models\CustomerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerDocumentSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'mitra']);
        Role::create(['name' => 'customer']);

        Storage::fake('private');
    }

    private function createCustomer(string $name = 'Customer'): array
    {
        $user = User::factory()->create(['name' => $name]);
        $user->assignRole('customer');

        $profile = CustomerProfile::create([
            'user_id' => $user->id,
            'nik' => rand(10000000, 99999999),
            'phone' => '08123456789',
            'verification_status' => 'pending',
        ]);

        return [$user, $profile];
    }

    public function test_customer_can_access_own_document(): void
    {
        [$customerA, $profileA] = $this->createCustomer('Customer A');

        $file = UploadedFile::fake()->create('ktp.jpg', 100, 'image/jpeg');
        $path = $file->store('customer-documents/' . $profileA->id, 'private');

        $document = CustomerDocument::create([
            'customer_profile_id' => $profileA->id,
            'document_type' => 'ktp',
            'file_path' => $path,
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($customerA)
            ->get(route('customer-documents.file', $document));

        $response->assertOk();
    }

    public function test_customer_cannot_access_other_customer_document(): void
    {
        [, $profileA] = $this->createCustomer('Customer A');
        [$customerB] = $this->createCustomer('Customer B');

        $file = UploadedFile::fake()->create('ktp.jpg', 100, 'image/jpeg');
        $path = $file->store('customer-documents/' . $profileA->id, 'private');

        $document = CustomerDocument::create([
            'customer_profile_id' => $profileA->id,
            'document_type' => 'ktp',
            'file_path' => $path,
            'verification_status' => 'pending',
        ]);

        // Customer B mencoba mengakses dokumen Customer A
        $response = $this
            ->actingAs($customerB)
            ->get(route('customer-documents.file', $document));

        $response->assertForbidden();
    }

    public function test_admin_can_access_any_customer_document(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        [, $profileA] = $this->createCustomer('Customer A');

        $file = UploadedFile::fake()->create('ktp.jpg', 100, 'image/jpeg');
        $path = $file->store('customer-documents/' . $profileA->id, 'private');

        $document = CustomerDocument::create([
            'customer_profile_id' => $profileA->id,
            'document_type' => 'ktp',
            'file_path' => $path,
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('customer-documents.file', $document));

        $response->assertOk();
    }
}
