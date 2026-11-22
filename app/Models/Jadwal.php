<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jadwal extends Model
{
    protected $guarded = [];

    protected $table = 'jadwal';

    public function guru()
    {
        return $this->belongsTo(Guru::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mapel()
    {
        return $this->belongsTo(Mapel::class);
    }

    public function tahunAjaran()
    {
        return $this->belongsTo(tahunAjaran::class, 'tahun_ajaran_id');
    }

    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class, 'jadwal_id');
    }
}
