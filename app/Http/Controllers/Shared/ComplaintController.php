<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;

use App\Http\Requests\ProcessComplaintRequest;
use App\Http\Requests\StoreComplaintRequest;
use App\Models\Booking;
use App\Models\Complaint;
use App\Services\ComplaintService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ComplaintController extends Controller
{
    public function __construct(
        protected ComplaintService $complaintService
    ) {
    }

    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            Complaint::class
        );

        $query = Complaint::query()
            ->with([
                'booking',
                'complainant',
                'reportedUser',
                'assignee',
            ])
            ->latest();

        if (!$request->user()->hasRole('admin')) {
            $query->where(function ($query) use ($request) {
                $query
                    ->where(
                        'complainant_id',
                        $request->user()->id
                    )
                    ->orWhere(
                        'reported_user_id',
                        $request->user()->id
                    );
            });
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $complaints = $query
            ->paginate(15)
            ->withQueryString();

        return view(
            'complaints.index',
            compact('complaints')
        );
    }

    public function create(
        Request $request
    ): View {
        $this->authorize(
            'create',
            Complaint::class
        );

        $booking = null;

        if ($request->filled('booking_id')) {
            $booking = Booking::with([
                'items.vehicle',
                'agentProfile',
                'customer',
            ])->findOrFail(
                $request->integer('booking_id')
            );

            $user = $request->user();

            $allowed =
                $booking->customer_id === $user->id
                ||
                $booking->agentProfile?->user_id === $user->id;

            if (!$allowed) {
                abort(403);
            }
        }

        return view(
            'complaints.create',
            compact('booking')
        );
    }

    public function store(
        StoreComplaintRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        $booking = null;

        if (!empty($validated['booking_id'])) {
            $booking = Booking::findOrFail(
                $validated['booking_id']
            );
        }

        $validated['attachments'] =
            $request->file('attachments', []);

        $complaint = $this->complaintService->create(
            $booking,
            $request->user(),
            $validated,
            $request
        );

        return redirect()
            ->route(
                'complaints.show',
                $complaint
            )
            ->with(
                'success',
                'Pengaduan berhasil dibuat.'
            );
    }

    public function show(
        Complaint $complaint
    ): View {
        $this->authorize(
            'view',
            $complaint
        );

        $complaint->load([
            'booking.items.vehicle',
            'complainant',
            'reportedUser',
            'assignee',
        ]);

        return view(
            'complaints.show',
            compact('complaint')
        );
    }

    public function process(
        ProcessComplaintRequest $request,
        Complaint $complaint
    ): RedirectResponse {
        $this->authorize(
            'process',
            $complaint
        );

        $validated = $request->validated();

        $this->complaintService->process(
            $complaint,
            $request->user(),
            $validated['status'],
            $validated['assigned_to'] ?? null,
            $validated['resolution'] ?? null,
            $request
        );

        return redirect()
            ->route(
                'complaints.show',
                $complaint
            )
            ->with(
                'success',
                'Pengaduan berhasil diproses.'
            );
    }
}