# One-time Graphify setup for PujaSetu (token minimization in Cursor)
# Official package: pip install graphifyy

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Installing graphifyy..." -ForegroundColor Cyan
pip install --upgrade graphifyy

Write-Host "Installing Cursor rule (query graph before reading files)..." -ForegroundColor Cyan
graphify cursor install --project

Write-Host "Building code knowledge graph (AST-only, no API key)..." -ForegroundColor Cyan
graphify update .

Write-Host ""
Write-Host "Done. Commit graphify-out/graph.json + GRAPH_REPORT.md for your team." -ForegroundColor Green
Write-Host "Query:  graphify query `"your question`"" -ForegroundColor Green
Write-Host "Update: graphify update .  (after each coding session)" -ForegroundColor Green
