# PujaSetu — AI agent guide

## Graphify (knowledge graph)

This repo uses [Graphify](https://github.com/safishamsi/graphify) to reduce token usage.

```bash
pip install graphifyy
graphify cursor install --project   # once
graphify .                          # build graph (or graphify extract .)
graphify update .                   # after code changes (AST-only)
graphify query "how does booking payment work?"
```

Outputs: `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`

**Prefer `graphify query` over reading many files or grepping the whole repo.**

## Stack

- `backend/` — Node.js, Express, MongoDB, Docker
- `mobile/` — Expo React Native, Redux, NativeWind

## Key flows

- **Auth:** OTP → JWT (`/api/auth/*`)
- **Booking:** 15% advance → service → mutual completion OTP → 85% remaining
- **Provider pricing:** `PUT /api/providers/profile/me/pricing`
