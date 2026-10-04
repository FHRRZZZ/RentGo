<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\MarketingTax;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

/**
 * MarketingTaxService
 *
 * Mengelola siklus hidup pajak pemasaran mitra:
 *  - Generate tagihan bulanan untuk semua mitra aktif.
 *  - Menandai tagihan jatuh tempo & menonaktifkan mitra yang belum bayar.
 *  - Upload bukti bayar oleh mitra.
 *  - Konfirmasi / pembebasan tagihan oleh admin.
 */
class MarketingTaxService
{
    /**
     * Generate tagihan pajak pemasaran untuk bulan tertentu.
     * Hanya mitra dengan onboarding_status = 'approved' yang ditagih.
     * Jika tagihan bulan tersebut sudah ada, dilewati (idempotent).
     *
     * @return int Jumlah tagihan baru yang dibuat
     */
    public function generateMonthlyBills(int $year, int $month): int
    {
        $agents = AgentProfile::where('onboarding_status', 'approved')->get();
        $created = 0;

        foreach ($agents as $agent) {
            $exists = MarketingTax::where('agent_profile_id', $agent->id)
                ->where('billing_year', $year)
                ->where('billing_month', $month)
                ->exists();

            if ($exists) {
                continue;
            }

            $dueDate = now()->setYear($year)->setMonth($month)->startOfMonth()->addDays(MarketingTax::DUE_DAYS);

            MarketingTax::create([
                'agent_profile_id' => $agent->id,
                'tax_number'       => $this->generateTaxNumber($year, $month),
                'billing_year'     => $year,
                'billing_month'    => $month,
                'amount'           => MarketingTax::MONTHLY_FEE,
                'status'           => MarketingTax::STATUS_UNPAID,
                'due_date'         => $dueDate,
            ]);

            $created++;
        }

        return $created;
    }

    /**
     * Tandai tagihan yang sudah jatuh tempo sebagai 'overdue'
     * dan nonaktifkan mitra yang bersangkutan.
     *
     * @return int Jumlah mitra yang dinonaktifkan
     */
    public function processOverdueBills(): int
    {
        $overdueTaxes = MarketingTax::whereIn('status', [
                MarketingTax::STATUS_UNPAID,
            ])
            ->where('due_date', '<', now()->startOfDay())
            ->get();

        $deactivated = 0;

        foreach ($overdueTaxes as $tax) {
            DB::transaction(function () use ($tax, &$deactivated) {
                $tax->update(['status' => MarketingTax::STATUS_OVERDUE]);

                // Nonaktifkan profil mitra jika belum nonaktif
                $agent = $tax->agentProfile;
                if ($agent && $agent->is_active) {
                    $agent->update(['is_active' => false]);
                    $deactivated++;
                }
            });
        }

        return $deactivated;
    }

    /**
     * Mitra mengupload bukti pembayaran.
     */
    public function uploadProof(MarketingTax $tax, Request $request): MarketingTax
    {
        abort_if(
            $tax->isSettled(),
            422,
            'Tagihan ini sudah selesai dan tidak perlu bukti pembayaran.'
        );

        abort_if(
            $tax->awaitingReview(),
            422,
            'Bukti pembayaran sudah diunggah dan sedang menunggu konfirmasi admin.'
        );

        $file = $request->file('proof');
        if (!$file) {
            abort(422, 'File bukti pembayaran wajib diunggah.');
        }

        // Hapus bukti lama jika ada
        if ($tax->proof_file_path) {
            Storage::disk('private')->delete($tax->proof_file_path);
        }

        $path = $file->store('marketing-tax-proofs/' . $tax->agentProfile->id, 'private');

        $tax->update([
            'proof_file_path'   => $path,
            'proof_uploaded_at' => now(),
            'status'            => MarketingTax::STATUS_AWAITING_REVIEW,
        ]);

        return $tax->fresh();
    }

    /**
     * Admin mengkonfirmasi pembayaran (tandai lunas & aktifkan kembali mitra).
     */
    public function confirm(MarketingTax $tax, $admin, ?string $notes = null): MarketingTax
    {
        abort_unless(
            $tax->awaitingReview(),
            422,
            'Tagihan harus dalam status "Menunggu Konfirmasi" untuk dikonfirmasi.'
        );

        DB::transaction(function () use ($tax, $admin, $notes) {
            $tax->update([
                'status'      => MarketingTax::STATUS_PAID,
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'paid_at'     => now(),
                'notes'       => $notes,
            ]);

            // Aktifkan kembali mitra jika dinonaktifkan karena overdue
            $agent = $tax->agentProfile;
            if ($agent && !$agent->is_active) {
                // Pastikan tidak ada tagihan overdue lain
                $hasOtherOverdue = $agent->marketingTaxes()
                    ->where('id', '!=', $tax->id)
                    ->where('status', MarketingTax::STATUS_OVERDUE)
                    ->exists();

                if (!$hasOtherOverdue) {
                    $agent->update(['is_active' => true]);
                }
            }
        });

        return $tax->fresh();
    }

    /**
     * Admin membebaskan tagihan (waive) — tidak perlu bayar.
     */
    public function waive(MarketingTax $tax, $admin, ?string $notes = null): MarketingTax
    {
        abort_if(
            $tax->isSettled(),
            422,
            'Tagihan ini sudah selesai.'
        );

        DB::transaction(function () use ($tax, $admin, $notes) {
            $tax->update([
                'status'      => MarketingTax::STATUS_WAIVED,
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'notes'       => $notes ?? 'Dibebaskan oleh admin.',
            ]);

            // Aktifkan kembali mitra jika dinonaktifkan karena overdue
            $agent = $tax->agentProfile;
            if ($agent && !$agent->is_active) {
                $hasOtherOverdue = $agent->marketingTaxes()
                    ->where('id', '!=', $tax->id)
                    ->where('status', MarketingTax::STATUS_OVERDUE)
                    ->exists();

                if (!$hasOtherOverdue) {
                    $agent->update(['is_active' => true]);
                }
            }
        });

        return $tax->fresh();
    }

    /**
     * Admin menolak bukti bayar (kembalikan ke 'unpaid' atau 'overdue').
     */
    public function rejectProof(MarketingTax $tax, $admin, ?string $notes = null): MarketingTax
    {
        abort_unless(
            $tax->awaitingReview(),
            422,
            'Tagihan harus dalam status "Menunggu Konfirmasi" untuk ditolak.'
        );

        $newStatus = $tax->isOverdue() ? MarketingTax::STATUS_OVERDUE : MarketingTax::STATUS_UNPAID;

        $tax->update([
            'status'            => $newStatus,
            'proof_file_path'   => null,
            'proof_uploaded_at' => null,
            'verified_by'       => $admin->id,
            'verified_at'       => null,
            'notes'             => $notes ?? 'Bukti pembayaran ditolak oleh admin.',
        ]);

        return $tax->fresh();
    }

    /**
     * Generate nomor tagihan unik: MTX-YYYYMM-XXXXX
     */
    private function generateTaxNumber(int $year, int $month): string
    {
        $prefix = 'MTX-' . $year . str_pad($month, 2, '0', STR_PAD_LEFT) . '-';
        $last   = MarketingTax::where('tax_number', 'like', $prefix . '%')
            ->orderByDesc('tax_number')
            ->value('tax_number');

        $seq = $last ? ((int) substr($last, -5)) + 1 : 1;

        return $prefix . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}
