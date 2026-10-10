<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Database\Seeder;

class AkademikDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ta = TahunAjaran::create(['nama' => '2025/2026', 'semester' => 'ganjil', 'status' => 'aktif']);
        $kelas8A = Kelas::create(['tahun_ajaran_id' => $ta->id, 'nama_kelas' => '8A', 'tingkat' => '8']);
        $mtk = Mapel::create(['nama_mapel' => 'Matematika']);
        $userGuru = User::create(['name' => 'Bu Rina', 'email' => 'rina@sekolah.test', 'password' => bcrypt('password'), 'role' => 'guru']);
        $guru = Guru::create(['user_id' => $userGuru->id, 'nama' => 'Bu Rina', 'nip' => '198501012010']);
        $userSiswa = User::create(['name' => 'Ahmad Fauzi', 'email' => 'ahmad@sekolah.test', 'password' => bcrypt('password'), 'role' => 'siswa']);
        $siswa = Siswa::create(['user_id' => $userSiswa->id, 'nama' => 'Ahmad Fauzi', 'nis' => '2025001']);
        SiswaKelas::create(['siswa_id' => $siswa->id, 'kelas_id' => $kelas8A->id, 'tahun_ajaran_id' => $ta->id, 'status' => 'aktif']);

        Jadwal::create([
            'kelas_id' => $kelas8A->id,
            'mapel_id' => $mtk->id,
            'guru_id' => $guru->id,
            'hari' => strtolower(now()->locale('id')->dayName), // ikut hari sekarang
            'jam_mulai' => now()->format('H:i'),
            'jam_selesai' => now()->addHours(2)->format('H:i'),
        ]);
    }
}
