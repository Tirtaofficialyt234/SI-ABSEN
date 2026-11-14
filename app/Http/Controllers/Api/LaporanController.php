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

    public function rekapPerHari(Request $request)
    {

        $ta = TahunAjaran::aktif();

        $query = Absensi::query()->join('siswa_kelas', 'absensi.siswa_kelas_id', '=', 'siswa_kelas.id')->
            where('siswa_kelas.tahun_ajaran_id', $ta->id);

        if ($request->has('kelas_id')) {

            $query->where('siswa_kelas.kelas_id', $request->kelas_id);

        }

        if ($request->has('guru_id')) {
            $query->join('jadwal', 'absensi.jadwal_id', '=', 'jadwal.id')
                ->where('jadwal.guru_id', $request->guru_id);
        }

        $data = $query->select('absensi.tanggal as date')->
            selectRaw('COUNT(*) as total')->
            selectRaw("SUM(CASE WHEN absensi.status = 'hadir' THEN 1 ELSE 0 END) as hadir")->
            selectRaw("SUM(CASE WHEN absensi.status = 'izin' THEN 1 ELSE 0 END) as izin")->
            selectRaw("SUM(CASE WHEN absensi.status = 'sakit' THEN 1 ELSE 0 END) as sakit")->
            selectRaw("SUM(CASE WHEN absensi.status = 'alpa' THEN 1 ELSE 0 END) as alpa")->
            groupBy('absensi.tanggal')->get()->map(function ($item) {
                $item->presentase = $item->total > 0 ? round(($item->hadir / $item->total) * 100, 1)
                    : null;
                return $item;

            });

    }

    public function rekapPerBulan(Request $request)
    {
        $ta = TahunAjaran::aktif();
        $query = Absensi::query()->
            join('siswa_kelas', 'absensi.siswa_kelas_id', '=', 'siswa_kelas.id')->
            where('siswa_kelas.tahun_ajaran_id', $ta->id);

        if ($request->has('kelas_id')) {
            $query->where('siswa_kelas.kelas_id', $request->kelas_id);
        }

        if ($request->has('guru_id')) {
            $query->join('jadwal', 'absensi.jadwal_id');
        }

        $data = $query->selectRaw("DATE_FORMAT(absensi.tanggal, '%Y-%m') as month")
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN absensi.status = 'hadir' THEN 1 ELSE 0 END) as hadir")
            ->selectRaw("SUM(CASE WHEN absensi.status = 'izin' THEN 1 ELSE 0 END) as izin")
            ->selectRaw("SUM(CASE WHEN absensi.status = 'sakit' THEN 1 ELSE 0 END) as sakit")
            ->selectRaw("SUM(CASE WHEN absensi.status = 'alpa' THEN 1 ELSE 0 END) as alpa")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                $item->persentase = $item->total > 0
                    ? round(($item->hadir / $item->total) * 100, 1)
                    : null;
                return $item;
            });
        return response()->json([
            'tahun_ajaran' => $ta,
            'data' => $data,
        ]);
    }
}
