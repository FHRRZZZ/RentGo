<?php

namespace App\Services;

use App\Models\CustomerDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentService
{
    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    /**
     * Upload dan simpan dokumen customer baru.
     *
     * File disimpan ke private disk agar tidak dapat diakses secara publik
     * (PRD §24 — Data Privacy).
     */
    public function create(
        int $customerProfileId,
        array $data,
        UploadedFile $file
    ): CustomerDocument {
        return DB::transaction(function () use ($customerProfileId, $data, $file) {
            $filePath = $file->store(
                "customer-documents/{$customerProfileId}",
                'private'
            );

            return CustomerDocument::create([
                'customer_profile_id' => $customerProfileId,
                'document_type'       => $data['document_type'],
                'document_number'     => $data['document_number'] ?? null,
                'file_path'           => $filePath,
                'status'              => CustomerDocument::STATUS_PENDING,
                'verified_at'         => null,
                'verified_by'         => null,
                'rejection_reason'    => null,
                'expires_at'          => $data['expires_at'] ?? null,
            ]);
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    /**
     * Perbarui dokumen customer.
     *
     * Jika file baru diunggah, file lama dihapus dari storage.
     * Status dokumen dikembalikan ke PENDING agar diverifikasi ulang oleh admin.
     */
    public function update(
        CustomerDocument $customerDocument,
        array $data,
        ?UploadedFile $file = null
    ): CustomerDocument {
        return DB::transaction(function () use ($customerDocument, $data, $file) {
            $updateData = [
                'document_type'   => $data['document_type'],
                'document_number' => $data['document_number'] ?? null,
                'expires_at'      => $data['expires_at'] ?? null,
            ];

            if ($file) {
                $newFilePath = $file->store(
                    "customer-documents/{$customerDocument->customer_profile_id}",
                    'private'
                );

                $oldFilePath = $customerDocument->file_path;

                $updateData['file_path'] = $newFilePath;

                if ($oldFilePath) {
                    Storage::disk('private')->delete($oldFilePath);
                }
            }

            // Dokumen yang diperbarui wajib diverifikasi ulang (PRD §23).
            $updateData['status']           = CustomerDocument::STATUS_PENDING;
            $updateData['verified_at']      = null;
            $updateData['verified_by']      = null;
            $updateData['rejection_reason'] = null;

            $customerDocument->update($updateData);

            return $customerDocument->refresh();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify
    |--------------------------------------------------------------------------
    */

    /**
     * Verifikasi dokumen customer oleh admin.
     *
     * Status yang diizinkan: approved | rejected.
     * Jika ditolak, wajib menyertakan rejection_reason.
     */
    public function verify(
        CustomerDocument $customerDocument,
        User $admin,
        string $status,
        ?string $rejectionReason = null
    ): CustomerDocument {
        return DB::transaction(function () use (
            $customerDocument,
            $admin,
            $status,
            $rejectionReason
        ) {
            $customerDocument->update([
                'status'           => $status,
                'verified_at'      => now(),
                'verified_by'      => $admin->id,
                'rejection_reason' => $status === CustomerDocument::STATUS_REJECTED
                    ? $rejectionReason
                    : null,
            ]);

            return $customerDocument->refresh();
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    /**
     * Hapus dokumen customer beserta file-nya dari storage.
     */
    public function delete(CustomerDocument $customerDocument): void
    {
        DB::transaction(function () use ($customerDocument) {
            $filePath = $customerDocument->file_path;

            $customerDocument->delete();

            if ($filePath) {
                Storage::disk('private')->delete($filePath);
            }
        });
    }
}