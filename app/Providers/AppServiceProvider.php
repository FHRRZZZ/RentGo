<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Refund;
use App\Policies\RefundPolicy;
use App\Models\Transaction;
use App\Policies\TransactionPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }

    protected $policies = [
        Refund::class => RefundPolicy::class,
        Transaction::class => TransactionPolicy::class
    ];
}
