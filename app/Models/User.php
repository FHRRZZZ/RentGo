<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Agent
    |--------------------------------------------------------------------------
    */

    public function agentProfile()
    {
        return $this->hasOne(AgentProfile::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Customer
    |--------------------------------------------------------------------------
    */

    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Bookings
    |--------------------------------------------------------------------------
    */

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Audit Logs
    |--------------------------------------------------------------------------
    */

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}