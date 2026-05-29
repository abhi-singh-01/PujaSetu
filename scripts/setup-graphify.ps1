# PujaSetu — Graphify setup for Cursor / AI IDE token minimization
# Official package: graphifyy (PyPI). CLI: graphify

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Installing graphifyy..." -ForegroundColor Cyan
pip install --upgrade graphifyy

Write-Host "Installing Cursor rules..." -ForegroundColor Cyan
graphify cursor install --project

Write-Host "Building code knowledge graph (AST-only, no API key)..." -ForegroundColor Cyan
graphify update .

Write-Host ""
Write-Host "Done. graphify-out/ contains graph.json + GRAPH_REPORT.md" -ForegroundColor Green
Write-Host "Query: graphify query `"your question`"" -ForegroundColor Green
Write-Host "After edits: graphify update ." -ForegroundColor Green
