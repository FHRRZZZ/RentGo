<?php

namespace App\Console\Commands;

use App\Services\MarketingTaxService;
use Illuminate\Console\Command;

/**
 * Perintah artisan untuk generate tagihan pajak pemasaran bulanan.
 *
 * Jalankan manual:
 *   php artisan marketing-tax:generate
 *   php artisan marketing-tax:generate --year=2026 --month=10
 *
 * Dijadwalkan otomatis di bootstrap/app.php / Console/Kernel.php: setiap tanggal 1 bulan
 */
class GenerateMarketingTax extends Command
{
    protected $signature = 'marketing-tax:generate
                            {--year=  : Tahun periode tagihan (default: tahun ini)}
                            {--month= : Bulan periode tagihan (default: bulan ini)}';

    protected $description = 'Generate tagihan pajak pemasaran bulanan untuk semua mitra aktif';

    public function __construct(
        private MarketingTaxService $taxService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $year  = (int) ($this->option('year')  ?: now()->year);
        $month = (int) ($this->option('month') ?: now()->month);

        $this->info("Generating tagihan pajak pemasaran untuk {$month}/{$year}...");

        $created = $this->taxService->generateMonthlyBills($year, $month);

        $this->info("✅ {$created} tagihan baru berhasil dibuat.");

        return self::SUCCESS;
    }
}
