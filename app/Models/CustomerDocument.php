<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerDocument extends Model
{
    use HasFactory;

    // -----------------------------------------------------------------------
    // Status Constants (PRD §23)
    // -----------------------------------------------------------------------

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED  = 'expired';

    // -----------------------------------------------------------------------
    // Document Type Constants
    // -----------------------------------------------------------------------

    public const TYPE_KTP    = 'ktp';
    public const TYPE_SIM_A  = 'sim_a';
    public const TYPE_SIM_C  = 'sim_c';
    public const TYPE_SELFIE = 'selfie';

    // -----------------------------------------------------------------------
    // Mass Assignment
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // Casts
    // -----------------------------------------------------------------------

    protected $casts = [
        'verified_at' => 'datetime',
        'expires_at'  => 'date',
    ];

    // -----------------------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------------------

    /**
     * Customer profile pemilik dokumen ini.
     */
    public function customerProfile()
    {
        return $this->belongsTo(CustomerProfile::class);
    }

    /**
     * Admin yang melakukan verifikasi dokumen.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // -----------------------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------------------

    /**
     * Filter dokumen milik customer tertentu berdasarkan user_id.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->whereHas(
            'customerProfile',
            fn (Builder $q) => $q->where('user_id', $userId)
        );
    }

    /**
     * Filter dokumen berdasarkan status.
     */
    public function scopeWithStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    // -----------------------------------------------------------------------
    // Accessors / Helpers
    // -----------------------------------------------------------------------

    /**
     * Apakah dokumen ini sudah diverifikasi (approved)?
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Apakah dokumen ini masih menunggu verifikasi?
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Apakah dokumen ini ditolak?
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }
}