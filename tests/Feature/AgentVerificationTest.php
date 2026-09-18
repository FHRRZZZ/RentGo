<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\User;
use App\Models\VehicleCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AgentVerificationTest extends TestCase
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

    private function createMitra(string $status = 'pending_verification', bool $isActive = false): array
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $agentProfile = AgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => 'Mitra Auto Test',
            'business_type' => 'Rental',
            'is_active' => $isActive,
            'onboarding_status' => $status,
        ]);

        return [$user, $agentProfile];
    }

    public function test_admin_can_approve_mitra(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra('pending_verification', false);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.agents.verify', $agentProfile), [
                'decision' => 'approved',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('agent_profiles', [
            'id' => $agentProfile->id,
            'onboarding_status' => 'approved',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_reject_mitra_with_reason(): void
    {
        $admin = $this->createAdmin();
        [, $agentProfile] = $this->createMitra('pending_verification', false);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.agents.verify', $agentProfile), [
                'decision' => 'rejected',
                'rejection_reason' => 'Dokumen NIB dan NPWP tidak valid.',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('agent_profiles', [
            'id' => $agentProfile->id,
            'onboarding_status' => 'rejected',
            'is_active' => false,
        ]);
    }

    public function test_unapproved_mitra_cannot_create_vehicle(): void
    {
        [$unapprovedMitra, $agentProfile] = $this->createMitra('pending_verification', false);

        $category = VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil-test',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($unapprovedMitra)
            ->post(route('vehicles.store'), [
                'agent_profile_id'    => $agentProfile->id,
                'vehicle_category_id' => $category->id,
                'vehicle_type'        => 'car',
                'name'                => 'Toyota Avanza Unapproved',
                'license_plate'       => 'B 9999 UNA',
                'pickup_location'     => 'Jakarta',
                'rental_requirements' => 'KTP',
            ]);

        $response->assertForbidden();
    }

    public function test_approved_mitra_can_create_vehicle(): void
    {
        [$approvedMitra, $agentProfile] = $this->createMitra('approved', true);

        $category = VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil-approved',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($approvedMitra)
            ->post(route('vehicles.store'), [
                'vehicle_category_id' => $category->id,
                'vehicle_type'        => 'car',
                'name'                => 'Toyota Avanza Approved',
                'license_plate'       => 'B 1111 APP',
                'pickup_location'     => 'Jakarta',
                'rental_requirements' => 'KTP',
            ]);

        $response->assertRedirect(route('vehicles.index'));
        $this->assertDatabaseHas('vehicles', [
            'license_plate'    => 'B 1111 APP',
            'agent_profile_id' => $agentProfile->id,
        ]);
    }
}
