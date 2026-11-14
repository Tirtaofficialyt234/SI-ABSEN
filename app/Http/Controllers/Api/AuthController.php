<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if ($user->role === 'guru') {
            $guru = $user->guru;

            if (!$guru) {
                return response()->json([
                    'message' => 'Profil data guru tidak ditemukan.'
                ], 403);
            }

            $hariIni = strtolower(now()->locale('id')->dayName);
            $jamSekarang = now()->format('H:i:s');
            $adaJadwal = \App\Models\Jadwal::where('guru_id', $guru->id)
                ->where('hari', $hariIni)
                ->where('jam_mulai', '<=', $jamSekarang)
                ->where('jam_selesai', '>=', $jamSekarang)
                ->exists();

            if(!$adaJadwal){
                return response()->json([
                    'message' => 'Anda tidak memiliki jadwal mengajar pada jam dan hari ini.'
                ], 403);
            }
        }

        return response()->json([
            'token' => $user->createToken('api')->plainTextToken,
            'role' => $user->role,
            'must_change_password' => $user->must_change_password,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil logout']);
    }
}
