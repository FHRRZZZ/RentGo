<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'actor_id',
        'reason',
        'cancelled_at',
        'refund_percentage',
        'refund_status',
        'refund_amount',
    ];

    protected function casts(): array
    {
        return [
            'cancelled_at' => 'datetime',
            'refund_percentage' => 'decimal:2',
            'refund_amount' => 'decimal:2',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}