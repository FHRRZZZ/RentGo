<?php

namespace Tests\Feature;

use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehiclePrice;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingTest extends TestCase
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

    private function createMitra(string $name = 'Mitra Rental'): array
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $agentProfile = AgentProfile::create([
            'user_id' => $user->id,
            'agency_name' => $name,
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

    private function createCategory(): VehicleCategory
    {
        return VehicleCategory::create([
            'name' => 'Mobil',
            'slug' => 'mobil-' . uniqid(),
            'description' => 'Kategori mobil',
            'is_active' => true,
        ]);
    }

    private function createVehicle(AgentProfile $agentProfile, string $status = 'available'): Vehicle
    {
        $category = $this->createCategory();

        $vehicle = Vehicle::create([
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Toyota Avanza 2024',
            'slug' => 'toyota-avanza-' . uniqid(),
            'brand' => 'Toyota',
            'model' => 'Avanza',
            'year' => 2024,
            'license_plate' => 'B ' . rand(1000, 9999) . ' BKG',
            'transmission' => 'Automatic',
            'seat_capacity' => 7,
            'fuel_type' => 'Bensin',
            'color' => 'Hitam',
            'description' => 'Mobil siap pakai',
            'pickup_location' => 'Jakarta Selatan',
            'rental_requirements' => 'KTP dan SIM A',
            'status' => $status,
        ]);

        VehiclePrice::create([
            'vehicle_id' => $vehicle->id,
            'price_per_day' => 350000,
            'is_active' => true,
        ]);

        return $vehicle;
    }

    public function test_customer_can_create_booking(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(5)->format('Y-m-d');

        $response = $this
            ->actingAs($customer)
            ->post(route('bookings.store'), [
                'vehicle_id' => $vehicle->id,
                'rental_start' => $rentalStart,
                'rental_end' => $rentalEnd,
                'fulfillment_type' => 'self_pickup',
                'pickup_location' => 'Pool Mitra Jakarta',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'customer_id'      => $customer->id,
            'agent_profile_id' => $agentProfile->id,
            'status'           => 'waiting_payment',
        ]);

        $this->assertDatabaseHas('booking_items', [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
        ]);
    }

    public function test_system_prevents_double_booking_on_same_period(): void
    {
        $customer1 = $this->createCustomer();
        $customer2 = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(5)->format('Y-m-d');

        // Booking pertama berhasil
        $this->actingAs($customer1)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        // Customer kedua mencoba booking mobil yang sama pada periode yang overlap
        $response = $this
            ->actingAs($customer2)
            ->post(route('bookings.store'), [
                'vehicle_id' => $vehicle->id,
                'rental_start' => Carbon::now()->addDays(3)->format('Y-m-d'),
                'rental_end' => Carbon::now()->addDays(6)->format('Y-m-d'),
                'fulfillment_type' => 'self_pickup',
            ]);

        $response->assertSessionHasErrors('vehicle_id');
    }

    public function test_customer_cannot_book_unavailable_vehicle(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'maintenance');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $response = $this
            ->actingAs($customer)
            ->post(route('bookings.store'), [
                'vehicle_id' => $vehicle->id,
                'rental_start' => $rentalStart,
                'rental_end' => $rentalEnd,
                'fulfillment_type' => 'self_pickup',
            ]);

        $response->assertSessionHasErrors('vehicle_id');
    }

    public function test_mitra_can_confirm_booking(): void
    {
        $customer = $this->createCustomer();
        [$mitra, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::where('agent_profile_id', $agentProfile->id)->firstOrFail();
        $booking->update(['status' => 'waiting_agent_confirmation']);

        $response = $this
            ->actingAs($mitra)
            ->post(route('bookings.confirm', $booking), [
                'status' => 'confirmed',
                'agent_note' => 'Mobil siap disewa, silakan ambil tepat waktu.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
            'agent_note' => 'Mobil siap disewa, silakan ambil tepat waktu.',
        ]);
    }

    public function test_mitra_can_reject_booking(): void
    {
        $customer = $this->createCustomer();
        [$mitra, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::where('agent_profile_id', $agentProfile->id)->firstOrFail();
        $booking->update(['status' => 'waiting_agent_confirmation']);

        $response = $this
            ->actingAs($mitra)
            ->post(route('bookings.confirm', $booking), [
                'status' => 'rejected',
                'agent_note' => 'Kendaraan mendadak mengalami kendala teknis.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'rejected',
            'agent_note' => 'Kendaraan mendadak mengalami kendala teknis.',
        ]);
    }

    public function test_mitra_rejecting_paid_booking_triggers_refund(): void
    {
        $customer = $this->createCustomer();
        [$mitra, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::where('agent_profile_id', $agentProfile->id)->firstOrFail();

        // Buat data pembayaran yang sudah dibayar
        \App\Models\Payment::create([
            'booking_id' => $booking->id,
            'payment_number' => 'PAY-TEST-' . uniqid(),
            'payment_method' => 'qris',
            'amount' => $booking->total_amount,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'waiting_agent_confirmation']);

        $response = $this
            ->actingAs($mitra)
            ->post(route('bookings.confirm', $booking), [
                'status' => 'rejected',
                'agent_note' => 'Mobil sedang dalam perbaikan berkala.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'rejected',
        ]);

        // Memastikan record refund berhasil dibuat otomatis
        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'amount' => $booking->total_amount,
            'status' => 'pending',
        ]);
    }

    public function test_mitra_cannot_confirm_other_mitra_booking(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile1] = $this->createMitra('Mitra 1');
        [$mitra2] = $this->createMitra('Mitra 2');
        $vehicle = $this->createVehicle($agentProfile1, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::where('agent_profile_id', $agentProfile1->id)->firstOrFail();
        $booking->update(['status' => 'waiting_agent_confirmation']);

        $response = $this
            ->actingAs($mitra2)
            ->post(route('bookings.confirm', $booking), [
                'status' => 'confirmed',
            ]);

        $response->assertForbidden();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'waiting_agent_confirmation',
        ]);
    }

    public function test_user_can_view_bookings_index_according_to_role(): void
    {
        $customer = $this->createCustomer();
        [$mitra, $agentProfile] = $this->createMitra();
        $admin = $this->createAdmin();

        $vehicle = $this->createVehicle($agentProfile, 'available');

        $rentalStart = Carbon::now()->addDays(2)->format('Y-m-d');
        $rentalEnd = Carbon::now()->addDays(4)->format('Y-m-d');

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => $rentalStart,
            'rental_end' => $rentalEnd,
            'fulfillment_type' => 'self_pickup',
        ]);

        // Customer can view index
        $customerResponse = $this->actingAs($customer)->get(route('bookings.index'));
        $customerResponse->assertOk();

        // Mitra can view index
        $mitraResponse = $this->actingAs($mitra)->get(route('bookings.index'));
        $mitraResponse->assertOk();

        // Admin can view index
        $adminResponse = $this->actingAs($admin)->get(route('bookings.index'));
        $adminResponse->assertOk();
    }
}
