<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalCheckin extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'checkin_at',
        'vehicle_condition',
        'photos',
        'odometer',
        'fuel_level',
        'equipment',
        'notes',
        'is_late_return',
        'late_return_fee',
        'customer_confirmed',
        'customer_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'checkin_at' => 'datetime',
            'photos' => 'array',
            'equipment' => 'array',
            'is_late_return' => 'boolean',
            'late_return_fee' => 'decimal:2',
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
        return $this->hasMany(RentalDamage::class);
    }
}