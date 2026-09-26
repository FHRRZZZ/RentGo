<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;

/**
 * Dashboard portal Customer (penyewa).
 */
class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Halaman dashboard customer.
     */
    public function index(): \Inertia\Response|\Illuminate\View\View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getCustomerData(Auth::user());

        return \Inertia\Inertia::render('Dashboard', $data);
    }
}
