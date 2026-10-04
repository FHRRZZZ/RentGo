<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/*
|--------------------------------------------------------------------------
| Domain PAYMENT
|--------------------------------------------------------------------------
| Model: Payment, Refund, Transaction, TransactionCommission, AgentPayout.
*/

class Payment extends Model
{
    use HasFactory;

    /** Metode pembayaran yang didukung. */
    public const METHOD_COD = 'cash';
    public const METHOD_QRIS = 'qris';
    public const METHOD_BANK_TRANSFER = 'bank_transfer';

    /** Menunggu pembayaran diselesaikan customer. */
    public const STATUS_PENDING = 'pending';

    /**
     * Customer sudah mengunggah bukti bayar (QRIS / transfer bank) dan
     * menunggu pemeriksaan mitra penyedia unit.
     */
    public const STATUS_AWAITING_VERIFICATION = 'awaiting_verification';

    /** Pembayaran sudah diterima / diverifikasi. */
    public const STATUS_PAID = 'paid';

    /** Status pembayaran yang dianggap sudah lunas. */
    public const SETTLED_STATUSES = [
        self::STATUS_PAID,
    ];

    /** Status pembayaran yang masih menunggu keputusan (belum final). */
    public const PENDING_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_AWAITING_VERIFICATION,
    ];

    /** Label tampilan untuk struk & riwayat pembayaran. */
    public const METHOD_LABELS = [
        self::METHOD_COD => 'Bayar di Tempat (COD)',
        self::METHOD_QRIS => 'QRIS',
        self::METHOD_BANK_TRANSFER => 'Transfer Bank (Virtual Account)',
    ];

    /** Label status pembayaran. */
    public const STATUS_LABELS = [
        self::STATUS_PENDING => 'Menunggu Pembayaran',
        self::STATUS_AWAITING_VERIFICATION => 'Menunggu Verifikasi Mitra',
        self::STATUS_PAID => 'Lunas',
        'failed' => 'Gagal',
        'expired' => 'Kedaluwarsa',
        'cancelled' => 'Dibatalkan',
    ];

    protected $fillable = [
        'booking_id',
        'payment_number',
        'payment_method',
        'va_number',
        'bank_code',
        'unique_code',
        'amount',
        'status',
        'proof_file_path',
        'paid_at',
        'verified_by',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'unique_code' => 'integer',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /** Label metode pembayaran (untuk struk). */
    public function getMethodLabelAttribute(): string
    {
        return self::METHOD_LABELS[$this->payment_method] ?? strtoupper((string) $this->payment_method);
    }

    /** Label status pembayaran (untuk struk). */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? strtoupper((string) $this->status);
    }

    /** Apakah pembayaran ini perlu bukti transfer (QRIS / bank transfer)? */
    public function requiresProof(): bool
    {
        return in_array($this->payment_method, [
            self::METHOD_QRIS,
            self::METHOD_BANK_TRANSFER,
        ], true);
    }

    /** Bukti pembayaran sudah diunggah customer. */
    public function hasProof(): bool
    {
        return filled($this->proof_file_path);
    }

    /** Apakah pembayaran ini masih menunggu verifikasi mitra? */
    public function awaitingVerification(): bool
    {
        return $this->status === self::STATUS_AWAITING_VERIFICATION;
    }

    /** Menunggu pembayaran / pemeriksaan (belum final). */
    public function isPending(): bool
    {
        return in_array($this->status, self::PENDING_STATUSES, true);
    }

    /** Struk hanya boleh dicetak setelah pembayaran benar-benar lunas/terverifikasi. */
    public function isSettled(): bool
    {
        return in_array($this->status, self::SETTLED_STATUSES, true);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }
}

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'payment_id',
        'refund_number',
        'amount',
        'reason',
        'status',
        'refunded_at',
        'processed_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'agent_profile_id',
        'transaction_number',
        'rental_amount',
        'delivery_fee',
        'service_fee',
        'additional_fee',
        'deposit_amount',
        'deduction_amount',
        'refund_amount',
        'total_amount',
        'status',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'rental_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'additional_fee' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'deduction_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'completed_at' => 'datetime',
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

    public function commission()
    {
        return $this->hasOne(TransactionCommission::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class);
    }
}

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

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

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
            TransactionCommission::class
        );
    }

    public function processor()
    {
        return $this->belongsTo(
            User::class,
            'processed_by'
        );
    }
}

