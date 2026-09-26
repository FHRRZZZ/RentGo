<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Menangani permintaan masuk dan memvalidasi hak akses role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        if (! empty($roles)) {
            $hasRole = false;

            foreach ($roles as $role) {
                $subRoles = explode('|', $role);
                foreach ($subRoles as $subRole) {
                    $trimmed = trim($subRole);
                    if (method_exists($user, 'hasRole') && $user->hasRole($trimmed)) {
                        $hasRole = true;
                        break 2;
                    }
                }
            }

            if (! $hasRole) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini.',
                    ], 403);
                }

                if (method_exists($user, 'hasRole')) {
                    if ($user->hasRole('admin')) {
                        return redirect('/admin')->with('error', 'Akses ditolak. Halaman tersebut bukan untuk role admin.');
                    }
                    if ($user->hasRole('mitra')) {
                        return redirect('/mitra')->with('error', 'Akses ditolak. Halaman tersebut bukan untuk role mitra.');
                    }
                }

                return redirect('/')->with('error', 'Akses ditolak. Anda tidak memiliki izin untuk halaman tersebut.');
            }
        }

        return $next($request);
    }
}
