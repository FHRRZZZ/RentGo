<?php

namespace App\Console\Commands;

use App\Services\MarketingTaxService;
use Illuminate\Console\Command;

/**
 * Perintah artisan untuk memproses tagihan pajak pemasaran yang jatuh tempo.
 *
 * Jalankan manual:
 *   php artisan marketing-tax:process-overdue
 *
 * Dijadwalkan otomatis: setiap hari pukul 01:00 WIB
 */
class ProcessOverdueMarketingTax extends Command
{
    protected $signature = 'marketing-tax:process-overdue';

    protected $description = 'Tandai tagihan pajak yang jatuh tempo & nonaktifkan mitra yang belum bayar';

    public function __construct(
        private MarketingTaxService $taxService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Memproses tagihan pajak pemasaran yang jatuh tempo...');

        $deactivated = $this->taxService->processOverdueBills();

        $this->info("✅ Selesai. {$deactivated} mitra dinonaktifkan karena tagihan jatuh tempo.");

        return self::SUCCESS;
    }
}
