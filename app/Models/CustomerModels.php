<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain CUSTOMER (Penyewa)
|--------------------------------------------------------------------------
| Model: CustomerProfile, CustomerDocument.
*/

class CustomerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'identity_number',
        'sim_type',
        'emergency_name',
        'emergency_relation',
        'emergency_phone',
        'date_of_birth',
        'address',
        'city',
        'province',
        'profile_photo_path',
        'is_active',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id', 'user_id');
    }
}

class CustomerDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_profile_id',
        'document_type',
        'document_number',
        'file_path',
        'status',
        'verified_at',
        'verified_by',
        'rejection_reason',
        'expires_at',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'expires_at' => 'date',
    ];

    public function customerProfile()
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
