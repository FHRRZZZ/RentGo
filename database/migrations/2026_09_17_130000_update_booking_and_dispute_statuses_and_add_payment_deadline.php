<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'payment_deadline')) {
                $table->dateTime('payment_deadline')->nullable()->after('rental_end');
            }
        });

        // Update enum status pada tabel bookings agar memuat seluruh status PRD
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

        // Update enum status pada tabel disputes agar memuat status PRD
        DB::statement("ALTER TABLE `disputes` MODIFY COLUMN `status` ENUM(
            'open',
            'investigating',
            'under_review',
            'awaiting_response',
            'waiting_customer',
            'waiting_agent',
            'resolved',
            'rejected',
            'closed'
        ) NOT NULL DEFAULT 'open'");
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'payment_deadline')) {
                $table->dropColumn('payment_deadline');
            }
        });

        DB::statement("ALTER TABLE `bookings` MODIFY COLUMN `status` ENUM(
            'pending_payment',
            'paid',
            'waiting_agent_confirmation',
            'confirmed',
            'rejected',
            'cancelled',
            'ongoing',
            'returned',
            'completed'
        ) NOT NULL DEFAULT 'pending_payment'");
    }
};
