param(
    [string]$ApiUrl = "http://127.0.0.1:8000",
    [string]$FrontendUrl = "",
    [string]$Email = "",
    [string]$Password = ""
)

$ErrorActionPreference = "Stop"
$api = $ApiUrl.TrimEnd('/')

function Assert-Status($Response, [string]$Label) {
    if ($Response.StatusCode -lt 200 -or $Response.StatusCode -ge 300) {
        throw "$Label returned HTTP $($Response.StatusCode)"
    }
    Write-Host "[ok] $Label -> HTTP $($Response.StatusCode)"
}

$health = Invoke-WebRequest -Uri "$api/health" -Method Get
Assert-Status $health "API health"
if ((($health.Content | ConvertFrom-Json).status) -ne "ok") {
    throw "API health payload did not contain status=ok"
}

$root = Invoke-WebRequest -Uri "$api/" -Method Get
Assert-Status $root "API root"

if ($FrontendUrl) {
    $frontend = Invoke-WebRequest -Uri $FrontendUrl.TrimEnd('/') -Method Get
    Assert-Status $frontend "Frontend"
}

if ($Email -or $Password) {
    if (-not ($Email -and $Password)) {
        throw "Provide both -Email and -Password for the optional auth check"
    }
    $body = @{ email = $Email; password = $Password } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$api/auth/login" -Method Post -ContentType "application/json" -Body $body
    if (-not $login.access_token) {
        throw "Auth login did not return an access token"
    }
    Write-Host "[ok] Auth login returned a bearer token"
}

Write-Host "Smoke test passed."
