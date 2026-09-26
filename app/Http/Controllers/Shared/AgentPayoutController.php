<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProcessAgentPayoutRequest;
use App\Models\AgentPayout;
use App\Models\TransactionCommission;
use App\Services\AgentPayoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AgentPayoutController extends Controller
{
    public function __construct(
        protected AgentPayoutService $payoutService
    ) {}

    public function index(
        Request $request
    ): View {
        $this->authorize(
            'viewAny',
            AgentPayout::class
        );

        $query = AgentPayout::query()
            ->with([
                'agentProfile',
                'transaction',
                'transactionCommission',
                'processor',
            ])
            ->latest();

        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'agentProfile',
                fn ($q) => $q->where(
                    'user_id',
                    Auth::id()
                )
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $payouts = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'agent-payouts.index',
            compact('payouts')
        );
    }

    public function show(
        AgentPayout $agentPayout
    ): View {
        $this->authorize(
            'view',
            $agentPayout
        );

        $agentPayout->load([
            'agentProfile',
            'transaction.booking',
            'transactionCommission',
            'processor',
        ]);

        return view(
            'agent-payouts.show',
            compact('agentPayout')
        );
    }

    public function createFromCommission(
        TransactionCommission $commission
    ): RedirectResponse {
        $this->authorize(
            'create',
            AgentPayout::class
        );

        $payout = $this->payoutService
            ->createFromCommission(
                $commission,
                Auth::user()
            );

        return redirect()
            ->route(
                'agent-payouts.show',
                $payout
            )
            ->with(
                'success',
                'Payout berhasil dibuat.'
            );
    }

    public function process(
        ProcessAgentPayoutRequest $request,
        AgentPayout $agentPayout
    ): RedirectResponse {
        $this->authorize(
            'process',
            $agentPayout
        );

        $validated = $request->validated();

        $this->payoutService->process(
            $agentPayout,
            Auth::user(),
            $validated['status'],
            $validated['payout_method'],
            $validated['account_name'] ?? null,
            $validated['account_number'] ?? null,
            $validated['bank_name'] ?? null,
            $validated['notes'] ?? null,
            $request,
        );

        return redirect()
            ->route(
                'agent-payouts.show',
                $agentPayout
            )
            ->with(
                'success',
                'Payout berhasil diperbarui.'
            );
    }
}