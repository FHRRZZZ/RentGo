<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleTest extends TestCase
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
            'agency_name' => 'Mitra Test',
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

    private function vehicleData(AgentProfile $agentProfile, VehicleCategory $category): array
    {
        return [
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Toyota Avanza',
            'slug' => 'toyota-avanza',
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2024,
            'license_plate' => 'B 1234 TEST',
            'transmission' => 'Automatic',
            'seat_capacity' => 7,
            'fuel_type' => 'Bensin',
            'color' => 'Hitam',
            'description' => 'Mobil rental test',
            'pickup_location' => 'Jakarta',
            'rental_requirements' => 'KTP dan SIM',
            'status' => 'draft',
        ];
    }

    public function test_admin_can_view_vehicle_index(): void
    {
        $admin = $this->createAdmin();

        $response = $this
            ->actingAs($admin)
            ->get(route('vehicles.index'));

        $response->assertOk();
    }

    public function test_mitra_can_view_vehicle_index(): void
    {
        [$mitra] = $this->createMitra();

        $response = $this
            ->actingAs($mitra)
            ->get(route('vehicles.index'));

        $response->assertOk();
    }

    public function test_customer_cannot_view_vehicle_index(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $response = $this
            ->actingAs($customer)
            ->get(route('vehicles.index'));

        $response->assertForbidden();
    }

    public function test_admin_can_create_vehicle(): void
    {
        $admin = $this->createAdmin();
        $mitra = $this->createMitra()[1];
        $category = $this->createCategory();

        $data = $this->vehicleData($mitra, $category);

        $response = $this
            ->actingAs($admin)
            ->post(route('vehicles.store'), $data);

        $response
            ->assertRedirect(route('vehicles.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('vehicles', [
            'name' => 'Toyota Avanza',
            'agent_profile_id' => $mitra->id,
            'vehicle_category_id' => $category->id,
            'license_plate' => 'B 1234 TEST',
        ]);
    }

    public function test_mitra_can_create_vehicle_for_own_profile(): void
    {
        [$mitra, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $data = $this->vehicleData($agentProfile, $category);

        // Mitra tidak perlu menentukan agent_profile_id.
        unset($data['agent_profile_id']);

        $response = $this
            ->actingAs($mitra)
            ->post(route('vehicles.store'), $data);

        $response
            ->assertRedirect(route('vehicles.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('vehicles', [
            'name' => 'Toyota Avanza',
            'agent_profile_id' => $agentProfile->id,
        ]);
    }

    public function test_mitra_cannot_access_another_mitras_vehicle(): void
    {
        [$mitra1, $profile1] = $this->createMitra();

        [$mitra2, $profile2] = $this->createMitra();

        $category = $this->createCategory();

        $vehicle = Vehicle::create(
            $this->vehicleData($profile2, $category)
        );

        $response = $this
            ->actingAs($mitra1)
            ->get(route('vehicles.show', $vehicle));

        $response->assertForbidden();
    }

    public function test_admin_can_view_vehicle_detail(): void
    {
        $admin = $this->createAdmin();
        $mitra = $this->createMitra()[1];
        $category = $this->createCategory();

        $vehicle = Vehicle::create(
            $this->vehicleData($mitra, $category)
        );

        $response = $this
            ->actingAs($admin)
            ->get(route('vehicles.show', $vehicle));

        $response->assertOk();

        $response->assertSee('Toyota Avanza');
    }

    public function test_mitra_can_update_own_vehicle(): void
    {
        [$mitra, $agentProfile] = $this->createMitra();
        $category = $this->createCategory();

        $vehicle = Vehicle::create(
            $this->vehicleData($agentProfile, $category)
        );

        $data = $this->vehicleData($agentProfile, $category);

        $data['name'] = 'Toyota Innova';
        $data['slug'] = 'toyota-innova';
        $data['license_plate'] = 'B 5678 TEST';

        unset($data['agent_profile_id']);

        $response = $this
            ->actingAs($mitra)
            ->put(
                route('vehicles.update', $vehicle),
                $data
            );

        $response->assertRedirect(route('vehicles.index'));

        $this->assertDatabaseHas('vehicles', [
            'id' => $vehicle->id,
            'name' => 'Toyota Innova',
            'license_plate' => 'B 5678 TEST',
        ]);
    }

    public function test_admin_can_delete_vehicle(): void
    {
        $admin = $this->createAdmin();
        $mitra = $this->createMitra()[1];
        $category = $this->createCategory();

        $vehicle = Vehicle::create(
            $this->vehicleData($mitra, $category)
        );

        $response = $this
            ->actingAs($admin)
            ->delete(route('vehicles.destroy', $vehicle));

        $response
            ->assertRedirect(route('vehicles.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('vehicles', [
            'id' => $vehicle->id,
        ]);
    }

    public function test_customer_cannot_create_vehicle(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $category = $this->createCategory();
        $mitra = $this->createMitra()[1];

        $data = $this->vehicleData($mitra, $category);

        $response = $this
            ->actingAs($customer)
            ->post(route('vehicles.store'), $data);

        $response->assertForbidden();

        $this->assertDatabaseMissing('vehicles', [
            'license_plate' => 'B 1234 TEST',
        ]);
    }
}