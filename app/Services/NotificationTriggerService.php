<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\RentalCheckin;
use App\Models\RentalCheckout;
use App\Models\RentalDamage;
use App\Models\Review;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;

class NotificationTriggerService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {
    }

    /**
     * ==========================================================
     * BOOKING
     * ==========================================================
     */

    public function bookingCreated(
        Booking $booking
    ): void {
        $booking->loadMissing([
            'agentProfile.user',
        ]);

        $mitra = $booking->agentProfile?->user;

        if (!$mitra) {
            return;
        }

        $this->notificationService->create(
            $mitra,
            'booking_created',
            'Booking Baru',
            'Ada booking baru yang perlu Anda konfirmasi.',
            [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
            ]
        );
    }

    public function bookingConfirmed(
        Booking $booking
    ): void {
        $booking->loadMissing([
            'customer',
        ]);

        $customer = $booking->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'booking_confirmed',
            'Booking Dikonfirmasi',
            'Booking '
                . $booking->booking_number
                . ' telah dikonfirmasi oleh mitra.',
            [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
            ]
        );
    }

    public function bookingRejected(
        Booking $booking
    ): void {
        $booking->loadMissing([
            'customer',
        ]);

        $customer = $booking->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'booking_rejected',
            'Booking Ditolak',
            'Booking '
                . $booking->booking_number
                . ' ditolak oleh mitra.',
            [
                'booking_id' => $booking->id,
                'booking_number' => $booking->booking_number,
            ]
        );
    }

    public function bookingCancelled(
        Booking $booking,
        ?User $recipient = null
    ): void {
        $booking->loadMissing([
            'customer',
            'agentProfile.user',
        ]);

        $recipients = [];

        if ($booking->customer) {
            $recipients[$booking->customer->id] =
                $booking->customer;
        }

        $mitra = $booking->agentProfile?->user;

        if ($mitra) {
            $recipients[$mitra->id] = $mitra;
        }

        if ($recipient) {
            $recipients[$recipient->id] = $recipient;
        }

        foreach ($recipients as $user) {
            $this->notificationService->create(
                $user,
                'booking_cancelled',
                'Booking Dibatalkan',
                'Booking '
                    . $booking->booking_number
                    . ' telah dibatalkan.',
                [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                ]
            );
        }
    }

    /**
     * ==========================================================
     * PAYMENT
     * ==========================================================
     */

    public function paymentVerified(
        Payment $payment
    ): void {
        $payment->loadMissing([
            'booking.customer',
            'booking.agentProfile.user',
        ]);

        $booking = $payment->booking;

        if (!$booking) {
            return;
        }

        /*
         * Customer
         */
        if ($booking->customer) {
            $this->notificationService->create(
                $booking->customer,
                'payment_verified',
                'Pembayaran Berhasil',
                'Pembayaran untuk booking '
                    . $booking->booking_number
                    . ' telah berhasil diverifikasi.',
                [
                    'booking_id' => $booking->id,
                    'booking_number' =>
                        $booking->booking_number,
                    'payment_id' => $payment->id,
                    'payment_number' =>
                        $payment->payment_number,
                ]
            );
        }

        /*
         * Mitra
         */
        $mitra = $booking->agentProfile?->user;

        if ($mitra) {
            $this->notificationService->create(
                $mitra,
                'payment_verified',
                'Pembayaran Berhasil Diverifikasi',
                'Pembayaran untuk booking '
                    . $booking->booking_number
                    . ' telah diverifikasi dan booking '
                    . 'menunggu konfirmasi Anda.',
                [
                    'booking_id' => $booking->id,
                    'booking_number' =>
                        $booking->booking_number,
                    'payment_id' => $payment->id,
                    'payment_number' =>
                        $payment->payment_number,
                ]
            );
        }
    }

    public function paymentFailed(
        Payment $payment,
        string $status
    ): void {
        $payment->loadMissing([
            'booking.customer',
        ]);

        $customer = $payment->booking?->customer;

        if (!$customer) {
            return;
        }

        $title = match ($status) {
            'failed' => 'Pembayaran Gagal',
            'expired' => 'Pembayaran Kedaluwarsa',
            'cancelled' => 'Pembayaran Dibatalkan',
            default => 'Status Pembayaran Berubah',
        };

        $message = match ($status) {
            'failed' =>
                'Pembayaran untuk booking '
                . $payment->booking->booking_number
                . ' dinyatakan gagal. Silakan melakukan pembayaran kembali.',

            'expired' =>
                'Pembayaran untuk booking '
                . $payment->booking->booking_number
                . ' telah kedaluwarsa. Silakan melakukan pembayaran kembali.',

            'cancelled' =>
                'Pembayaran untuk booking '
                . $payment->booking->booking_number
                . ' telah dibatalkan. Silakan melakukan pembayaran kembali.',

            default =>
                'Status pembayaran Anda telah berubah.',
        };

        $this->notificationService->create(
            $customer,
            'payment_' . $status,
            $title,
            $message,
            [
                'booking_id' =>
                    $payment->booking->id,
                'booking_number' =>
                    $payment->booking->booking_number,
                'payment_id' =>
                    $payment->id,
                'payment_number' =>
                    $payment->payment_number,
                'status' =>
                    $status,
            ]
        );
    }

    /**
     * ==========================================================
     * REFUND
     * ==========================================================
     */

    public function refundProcessed(
        Refund $refund
    ): void {
        $refund->loadMissing([
            'payment.booking.customer',
        ]);

        $customer =
            $refund->payment?->booking?->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'refund_processed',
            'Refund Diproses',
            'Refund untuk booking '
                . $refund->payment->booking->booking_number
                . ' telah diproses.',
            [
                'refund_id' => $refund->id,
                'payment_id' =>
                    $refund->payment_id,
                'booking_id' =>
                    $refund->payment->booking_id,
            ]
        );
    }

    /**
     * ==========================================================
     * COMPLAINT
     * ==========================================================
     */

    public function complaintCreated(
        Complaint $complaint
    ): void {
        /*
         * Admin menerima notification.
         */
        $admins = User::role('admin')->get();

        foreach ($admins as $admin) {
            $this->notificationService->create(
                $admin,
                'complaint_created',
                'Complaint Baru',
                'Ada complaint baru yang membutuhkan penanganan.',
                [
                    'complaint_id' => $complaint->id,
                    'booking_id' => $complaint->booking_id,
                ]
            );
        }
    }

    public function complaintProcessed(
        Complaint $complaint
    ): void {
        $complaint->loadMissing([
            'complainant',
        ]);

        $complainant = $complaint->complainant;

        if (!$complainant) {
            return;
        }

        $this->notificationService->create(
            $complainant,
            'complaint_processed',
            'Complaint Diperbarui',
            'Complaint Anda telah diperbarui oleh admin.',
            [
                'complaint_id' => $complaint->id,
                'status' => $complaint->status,
            ]
        );
    }

    /**
     * ==========================================================
     * REVIEW
     * ==========================================================
     */

    public function reviewCreated(
        Review $review
    ): void {
        $review->loadMissing([
            'vehicle.agentProfile.user',
        ]);

        $mitra =
            $review->vehicle?->agentProfile?->user;

        if (!$mitra) {
            return;
        }

        $this->notificationService->create(
            $mitra,
            'review_created',
            'Review Baru',
            'Kendaraan Anda mendapatkan review baru dari customer.',
            [
                'review_id' => $review->id,
                'vehicle_id' => $review->vehicle_id,
            ]
        );
    }

    /**
     * ==========================================================
     * VEHICLE
     * ==========================================================
     */

    public function vehicleVerified(
        Vehicle $vehicle,
        string $status
    ): void {
        $vehicle->loadMissing([
            'agentProfile.user',
        ]);

        $mitra =
            $vehicle->agentProfile?->user;

        if (!$mitra) {
            return;
        }

        $title = match ($status) {
            'approved' =>
                'Kendaraan Disetujui',

            'rejected' =>
                'Kendaraan Ditolak',

            default =>
                'Status Kendaraan Diperbarui',
        };

        $message = match ($status) {
            'approved' =>
                'Kendaraan '
                . $vehicle->name
                . ' telah disetujui dan dapat digunakan.',

            'rejected' =>
                'Kendaraan '
                . $vehicle->name
                . ' ditolak dalam proses verifikasi.',

            default =>
                'Status verifikasi kendaraan '
                . $vehicle->name
                . ' telah diperbarui.',
        };

        $this->notificationService->create(
            $mitra,
            'vehicle_' . $status,
            $title,
            $message,
            [
                'vehicle_id' => $vehicle->id,
                'vehicle_name' => $vehicle->name,
                'status' => $status,
            ]
        );
    }

    /**
     * ==========================================================
     * RENTAL DAMAGE
     * ==========================================================
     */

    public function rentalDamageCreated(
        RentalDamage $damage
    ): void {
        $damage->loadMissing([
            'booking.customer',
        ]);

        $customer = $damage->booking?->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'rental_damage_created',
            'Laporan Kerusakan Kendaraan',
            'Mitra telah mencatat kerusakan pada kendaraan yang Anda sewa. '
                . 'Silakan periksa detail laporan kerusakan.',
            [
                'damage_id'  => $damage->id,
                'booking_id' => $damage->booking_id,
            ]
        );
    }

    /**
     * ==========================================================
     * RENTAL CHECKOUT & CHECKIN
     * ==========================================================
     */

    public function rentalCheckoutCreated(
        RentalCheckout $checkout
    ): void {
        $checkout->loadMissing([
            'booking.customer',
        ]);

        $customer = $checkout->booking?->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'rental_checkout_created',
            'Checkout Kendaraan Berhasil',
            'Kendaraan untuk booking '
                . $checkout->booking->booking_number
                . ' telah diserahkan (checkout). Selamat menikmati perjalanan Anda!',
            [
                'checkout_id' => $checkout->id,
                'booking_id'  => $checkout->booking_id,
                'vehicle_id'  => $checkout->vehicle_id,
            ]
        );
    }

    public function rentalCheckinCreated(
        RentalCheckin $checkin
    ): void {
        $checkin->loadMissing([
            'booking.customer',
        ]);

        $customer = $checkin->booking?->customer;

        if (!$customer) {
            return;
        }

        $this->notificationService->create(
            $customer,
            'rental_checkin_created',
            'Check-in Kendaraan Selesai',
            'Kendaraan untuk booking '
                . $checkin->booking->booking_number
                . ' telah berhasil dikembalikan (check-in).',
            [
                'checkin_id' => $checkin->id,
                'booking_id' => $checkin->booking_id,
                'vehicle_id' => $checkin->vehicle_id,
            ]
        );
    }

    /**
     * ==========================================================
     * TRANSACTION
     * ==========================================================
     */

    /**
     * Notifikasi ke customer dan mitra setelah transaksi selesai.
     */
    public function transactionCompleted(
        Transaction $transaction
    ): void {
        $transaction->loadMissing([
            'customer',
            'agentProfile.user',
            'booking',
        ]);

        $bookingNumber = $transaction->booking?->booking_number
            ?? $transaction->transaction_number;

        if ($transaction->customer) {
            $this->notificationService->create(
                $transaction->customer,
                'transaction_completed',
                'Transaksi Selesai',
                'Transaksi untuk booking '
                    . $bookingNumber
                    . ' telah selesai. Terima kasih telah menggunakan RentGo!',
                [
                    'transaction_id'     => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'booking_id'         => $transaction->booking_id,
                ]
            );
        }

        $mitra = $transaction->agentProfile?->user;

        if ($mitra) {
            $this->notificationService->create(
                $mitra,
                'transaction_completed',
                'Transaksi Selesai',
                'Transaksi untuk booking '
                    . $bookingNumber
                    . ' telah diselesaikan. Pendapatan Anda siap diproses.',
                [
                    'transaction_id'     => $transaction->id,
                    'transaction_number' => $transaction->transaction_number,
                    'booking_id'         => $transaction->booking_id,
                ]
            );
        }
    }
}