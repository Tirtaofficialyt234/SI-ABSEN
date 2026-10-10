<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\Request;


class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with(['kelasAktif.kelas', 'user'])
            ->when($request->search, function ($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                    ->orWhere('nis', 'like', "%{$request->search}%");
            })
            ->when($request->kelas_id, function ($q) use ($request) {
                $q->whereHas('kelasAktif', fn($q) => $q->where('kelas_id', $request->kelas_id));
            })
            ->when($request->status, function ($q) use ($request) {
                $q->whereHas('kelasAktif', fn($q) => $q->where('status', $request->status));
            });

        $siswa = $query->paginate(10);

        $data = $siswa->getCollection()->map(function ($s, $index) use ($siswa) {
            $kelasAktif = $s->kelasAktif;

            return [
                'no' => ($siswa->currentPage() - 1) * $siswa->perPage() + $index + 1,
                'id' => $s->id,
                'nis' => $s->nis,
                'nama' => $s->nama,
                'kelas' => $kelasAktif?->kelas?->nama_kelas ?? '-',
                'jenis_kelamin' => $s->user?->jenis_kelamin ?? $s->jenis_kelamin ?? '-',
                'status' => $kelasAktif?->status ?? 'tidak aktif',
            ];
        });

        return response()->json([
            'data' => $data,
            'total' => $siswa->total(),
            'current_page' => $siswa->currentPage(),
            'last_page' => $siswa->lastPage(),
            'per_page' => $siswa->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required',
            'nis' => 'required|unique:siswa,nis',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $user = User::create([
            'name' => $validated['nama'],
            'email' => $validated['nis'] . '@sekolah.local',
            'password' => bcrypt($validated['nis']),
            'role' => 'siswa',
        ]);

        $siswa = Siswa::create(['user_id' => $user->id, 'nama' => $validated['nama'], 'nis' => $validated['nis']]);

        SiswaKelas::create([
            'siswa_id' => $siswa->id,
            'kelas_id' => $validated['kelas_id'],
            'tahun_ajaran_id' => TahunAjaran::aktif()->id,
            'status' => 'aktif',
        ]);

        return response()->json($siswa, 201);
    }

    public function destroy($id)
    {
        $Siswa = Siswa::find($id);

        if (!$Siswa) {
            return response()->json([
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
        $Siswa->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus'
        ]);
    }
}
