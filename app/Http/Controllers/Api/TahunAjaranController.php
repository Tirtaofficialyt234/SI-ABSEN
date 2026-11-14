<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class TahunAjaranController extends Controller
{
    public function naikkanKelas(Request $request)
    {
        $tahunLama = TahunAjaran::aktif();

        $tahunBaru = TahunAjaran::create([
            'nama' => $request->nama,
            'semester' => $request->semester,
            'status' => 'aktif',
        ]);

        $tahunLama->update([
            'status' => 'nonaktif',
        ]);

        foreach ($request->kenaikan as $item) {
            $lama = SiswaKelas::find($item['siswa_kelas_id']);

            $lama->update([
                'status' => $item['status'],
            ]);

            if ($item['status'] == 'lulus') {

                SiswaKelas::create([
                    'siswa_id' => $lama->siswa_id,
                    'kelas_id' => $item['kelas_tujuan_id'],
                    'tahun_ajaran_id' => $tahunBaru->id,
                    'status' => 'aktif',
                ]);

            } else {

                $lama->siswa->update([
                    'status' => 'lulus',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Kenaikan kelas berhasil diproses.',
            'tahun_ajaran_baru' => $tahunBaru,
        ], 200);
    }

    public function index()
    {
        $tahunAjaran = TahunAjaran::orderBy('id', 'desc')->get();
        return response()->json($tahunAjaran);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string',
            'semester' => 'required|in:ganjil,genap',
        ]);

        $validated['status'] = 'nonaktif';

        $tahun = TahunAjaran::create($validated);

        return response()->json([
            'message' => 'Tahun ajaran berhasil dibuat',
            'data' => $tahun
        ], 201);

    }

    public function setAktif($id)
    {
        $target = TahunAjaran::find($id);

        if (!$target) {
            return response()->json([
                'message' => 'Tahun ajaran tidak ditemukan'
            ], 404);
        }

        TahunAjaran::query()->update(['status' => 'nonaktif']);
        $target->update(['status' => 'aktif']);

        return response()->json([
            'message' => 'Tahun ajaran aktif berhasil diperbarui',
            'data' => $target
        ]);


    }

    public function destroy($id)
    {
        $target = TahunAjaran::find($id);
        if (!$target) {
            return response()->json(['message' => 'Tahun ajaran tidak ditemukan'], 404);
        }
        if ($target->status === 'aktif') {
            return response()->json([
                'message' => 'Tidak dapat menghapus tahun ajaran yang sedang aktif.'
            ], 422);
        }
        $target->delete();
        return response()->json(['message' => 'Tahun ajaran berhasil dihapus']);
    }
}
