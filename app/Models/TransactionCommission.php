<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'agent_profile_id',
        'commission_base',
        'commission_percentage',
        'commission_amount',
        'net_amount',
        'status',
        'calculated_at',
        'notes',
    ];

    protected $casts = [
        'commission_base' => 'decimal:2',
        'commission_percentage' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class);
    }
}