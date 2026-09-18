<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class AuditLogService
{
    public function create(
        ?User $user,
        string $action,
        string $module,
        string $description,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user?->id,

            'action' => $action,
            'module' => $module,

            'auditable_type' => $auditable
                ? get_class($auditable)
                : null,

            'auditable_id' => $auditable?->getKey(),

            'description' => $description,

            'old_values' => $oldValues,
            'new_values' => $newValues,

            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    public function created(
        ?User $user,
        string $module,
        string $description,
        ?Model $auditable = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        return $this->create(
            $user,
            'created',
            $module,
            $description,
            $auditable,
            null,
            $newValues,
            $request
        );
    }

    public function updated(
        ?User $user,
        string $module,
        string $description,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        return $this->create(
            $user,
            'updated',
            $module,
            $description,
            $auditable,
            $oldValues,
            $newValues,
            $request
        );
    }

    public function deleted(
        ?User $user,
        string $module,
        string $description,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?Request $request = null
    ): AuditLog {
        return $this->create(
            $user,
            'deleted',
            $module,
            $description,
            $auditable,
            $oldValues,
            null,
            $request
        );
    }
}