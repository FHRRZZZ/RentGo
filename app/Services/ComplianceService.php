<?php

namespace App\Services;

use App\Models\AgentProfile;
use App\Models\CustomerProfile;
use App\Models\User;

/**
 * ComplianceService — pusat aturan kelengkapan syarat RentGo.
 *
 * Dua aturan utama:
 *  1. Customer WAJIB mengisi & menyimpan data pribadi + dokumen (KTP & SIM)
 *     sebelum boleh memesan kendaraan. Verifikasi admin TIDAK memblokir
 *     pemesanan — dokumen "pending" tetap dianggap lengkap.
 *  2. Mitra WAJIB melengkapi data usaha + dokumen legal sebelum
 *     pengajuan/verifikasi mitra dapat disetujui admin.
 *
 * Semua pengecekan bersifat server-side (sumber kebenaran), bukan
 * hanya validasi di frontend.
 */
class ComplianceService
{
    /**
     * Dokumen yang wajib dimiliki customer, lengkap dengan labelnya.
     */
    public const REQUIRED_CUSTOMER_DOCUMENTS = [
        'ktp' => 'Kartu Tanda Penduduk (KTP)',
        'sim' => 'Surat Izin Mengemudi (SIM)',
    ];

    /**
     * Dokumen yang wajib dimiliki mitra sebelum pengajuan disetujui.
     */
    public const REQUIRED_AGENT_DOCUMENTS = [
        'ktp' => 'KTP Pemilik / Penanggung Jawab',
        'nib' => 'NIB / Akta Usaha',
    ];

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    /**
     * Cek kelengkapan data & dokumen customer.
     *
     * ATURAN: customer boleh memesan begitu data diri + dokumen (KTP, SIM)
     * SUDAH DIISI DAN TERSIMPAN. Verifikasi admin tidak memblokir pemesanan —
     * dokumen berstatus "pending" tetap dihitung lengkap, dan verifikasi fisik
     * dilakukan mitra saat serah terima kendaraan.
     *
     * Yang tetap memblokir hanya jika dokumen belum ada sama sekali, atau
     * ditolak admin (harus diunggah ulang).
     *
     * @return array{
     *   complete: bool,
     *   missing_profile: array<int, string>,
     *   missing_documents: array<int, string>,
     *   pending_documents: array<int, string>,
     *   rejected_documents: array<int, string>,
     *   messages: array<int, string>
     * }
     */
    public function customerStatus(User $user): array
    {
        $result = [
            'complete' => false,
            'missing_profile' => [],
            'missing_documents' => [],
            'pending_documents' => [],
            'rejected_documents' => [],
            'messages' => [],
        ];

        /** @var CustomerProfile|null $profile */
        $profile = $user->customerProfile;

        if (!$profile) {
            $result['missing_profile'][] = 'Profil penyewa (data diri dasar)';
        } else {
            $requiredProfileFields = [
                'phone' => 'Nomor WhatsApp aktif',
                'identity_number' => 'Nomor NIK / KTP',
                'date_of_birth' => 'Tanggal lahir',
                'address' => 'Alamat domisili',
            ];

            foreach ($requiredProfileFields as $field => $label) {
                if (blank($profile->{$field})) {
                    $result['missing_profile'][] = $label;
                }
            }
        }

        // Periksa dokumen wajib. Tanpa profil, seluruh dokumen dianggap belum ada.
        $documents = $profile
            ? $profile->documents()->whereIn('document_type', array_keys(self::REQUIRED_CUSTOMER_DOCUMENTS))->get()
            : collect();

        foreach (self::REQUIRED_CUSTOMER_DOCUMENTS as $type => $label) {
            $doc = $documents->firstWhere('document_type', $type);

            if (!$doc) {
                $result['missing_documents'][] = $label;
            } elseif ($doc->status === 'rejected') {
                $result['rejected_documents'][] = $label;
            } elseif ($doc->status !== 'approved') {
                // Sudah diunggah, menunggu verifikasi admin. Bukan penghalang
                // pemesanan — hanya dicatat untuk kebutuhan tampilan/notifikasi.
                $result['pending_documents'][] = $label;
            }
        }

        if (!empty($result['missing_profile'])) {
            $result['messages'][] = 'Lengkapi data profil penyewa: ' . implode(', ', $result['missing_profile']) . '.';
        }

        if (!empty($result['missing_documents'])) {
            $result['messages'][] = 'Unggah dokumen berikut: ' . implode(', ', $result['missing_documents']) . '.';
        }

        if (!empty($result['rejected_documents'])) {
            $result['messages'][] = 'Dokumen berikut ditolak dan harus diunggah ulang: ' . implode(', ', $result['rejected_documents']) . '.';
        }

        $result['complete'] =
            empty($result['missing_profile'])
            && empty($result['missing_documents'])
            && empty($result['rejected_documents']);

        return $result;
    }

    /**
     * Apakah customer sudah boleh memesan kendaraan.
     */
    public function customerCanBook(User $user): bool
    {
        return $this->customerStatus($user)['complete'];
    }

    /*
    |--------------------------------------------------------------------------
    | MITRA / AGENT
    |--------------------------------------------------------------------------
    */

    /**
     * Cek kelengkapan data & dokumen mitra sebelum pengajuan dapat disetujui.
     *
     * @return array{
     *   complete: bool,
     *   missing_profile: array<int, string>,
     *   missing_documents: array<int, string>,
     *   pending_documents: array<int, string>,
     *   rejected_documents: array<int, string>,
     *   messages: array<int, string>
     * }
     */
    public function agentStatus(?AgentProfile $profile): array
    {
        $result = [
            'complete' => false,
            'missing_profile' => [],
            'missing_documents' => [],
            'pending_documents' => [],
            'rejected_documents' => [],
            'messages' => [],
        ];

        if (!$profile) {
            $result['missing_profile'][] = 'Profil mitra';
            $result['messages'][] = 'Profil mitra belum dibuat.';

            return $result;
        }

        $requiredProfileFields = [
            'agency_name' => 'Nama agensi / usaha',
            'phone' => 'Nomor telepon',
            'address' => 'Alamat usaha',
            'city' => 'Kota operasional',
        ];

        foreach ($requiredProfileFields as $field => $label) {
            if (blank($profile->{$field})) {
                $result['missing_profile'][] = $label;
            }
        }

        $documents = $profile->documents()
            ->whereIn('document_type', array_keys(self::REQUIRED_AGENT_DOCUMENTS))
            ->get();

        foreach (self::REQUIRED_AGENT_DOCUMENTS as $type => $label) {
            $doc = $documents->firstWhere('document_type', $type);

            if (!$doc) {
                $result['missing_documents'][] = $label;
            } elseif ($doc->status === 'rejected') {
                $result['rejected_documents'][] = $label;
            } elseif ($doc->status !== 'approved') {
                $result['pending_documents'][] = $label;
            }
        }

        if (!empty($result['missing_profile'])) {
            $result['messages'][] = 'Lengkapi data profil mitra: ' . implode(', ', $result['missing_profile']) . '.';
        }

        if (!empty($result['missing_documents'])) {
            $result['messages'][] = 'Unggah dokumen berikut: ' . implode(', ', $result['missing_documents']) . '.';
        }

        if (!empty($result['pending_documents'])) {
            $result['messages'][] = 'Dokumen berikut sedang menunggu verifikasi: ' . implode(', ', $result['pending_documents']) . '.';
        }

        if (!empty($result['rejected_documents'])) {
            $result['messages'][] = 'Dokumen berikut ditolak dan harus diunggah ulang: ' . implode(', ', $result['rejected_documents']) . '.';
        }

        $result['complete'] =
            empty($result['missing_profile'])
            && empty($result['missing_documents'])
            && empty($result['pending_documents'])
            && empty($result['rejected_documents']);

        return $result;
    }

    /**
     * Apakah mitra sudah lengkap sehingga pengajuan boleh disetujui.
     */
    public function agentCanBeApproved(?AgentProfile $profile): bool
    {
        return $this->agentStatus($profile)['complete'];
    }
}
