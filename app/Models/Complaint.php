<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'complainant_id',
        'reported_user_id',
        'subject',
        'description',
        'category',
        'attachments',
        'priority',
        'status',
        'assigned_to',
        'resolved_at',
        'resolution',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function complainant()
    {
        return $this->belongsTo(User::class, 'complainant_id');
    }

    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}