<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain AGENT (Mitra)
|--------------------------------------------------------------------------
| Model: AgentProfile, AgentDocument.
*/

class AgentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'agency_name',
        'owner_name',
        'logo',
        'banner',
        'business_type',
        'address',
        'city',
        'province',
        'latitude',
        'longitude',
        'description',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'onboarding_status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

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

class AgentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_profile_id',
        'document_type',
        'document_number',
        'file_path',
        'verified_at',
        'rejection_reason',
        'status',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }
}
