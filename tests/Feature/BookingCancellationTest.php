<?php

namespace Tests\Feature;

use App\Constants\BookingStatus;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleCategory;
use App\Models\VehiclePrice;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingCancellationTest extends TestCase
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
            'agency_name' => 'Mitra Cancel Test',
            'business_type' => 'Rental',
            'is_active' => true,
            'onboarding_status' => 'approved',
        ]);

        return [$user, $agentProfile];
    }

    private function createVehicle(AgentProfile $agentProfile): Vehicle
    {
        $category = VehicleCategory::create([
            'name' => 'Sedan',
            'slug' => 'sedan-' . uniqid(),
            'is_active' => true,
        ]);

        $vehicle = Vehicle::create([
            'agent_profile_id' => $agentProfile->id,
            'vehicle_category_id' => $category->id,
            'vehicle_type' => 'car',
            'name' => 'Honda Civic RS',
            'slug' => 'honda-civic-' . uniqid(),
            'brand' => 'Honda',
            'model' => 'Civic',
            'year' => 2024,
            'license_plate' => 'B ' . rand(1000, 9999) . ' CVC',
            'pickup_location' => 'Jakarta',
            'status' => 'available',
        ]);

        VehiclePrice::create([
            'vehicle_id' => $vehicle->id,
            'price_per_day' => 600000,
            'is_active' => true,
        ]);

        return $vehicle;
    }

    public function test_customer_can_cancel_unpaid_booking(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(4)->format('Y-m-d'),
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::first();

        $response = $this
            ->actingAs($customer)
            ->post(route('bookings.cancel', $booking), [
                'reason' => 'Rencana perjalanan dibatalkan.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::CANCELLED,
        ]);
    }

    public function test_customer_cancelling_paid_booking_triggers_refund_pending(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(4)->format('Y-m-d'),
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::first();

        // Buat pembayaran lunas
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_number' => 'PAY-TEST-' . uniqid(),
            'payment_method' => 'qris',
            'amount' => $booking->total_amount,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => BookingStatus::PAID]);

        $response = $this
            ->actingAs($customer)
            ->post(route('bookings.cancel', $booking), [
                'reason' => 'Acara keluarga ditunda.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::REFUND_PENDING,
        ]);

        // Memastikan record refund otomatis dibuat
        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'payment_id' => $payment->id,
            'amount' => $booking->total_amount,
            'status' => 'pending',
        ]);
    }

    public function test_artisan_command_expires_overdue_bookings(): void
    {
        $customer = $this->createCustomer();
        [, $agentProfile] = $this->createMitra();
        $vehicle = $this->createVehicle($agentProfile);

        $this->actingAs($customer)->post(route('bookings.store'), [
            'vehicle_id' => $vehicle->id,
            'rental_start' => Carbon::now()->addDays(2)->format('Y-m-d'),
            'rental_end' => Carbon::now()->addDays(4)->format('Y-m-d'),
            'fulfillment_type' => 'self_pickup',
        ]);

        $booking = Booking::first();

        // Simulasi batas waktu pembayaran sudah terlewati 10 menit lalu
        $booking->update([
            'payment_deadline' => Carbon::now()->subMinutes(10),
            'status' => BookingStatus::WAITING_PAYMENT,
        ]);

        Artisan::call('bookings:expire');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::EXPIRED,
        ]);
    }
}
