<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/pencarian', function (Request $request) {
    return Inertia::render('Unit/MappingUnit', [
        'search' => [
            'tipe' => $request->string('tipe', 'mobil')->toString(),
            'q' => $request->string('q')->toString(),
            'kota' => $request->string('kota', 'Semua Kota')->toString(),
            'layanan' => $request->string('layanan', 'lepas-kunci')->toString(),
            'tanggal' => $request->string('tanggal')->toString(),
            'durasi' => $request->string('durasi', '1 Hari')->toString(),
        ],
    ]);
})->name('unit.search');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
