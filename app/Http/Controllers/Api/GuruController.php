<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GuruController extends Controller
{
    public function index(Request $request)
    {
        $query = Guru::with('user')->withCount('jadwal');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $guruList = $query->orderBy('nama', 'asc')->get();

        return response()->json($guruList);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'     => 'required|string|max:100',
            'nip'      => 'required|string|max:30|unique:guru,nip',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'nama.required'     => 'Nama guru wajib diisi.',
            'nip.required'      => 'NIP wajib diisi.',
            'nip.unique'        => 'NIP ini sudah terdaftar.',
            'email.required'    => 'Email untuk login wajib diisi.',
            'email.unique'      => 'Email ini sudah digunakan oleh akun lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
        ]);

        return DB::transaction(function () use ($validated) {
            $user = User::create([
                'name'     => $validated['nama'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'guru',
            ]);

            $guru = Guru::create([
                'user_id' => $user->id,
                'nama'    => $validated['nama'],
                'nip'     => $validated['nip'],
            ]);

            return response()->json([
                'message' => 'Guru berhasil ditambahkan beserta akun loginnya',
                'data'    => $guru->load('user'),
            ], 201);
        });
    }

    public function destroy($id)
    {
        $guru = Guru::find($id);

        if (! $guru) {
            return response()->json(['message' => 'Guru tidak ditemukan'], 404);
        }

        if ($guru->jadwal()->exists()) {
            return response()->json([
                'message' => 'Guru tidak dapat dihapus karena masih terdaftar di jadwal mengajar.'
            ], 422);
        }

        return DB::transaction(function () use ($guru) {
            $user = $guru->user;
            $guru->delete();
            if ($user) {
                $user->delete();
            }

            return response()->json(['message' => 'Guru dan akun login berhasil dihapus']);
        });
    }
}
