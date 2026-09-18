<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'mitra']);
        Role::create(['name' => 'customer']);
    }

    private function createAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function createMitra(): array
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $agentProfile = AgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => 'Mitra Verif Test',
            'business_type' => 'Rental',
            'is_active' => true,
            'onboarding_status' => 'approved',
        ]);

        return [$user, $agentProfile];
    }

    private function createCategory(): VehicleCategory
    {
        return VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil',
            'description' => 'Kategori mobil',
            'is_active' => true,
        ]);
    }

    private function createVehicle(AgentProfile $agentProfile, VehicleCategory $category, string $status = 'pending_review'): Vehicle
    {
        return Vehicle::create([
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Toyota Avanza 2024',
            'slug' => 'toyota-avanza-2024-' . uniqid(),
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2024,
            'license_plate' => 'B ' . rand(1000, 9999) . ' VER',
            'transmission' => 'Automatic',
            'seat_capacity' => 7,
            'fuel_type' => 'Bensin',
            'color' => 'Hitam',
            'description' => 'Mobil verifikasi test',
            'pickup_location' => 'Jakarta',
            'rental_requirements' => 'KTP dan SIM',
            'status' => $status,
        ]);
    }

    public function test_admin_can_approve_vehicle_in_pending_review(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'pending_review');

        $response = $this
            ->actingAs($admin)
            ->post(route('vehicles.verify', $vehicle), [
                'decision' => 'approved',
            ]);

        $response
            ->assertRedirect(route('vehicles.show', $vehicle))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'available',
        ]);
    }

    public function test_admin_can_reject_vehicle_with_reason(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'pending_review');

        $response = $this
            ->actingAs($admin)
            ->post(route('vehicles.verify', $vehicle), [
                'decision' => 'rejected',
                'rejection_reason' => 'Foto STNK tidak jelas atau kadaluarsa.',
            ]);

        $response
            ->assertRedirect(route('vehicles.show', $vehicle))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'rejected',
        ]);
    }

    public function test_rejection_requires_rejection_reason(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'pending_review');

        $response = $this
            ->actingAs($admin)
            ->post(route('vehicles.verify', $vehicle), [
                'decision' => 'rejected',
                'rejection_reason' => '',
            ]);

        $response->assertSessionHasErrors('rejection_reason');

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'pending_review',
        ]);
    }

    public function test_mitra_cannot_verify_vehicle(): void
    {
        [$mitra, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'pending_review');

        $response = $this
            ->actingAs($mitra)
            ->post(route('vehicles.verify', $vehicle), [
                'decision' => 'approved',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'pending_review',
        ]);
    }

    public function test_customer_cannot_verify_vehicle(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        [, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'pending_review');

        $response = $this
            ->actingAs($customer)
            ->post(route('vehicles.verify', $vehicle), [
                'decision' => 'approved',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'status' => 'pending_review',
        ]);
    }

    public function test_cannot_verify_vehicle_not_in_pending_review(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = $this->createVehicle($agentProfile, $category, 'draft');

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/Hanya kendaraan berstatus pending_review yang dapat diverifikasi\./');

        // Memanggil service langsung untuk memverifikasi exception bisnis
        app(\App\Services\VehicleService::class)->verify(
            $vehicle,
            $admin,
            'approved'
        );
    }
}
