<?php

namespace App\Services;

use App\Models\CustomerDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentService
{
    public function create(
        int $customerProfileId,
        array $data,
        UploadedFile $file
    ): CustomerDocument {
        return DB::transaction(function () use (
            $customerProfileId,
            $data,
            $file
        ) {
            $filePath = $file->store(
                "customer-documents/{$customerProfileId}",
                'private'
            );

            return CustomerDocument::create([
                'customer_profile_id' => $customerProfileId,
                'document_type' => $data['document_type'],
                'document_number' => $data['document_number'] ?? null,
                'file_path' => $filePath,
                'status' => 'pending',
                'verified_at' => null,
                'verified_by' => null,
                'rejection_reason' => null,
                'expires_at' => $data['expires_at'] ?? null,
            ]);
        });
    }

    public function update(
        CustomerDocument $customerDocument,
        array $data,
        ?UploadedFile $file = null
    ): CustomerDocument {
        return DB::transaction(function () use (
            $customerDocument,
            $data,
            $file
        ) {
            $updateData = [
                'document_type' => $data['document_type'],
                'document_number' => $data['document_number'] ?? null,
                'expires_at' => $data['expires_at'] ?? null,
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

            // Dokumen yang diperbarui harus diverifikasi ulang.
            $updateData['status'] = 'pending';
            $updateData['verified_at'] = null;
            $updateData['verified_by'] = null;
            $updateData['rejection_reason'] = null;

            $customerDocument->update($updateData);

            return $customerDocument->refresh();
        });
    }

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
                'status' => $status,
            'verified_at' => now(),
            'verified_by' => $admin->id,
            'rejection_reason' => $status === 'rejected'
                ? $rejectionReason
                : null,
        ]);

        return $customerDocument->refresh();
    });
    }

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