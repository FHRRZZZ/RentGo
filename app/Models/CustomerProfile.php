<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'phone',
        'identity_number',
        'date_of_birth',
        'address',
        'city',
        'province',
        'profile_photo_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
        ];
    }

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