<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;

/**
 * Dashboard portal Admin.
 */
class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Halaman dashboard admin.
     */
    public function index(): \Inertia\Response|\Illuminate\View\View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getAdminData();

        return \Inertia\Inertia::render('Admin/Dashboard', $data);
    }
}
