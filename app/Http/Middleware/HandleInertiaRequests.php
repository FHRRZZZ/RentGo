<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $mitraApprovalNotice = null;

        if ($request->user()) {
            $mitraApprovalNotice = $request->user()
                ->notifications()
                ->where('type', 'agent_verification_approved')
                ->whereNull('read_at')
                ->latest()
                ->first(['id', 'title', 'message', 'data']);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                // Dipakai frontend (mis. tombol Simpan Dokumen Sewa) untuk
                // membedakan customer dan mitra tanpa request tambahan.
                'role' => fn () => $request->user()
                    ? ($request->user()->roles->first()?->name ?? 'customer')
                    : null,
            ],
            'mitraApprovalNotice' => $mitraApprovalNotice,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
