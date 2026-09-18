<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Halaman dashboard utama.
     */
    public function index(Request $request): View|\Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return $this->adminDashboard();
        }

        if ($user->hasRole('mitra')) {
            return $this->mitraDashboard($user);
        }

        return $this->customerDashboard($user);
    }

    protected function adminDashboard(): View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getAdminData();

        if (view()->exists('dashboard.admin')) {
            return view('dashboard.admin', $data);
        }

        return response()->json($data);
    }

    protected function mitraDashboard($user): View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getMitraData($user);

        if (view()->exists('dashboard.mitra')) {
            return view('dashboard.mitra', $data);
        }

        return response()->json($data);
    }

    protected function customerDashboard($user): View|\Illuminate\Http\JsonResponse
    {
        $data = $this->dashboardService->getCustomerData($user);

        if (view()->exists('dashboard.customer')) {
            return view('dashboard.customer', $data);
        }

        return response()->json($data);
    }
}
