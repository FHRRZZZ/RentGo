<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class VehicleCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('admin');
        Role::findOrCreate('mitra');
        Role::findOrCreate('customer');
    }

    public function test_admin_can_view_vehicle_categories(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil',
            'description' => 'Kategori kendaraan mobil',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->get(route('vehicle-categories.index'));
            $response->dump();
            $response->assertStatus(200);
    }

    public function test_admin_can_create_vehicle_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('vehicle-categories.store'), [
                'name' => 'Motor',
                'slug' => 'motor',
                'description' => 'Kategori kendaraan motor',
                'is_active' => true,
            ]);

        $response->assertRedirect(
            route('vehicle-categories.index')
        );

        $this->assertDatabaseHas('vehicle_categories', [
            'name' => 'Motor',
            'slug' => 'motor',
        ]);
    }

    public function test_admin_can_update_vehicle_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $category = VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil',
            'description' => 'Kategori mobil',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->put(
                route(
                    'vehicle-categories.update',
                    $category
                ),
                [
                    'name' => 'Mobil Premium',
                    'slug' => 'mobil-premium',
                    'description' => 'Kategori mobil premium',
                    'is_active' => true,
                ]
            );

        $response->assertRedirect(
            route('vehicle-categories.index')
        );

        $this->assertDatabaseHas('vehicle_categories', [
            'id' => $category->id,
            'name' => 'Mobil Premium',
            'slug' => 'mobil-premium',
        ]);
    }

    public function test_admin_can_delete_vehicle_category(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $category = VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil',
            'description' => 'Kategori mobil',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->delete(
                route(
                    'vehicle-categories.destroy',
                    $category
                )
            );

        $response->assertRedirect(
            route('vehicle-categories.index')
        );

        $this->assertDatabaseMissing('vehicle_categories', [
            'id' => $category->id,
        ]);
    }

    public function test_mitra_cannot_manage_vehicle_categories(): void
    {
        $mitra = User::factory()->create();
        $mitra->assignRole('mitra');

        $response = $this->actingAs($mitra)
            ->get(route('vehicle-categories.index'));

        $response->assertForbidden();
    }

    public function test_customer_cannot_manage_vehicle_categories(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $response = $this->actingAs($customer)
            ->get(route('vehicle-categories.index'));

        $response->assertForbidden();
    }

    public function test_vehicle_category_requires_name_and_slug(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)
            ->post(route('vehicle-categories.store'), [
                'description' => 'Kategori tanpa nama dan slug',
                'is_active' => true,
            ]);

        $response->assertSessionHasErrors([
            'name',
            'slug',
        ]);
    }

    public function test_vehicle_category_slug_must_be_unique(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil',
            'description' => null,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->post(route('vehicle-categories.store'), [
                'name' => 'Mobil Baru',
                'slug' => 'mobil',
                'description' => null,
                'is_active' => true,
            ]);

        $response->assertSessionHasErrors([
            'slug',
        ]);
    }
}