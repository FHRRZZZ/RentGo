<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardTest extends TestCase
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
            'agency_name' => 'Mitra Dashboard Test',
            'business_type' => 'Rental',
            'is_active' => true,
            'onboarding_status' => 'approved',
        ]);

        return [$user, $agentProfile];
    }

    private function createCustomer(): User
    {
        $user = User::factory()->create();
        $user->assignRole('customer');

        return $user;
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->createAdmin();

        $response = $this
            ->actingAs($admin)
            ->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_mitra_can_access_dashboard(): void
    {
        [$mitra] = $this->createMitra();

        $response = $this
            ->actingAs($mitra)
            ->get(route('dashboard'));

        $response->assertOk();
    }

    public function test_customer_can_access_dashboard(): void
    {
        $customer = $this->createCustomer();

        $response = $this
            ->actingAs($customer)
            ->get(route('dashboard'));

        $response->assertOk();
    }
}
