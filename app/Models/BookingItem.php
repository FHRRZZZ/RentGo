<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'vehicle_id',
        'rental_start',
        'rental_end',
        'rental_days',
        'price_per_day',
        'rental_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'rental_start' => 'datetime',
            'rental_end' => 'datetime',
            'price_per_day' => 'decimal:2',
            'rental_amount' => 'decimal:2',
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
}