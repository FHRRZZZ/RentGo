<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Auth;

/**
 * Dashboard portal Mitra (Agent).
 */
class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Halaman dashboard mitra.
     */
    public function index(): \Inertia\Response|\Illuminate\View\View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getMitraData(Auth::user());

        return \Inertia\Inertia::render('Agent/Dashboard', $data);
    }
}
