<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ModerateReviewRequest;
use App\Http\Requests\ProcessComplaintRequest;
use App\Http\Requests\ProcessDisputeRequest;
use App\Models\Complaint;
use App\Models\Dispute;
use App\Models\Review;
use App\Models\User;
use App\Services\ComplaintService;
use App\Services\DisputeService;
use App\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Pusat penyelesaian masalah untuk Admin:
 * Sengketa (dispute), Komplain (complaint), dan Ulasan (review).
 *
 * Halaman admin memakai Inertia, sehingga controller ini mengembalikan data
 * siap-pakai (bukan Blade) sekaligus menangani aksi pemrosesan/moderasi.
 */
class SupportController extends Controller
{
    public function __construct(
        private DisputeService $disputeService,
        private ComplaintService $complaintService,
        private ReviewService $reviewService,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Daftar gabungan: sengketa, komplain, ulasan
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): \Inertia\Response
    {
        $this->authorize('viewAny', Dispute::class);
        $this->authorize('viewAny', Complaint::class);
        $this->authorize('viewAny', Review::class);

        $disputes = Dispute::query()
            ->with(['booking', 'initiator', 'respondent', 'assignee'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Dispute $d) => [
                'id' => $d->id,
                'subject' => $d->subject,
                'description' => $d->description,
                'category' => $d->category,
                'status' => $d->status,
                'resolution' => $d->resolution,
                'resolution_party' => $d->resolution_party,
                'refund_amount' => (float) $d->refund_amount,
                'notes' => $d->notes,
                'created_at' => $d->created_at?->toISOString(),
                'resolved_at' => $d->resolved_at?->toISOString(),
                'booking_number' => $d->booking?->booking_number,
                'initiator' => $d->initiator ? [
                    'id' => $d->initiator->id,
                    'name' => $d->initiator->name,
                    'email' => $d->initiator->email,
                ] : null,
                'respondent' => $d->respondent ? [
                    'id' => $d->respondent->id,
                    'name' => $d->respondent->name,
                    'email' => $d->respondent->email,
                ] : null,
                'assignee' => $d->assignee?->name,
            ])
            ->values()
            ->all();

        $complaints = Complaint::query()
            ->with(['booking', 'complainant', 'reportedUser', 'assignee'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Complaint $c) => [
                'id' => $c->id,
                'subject' => $c->subject,
                'description' => $c->description,
                'category' => $c->category,
                'priority' => $c->priority,
                'status' => $c->status,
                'resolution' => $c->resolution,
                'created_at' => $c->created_at?->toISOString(),
                'resolved_at' => $c->resolved_at?->toISOString(),
                'booking_number' => $c->booking?->booking_number,
                'complainant' => $c->complainant ? [
                    'id' => $c->complainant->id,
                    'name' => $c->complainant->name,
                ] : null,
                'reported_user' => $c->reportedUser ? [
                    'id' => $c->reportedUser->id,
                    'name' => $c->reportedUser->name,
                ] : null,
                'assignee' => $c->assignee?->name,
            ])
            ->values()
            ->all();

        $reviews = Review::query()
            ->with(['customer', 'vehicle', 'moderator'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Review $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'review' => $r->review,
                'status' => $r->status,
                'moderation_note' => $r->moderation_note,
                'created_at' => $r->created_at?->toISOString(),
                'published_at' => $r->published_at?->toISOString(),
                'customer' => $r->customer ? [
                    'id' => $r->customer->id,
                    'name' => $r->customer->name,
                ] : null,
                'vehicle_name' => $r->vehicle?->name,
                'moderator' => $r->moderator?->name,
            ])
            ->values()
            ->all();

        // Daftar admin untuk penugasan (assignee) pada sengketa/komplain.
        $admins = User::role('admin')
            ->get(['id', 'name'])
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name])
            ->values()
            ->all();

        return \Inertia\Inertia::render('Admin/Disputes', [
            'disputes' => $disputes,
            'complaints' => $complaints,
            'reviews' => $reviews,
            'admins' => $admins,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Sengketa — proses oleh admin
    |--------------------------------------------------------------------------
    */

    public function processDispute(ProcessDisputeRequest $request, Dispute $dispute): RedirectResponse
    {
        $this->authorize('process', $dispute);

        $validated = $request->validated();

        try {
            $this->disputeService->process(
                $dispute,
                Auth::user(),
                $validated['status'],
                $validated['assigned_to'] ?? null,
                $validated['resolution'] ?? null,
                $validated['resolution_party'] ?? null,
                (float) ($validated['refund_amount'] ?? 0),
                $validated['notes'] ?? null,
            );
        } catch (\RuntimeException | \InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('admin.disputes')
            ->with('success', 'Sengketa berhasil diproses.');
    }

    /*
    |--------------------------------------------------------------------------
    | Komplain — proses oleh admin
    |--------------------------------------------------------------------------
    */

    public function processComplaint(ProcessComplaintRequest $request, Complaint $complaint): RedirectResponse
    {
        $this->authorize('process', $complaint);

        $validated = $request->validated();

        try {
            $this->complaintService->process(
                $complaint,
                Auth::user(),
                $validated['status'],
                $validated['assigned_to'] ?? null,
                $validated['resolution'] ?? null,
                $request,
            );
        } catch (\RuntimeException | \InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('admin.disputes')
            ->with('success', 'Komplain berhasil diproses.');
    }

    /*
    |--------------------------------------------------------------------------
    | Ulasan — moderasi oleh admin
    |--------------------------------------------------------------------------
    */

    public function moderateReview(ModerateReviewRequest $request, Review $review): RedirectResponse
    {
        $this->authorize('moderate', $review);

        $validated = $request->validated();

        try {
            $this->reviewService->moderate(
                $review,
                Auth::user(),
                $validated['status'],
                $validated['moderation_note'] ?? null,
                $request,
            );
        } catch (\RuntimeException | \InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return redirect()
            ->route('admin.disputes')
            ->with('success', 'Ulasan berhasil dimoderasi.');
    }
}
