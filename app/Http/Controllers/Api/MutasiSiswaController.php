<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MutasiSiswa;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use Illuminate\Http\Request;

use function Symfony\Component\Clock\now;

class MutasiSiswaController extends Controller
{
    public function mutasiKeluar(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'sekolah_tujuan' => 'required|string',
        ]);

        MutasiSiswa::create([
            'siswa_id' => $siswa->id,
            'jenis' => 'keluar',
            'tanggal' => now(),
            'sekolah_terkait' => $validated['sekolah_tujuan'],
        ]);

        $siswa->update(['status' => 'pindah']);

        SiswaKelas::where('siswa_id', $siswa->id)
            ->where('status', 'aktif')
            ->update(['status' => 'pindah']);

        return response()->json(['message' => 'Siswa berhasil dimutasi keluar']);
    }
}
