<?php

namespace App\Services;

use App\Models\AgentPayout;
use App\Models\TransactionCommission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgentPayoutService
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Membuat payout berdasarkan transaction commission.
     */
    public function createFromCommission(
        TransactionCommission $commission,
        User $admin,
        ?Request $request = null
    ): AgentPayout {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat membuat payout.'
            );
        }

        $commission->loadMissing([
            'transaction',
            'agentProfile',
        ]);

        if ($commission->status !== 'calculated') {
            throw new \RuntimeException(
                'Commission belum siap untuk dipayout.'
            );
        }

        $existingPayout = AgentPayout::where(
            'transaction_commission_id',
            $commission->id
        )->first();

        if ($existingPayout) {
            return $existingPayout;
        }

        return DB::transaction(function () use (
            $commission,
            $admin,
            $request
        ) {
            $payout = AgentPayout::create([
                'agent_profile_id' =>
                    $commission->agent_profile_id,

                'transaction_id' =>
                    $commission->transaction_id,

                'transaction_commission_id' =>
                    $commission->id,

                'payout_number' =>
                    'PAY-'
                    . now()->format('YmdHis')
                    . '-'
                    . strtoupper(Str::random(6)),

                'amount' =>
                    $commission->net_amount,

                'payout_method' =>
                    'bank_transfer',

                'account_name' => null,
                'account_number' => null,
                'bank_name' => null,

                'status' => 'pending',

                'processed_by' => null,

                'notes' => null,
            ]);

            $this->auditLogService->created(
                $admin,
                'agent_payout',
                'Admin membuat payout berdasarkan transaction commission.',
                $payout,
                $payout->toArray(),
                $request
            );

            return $payout->refresh();
        });
    }

    /**
     * Memproses / mengubah status payout.
     */
    public function process(
        AgentPayout $payout,
        User $admin,
        string $status,
        string $payoutMethod,
        ?string $accountName = null,
        ?string $accountNumber = null,
        ?string $bankName = null,
        ?string $notes = null,
        ?Request $request = null
    ): AgentPayout {
        if (!$admin->hasRole('admin')) {
            throw new \RuntimeException(
                'Hanya admin yang dapat memproses payout.'
            );
        }

        $allowedStatuses = [
            'processing',
            'paid',
            'failed',
            'cancelled',
        ];

        if (!in_array($status, $allowedStatuses, true)) {
            throw new \RuntimeException(
                'Status payout tidak valid.'
            );
        }

        if (!in_array($payoutMethod, [
            'bank_transfer',
            'cash',
        ], true)) {
            throw new \RuntimeException(
                'Metode payout tidak valid.'
            );
        }

        if (
            $payoutMethod === 'bank_transfer'
            && (
                empty($accountName)
                || empty($accountNumber)
                || empty($bankName)
            )
        ) {
            throw new \RuntimeException(
                'Informasi rekening wajib diisi untuk bank transfer.'
            );
        }

        if (
            $payout->status === 'pending'
            && !in_array($status, [
                'processing',
                'cancelled',
            ], true)
        ) {
            throw new \RuntimeException(
                'Payout pending hanya dapat diproses menjadi processing atau cancelled.'
            );
        }

        if (
            $payout->status === 'processing'
            && !in_array($status, [
                'paid',
                'failed',
                'cancelled',
            ], true)
        ) {
            throw new \RuntimeException(
                'Payout processing hanya dapat menjadi paid, failed, atau cancelled.'
            );
        }

        if (in_array($payout->status, [
            'paid',
            'failed',
            'cancelled',
        ], true)) {
            throw new \RuntimeException(
                'Payout yang sudah selesai tidak dapat diubah kembali.'
            );
        }

        return DB::transaction(function () use (
            $payout,
            $admin,
            $status,
            $payoutMethod,
            $accountName,
            $accountNumber,
            $bankName,
            $notes,
            $request
        ) {
            $oldValues = $payout->toArray();

            $payout->update([
                'status' => $status,
                'payout_method' => $payoutMethod,
                'account_name' => $accountName,
                'account_number' => $accountNumber,
                'bank_name' => $bankName,
                'processed_by' => $admin->id,
                'notes' => $notes,
                'paid_at' =>
                    $status === 'paid'
                        ? now()
                        : null,
            ]);

            $payout->refresh();

            $this->auditLogService->updated(
                $admin,
                'agent_payout',
                'Admin memperbarui status payout mitra.',
                $payout,
                $oldValues,
                $payout->toArray(),
                $request
            );

            return $payout;
        });
    }
}