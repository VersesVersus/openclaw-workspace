# Signal Inbound Dispatch Pattern (v1)

## Goal
Use OpenClaw as the **single ingress** for Signal messages, then fan out to multiple agents without `signal-cli receive` lock contention.

## Architecture
1. **Ingress (main session / channel event):**
   - OpenClaw receives inbound Signal DM.
   - Router publishes normalized event to dispatcher bus.
2. **Dispatcher (shared):**
   - Append-only JSONL event log.
   - Per-consumer cursor files.
3. **Consumers (agents):**
   - Each agent reads only new events via `consume --consumer <name>`.
   - No agent calls `signal-cli receive` directly.

## Event contract
```json
{
  "id": "<unique>",
  "ts": 1771342725,
  "channel": "signal",
  "from": "+19412907826",
  "text": "1",
  "target": "+19412907826",
  "meta": { "source": "dailyverse" }
}
```

## Commands
Publish:
```bash
python3 /home/james/.openclaw/workspace/shared/signal_dispatcher.py publish \
  --channel signal --from +19412907826 --text "1" --target +19412907826 --source main-router
```

Consume:
```bash
python3 /home/james/.openclaw/workspace/shared/signal_dispatcher.py consume \
  --consumer sigpro-auth-codes --channel signal --from +19412907826 --limit 50
```

## Rules
- Outbound sending: `openclaw message send --channel signal ...`
- Inbound receiving: dispatcher bus only.
- Consumer names must be stable (cursor identity).
- Keep handlers idempotent where possible.

## Current adopters
- DailyVerse: publishes inbound replies via `--handle-reply` path.
- SigPro: consumes auth-code messages from dispatcher.
- Eleventy: outbound Signal only (no inbound consumer yet).
