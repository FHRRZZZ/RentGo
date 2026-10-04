<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\MarketingTax;
use App\Services\MarketingTaxService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller pajak pemasaran sisi mitra.
 * Mitra dapat melihat daftar tagihan & mengupload bukti pembayaran.
 */
class MarketingTaxController extends Controller
{
    public function __construct(
        private MarketingTaxService $taxService
    ) {}

    /**
     * Daftar tagihan pajak pemasaran mitra yang sedang login.
     */
    public function index(Request $request): Response
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent, 403, 'Profil mitra tidak ditemukan.');

        $taxes = MarketingTax::where('agent_profile_id', $agent->id)
            ->orderByDesc('billing_year')
            ->orderByDesc('billing_month')
            ->get()
            ->map(fn(MarketingTax $t) => $this->formatTax($t));

        // Tagihan terbuka yang perlu segera dibayar
        $openTax = MarketingTax::where('agent_profile_id', $agent->id)
            ->whereIn('status', [
                MarketingTax::STATUS_UNPAID,
                MarketingTax::STATUS_OVERDUE,
            ])
            ->orderByDesc('billing_year')
            ->orderByDesc('billing_month')
            ->first();

        return Inertia::render('Mitra/MarketingTax', [
            'taxes'   => $taxes,
            'openTax' => $openTax ? $this->formatTax($openTax) : null,
            'agent'   => [
                'is_active'         => $agent->is_active,
                'onboarding_status' => $agent->onboarding_status,
            ],
        ]);
    }

    /**
     * Mitra mengupload bukti pembayaran pajak.
     */
    public function uploadProof(Request $request, MarketingTax $marketingTax): RedirectResponse
    {
        $agent = $request->user()->agentProfile;
        abort_unless($agent && $marketingTax->agent_profile_id === $agent->id, 403);

        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ], [
            'proof.required' => 'Bukti pembayaran wajib diunggah.',
            'proof.mimes'    => 'Format file harus JPG, PNG, atau PDF.',
            'proof.max'      => 'Ukuran file maksimal 5 MB.',
        ]);

        try {
            $this->taxService->uploadProof($marketingTax, $request);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.');
    }

    /**
     * Admin/Mitra: tampilkan file bukti pembayaran (streaming aman).
     */
    public function proofFile(Request $request, MarketingTax $marketingTax): mixed
    {
        $user  = $request->user();
        $agent = $user->agentProfile;

        // Mitra hanya bisa akses miliknya sendiri; admin bisa akses semua
        if (!$user->hasRole('admin')) {
            abort_unless($agent && $marketingTax->agent_profile_id === $agent->id, 403);
        }

        abort_unless($marketingTax->proof_file_path, 404, 'File bukti tidak ditemukan.');

        $disk = Storage::disk('private');
        abort_unless($disk->exists($marketingTax->proof_file_path), 404, 'File tidak tersedia.');

        return $disk->response($marketingTax->proof_file_path);
    }

    // ------------------------------------------------------------------
    // Helper
    // ------------------------------------------------------------------

    private function formatTax(MarketingTax $t): array
    {
        return [
            'id'                  => $t->id,
            'tax_number'          => $t->tax_number,
            'billing_year'        => $t->billing_year,
            'billing_month'       => $t->billing_month,
            'billing_period_label'=> $t->billing_period_label,
            'amount'              => (float) $t->amount,
            'status'              => $t->status,
            'status_label'        => $t->status_label,
            'due_date'            => $t->due_date?->toDateString(),
            'is_overdue'          => $t->isOverdue(),
            'proof_uploaded_at'   => $t->proof_uploaded_at?->toISOString(),
            'has_proof'           => (bool) $t->proof_file_path,
            'paid_at'             => $t->paid_at?->toISOString(),
            'verified_at'         => $t->verified_at?->toISOString(),
            'notes'               => $t->notes,
            'created_at'          => $t->created_at?->toISOString(),
        ];
    }
}
