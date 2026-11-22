<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Siswa;
use App\Models\SiswaKelas;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RestoreAcademicRelationsSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $tahunAjaran = TahunAjaran::aktif();

            if (! $tahunAjaran) {
                throw new RuntimeException('Tidak ada tahun ajaran aktif.');
            }

            $classes = [
                ['name' => 'X-B1', 'level' => '10', 'first_student_id' => 13, 'last_student_id' => 23],
                ['name' => 'X-K1', 'level' => '10', 'first_student_id' => 24, 'last_student_id' => 46],
                ['name' => 'X-K2', 'level' => '10', 'first_student_id' => 47, 'last_student_id' => 68],
                ['name' => 'X-PPLG1', 'level' => '10', 'first_student_id' => 69, 'last_student_id' => 78],
                ['name' => 'XI-B1', 'level' => '11', 'first_student_id' => 79, 'last_student_id' => 98],
                ['name' => 'XI-K1', 'level' => '11', 'first_student_id' => 99, 'last_student_id' => 123],
                ['name' => 'XI-K2', 'level' => '11', 'first_student_id' => 124, 'last_student_id' => 150],
                ['name' => 'XI-PPLG1', 'level' => '11', 'first_student_id' => 151, 'last_student_id' => 173],
                ['name' => 'XII-B1', 'level' => '12', 'first_student_id' => 174, 'last_student_id' => 185],
                ['name' => 'XII-K1', 'level' => '12', 'first_student_id' => 186, 'last_student_id' => 205],
                ['name' => 'XII-PPLG1', 'level' => '12', 'first_student_id' => 206, 'last_student_id' => 216],
            ];

            $restoredStudentCount = 0;

            foreach ($classes as $class) {
                $students = Siswa::query()
                    ->whereBetween('id', [$class['first_student_id'], $class['last_student_id']])
                    ->orderBy('id')
                    ->get();
                $expectedStudentCount = $class['last_student_id'] - $class['first_student_id'] + 1;

                if ($students->count() !== $expectedStudentCount) {
                    throw new RuntimeException("Data siswa untuk kelas {$class['name']} tidak lengkap.");
                }

                $kelas = Kelas::firstOrCreate(
                    [
                        'tahun_ajaran_id' => $tahunAjaran->id,
                        'nama_kelas' => $class['name'],
                    ],
                    ['tingkat' => $class['level']]
                );

                foreach ($students as $siswa) {
                    SiswaKelas::updateOrCreate(
                        [
                            'siswa_id' => $siswa->id,
                            'tahun_ajaran_id' => $tahunAjaran->id,
                        ],
                        [
                            'kelas_id' => $kelas->id,
                            'status' => 'aktif',
                        ]
                    );
                }

                $restoredStudentCount += $students->count();
            }

            $kelas12Pplg = Kelas::where('tahun_ajaran_id', $tahunAjaran->id)
                ->where('nama_kelas', '12 PPLG')
                ->first();

            $jadwal = Jadwal::where('kelas_id', $kelas12Pplg?->id)
                ->where('mapel_id', Mapel::where('nama_mapel', 'Backend')->value('id'))
                ->where('guru_id', Guru::where('nama', 'Moch Chamdan Yuwafi S.ST')->value('id'))
                ->first();

            if ($jadwal) {
                $jadwal->update([
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'hari' => 'sabtu',
                    'jam_mulai' => '20:29',
                    'jam_selesai' => '21:30',
                ]);
            }

            $this->command->info(
                'Pemulihan selesai: '.count($classes)." kelas dan {$restoredStudentCount} penempatan siswa."
            );
        });
    }
}
