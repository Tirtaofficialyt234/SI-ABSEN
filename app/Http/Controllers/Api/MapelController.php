<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Mapel;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MapelController extends Controller
{
    public function index(Request $request)
    {
        $query = Mapel::withCount('jadwal');

        if ($request->filled('search')) {
            $query->where('nama_mapel', 'like', '%' . $request->search . '%');
        }

        $mapel = $query->orderBy('nama_mapel', 'asc')->get();

        return response()->json($mapel);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_mapel' => 'required|string|max:100|unique:mapel,nama_mapel',
        ], [
            'nama_mapel.required' => 'Nama mata pelajaran wajib diisi.',
            'nama_mapel.unique' => 'Mata pelajaran ini sudah ada.',

        ]);

        $mapel = Mapel::create($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil ditambahkan',
            'data' => $mapel,
        ], 201);
    }

    public function destroy($id)
    {
        $mapel = Mapel::find($id);

        if (!$mapel) {
            return response()->json([
                'message' => 'Mata pelajaran tidak ditemukan'
            ], 404);
        }

        $dipakaiDiJadwal = Jadwal::where('mapel_id', $id)->exists();
        if ($dipakaiDiJadwal) {
            return response()->json([
                'message' => 'Mata pelajaran ini tidak dapat dihapus karena masih digunakan di jadwal aktif.'
            ], 422);
        }

        $mapel->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus'
        ]);
    }


}
