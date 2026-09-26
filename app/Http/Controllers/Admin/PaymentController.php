<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessAgentPayoutRequest;
use App\Http\Requests\ProcessRefundRequest;
use App\Http\Requests\VerifyPaymentRequest;
use App\Models\AgentPayout;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Transaction;
use App\Models\TransactionCommission;
use App\Services\AgentPayoutService;
use App\Services\PaymentService;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

/**
 * PaymentController khusus Admin.
 *
 * Berisi daftar seluruh pembayaran (halaman Finance) dan verifikasi
 * pembayaran oleh admin.
 */
class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private AgentPayoutService $payoutService,
        private RefundService $refundService,
    ) {}

    /**
     * Daftar pembayaran (Finance) dengan filter dan pagination.
     */
    public function index(Request $request): \Inertia\Response|View|\Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $query = Payment::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
            ])
            ->latest();

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter metode pembayaran
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query
            ->paginate(15)
            ->withQueryString();

        // Payout mitra yang menunggu / sedang diproses admin.
        $payouts = AgentPayout::query()
            ->with(['agentProfile.user', 'transaction'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (AgentPayout $p) => [
                'id' => $p->id,
                'payout_number' => $p->payout_number,
                'amount' => (float) $p->amount,
                'payout_method' => $p->payout_method,
                'account_name' => $p->account_name,
                'account_number' => $p->account_number,
                'bank_name' => $p->bank_name,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->toISOString(),
                'created_at' => $p->created_at?->toISOString(),
                'agent_name' => $p->agentProfile?->agency_name
                    ?? $p->agentProfile?->user?->name
                    ?? 'Mitra RentGo',
                'transaction_number' => $p->transaction?->transaction_number,
            ])
            ->values()
            ->all();

        // Refund yang perlu diproses admin.
        $refunds = Refund::query()
            ->with(['booking.customer', 'payment', 'processor'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Refund $r) => [
                'id' => $r->id,
                'refund_number' => $r->refund_number,
                'amount' => (float) $r->amount,
                'reason' => $r->reason,
                'status' => $r->status,
                'notes' => $r->notes,
                'refunded_at' => $r->refunded_at?->toISOString(),
                'created_at' => $r->created_at?->toISOString(),
                'booking_number' => $r->booking?->booking_number,
                'customer_name' => $r->booking?->customer?->name,
                'processor' => $r->processor?->name,
            ])
            ->values()
            ->all();

        // Statistik nyata dari data transaksi & komisi.
        $stats = [
            'total_gmv' => (float) Transaction::where('status', 'completed')->sum('total_amount'),
            'platform_commission_revenue' => (float) TransactionCommission::whereIn('status', ['calculated', 'paid'])->sum('commission_amount'),
            'pending_payouts' => (float) AgentPayout::whereIn('status', ['pending', 'processing'])->sum('amount'),
            'pending_refunds' => (float) Refund::whereIn('status', ['pending', 'processing'])->sum('amount'),
        ];

        return \Inertia\Inertia::render('Admin/Finance', [
            'payments' => $payments->items(),
            'pagination' => $payments,
            'payouts' => $payouts,
            'refunds' => $refunds,
            'stats' => $stats,
        ]);
    }

    /**
     * Proses payout mitra oleh admin (transfer pencairan saldo).
     */
    public function processPayout(ProcessAgentPayoutRequest $request, AgentPayout $agentPayout): RedirectResponse
    {
        $this->authorize('process', $agentPayout);

        $validated = $request->validated();

        try {
            $this->payoutService->process(
                $agentPayout,
                Auth::user(),
                $validated['status'],
                $validated['payout_method'],
                $validated['account_name'] ?? $agentPayout->account_name,
                $validated['account_number'] ?? $agentPayout->account_number,
                $validated['bank_name'] ?? $agentPayout->bank_name,
                $validated['notes'] ?? null,
                $request,
            );
        } catch (\RuntimeException | \InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('admin.finance')
            ->with('success', 'Payout mitra berhasil diproses.');
    }

    /**
     * Proses refund ke customer oleh admin.
     */
    public function processRefund(ProcessRefundRequest $request, Refund $refund): RedirectResponse
    {
        $this->authorize('process', $refund);

        $validated = $request->validated();

        try {
            $this->refundService->process(
                $refund,
                Auth::user(),
                $validated['status'],
                $validated['notes'] ?? null,
                $request,
            );
        } catch (\RuntimeException | \InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('admin.finance')
            ->with('success', 'Refund berhasil diproses.');
    }

    /**
     * Verifikasi pembayaran oleh admin.
     */
    public function verify(VerifyPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->authorize('verify', $payment);

        $validated = $request->validated();

        $this->paymentService->verify(
            $payment,
            Auth::user(),
            $validated['status'],
            $validated['notes'] ?? null,
            $request
        );

        return redirect()
            ->route('payments.show', $payment)
            ->with('success', 'Status pembayaran berhasil diperbarui.');
    }
}
