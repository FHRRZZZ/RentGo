<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Support\AssignsCustomerRole;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    use AssignsCustomerRole;

    /**
     * Mengarahkan pengguna ke halaman autentikasi Google OAuth.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Menangani callback autentikasi dari Google.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            // Gunakan stateless() untuk menghindari kendala InvalidStateException di lingkungan local/proxy
            try {
                /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
                $driver = Socialite::driver('google');
                $googleUser = $driver->user();
            } catch (\Throwable $e) {
                /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
                $driver = Socialite::driver('google');
                $googleUser = $driver->stateless()->user();
            }

            if (! $googleUser || ! $googleUser->getEmail()) {
                return redirect()->route('login')
                    ->with('error', 'Gagal mengambil data dari akun Google. Silakan coba lagi.');
            }

            // 1. Cari user berdasarkan google_id
            $user = User::where('google_id', $googleUser->getId())->first();

            // 2. Jika tidak ada, cek apakah email sudah terdaftar sebelumnya
            if (! $user) {
                $user = User::where('email', $googleUser->getEmail())->first();

                if ($user) {
                    // Hubungkan akun yang ada dengan Google ID & update avatar jika belum ada
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $user->avatar ?: $googleUser->getAvatar(),
                        'email_verified_at' => $user->email_verified_at ?: now(),
                    ]);
                }
            }

            // 3. Jika belum terdaftar sama sekali, buat user baru (Registrasi via Google)
            $isNewUser = false;
            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?: explode('@', $googleUser->getEmail())[0],
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)),
                ]);

                // Berikan role customer default jika package Spatie Permission tersedia.
                //
                // Role dibuat lebih dulu bila belum ada — tanpa ini assignRole()
                // melempar RoleDoesNotExist sehingga user tercipta tanpa role
                // (penyebab data profil & dokumen tidak bisa disimpan).
                $this->assignDefaultCustomerRole($user);

                event(new Registered($user));
                $isNewUser = true;
            } else {
                // Akun lama (mis. hasil login Google sebelum role tersedia)
                // bisa saja belum punya role apa pun — lengkapi di sini.
                $this->assignDefaultCustomerRole($user);
            }

            // Login-kan user ke dalam sistem
            Auth::login($user, true);
            request()->session()->regenerate();

            // Cek role untuk redirect tujuan
            if (method_exists($user, 'hasRole')) {
                if ($user->hasRole('admin')) {
                    return redirect()->intended('/admin')
                        ->with('success', 'Selamat datang Administrator, ' . $user->name . '.');
                }

                if ($user->hasRole('mitra')) {
                    return redirect()->intended('/mitra')
                        ->with('success', 'Selamat datang Mitra, ' . $user->name . '.');
                }
            }

            $message = $isNewUser
                ? 'Akun Anda berhasil didaftarkan dan masuk dengan Google!'
                : 'Berhasil masuk dengan akun Google.';

            request()->session()->forget('url.intended');
            return redirect(RouteServiceProvider::HOME)->with('success', $message);

        } catch (\Throwable $th) {
            Log::error('Google OAuth Login Error: ' . $th->getMessage(), [
                'exception' => $th,
            ]);

            return redirect()->route('login')
                ->with('error', 'Terjadi kendala saat login dengan Google: ' . $th->getMessage());
        }
    }
}
