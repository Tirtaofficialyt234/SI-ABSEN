<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        $query = Kelas::with('tahunAjaran')->withCount('siswaKelas');

        if ($request->filled('search')) {
            $query->where('nama_kelas', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('tingkat')) {
            $query->where('tingkat', $request->tingkat);
        }

        $kelas_list = $query->orderBy('tingkat', 'asc')->orderBy('nama_kelas', 'asc')->get();
        return response()->json($kelas_list);
    }

    public function store(Request $request)
    {
        $tahunAktif = TahunAjaran::aktif();

        if (!$tahunAktif) {
            return response()->json([
                'message' => 'Tidak ada tahun ajaran aktif. Silakan aktifkan tahun ajaran terlebih dahulu.'
            ], 422);
        }

        $validated = $request->validate([
            'nama_kelas' => 'required|string|max:50',
            'tingkat' => 'required|in:10,11,12',
        ], [
            'nama_kelas.required' => 'Nama kelas wajib diisi.',
            'tingkat.required' => 'Tingkat kelas wajib dipilih.',
        ]);

        $validated['tahun_ajaran_id'] = $tahunAktif-> id;
        $kelas = Kelas::create($validated);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan',
            'data'    => $kelas,
        ],201);
    }

    public function destroy($id){
        $kelas = Kelas::find($id);
        if(!$kelas){
            return response()->json([
               'message' => 'Kelas tidak ditemukan'
            ],404);
        }

        if($kelas-> siswaKelas()->exists()){
            return response()->json([
                'message' => 'Kelas tidak dapat dihapus karena masih memiliki siswa.'
            ],422);

        }

        if($kelas-> jadwal()->exists()){
            return response()->json([
                'message' => 'Kelas tidak dapat dihapus karena masih memiliki jadwal pelajaran.'
            ],422);
        }

        $kelas->delete();

        return response()->json([
            'message' => 'Kelas berhasil dihapus'
        ]);
    }
}
