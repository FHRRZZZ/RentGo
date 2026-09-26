<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain SUPPORT
|--------------------------------------------------------------------------
| Model: Review, Complaint, Dispute.
*/

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'agent_profile_id',
        'vehicle_id',
        'rating',
        'review',
        'status',
        'published_at',
        'moderation_note',
        'moderated_by',
        'reply',
        'replied_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'published_at' => 'datetime',
        'replied_at' => 'datetime',
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

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}

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

    protected $casts = [
        'attachments' => 'array',
        'resolved_at' => 'datetime',
    ];

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

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'initiator_id',
        'respondent_id',
        'subject',
        'description',
        'category',
        'attachments',
        'status',
        'assigned_to',
        'resolution',
        'resolution_party',
        'refund_amount',
        'resolved_at',
        'notes',
    ];

    protected $casts = [
        'attachments' => 'array',
        'refund_amount' => 'decimal:2',
        'resolved_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function respondent()
    {
        return $this->belongsTo(User::class, 'respondent_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
