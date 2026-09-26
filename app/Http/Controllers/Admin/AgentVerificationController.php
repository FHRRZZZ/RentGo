<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Models\AgentProfile;
use App\Models\AgentDocument;
use App\Services\AgentVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

    public function verifyDocument(
        Request $request,
        AgentDocument $agentDocument
    ): RedirectResponse|\Illuminate\Http\JsonResponse {
        abort_unless(Auth::user()->hasRole('admin'), 403);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected'],
            'rejection_reason' => ['nullable', 'string', 'max:1000', 'required_if:status,rejected'],
        ]);

        $agentDocument->update([
            'status' => $validated['status'],
            'verified_at' => $validated['status'] === 'approved' ? now() : null,
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'document' => $agentDocument->fresh()]);
        }

        return redirect()->back()->with('success', 'Status dokumen berhasil diperbarui.');
    }

    public function documentFile(AgentDocument $agentDocument)
    {
        abort_unless(Auth::user()->hasRole('admin'), 403);
        abort_unless($agentDocument->file_path, 404, 'File dokumen tidak ditemukan.');

        $disk = Storage::disk('private');
        abort_unless($disk->exists($agentDocument->file_path), 404, 'File dokumen tidak ditemukan.');

        return $disk->response($agentDocument->file_path);
    }
}
