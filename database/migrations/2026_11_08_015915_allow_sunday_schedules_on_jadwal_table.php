<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE jadwal MODIFY hari ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu') NOT NULL"
        );
    }

    public function down(): void
    {
        if (DB::table('jadwal')->where('hari', 'minggu')->exists()) {
            throw new RuntimeException(
                'Delete Sunday schedules before rolling back this migration.'
            );
        }

        DB::statement(
            "ALTER TABLE jadwal MODIFY hari ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu') NOT NULL"
        );
    }
};
