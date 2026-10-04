<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use App\Models\MarketingTax;
use App\Services\MarketingTaxService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller pajak pemasaran sisi Admin.
 * Admin dapat melihat semua tagihan, mengkonfirmasi/menolak bukti bayar,
 * membebaskan tagihan, dan men-generate tagihan manual.
 */
class MarketingTaxController extends Controller
{
    public function __construct(
        private MarketingTaxService $taxService
    ) {}

    /**
     * Daftar semua tagihan pajak pemasaran (admin).
     */
    public function index(Request $request): Response
    {
        $query = MarketingTax::with(['agentProfile.user'])
            ->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_profile_id', $request->agent_id);
        }

        if ($request->filled('year')) {
            $query->where('billing_year', $request->year);
        }

        if ($request->filled('month')) {
            $query->where('billing_month', $request->month);
        }

        $taxes = $query->paginate(20)->withQueryString();

        $stats = [
            'total_unpaid'          => MarketingTax::whereIn('status', [MarketingTax::STATUS_UNPAID, MarketingTax::STATUS_OVERDUE])->count(),
            'total_awaiting_review' => MarketingTax::where('status', MarketingTax::STATUS_AWAITING_REVIEW)->count(),
            'total_paid_this_month' => MarketingTax::where('status', MarketingTax::STATUS_PAID)
                ->where('billing_year', now()->year)
                ->where('billing_month', now()->month)
                ->count(),
            'revenue_this_month'    => (float) MarketingTax::where('status', MarketingTax::STATUS_PAID)
                ->where('billing_year', now()->year)
                ->where('billing_month', now()->month)
                ->sum('amount'),
            'total_overdue_agents'  => AgentProfile::where('is_active', false)
                ->whereHas('marketingTaxes', fn($q) => $q->where('status', MarketingTax::STATUS_OVERDUE))
                ->count(),
        ];

        return Inertia::render('Admin/MarketingTax', [
            'taxes'      => $taxes->items(),
            'pagination' => $taxes,
            'stats'      => $stats,
            'filters'    => $request->only(['status', 'agent_id', 'year', 'month']),
        ]);
    }

    /**
     * Admin mengkonfirmasi pembayaran (tandai lunas).
     */
    public function confirm(Request $request, MarketingTax $marketingTax): RedirectResponse
    {
        $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->taxService->confirm($marketingTax, $request->user(), $request->notes);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Pembayaran pajak pemasaran dikonfirmasi. Mitra telah diaktifkan kembali jika sebelumnya nonaktif.');
    }

    /**
     * Admin menolak bukti pembayaran mitra.
     */
    public function rejectProof(Request $request, MarketingTax $marketingTax): RedirectResponse
    {
        $request->validate([
            'notes' => ['required', 'string', 'max:500'],
        ], [
            'notes.required' => 'Alasan penolakan wajib diisi.',
        ]);

        try {
            $this->taxService->rejectProof($marketingTax, $request->user(), $request->notes);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Bukti pembayaran ditolak. Mitra telah diberitahu untuk mengupload ulang.');
    }

    /**
     * Admin membebaskan tagihan (waive).
     */
    public function waive(Request $request, MarketingTax $marketingTax): RedirectResponse
    {
        $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->taxService->waive($marketingTax, $request->user(), $request->notes);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Tagihan berhasil dibebaskan.');
    }

    /**
     * Generate tagihan manual untuk bulan tertentu.
     */
    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year'  => ['required', 'integer', 'min:2024', 'max:2099'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $created = $this->taxService->generateMonthlyBills($validated['year'], $validated['month']);

        return back()->with('success', "{$created} tagihan pajak pemasaran baru berhasil dibuat.");
    }
}
