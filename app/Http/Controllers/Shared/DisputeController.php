<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProcessDisputeRequest;
use App\Http\Requests\StoreDisputeRequest;
use App\Models\Booking;
use App\Models\Dispute;
use App\Services\DisputeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DisputeController extends Controller
{
    public function __construct(
        protected DisputeService $disputeService
    ) {}

    /**
     * Daftar dispute.
     */
    public function index(Request $request): View
    {
        $this->authorize('viewAny', Dispute::class);

        $user = Auth::user();

        $query = Dispute::query()
            ->with([
                'booking',
                'initiator',
                'respondent',
                'assignee',
            ])
            ->latest();

        // Customer dan mitra hanya melihat dispute
        // yang berkaitan dengan dirinya.
        if (!$user->hasRole('admin')) {
            $query->where(function ($query) use ($user) {
                $query
                    ->where('initiator_id', $user->id)
                    ->orWhere('respondent_id', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        if ($request->filled('category')) {
            $query->where(
                'category',
                $request->category
            );
        }

        $disputes = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'disputes.index',
            compact('disputes')
        );
    }

    /**
     * Form membuat dispute.
     */
    public function create(Request $request): View
    {
        $this->authorize('create', Dispute::class);

        $booking = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::query()
                ->with([
                    'agentProfile',
                    'customer',
                    'items.vehicle',
                ])
                ->findOrFail(
                    $request->booking_id
                );

            $user = Auth::user();

            $isCustomerOwner =
                $booking->customer_id === $user->id;

            $isMitraOwner =
                $booking->agentProfile?->user_id === $user->id;

            abort_unless(
                $isCustomerOwner || $isMitraOwner,
                403
            );
        }

        return view(
            'disputes.create',
            compact('booking')
        );
    }

    /**
     * Simpan dispute baru.
     */
    public function store(
        StoreDisputeRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        $attachments = $request
            ->file('attachments', []);

        $dispute = $this->disputeService->create(
            Auth::user(),
            $validated,
            $attachments
        );

        return redirect()
            ->route(
                'disputes.show',
                $dispute
            )
            ->with(
                'success',
                'Dispute berhasil dibuat.'
            );
    }

    /**
     * Detail dispute.
     */
    public function show(
        Dispute $dispute
    ): View {
        $this->authorize(
            'view',
            $dispute
        );

        $dispute->load([
            'booking.items.vehicle',
            'initiator',
            'respondent',
            'assignee',
        ]);

        return view(
            'disputes.show',
            compact('dispute')
        );
    }

    /**
     * Proses dispute oleh admin.
     */
    public function process(
        ProcessDisputeRequest $request,
        Dispute $dispute
    ): RedirectResponse {
        $this->authorize(
            'process',
            $dispute
        );

        $validated = $request->validated();

        $this->disputeService->process(
            $dispute,
            Auth::user(),
            $validated['status'],
            $validated['assigned_to'] ?? null,
            $validated['resolution'] ?? null,
            $validated['resolution_party'] ?? null,
            (float) ($validated['refund_amount'] ?? 0),
            $validated['notes'] ?? null
        );

        return redirect()
            ->route(
                'disputes.show',
                $dispute
            )
            ->with(
                'success',
                'Dispute berhasil diproses.'
            );
    }
}