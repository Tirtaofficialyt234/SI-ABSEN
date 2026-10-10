<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use Illuminate\Http\Request;

class AbsensiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jadwal_id' => 'required|exists:jadwal,id',
            'tanggal' => 'required|date',
            'data' => 'required|array',
            'data.*.siswa_kelas_id' => 'required|exists:siswa_kelas,id',
            'data.*.status' => 'required|in:hadir,izin,sakit,alpa',
        ]);

        foreach ($validated['data'] as $item) {
            Absensi::updateOrCreate(
                [
                    'siswa_kelas_id' => $item['siswa_kelas_id'],
                    'jadwal_id' => $validated['jadwal_id'],
                    'tanggal' => $validated['tanggal'],
                ],
                ['status' => $item['status']]
            );
        }

        return response()->json(['message' => 'Absensi tersimpan']);
    }
}
