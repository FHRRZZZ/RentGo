<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }
}