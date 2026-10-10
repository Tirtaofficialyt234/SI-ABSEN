<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    protected $guarded = [];

    protected $table = 'tahun_ajaran';

    public function kelas()
    {
        return $this->hasMany(Kelas::class);
    }

    public function siswaKelas()
    {
        return $this->hasMany(SiswaKelas::class);
    }

    public static function aktif()
    {
        return static::where('status', 'aktif')->first();
    }
}
