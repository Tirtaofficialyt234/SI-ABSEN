<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tujuhHariLalu = now()->subDays(6)->toDateString();
$absensiSeminggu = App\Models\Absensi::where('tanggal', '>=', $tujuhHariLalu)->get();

echo "Total records in 7 days: " . $absensiSeminggu->count() . "\n";
if ($absensiSeminggu->count() > 0) {
    echo "Sample tanggal value: " . $absensiSeminggu->first()->tanggal . "\n";
}
