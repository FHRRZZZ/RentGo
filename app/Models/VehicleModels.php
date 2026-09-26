<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain UNIT (Kendaraan)
|--------------------------------------------------------------------------
| Model: VehicleCategory, Vehicle, VehiclePhoto, VehicleDocument,
|        VehicleAvailability, VehiclePrice.
*/

class VehicleCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}

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

    protected $casts = [
        'year' => 'integer',
        'seat_capacity' => 'integer',
    ];

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

class VehiclePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'file_path',
        'media_type',
        'caption',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

class VehicleDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'document_type',
        'document_number',
        'file_path',
        'issued_at',
        'expires_at',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

class VehicleAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

class VehiclePrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'price_per_day',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
