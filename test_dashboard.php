<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$controller = app(App\Http\Controllers\Api\DashboardController::class);
$request = Illuminate\Http\Request::create('/api/admin/dashboard', 'GET');
$response = $controller->adminDashboard($request);

echo $response->getContent();
