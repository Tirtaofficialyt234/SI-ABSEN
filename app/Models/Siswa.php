<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    protected $guarded = [];

    protected $table = 'siswa';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function riwayatKelas()
    {
        return $this->hasMany(SiswaKelas::class);
    }

    public function kelasAktif()
    {

        return $this->hasOne(SiswaKelas::class)
            ->where('status', 'aktif')
            ->latestOfMany();
    }

    public function nilai()
    {
        return $this->hasMany(Nilai::class);
    }

    public function mutasi()
    {
        return $this->hasMany(MutasiSiswa::class);
    }
}
