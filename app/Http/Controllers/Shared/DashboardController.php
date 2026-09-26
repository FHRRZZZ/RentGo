<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * DashboardController (Shared) — dispatcher cerdas.
 *
 * Mengarahkan tampilan dashboard sesuai role user yang sedang login:
 *  - admin  → Admin\DashboardController
 *  - mitra  → Agent\DashboardController
 *  - lainnya (customer) → Customer\DashboardController
 *
 * Route "/dashboard" memakai controller ini sebagai pintu masuk tunggal.
 */
class DashboardController extends Controller
{
    public function index(Request $request): \Inertia\Response|\Illuminate\Http\RedirectResponse|\Illuminate\View\View|\Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return app(\App\Http\Controllers\Admin\DashboardController::class)->index();
        }

        if ($user->hasRole('mitra')) {
            return app(\App\Http\Controllers\Agent\DashboardController::class)->index();
        }

        return app(\App\Http\Controllers\Customer\DashboardController::class)->index();
    }
}
