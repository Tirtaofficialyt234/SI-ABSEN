<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Jadwal;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = [
            'Erni Sofa Nugraha. S.Pd.',
            'H. Ubaidillah Wahab. SH.M. Si.',
            'Dr. Hj. Umi Athiyah',
            'Yeni Dewi S.Pd.',
            'Ahmad Dainuri S.Pd.I',
            'Sri Wahyuni S.Pd.',
            'Endang Sulastri S.Sos.',
            'Sri Wahyuni S.Sos.',
            'Faroh Luluatul Afidah S.Pd',
            'Moch Chamdan Yuwafi S.ST',
            'Moh Humam Wafi S.Kom',
            "Moh Atho'illah SE, MM",
            'Dra. Siti Rusiana',
            'Bintari Kustianingrum A.Md',
            'Khoridah Hanim S.Pd',
            'Atik Nur Fatkiyah S.Pd',
            'Ir. Farid Helmi',
            'M. Aris Fuad S.Kom',
            'Laili Mushoffa S.Kom',
            'Eko Ardhiyanto A.Md',
            'Irham Abdul Jalil S.Kom',
            'Agus Badruzzaman',
            'Ahsin A.Md',
            'Ana Suryani Tohir S.Pd',
            'Angga Widhi Pratama S.Pd',
            'Cipto Arief Leksono Aji S.Pd',
            'Drs. H. Abdul Kafi M.Si',
            'Aziz Muslim S.Pd',
            'Irna Baroroh S.Pd.I',
            'Khida Efty Nely Ifada S.Pd',
            "M. Jaza'ussalam S.Pd.I",
            'Mohammad Misbachul Huda S.Or',
            'Maulidah Rohmah S.Pd',
            'Udkhiana S.Pd',
            'Vitna Puji Lestari S.Tr.Bos',
            'Hilma Huril Aini S.Pd',
            'Eni Mufaricha S.Pd',
            'Muhammad Fahmi Ainunnajib',
            'Ahmad Hanif Dzikron',
        ];

        DB::transaction(function () use ($names): void {
            Jadwal::query()->delete();

            $oldGuruUserIds = Guru::query()->pluck('user_id');
            Guru::query()->delete();
            User::whereIn('id', $oldGuruUserIds)->delete();
            User::where('role', 'guru')->delete();

            $emailCounts = [];

            foreach ($names as $index => $name) {
                $baseName = $this->stripTitlesAndDegrees($name);
                $emailBase = Str::slug($baseName, '_').'@sekolah.id';

                $emailCounts[$emailBase] = ($emailCounts[$emailBase] ?? 0) + 1;
                $email = $emailCounts[$emailBase] > 1
                    ? Str::slug($baseName, '_').'_'.$emailCounts[$emailBase].'@sekolah.id'
                    : $emailBase;

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => 'password',
                    'role' => 'guru',
                    'must_change_password' => false,
                ]);

                Guru::create([
                    'user_id' => $user->id,
                    'nama' => $name,
                    'nip' => sprintf('GURU-2026-%03d', $index + 1),
                ]);
            }
        });
    }

    private function stripTitlesAndDegrees(string $name): string
    {
        $name = preg_replace('/^(Drs?\.\s*|Dra\.\s*|Ir\.\s*|H\.\s*|Hj\.\s*)+/iu', '', $name) ?? $name;

        $suffixPattern = '/\s*(?:'
            .'SH\.?\s*M\.?\s*Si\.?|'
            .'S\.?(?:Pd|Sos|Kom|ST|Or)\.?(?:I)?|'
            .'A\.?Md\.?|'
            .'SE(?:,\s*MM)?|'
            .'MM|'
            .'M\.?Si\.?|'
            .'S\.?Tr\.?Bos'
            .')$/iu';

        return trim(preg_replace($suffixPattern, '', $name) ?? $name);
    }
}
