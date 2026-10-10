<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guru extends Model
{
    protected $guarded = [];

    protected $table = 'guru';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class);
    }

    public function nilai()
    {
        return $this->hasMany(Nilai::class);
    }
}
