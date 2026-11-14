<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mapel extends Model
{
    protected $guarded = [];

    protected $table = 'mapel';

    public function siswaKelas()
    {
        return $this->belongsTo(SiswaKelas::class);
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class);
    }
}
