<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'expires_at' => 'date',
        ];
    }

    public function customerProfile()
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}