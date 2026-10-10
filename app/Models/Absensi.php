<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absensi extends Model
{
    protected $guarded = [];

    protected $table = 'absensi';

    public function siswaKelas()
    {
        return $this->belongsTo(SiswaKelas::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class);
    }
}
