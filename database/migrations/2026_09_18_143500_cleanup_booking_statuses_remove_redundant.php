<?php

use App\Constants\BookingStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Migrasi data eksisting jika masih ada booking dengan status lama 'pending_payment'
        DB::table('bookings')
            ->where('status', 'pending_payment')
            ->update(['status' => BookingStatus::WAITING_PAYMENT]);

        // 2. Bersihkan enum pada tabel bookings (hanya status resmi PRD)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `bookings` MODIFY COLUMN `status` ENUM(
                'pending',
                'waiting_payment',
                'paid',
                'waiting_agent_confirmation',
                'confirmed',
                'ready_for_pickup',
                'ongoing',
                'returned',
                'completed',
                'cancelled',
                'rejected',
                'expired',
                'refund_pending',
                'refunded',
                'disputed'
            ) NOT NULL DEFAULT 'waiting_payment'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `bookings` MODIFY COLUMN `status` ENUM(
                'pending',
                'pending_payment',
                'waiting_payment',
                'paid',
                'waiting_agent_confirmation',
                'confirmed',
                'ready_for_pickup',
                'ongoing',
                'returned',
                'completed',
                'cancelled',
                'rejected',
                'expired',
                'refund_pending',
                'refunded',
                'disputed'
            ) NOT NULL DEFAULT 'waiting_payment'");
        }
    }
};
