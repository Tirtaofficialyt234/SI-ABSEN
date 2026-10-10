<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;

// Reset password admin ke 'password'
$admin = User::where('email', 'admin@sekolah.test')->first();
if ($admin) {
    $admin->password = Hash::make('password');
    $admin->save();
    echo "Password admin direset ke: password\n";
    echo 'Verifikasi: '.(Hash::check('password', $admin->fresh()->password) ? 'OK' : 'FAIL')."\n";

    // Hapus semua token lama agar fresh
    $admin->tokens()->delete();
    echo "Token lama dihapus\n";
}

echo "\n=== Status User ===\n";
$users = User::all(['id', 'email', 'role', 'must_change_password']);
foreach ($users as $u) {
    echo "ID: {$u->id}, Email: {$u->email}, Role: {$u->role}, MustChange: {$u->must_change_password}\n";
}
