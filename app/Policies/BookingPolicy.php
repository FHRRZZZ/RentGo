<?php

namespace App\Policies;

use App\Constants\BookingStatus;
use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'mitra',
            'customer',
        ]);
    }

    public function confirm(User $user, Booking $booking): bool
{
    if (!$user->hasRole('mitra')) {
        return false;
    }

    return $booking->agentProfile?->user_id === $user->id
        && $booking->status === BookingStatus::WAITING_AGENT_CONFIRMATION;
}

    public function view(User $user, Booking $booking): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if (
            $user->hasRole('customer') &&
            $booking->customer_id === $user->id
        ) {
            return true;
        }

        if ($user->hasRole('mitra')) {
            return $booking->agentProfile?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('customer');
    }

    public function update(User $user, Booking $booking): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('customer')) {
            return $booking->customer_id === $user->id
                && in_array($booking->status, [BookingStatus::WAITING_PAYMENT, BookingStatus::PENDING], true);
        }

        return false;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->hasRole('admin');
    }
}