<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProcessRefundRequest;
use App\Models\Refund;
use App\Services\RefundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class RefundController extends Controller
{
    public function __construct(
        protected RefundService $refundService
    ) {
    }

    public function index(Request $request): View
    {
        $this->authorize('viewAny', Refund::class);

        $query = Refund::query()
            ->with([
                'booking.customer',
                'booking.agentProfile',
                'payment',
                'processor',
            ])
            ->latest();

        if (Auth::user()->hasRole('customer')) {
            $query->whereHas(
                'booking',
                fn ($query) => $query->where(
                    'customer_id',
                    Auth::id()
                )
            );
        }

        if (Auth::user()->hasRole('mitra')) {
            $query->whereHas(
                'booking.agentProfile',
                fn ($query) => $query->where(
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

        $refunds = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'refunds.index',
            compact('refunds')
        );
    }

    public function show(Refund $refund): View
    {
        $this->authorize('view', $refund);

        $refund->load([
            'booking.items.vehicle',
            'booking.customer',
            'booking.agentProfile',
            'payment',
            'processor',
        ]);

        return view(
            'refunds.show',
            compact('refund')
        );
    }

    public function process(
        ProcessRefundRequest $request,
        Refund $refund
    ): RedirectResponse {
        $this->authorize('process', $refund);

        $validated = $request->validated();

        $this->refundService->process(
            $refund,
            Auth::user(),
            $validated['status'],
            $validated['notes'] ?? null,
            $request
        );

        return redirect()
            ->route('refunds.show', $refund)
            ->with(
                'success',
                'Status refund berhasil diperbarui.'
            );
    }
}