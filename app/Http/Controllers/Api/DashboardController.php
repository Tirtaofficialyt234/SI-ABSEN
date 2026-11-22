<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function siswaDashboard(Request $request)
    {
        $user = $request->user();
        $siswa = $user->siswa;

        $tahunAjaran = TahunAjaran::aktif();

        // Kelas aktif siswa di tahun ajaran ini
        $siswaKelas = SiswaKelas::with('kelas')
            ->where('siswa_id', $siswa->id)
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->where('status', 'aktif')
            ->first();

        // Jadwal kelas hari ini
        $hariIni = strtolower(now()->locale('id')->dayName);
        $jadwalHariIni = [];
        if ($siswaKelas) {
            $jadwalHariIni = Jadwal::with(['mapel', 'guru'])
                ->where('kelas_id', $siswaKelas->kelas_id)
                ->where('hari', $hariIni)
                ->orderBy('jam_mulai')
                ->get();
        }

        return response()->json([
            'siswa' => $siswa,
            'tahun_ajaran' => $tahunAjaran,
            'kelas' => $siswaKelas?->kelas,
            'jadwal_hari_ini' => $jadwalHariIni,
        ]);
    }

    public function guruDashboard(Request $request)
    {
        $guru = $request->user()->guru;
        $hariIni = strtolower(now()->locale('id')->dayName);
        $jamSekarang = now()->format('H:i:s');

        $jadwalAktif = Jadwal::with(['kelas', 'mapel'])
            ->where('guru_id', $guru->id)
            ->where('hari', $hariIni)
            ->where('jam_mulai', '<=', $jamSekarang)
            ->where('jam_selesai', '>=', $jamSekarang)
            ->first();

        if (! $jadwalAktif) {
            return response()->json(['message' => 'Tidak ada jadwal aktif']);
        }

        $siswaDiKelas = SiswaKelas::with('siswa')
            ->where('kelas_id', $jadwalAktif->kelas_id)
            ->where('tahun_ajaran_id', $jadwalAktif->tahun_ajaran_id)
            ->where('status', 'aktif')
            ->get();

        return response()->json([
            'jadwal' => $jadwalAktif,
            'siswa' => $siswaDiKelas,
        ]);
    }

    public function adminDashboard(Request $request)
    {
        $totalSiswa = Siswa::count();
        $totalGuru = Guru::count();
        $totalKelas = Kelas::count();

        $hariIni = now()->toDateString();

        $absensiHariIni = Absensi::where('tanggal', $hariIni)->get();

        $hadir = $absensiHariIni->where('status', 'hadir')->count();
        $izin = $absensiHariIni->where('status', 'izin')->count();
        $sakit = $absensiHariIni->where('status', 'sakit')->count();
        $alfa = $absensiHariIni->where('status', 'alpa')->count(); // alpa in db

        $totalAbsensi = $absensiHariIni->count();
        $persentaseHadir = $totalAbsensi > 0 ? round(($hadir / $totalAbsensi) * 100) : 0;

        $absensiTerbaruData = Absensi::with(['siswaKelas.siswa', 'siswaKelas.kelas'])
            ->latest('tanggal')
            ->latest('id')
            ->take(5)
            ->get();

        $absensiTerbaru = $absensiTerbaruData->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_siswa' => $item->siswaKelas?->siswa?->nama ?? '-',
                'nama_kelas' => $item->siswaKelas?->kelas?->nama_kelas ?? '-',
                'status' => $item->status == 'alpa' ? 'alfa' : $item->status, // Map back to alfa for frontend
                'tanggal' => date('d M Y', strtotime($item->tanggal)),
            ];
        });

        // Data for chart: Last 7 days attendance
        $grafikKehadiran = [];
        $tujuhHariLalu = now()->subDays(6)->toDateString();

        $absensiSeminggu = Absensi::where('tanggal', '>=', $tujuhHariLalu)->get();

        $hariIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $tanggalString = $date->toDateString();
            $label = $hariIndo[$date->dayOfWeek];

            $absensiHarian = $absensiSeminggu->where('tanggal', $tanggalString);
            $total = $absensiHarian->count();
            $hadirCount = $absensiHarian->where('status', 'hadir')->count();

            $persentase = $total > 0 ? round(($hadirCount / $total) * 100) : 0;

            $grafikKehadiran[] = [
                'hari' => $label,
                'persentase' => $persentase,
            ];
        }

        return response()->json([
            'total_siswa' => $totalSiswa,
            'total_guru' => $totalGuru,
            'total_kelas' => $totalKelas,
            'persentase_hadir' => $persentaseHadir,
            'hadir' => $hadir,
            'izin' => $izin,
            'sakit' => $sakit,
            'alfa' => $alfa,
            'absensi_terbaru' => $absensiTerbaru,
            'grafik_kehadiran' => $grafikKehadiran,
        ]);
    }
}
