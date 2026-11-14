<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Symfony\Component\Mime\Message;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jadwal::with(['kelas', 'mapel', 'guru', 'tahunAjaran']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('mapel', fn($sub) => $sub->where('nama_mapel', 'like', "%{$search}%"))
                    ->orWhereHas('guru', fn($sub) => $sub->where('nama', 'like', "%{$search}%"))
                    ->orWhereHas('kelas', fn($sub) => $sub->where('nama_kelas', 'like', "%{$search}%"));
            });
        }

        if ($request->filled("hari")) {
            $query->where('hari', $request->hari);
        }

        $jadwal = $query->orderBy('hari')->orderBy('jam_mulai')->paginate(10);

        return response()->json($jadwal);


    }

    public function options()
    {
        return response()->json([
            'kelas' => \App\Models\Kelas::all(['id', 'nama_kelas']),
            'mapel' => \App\Models\Mapel::all(['id', 'nama_mapel']),
            'guru' => \App\Models\Guru::all(['id', 'nama']),
            'tahun_ajaran' => \App\Models\TahunAjaran::where('status', 'aktif')->first(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tahun_ajaran_id' => 'required|exists:tahun_ajaran,id',
            'kelas_id' => 'required|exists:kelas,id',
            'mapel_id' => 'required|exists:mapel,id',
            'guru_id' => 'required|exists:guru,id',
            'hari' => 'required|in:senin,selasa,rabu,kamis,jumat,sabtu,minggu',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
        ]);

        $bentrokGuru = Jadwal::where('guru_id', $validated['guru_id'])->where('hari', $validated['hari'])
            ->where(function ($query) use ($validated) {
                $query->where('jam_mulai', '<', $validated['jam_selesai'])
                    ->where('jam_selesai', '>', $validated['jam_mulai']);
            })
            ->exists();

        if ($bentrokGuru) {
            return response()->json([
                'message' => 'Guru tersebut sudah memiliki jadwal mengajar pada jam dan hari ini.'
            ], 422);
        }

        $bentrokKelas =
            Jadwal::where('kelas_id', $validated['kelas_id'])
                ->where('hari', $validated['hari'])
                ->where(function ($query) use ($validated) {
                    $query->where('jam_mulai', '<', $validated['jam_selesai'])
                        ->where('jam_selesai', '>', $validated['jam_mulai']);
                })
                ->exists();

        if ($bentrokKelas) {
            return response()->json([
                'message' => 'Kelas tersebut sudah memiliki jadwal pelajaran lain pada jam dan hari ini.'
            ], 422);
        }

        $jadwal = Jadwal::create($validated);
        return response()->json([
            'message' => 'Jadwal berhasil ditambahkan',
            'data' => $jadwal
        ], 201);
    }
}
