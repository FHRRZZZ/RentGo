<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Booking;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    public function index(Request $request): View
    {
        $this->authorize('viewAny', Transaction::class);

        $query = Transaction::query()
            ->with([
                'booking',
                'customer',
                'agentProfile',
                'commission',
            ])
            ->latest();

        if (Auth::user()->hasRole('customer')) {
            $query->where(
                'customer_id',
                Auth::id()
            );
        }

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

        $transactions = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'transactions.index',
            compact('transactions')
        );
    }

    public function create(
        Request $request
    ): View {
        $this->authorize(
            'create',
            Transaction::class
        );

        $booking = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::query()
                ->with([
                    'items.vehicle',
                    'customer',
                    'agentProfile',
                    'rentalCheckin',
                    'rentalDamages',
                    'transaction',
                ])
                ->findOrFail(
                    $request->integer('booking_id')
                );

            $this->authorize(
                'view',
                $booking
            );
        }

        return view(
            'transactions.create',
            compact('booking')
        );
    }

    public function store(
        StoreTransactionRequest $request
    ): RedirectResponse {
        $this->authorize(
            'create',
            Transaction::class
        );

        $validated = $request->validated();

        $booking = Booking::query()
            ->with([
                'items',
                'agentProfile',
                'customer',
                'rentalCheckin',
                'rentalDamages',
                'transaction',
            ])
            ->findOrFail(
                $validated['booking_id']
            );

        $this->authorize(
            'view',
            $booking
        );

        $transaction = $this->transactionService->create(
            $booking,
            Auth::user(),
            $validated['notes'] ?? null,
            $request
        );

        return redirect()
            ->route(
                'transactions.show',
                $transaction
            )
            ->with(
                'success',
                'Transaksi berhasil dibuat.'
            );
    }

    public function show(
        Transaction $transaction
    ): View {
        $this->authorize(
            'view',
            $transaction
        );

        $transaction->load([
            'booking.items.vehicle',
            'booking.rentalCheckin',
            'booking.rentalDamages',
            'customer',
            'agentProfile',
            'commission',
        ]);

        return view(
            'transactions.show',
            compact('transaction')
        );
    }

   public function complete(
    Request $request,
    Transaction $transaction
): RedirectResponse {
    $this->authorize(
        'update',
        $transaction
    );

    $this->transactionService->complete(
        $transaction,
        Auth::user(),
        $request
    );

    return redirect()
        ->route(
            'transactions.show',
            $transaction
        )
        ->with(
            'success',
            'Transaksi berhasil diselesaikan.'
        );
    }
}