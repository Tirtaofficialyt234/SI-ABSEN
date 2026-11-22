<?php

use App\Http\Controllers\Api\AbsensiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GuruController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\MapelController;
use App\Http\Controllers\Api\MutasiSiswaController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\TahunAjaranController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test-token', function (Request $request) {
    return response()->json([
        'has_bearer' => $request->bearerToken() !== null,
        'bearer_token' => $request->bearerToken(),
        'auth_check' => auth('sanctum')->check(),
        'user' => auth('sanctum')->user(),
    ]);
});
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login'])
    ->name('login');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // User yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | GURU
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:guru')->group(function () {

        Route::get('/guru/dashboard', [
            DashboardController::class,
            'guruDashboard',
        ]);

        Route::post('/absensi', [
            AbsensiController::class,
            'store',
        ]);

        Route::get('/absensi', [AbsensiController::class, 'index']);

    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin')->group(function () {

        Route::get('/admin/dashboard', [
            DashboardController::class,
            'adminDashboard',
        ]);

        Route::get('/siswa', [
            SiswaController::class,
            'index',
        ]);

        Route::get('/siswa/{id}', [
            SiswaController::class,
            'show',
        ]);

        Route::post('/siswa', [
            SiswaController::class,
            'store',
        ]);

        Route::post('/siswa/{siswa}/mutasi-keluar', [
            MutasiSiswaController::class,
            'mutasiKeluar',
        ]);

        Route::post('/tahun-ajaran/naikkan-kelas', [
            TahunAjaranController::class,
            'naikkanKelas',
        ]);

        Route::delete('/siswa/{id}', [SiswaController::class, 'destroy'])
            ->middleware('role:admin');

        Route::get('/laporan-absensi', [LaporanController::class, 'rekapAbsensi']);

        Route::get('/tahun-ajaran', [TahunAjaranController::class, 'index']);
        Route::post('/tahun-ajaran', [TahunAjaranController::class, 'store']);
        Route::patch('/tahun-ajaran/{id}/aktif', [TahunAjaranController::class, 'setAktif']);
        Route::delete('/tahun-ajaran/{id}', [TahunAjaranController::class, 'destroy']);

        Route::get('/jadwal', [JadwalController::class, 'index']);
        Route::get('/jadwal-options', [JadwalController::class, 'options']);
        Route::post('/jadwal', [JadwalController::class, 'store']);
        Route::delete('/jadwal/{id}', [JadwalController::class, 'destroy']);

        Route::get('/mapel', [MapelController::class, 'index']);
        Route::post('/mapel', [MapelController::class, 'store']);
        Route::delete('/mapel/{id}', [MapelController::class, 'destroy']);

        Route::get('/kelas', [KelasController::class, 'index']);
        Route::post('/kelas', [KelasController::class, 'store']);
        Route::delete('/kelas/{id}', [KelasController::class, 'destroy']);

        Route::get('/guru', [GuruController::class, 'index']);
        Route::post('/guru', [GuruController::class, 'store']);
        Route::delete('/guru/{id}', [GuruController::class, 'destroy']);

        Route::get('/guru/absensi/rekap/harian', [
            LaporanController::class,
            'rekapHarianGuru',
        ]);
        Route::get('/guru/absensi/rekap/bulanan', [
            LaporanController::class,
            'rekapBulananGuru',
        ]);

    });

    /*
    |--------------------------------------------------------------------------
    | SISWA
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:siswa')->group(function () {

        Route::get('/siswa/dashboard', [
            DashboardController::class,
            'siswaDashboard',
        ]);

    });

});
