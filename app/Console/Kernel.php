<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Generate tagihan pajak pemasaran mitra — setiap tanggal 1 pukul 00:05 WIB
        $schedule->command('marketing-tax:generate')
            ->monthlyOn(1, '00:05')
            ->timezone('Asia/Jakarta')
            ->withoutOverlapping()
            ->runInBackground();

        // Proses tagihan jatuh tempo & nonaktifkan mitra — setiap hari pukul 01:00 WIB
        $schedule->command('marketing-tax:process-overdue')
            ->dailyAt('01:00')
            ->timezone('Asia/Jakarta')
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
