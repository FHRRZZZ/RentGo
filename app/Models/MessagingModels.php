<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain MESSAGING
|--------------------------------------------------------------------------
| Model: Conversation, Message.
|
| Percakapan selalu terikat pada satu booking (pesanan), satu customer, dan
| satu agent_profile (mitra). Dengan begitu hak akses cukup diperiksa lewat
| pasangan user → conversation.
*/

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'agent_profile_id',
        'subject',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
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

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('id');
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Apakah user ikut dalam percakapan ini?
     */
    public function involves(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $this->agentProfile?->user_id === $user->id;
        }

        return $this->customer_id === $user->id;
    }

    /**
     * Label lawan bicara untuk sisi tampilan user.
     */
    public function counterpartLabel(User $user): string
    {
        if ($user->hasRole('customer')) {
            return $this->agentProfile?->agency_name
                ?? $this->agentProfile?->user?->name
                ?? 'Mitra RentGo';
        }

        return $this->customer?->name ?? 'Customer';
    }
}

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'sender_role',
        'body',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
