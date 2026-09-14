<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_profile_id',
        'transaction_id',
        'transaction_commission_id',
        'payout_number',
        'amount',
        'payout_method',
        'account_name',
        'account_number',
        'bank_name',
        'status',
        'paid_at',
        'processed_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function transactionCommission()
    {
        return $this->belongsTo(
            TransactionCommission::class,
            'transaction_commission_id'
        );
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}