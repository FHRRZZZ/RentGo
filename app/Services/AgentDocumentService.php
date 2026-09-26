<?php

namespace App\Services;

use App\Models\AgentDocument;
use App\Models\AgentProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * AgentDocumentService — pengelolaan dokumen legal mitra.
 *
 * Setiap dokumen yang diunggah / diperbarui akan kembali berstatus
 * "pending" sehingga wajib diverifikasi ulang oleh admin.
 */
class AgentDocumentService
{
    /**
     * Simpan (buat / perbarui) satu dokumen mitra berdasarkan jenisnya.
     */
    public function store(
        AgentProfile $agentProfile,
        string $documentType,
        UploadedFile $file,
        ?string $documentNumber = null
    ): AgentDocument {
        return DB::transaction(function () use (
            $agentProfile,
            $documentType,
            $file,
            $documentNumber
        ) {
            $existing = AgentDocument::query()
                ->where('agent_profile_id', $agentProfile->id)
                ->where('document_type', $documentType)
                ->first();

            $filePath = $file->store(
                "agent-documents/{$agentProfile->id}",
                'private'
            );

            // Hapus file lama jika ada agar tidak menumpuk.
            if ($existing && $existing->file_path) {
                Storage::disk('private')->delete($existing->file_path);
            }

            return AgentDocument::updateOrCreate(
                [
                    'agent_profile_id' => $agentProfile->id,
                    'document_type' => $documentType,
                ],
                [
                    'document_number' => $documentNumber,
                    'file_path' => $filePath,
                    'status' => 'pending',
                    'verified_at' => null,
                    'rejection_reason' => null,
                ]
            );
        });
    }

    /**
     * Hapus dokumen mitra beserta filenya.
     */
    public function delete(AgentDocument $agentDocument): void
    {
        DB::transaction(function () use ($agentDocument) {
            $filePath = $agentDocument->file_path;

            $agentDocument->delete();

            if ($filePath) {
                Storage::disk('private')->delete($filePath);
            }
        });
    }
}
