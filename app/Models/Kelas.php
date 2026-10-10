<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    protected $guarded = [];

    protected $table = 'kelas';

    public function tahunAjaran()
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function siswaKelas()
    {
        return $this->hasMany(SiswaKelas::class);
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class);
    }
}
