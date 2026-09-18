<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Review;


class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_profile_id',
        'vehicle_category_id',
        'vehicle_type',
        'name',
        'slug',
        'brand',
        'model',
        'year',
        'license_plate',
        'transmission',
        'seat_capacity',
        'fuel_type',
        'color',
        'description',
        'pickup_location',
        'rental_requirements',
        'status',
    ];

    protected $casts =[
        'year' => 'integer',
        'seat_capacity' => 'integer',];

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class, 'agent_profile_id');
    }

    public function vehicleCategory()
    {
        return $this->belongsTo(
            VehicleCategory::class,
            'vehicle_category_id'
        );
    }

    /**
     * Alias untuk vehicleCategory() agar kompatibel dengan
     * VehicleSearchService yang memanggil ->with('category').
     */
    public function category()
    {
        return $this->belongsTo(
            VehicleCategory::class,
            'vehicle_category_id'
        );
    }

    public function photos()
    {
        return $this->hasMany(VehiclePhoto::class);
    }

    public function documents()
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function availabilities()
    {
        return $this->hasMany(VehicleAvailability::class);
    }

    public function prices()
    {
        return $this->hasMany(VehiclePrice::class);
    }

    public function bookingItems()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function rentalCheckouts()
    {
        return $this->hasMany(RentalCheckout::class);
    }

    public function rentalCheckins()
    {
        return $this->hasMany(RentalCheckin::class);
    }

    public function damages()
    {
        return $this->hasMany(RentalDamage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}