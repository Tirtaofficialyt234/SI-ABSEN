<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MutasiSiswa extends Model
{
    protected $guarded = [];

    protected $table = 'mutasi_siswa';

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
}
