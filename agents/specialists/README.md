# DailyVerse Specialists

These specialist definitions are reusable role prompts for sub-agent execution.

## Available specialists

- `builder`
- `delivery-ops`
- `notion-pm`
- `research`

## Build a specialist task prompt

```bash
node scripts/build-specialist-task.js <specialist-id> "<objective>"
```

Example:

```bash
node scripts/build-specialist-task.js builder "Implement opt-out command handling for Signal messages"
```

The command prints a ready-to-use task prompt. Paste that into `sessions_spawn` (or a cron isolated `agentTurn`) to run the specialist workflow.
