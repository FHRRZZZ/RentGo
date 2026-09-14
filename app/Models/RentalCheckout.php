<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalCheckout extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'checkout_at',
        'vehicle_condition',
        'photos',
        'odometer',
        'fuel_level',
        'equipment',
        'notes',
        'customer_confirmed',
        'customer_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'checkout_at' => 'datetime',
            'photos' => 'array',
            'equipment' => 'array',
            'customer_confirmed' => 'boolean',
            'customer_confirmed_at' => 'datetime',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function damages()
    {
        return $this->hasMany(RentalDamage::class, 'rental_checkin_id');
    }
}