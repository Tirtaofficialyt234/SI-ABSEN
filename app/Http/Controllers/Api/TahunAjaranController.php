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
}
