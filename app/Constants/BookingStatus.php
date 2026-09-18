<?php

namespace App\Constants;

class BookingStatus
{
    public const PENDING = 'pending';
    public const WAITING_PAYMENT = 'waiting_payment';
    public const PAID = 'paid';
    public const WAITING_AGENT_CONFIRMATION = 'waiting_agent_confirmation';
    public const CONFIRMED = 'confirmed';
    public const READY_FOR_PICKUP = 'ready_for_pickup';
    public const ONGOING = 'ongoing';
    public const RETURNED = 'returned';
    public const COMPLETED = 'completed';
    public const CANCELLED = 'cancelled';
    public const REJECTED = 'rejected';
    public const EXPIRED = 'expired';
    public const REFUND_PENDING = 'refund_pending';
    public const REFUNDED = 'refunded';
    public const DISPUTED = 'disputed';

    /**
     * Seluruh status yang valid.
     */
    public static function all(): array
    {
        return [
            self::PENDING,
            self::WAITING_PAYMENT,
            self::PAID,
            self::WAITING_AGENT_CONFIRMATION,
            self::CONFIRMED,
            self::READY_FOR_PICKUP,
            self::ONGOING,
            self::RETURNED,
            self::COMPLETED,
            self::CANCELLED,
            self::REJECTED,
            self::EXPIRED,
            self::REFUND_PENDING,
            self::REFUNDED,
            self::DISPUTED,
        ];
    }

    /**
     * Status booking yang dianggap aktif (kendaraan sedang digunakan/dipesan).
     */
    public static function activeStatuses(): array
    {
        return [
            self::PENDING,
            self::WAITING_PAYMENT,
            self::PAID,
            self::WAITING_AGENT_CONFIRMATION,
            self::CONFIRMED,
            self::READY_FOR_PICKUP,
            self::ONGOING,
        ];
    }
}
