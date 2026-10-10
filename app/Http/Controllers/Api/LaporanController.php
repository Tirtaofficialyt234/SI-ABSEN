<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    /**
     * Rekap kehadiran siswa per tahun ajaran aktif.
     *
     * Query params (opsional):
     *   - kelas_id : filter berdasarkan kelas tertentu
     */
    public function rekapAbsensi(Request $request)
    {
        $ta = TahunAjaran::aktif();

        // Ambil semua siswa aktif di tahun ajaran ini, bisa difilter per kelas
        $query = SiswaKelas::with('siswa', 'kelas')
            ->where('tahun_ajaran_id', $ta->id)
            ->where('status', 'aktif');

        if ($request->has('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        $siswaKelas = $query->get();

        // Bangun rekap per siswa: hitung total pertemuan, hadir, izin, sakit, alpa
        $rekap = $siswaKelas->map(function ($sk) {
            $total = Absensi::where('siswa_kelas_id', $sk->id)->count();
            $hadir = Absensi::where('siswa_kelas_id', $sk->id)->where('status', 'hadir')->count();
            $izin = Absensi::where('siswa_kelas_id', $sk->id)->where('status', 'izin')->count();
            $sakit = Absensi::where('siswa_kelas_id', $sk->id)->where('status', 'sakit')->count();
            $alpa = Absensi::where('siswa_kelas_id', $sk->id)->where('status', 'alpa')->count();

            return [
                'siswa' => $sk->siswa->nama,
                'kelas' => $sk->kelas->nama_kelas,
                'total_pertemuan' => $total,
                'hadir' => $hadir,
                'izin' => $izin,
                'sakit' => $sakit,
                'alpa' => $alpa,
                'persentase_kehadiran' => $total > 0
                    ? round(($hadir / $total) * 100, 1)
                    : null,
            ];
        });

        return response()->json([
            'tahun_ajaran' => $ta,
            'data' => $rekap,
        ]);
    }
}
