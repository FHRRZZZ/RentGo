<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'agent_profile_id',
        'transaction_number',
        'rental_amount',
        'delivery_fee',
        'service_fee',
        'additional_fee',
        'deposit_amount',
        'deduction_amount',
        'refund_amount',
        'total_amount',
        'status',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'rental_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'additional_fee' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function commission()
    {
        return $this->hasOne(TransactionCommission::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class);
    }
}