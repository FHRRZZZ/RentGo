<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'agency_name',
        'business_type',
        'address',
        'city',
        'province',
        'description',
        'onboarding_status',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(AgentDocument::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function commissions()
    {
        return $this->hasMany(TransactionCommission::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}