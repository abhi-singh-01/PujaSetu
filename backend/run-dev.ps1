# Load backend/.env and start Spring Boot (mvn does not read .env by itself)
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Missing $envFile — copy .env.example to .env first."
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $eq = $line.IndexOf("=")
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    Set-Item -Path "env:$name" -Value $value
}

Write-Host "Starting PujaSetu API on port $env:PORT ..."
mvn spring-boot:run
