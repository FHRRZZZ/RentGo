<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * API Authentication — Login, Register, Logout, Me.
 * Menggunakan Laravel Sanctum (token-based).
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Daftar akun baru (role: customer).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone'    => ['nullable', 'string', 'max:30'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('customer');

        // Buat profil customer kosong
        $user->customerProfile()->create([
            'phone'       => $validated['phone'] ?? null,
            'is_verified' => false,
        ]);

        $token = $user->createToken('mobile', ['*'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login
     * Login dengan email & password.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Hapus token lama dengan nama device yang sama
        $deviceName = $request->device_name ?? 'mobile';
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName, ['*'], now()->addDays(30))->plainTextToken;

        $user->load(['agentProfile', 'customerProfile']);

        return response()->json([
            'message' => 'Login berhasil.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     * Hapus token aktif (logout dari device ini).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }

    /**
     * GET /api/auth/me
     * Data user yang sedang login.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['agentProfile', 'customerProfile', 'roles']);

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * PUT /api/auth/password
     * Ganti password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama salah.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    // ------------------------------------------------------------------
    // Helper
    // ------------------------------------------------------------------
    private function formatUser(User $user): array
    {
        $role = $user->roles->first()?->name ?? $user->getRoleNames()->first() ?? 'customer';
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'avatar'       => $user->avatar,
            'role'         => $role,
            'agent_profile'   => $user->agentProfile ? [
                'id'               => $user->agentProfile->id,
                'agency_name'      => $user->agentProfile->agency_name,
                'owner_name'       => $user->agentProfile->owner_name,
                'phone'            => $user->agentProfile->phone,
                'city'             => $user->agentProfile->city,
                'province'         => $user->agentProfile->province,
                'logo'             => $user->agentProfile->logo
                    ? asset('storage/' . $user->agentProfile->logo)
                    : null,
                'onboarding_status' => $user->agentProfile->onboarding_status,
                'is_active'        => $user->agentProfile->is_active,
            ] : null,
            'customer_profile' => $user->customerProfile ? [
                'id'          => $user->customerProfile->id,
                'phone'       => $user->customerProfile->phone,
                'is_verified' => $user->customerProfile->is_verified,
            ] : null,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
