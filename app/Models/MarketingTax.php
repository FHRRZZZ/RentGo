<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Pajak Pemasaran Mitra.
 *
 * Setiap mitra dikenakan biaya pemasaran tetap Rp 75.000/bulan.
 * Jika jatuh tempo & belum dibayar → akun dinonaktifkan otomatis.
 */
class MarketingTax extends Model
{
    use HasFactory;

    /** Tarif pajak pemasaran bulanan default. */
    public const MONTHLY_FEE = 75000;

    /** Batas hari pembayaran setelah tagihan diterbitkan. */
    public const DUE_DAYS = 7;

    public const STATUS_UNPAID          = 'unpaid';
    public const STATUS_AWAITING_REVIEW = 'awaiting_review';
    public const STATUS_PAID            = 'paid';
    public const STATUS_OVERDUE         = 'overdue';
    public const STATUS_WAIVED          = 'waived';

    public const STATUS_LABELS = [
        self::STATUS_UNPAID          => 'Belum Dibayar',
        self::STATUS_AWAITING_REVIEW => 'Menunggu Konfirmasi',
        self::STATUS_PAID            => 'Lunas',
        self::STATUS_OVERDUE         => 'Jatuh Tempo',
        self::STATUS_WAIVED          => 'Dibebaskan',
    ];

    protected $fillable = [
        'agent_profile_id',
        'tax_number',
        'billing_year',
        'billing_month',
        'amount',
        'status',
        'due_date',
        'proof_file_path',
        'proof_uploaded_at',
        'verified_by',
        'verified_at',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount'            => 'decimal:2',
        'due_date'          => 'date',
        'proof_uploaded_at' => 'datetime',
        'verified_at'       => 'datetime',
        'paid_at'           => 'datetime',
    ];

    public function agentProfile()
    {
        return $this->belongsTo(AgentProfile::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /** Label status tampilan. */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? strtoupper((string) $this->status);
    }

    /** Nama bulan & tahun periode tagihan (misal: "Oktober 2026"). */
    public function getBillingPeriodLabelAttribute(): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret',
            4 => 'April',   5 => 'Mei',       6 => 'Juni',
            7 => 'Juli',    8 => 'Agustus',   9 => 'September',
            10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];
        return ($months[(int) $this->billing_month] ?? '-') . ' ' . $this->billing_year;
    }

    /** Apakah sudah jatuh tempo (due_date terlewat & belum dibayar)? */
    public function isOverdue(): bool
    {
        return in_array($this->status, [self::STATUS_UNPAID, self::STATUS_OVERDUE], true)
            && now()->startOfDay()->gt($this->due_date);
    }

    /** Apakah tagihan ini sudah selesai (lunas atau dibebaskan)? */
    public function isSettled(): bool
    {
        return in_array($this->status, [self::STATUS_PAID, self::STATUS_WAIVED], true);
    }

    /** Apakah mitra sudah upload bukti bayar dan menunggu review? */
    public function awaitingReview(): bool
    {
        return $this->status === self::STATUS_AWAITING_REVIEW;
    }
}
