<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'agent_profile_id',
        'booking_number',
        'rental_start',
        'rental_end',
        'fulfillment_type',
        'pickup_location',
        'delivery_address',
        'rental_amount',
        'delivery_fee',
        'service_fee',
        'additional_fee',
        'deposit_amount',
        'total_amount',
        'status',
        'customer_note',
        'agent_note',
    ];

    protected function casts(): array
    {
        return [
            'rental_start' => 'datetime',
            'rental_end' => 'datetime',
            'rental_amount' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'additional_fee' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function items()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function cancellations()
    {
        return $this->hasMany(BookingCancellation::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function checkout()
    {
        return $this->hasOne(RentalCheckout::class);
    }

    public function checkin()
    {
        return $this->hasOne(RentalCheckin::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }
}