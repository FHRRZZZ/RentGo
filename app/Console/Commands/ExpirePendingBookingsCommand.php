<?php

namespace App\Console\Commands;

use App\Constants\BookingStatus;
use App\Models\Booking;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

class ExpirePendingBookingsCommand extends Command
{
    protected $signature = 'bookings:expire';
    protected $description = 'Membatalkan otomatis booking yang belum dibayar dan telah melewati payment_deadline';

    public function handle(
        AuditLogService $auditLogService,
        NotificationService $notificationService
    ): int {
        $expiredBookings = Booking::query()
            ->whereIn('status', [
                BookingStatus::PENDING,
                BookingStatus::WAITING_PAYMENT,
            ])
            ->whereNotNull('payment_deadline')
            ->where('payment_deadline', '<=', now())
            ->get();

        $count = $expiredBookings->count();

        foreach ($expiredBookings as $booking) {
            $oldValues = $booking->toArray();

            $booking->update([
                'status' => BookingStatus::EXPIRED,
            ]);

            $booking->refresh();

            $auditLogService->updated(
                $booking->customer,
                'booking',
                'Booking otomatis kadaluarsa (expired) karena melewati batas waktu pembayaran.',
                $booking,
                $oldValues,
                $booking->toArray()
            );

            if ($booking->customer) {
                $notificationService->create(
                    $booking->customer,
                    'booking_expired',
                    'Batas Waktu Pembayaran Habis',
                    "Pemesanan {$booking->booking_number} telah kadaluarsa karena tidak dibayar tepat waktu.",
                    [
                        'booking_id' => $booking->id,
                        'booking_number' => $booking->booking_number,
                    ]
                );
            }
        }

        $this->info("Berhasil mengupdate {$count} booking menjadi expired.");

        return SymfonyCommand::SUCCESS;
    }
}
