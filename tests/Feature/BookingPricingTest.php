<?php

namespace Tests\Feature;

use App\Constants\BookingStatus;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehiclePrice;
use App\Services\VehicleSearchService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingPricingTest extends TestCase
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

    private function createMitra(): array
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $agentProfile = AgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => 'Mitra Pricing Test',
            'business_type' => 'Rental',
            'is_active' => true,
            'onboarding_status' => 'approved',
        ]);

        return [$user, $agentProfile];
    }

    private function createVehicle(AgentProfile $agentProfile): Vehicle
    {
        $category = VehicleCategory::create([
            'name' => 'SUV',
            'slug' => 'suv-' . uniqid(),
            'is_active' => true,
        ]);

        $vehicle = Vehicle::create([
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Pajero Sport Dakar',
            'slug' => 'pajero-sport-' . uniqid(),
            'brand' => 'Mitsubishi',
            'model' => 'Pajero Sport',
            'year' => 2024,
            'license_plate' => 'B ' . rand(1000, 9999) . ' PJR',
            'transmission' => 'automatic',
            'seat_capacity' => 7,
            'fuel_type' => 'Diesel',
            'pickup_location' => 'Jakarta Selatan',
            'status' => 'available',
        ]);

        VehiclePrice::create([
            'vehicle_id' => $vehicle->id,
            'price_per_day' => 800000,
            'is_active' => true,
        ]);

        return $vehicle;
    }

    public function test_booking_calculates_all_pricing_components_and_deadline(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(5)->format('Y-m-d'); // 3 hari sewa

        // Delivery fulfillment: harus ada delivery fee 50.000
        $response = $this
            ->actingAs($customer)
            ->post(route('bookings.store'), [
                'vehicle_id' => $vehicle->id,
                'rental_start' => $rentalStart,
                'rental_end' => $rentalEnd,
                'fulfillment_type' => 'delivery',
                'delivery_address' => 'Jl. Sudirman No 45, Jakarta',
            ]);

        $response->assertSessionHasNoErrors();

        // 3 hari * 800.000 = 2.400.000
        // Delivery fee = 50.000
        // Service fee = 10.000
        // Deposit = 200.000
        // Total = 2.660.000
        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'agent_profile_id' => $agentProfile->id,
            'rental_amount' => 2400000.00,
            'delivery_fee' => 50000.00,
            'service_fee' => 10000.00,
            'deposit_amount' => 200000.00,
            'total_amount' => 2660000.00,
            'status' => BookingStatus::WAITING_PAYMENT,
        ]);

        $booking = Booking::first();
        $this->assertNotNull($booking->payment_deadline);
        $this->assertTrue($booking->payment_deadline->isFuture());
    }

    public function test_search_service_excludes_overlapping_active_bookings(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $rentalStart = Carbon::now()->addDays(5)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(8)->format('Y-m-d');

        // Buat booking untuk kendaraan
        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        $searchService = app(VehicleSearchService::class);

        // Cari pada tanggal yang bertabrakan (overlap)
        $results = $searchService->search([
            'rental_start' => Carbon::now()->addDays(6)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(7)->format('Y-m-d'),
        ]);

        // Kendaraan tidak boleh muncul di hasil cari
        $this->assertFalse($results->contains('id', $vehicle->id));

        // Cari pada tanggal bebas
        $freeResults = $searchService->search([
            'rental_start' => Carbon::now()->addDays(15)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(18)->format('Y-m-d'),
        ]);

        // Kendaraan harus muncul
        $this->assertTrue($freeResults->contains('id', $vehicle->id));
    }

    public function test_search_filters_transmission_and_seat_capacity(): void
    {
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $searchService = app(VehicleSearchService::class);

        // Cari transmisi yang cocok
        $matching = $searchService->search([
            'rental_start' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'transmission' => 'automatic',
            'seat_capacity' => 6,
        ]);
        $this->assertTrue($matching->contains('id', $vehicle->id));

        // Cari kapasitas kursi yang melebihi unit (misal butuh 10 kursi)
        $notMatching = $searchService->search([
            'rental_start' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'seat_capacity' => 10,
        ]);
        $this->assertFalse($notMatching->contains('id', $vehicle->id));
    }
}
