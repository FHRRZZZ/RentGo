<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'mitra']);
        Role::create(['name' => 'customer']);
    }

    private function createCustomer(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        return $user;
    }

    private function createVehicle(): Vehicle
    {
        $mitraUser = User::factory()->create();
        $mitraUser->assignRole('mitra');

        $agentProfile = AgentProfile::create([
            'user_id' => $mitraUser->id,
            'agency_name' => 'Mitra Wishlist',
            'business_type' => 'Rental',
            'is_active' => true,
            'onboarding_status' => 'approved',
        ]);

        $category = VehicleCategory::create([
            'name' => 'Sedan',
            'slug' => 'sedan-' . uniqid(),
            'is_active' => true,
        ]);

        return Vehicle::create([
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Toyota Camry 2.5',
            'slug' => 'toyota-camry-' . uniqid(),
            'brand' => 'Toyota',
            'model' => 'Camry',
            'year' => 2024,
            'license_plate' => 'B ' . rand(1000, 9999) . ' CMR',
            'status' => 'available',
        ]);
    }

    public function test_customer_can_add_vehicle_to_wishlist(): void
    {
        $customer = $this->createCustomer();
        $vehicle = $this->createVehicle();

        $response = $this
            ->actingAs($customer)
            ->post(route('wishlists.store'), [
                'vehicle_id' => $vehicle->id,
            ]);

        $this->assertDatabaseHas('wishlists', [
            'user_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_cannot_add_same_vehicle_twice_to_wishlist(): void
    {
        $customer = $this->createCustomer();
        $vehicle = $this->createVehicle();

        // Tambah pertama kali
        Wishlist::create([
            'user_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
        ]);

        // Coba tambah kedua kali
        $response = $this
            ->actingAs($customer)
            ->post(route('wishlists.store'), [
                'vehicle_id' => $vehicle->id,
            ]);

        $response->assertSessionHasErrors('vehicle_id');
    }

    public function test_customer_can_remove_vehicle_from_wishlist(): void
    {
        $customer = $this->createCustomer();
        $vehicle = $this->createVehicle();

        $wishlist = Wishlist::create([
            'user_id' => $customer->id,
            'vehicle_id' => $vehicle->id,
        ]);

        $response = $this
            ->actingAs($customer)
            ->delete(route('wishlists.destroy', $wishlist));

        $this->assertDatabaseMissing('wishlists', [
            'id' => $wishlist->id,
        ]);
    }

    public function test_customer_cannot_delete_other_customer_wishlist(): void
    {
        $customerA = $this->createCustomer();
        $customerB = $this->createCustomer();
        $vehicle = $this->createVehicle();

        $wishlistA = Wishlist::create([
            'user_id' => $customerA->id,
            'vehicle_id' => $vehicle->id,
        ]);

        $response = $this
            ->actingAs($customerB)
            ->delete(route('wishlists.destroy', $wishlistA));

        $response->assertForbidden();

        $this->assertDatabaseHas('wishlists', [
            'id' => $wishlistA->id,
        ]);
    }
}
