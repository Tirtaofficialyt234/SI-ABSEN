<?php

$headers = getallheaders();
header('Content-Type: application/json');
echo json_encode([
    'headers' => $headers,
    'auth_header_raw' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
]);
