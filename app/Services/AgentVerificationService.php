<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Notifications\MitraVerificationNotification;

class AgentVerificationService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected NotificationService $notificationService,
        protected ComplianceService $complianceService
    ) {}

    /**
     * Admin memverifikasi onboarding Mitra (approve / reject / suspend).
     */
    public function verify(
        AgentProfile $agentProfile,
        User $admin,
        string $decision,
        ?string $rejectionReason = null,
        ?Request $request = null
    ): AgentProfile {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException('Hanya admin yang dapat memverifikasi mitra.');
        }

        if (!in_array($decision, ['approved', 'rejected', 'suspended'], true)) {
            throw ValidationException::withMessages([
                'decision' => 'Keputusan verifikasi mitra tidak valid.',
            ]);
        }

        if ($decision === 'rejected' && blank($rejectionReason)) {
            throw ValidationException::withMessages([
                'rejection_reason' => 'Alasan penolakan wajib diisi saat menolak mitra.',
            ]);
        }

        // ==========================================
        // ATURAN: Mitra wajib melengkapi data usaha & dokumen legal
        // sebelum pengajuan boleh disetujui admin.
        // ==========================================
        if ($decision === 'approved') {
            $compliance = $this->complianceService->agentStatus($agentProfile);

            if (!empty($compliance['missing_profile'])) {
                throw ValidationException::withMessages([
                    'decision' => 'Mitra belum dapat disetujui karena data profil belum lengkap. '
                        . implode(' ', $compliance['messages']),
                ]);
            }

            if (!empty($compliance['missing_documents']) || !empty($compliance['rejected_documents'])) {
                throw ValidationException::withMessages([
                    'decision' => 'Mitra belum dapat disetujui karena dokumen wajib belum tersedia atau ditolak. '
                        . implode(' ', $compliance['messages']),
                ]);
            }

            // Persetujuan profil adalah keputusan final admin setelah dokumen
            // diperiksa, sehingga dokumen pending ikut disahkan.
            if (!empty($compliance['pending_documents'])) {
                $agentProfile->documents()
                    ->whereIn('document_type', array_keys(ComplianceService::REQUIRED_AGENT_DOCUMENTS))
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'approved',
                        'verified_at' => now(),
                        'rejection_reason' => null,
                    ]);

                $compliance = $this->complianceService->agentStatus($agentProfile->fresh());
            }

            if (!$compliance['complete']) {
                throw ValidationException::withMessages([
                    'decision' => 'Mitra belum dapat disetujui karena persyaratan belum lengkap. '
                        . implode(' ', $compliance['messages']),
                ]);
            }
        }

        return DB::transaction(function () use (
            $agentProfile,
            $admin,
            $decision,
            $rejectionReason,
            $request
        ) {
            $oldValues = $agentProfile->toArray();

            $isActive = $decision === 'approved';

            $agentProfile->update([
                'onboarding_status' => $decision,
                'is_active' => $isActive,
            ]);

            if ($decision === 'approved' && $agentProfile->user && !$agentProfile->user->hasRole('mitra')) {
                $agentProfile->user->syncRoles(['mitra']);
            }

            $agentProfile->refresh();

            $description = match ($decision) {
                'approved' => 'Admin menyetujui onboarding mitra. Mitra kini berstatus aktif.',
                'rejected' => 'Admin menolak onboarding mitra. Alasan: ' . $rejectionReason,
                'suspended' => 'Admin menonaktifkan / menangguhkan mitra.',
            };

            $this->auditLogService->updated(
                $admin,
                'agent_profile',
                $description,
                $agentProfile,
                $oldValues,
                $agentProfile->toArray(),
                $request
            );

            // Kirim notifikasi ke user mitra
            if ($agentProfile->user) {
                $title = match ($decision) {
                    'approved' => 'Pendaftaran Mitra Disetujui',
                    'rejected' => 'Pendaftaran Mitra Ditolak',
                    'suspended' => 'Akun Mitra Ditangguhkan',
                };

                $message = match ($decision) {
                    'approved' => 'Selamat, akun mitra Anda telah diverifikasi dan aktif. Anda sekarang dapat mulai menambahkan unit kendaraan.',
                    'rejected' => 'Mohon maaf, pendaftaran mitra Anda ditolak dengan alasan: ' . $rejectionReason,
                    'suspended' => 'Akun mitra Anda telah ditangguhkan sementara oleh admin.',
                };

                $this->notificationService->create(
                    $agentProfile->user,
                    'agent_verification_' . $decision,
                    $title,
                    $message,
                    [
                        'agent_profile_id' => $agentProfile->id,
                        'decision' => $decision,
                        'rejection_reason' => $rejectionReason,
                    ]
                );

                $agentProfile->user->notify(new MitraVerificationNotification(
                    $decision,
                    $rejectionReason
                ));
            }

            return $agentProfile;
        });
    }
}
