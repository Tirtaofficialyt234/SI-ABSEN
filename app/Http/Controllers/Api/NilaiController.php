<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Nilai;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class NilaiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'siswa_id' => 'required|exists:siswa,id',
            'mapel_id' => 'required|exists:mapel,id',
            'jenis_nilai' => 'required|in:harian,tugas,uts,uas',
            'nilai' => 'required|numeric|min:0|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $validated['guru_id'] = $request->user()->guru->id;
        $validated['tahun_ajaran_id'] = TahunAjaran::aktif()->id;

        Nilai::create($validated);

        return response()->json(['message' => 'Nilai tersimpan']);
    }
}
