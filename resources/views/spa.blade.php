<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SI-ABSEN</title>
    @php
        $manifestPath = public_path('react/.vite/manifest.json');
        $jsFile = null;
        $cssFile = null;
        if (file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            $entry = $manifest['src/main.jsx']
                ?? collect($manifest)->firstWhere('isEntry', true);
            if ($entry) {
                $jsFile = $entry['file'] ?? null;
                $cssFile = isset($entry['css'][0]) ? $entry['css'][0] : null;
            }
        }
    @endphp
    @if($cssFile)
        <link rel="stylesheet" href="/react/{{ $cssFile }}">
    @endif
</head>
<body>
    <div id="root"></div>
    @if($jsFile)
        <script type="module" src="/react/{{ $jsFile }}"></script>
    @endif
</body>
</html>