<?php

namespace App\Constants;

class DisputeStatus
{
    public const OPEN = 'open';
    public const UNDER_REVIEW = 'under_review';
    public const WAITING_CUSTOMER = 'waiting_customer';
    public const WAITING_AGENT = 'waiting_agent';
    public const RESOLVED = 'resolved';
    public const REJECTED = 'rejected';
    public const CLOSED = 'closed';

    /**
     * Seluruh status dispute yang valid.
     */
    public static function all(): array
    {
        return [
            self::OPEN,
            self::UNDER_REVIEW,
            self::WAITING_CUSTOMER,
            self::WAITING_AGENT,
            self::RESOLVED,
            self::REJECTED,
            self::CLOSED,
        ];
    }
}
