<?php

namespace App\Http\Controllers;

use App\Models\AgentProfile;
use App\Services\AgentVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AgentVerificationController extends Controller
{
    public function __construct(
        protected AgentVerificationService $agentVerificationService
    ) {}

    /**
     * Admin memverifikasi onboarding mitra.
     */
    public function verify(
        Request $request,
        AgentProfile $agentProfile
    ): RedirectResponse|\Illuminate\Http\JsonResponse {
        if (!Auth::user()->hasRole('admin')) {
            abort(403, 'Hanya admin yang berhak memverifikasi mitra.');
        }

        $validated = $request->validate([
            'decision' => ['required', 'string', 'in:approved,rejected,suspended'],
            'rejection_reason' => ['nullable', 'string', 'max:1000', 'required_if:decision,rejected'],
        ]);

        $this->agentVerificationService->verify(
            $agentProfile,
            Auth::user(),
            $validated['decision'],
            $validated['rejection_reason'] ?? null,
            $request
        );

        $message = match ($validated['decision']) {
            'approved' => 'Mitra berhasil diverifikasi dan diaktifkan.',
            'rejected' => 'Pendaftaran mitra berhasil ditolak.',
            'suspended' => 'Akun mitra berhasil ditangguhkan.',
        };

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'agent_profile' => $agentProfile->fresh(),
            ]);
        }

        return redirect()->back()->with('success', $message);
    }
}
