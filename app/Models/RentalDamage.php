<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalDamage extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'rental_checkin_id',
        'description',
        'location',
        'severity',
        'photos',
        'repair_cost',
        'customer_charge',
        'deducted_from_deposit',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
            'repair_cost' => 'decimal:2',
            'customer_charge' => 'decimal:2',
            'deducted_from_deposit' => 'boolean',
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

    public function rentalCheckin()
    {
        return $this->belongsTo(RentalCheckin::class);
    }
}