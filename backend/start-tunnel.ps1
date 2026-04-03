# Queueless Campus - Backend & Tunnel Starter
# This script starts the backend and the Cloudflare tunnel simultaneously.

Write-Host "Starting Queueless Campus Backend..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run dev"

Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Yellow
Write-Host "Wait for the 'trycloudflare.com' link to appear below." -ForegroundColor Gray

# Start cloudflared and pipe output to a file and display it
./cloudflared.exe tunnel --url http://localhost:8989 2>&1 | Tee-Object -FilePath "tunnel_current.log" | ForEach-Object {
    if ($_ -match "https://.*\.trycloudflare\.com") {
        $url = $matches[0]
        Write-Host "`n===============================================" -ForegroundColor Green
        Write-Host " TUNNEL ACTIVE: $url " -ForegroundColor Green -BackgroundColor Black
        Write-Host "===============================================`n" -ForegroundColor Green
        Write-Host "Copy this URL to the mobile app's Server Settings (long-press 'Welcome Back')." -ForegroundColor White
    }
    $_
}
