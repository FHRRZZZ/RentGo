<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AuditLogController extends Controller
{
    public function index(Request $request): View
    {
        $this->authorize(
            'viewAny',
            AuditLog::class
        );

        $query = AuditLog::query()
            ->with('user')
            ->latest();

        if ($request->filled('action')) {
            $query->where(
                'action',
                $request->action
            );
        }

        if ($request->filled('module')) {
            $query->where(
                'module',
                $request->module
            );
        }

        $auditLogs = $query
            ->paginate(20)
            ->withQueryString();

        $actions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        $modules = AuditLog::query()
            ->select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module');

        return view(
            'audit-logs.index',
            compact(
                'auditLogs',
                'actions',
                'modules'
            )
        );
    }

    public function show(
        AuditLog $auditLog
    ): View {
        $this->authorize(
            'view',
            $auditLog
        );

        $auditLog->load('user');

        return view(
            'audit-logs.show',
            compact('auditLog')
        );
    }
}