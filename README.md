# openclaw-workspace

## DailyVerse MVP

Random daily Bible verse delivery scaffold using:
- Node.js runtime
- `signal-cli` for message delivery
- Bible API for verse text retrieval

## Quick start

1. Copy env template:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your Signal account and recipients.
3. Add subscribers (optional):
   - Edit `data/subscribers.json`
4. Send one dry-run message:
   ```bash
   npm run send-once:dry
   ```
5. Send one live message:
   ```bash
   npm run send-once
   ```
6. Start daily scheduler:
   ```bash
   npm start
   ```

## Specialized agent setup

This repo includes reusable specialist definitions under `agents/specialists/`:

- `builder`
- `delivery-ops`
- `notion-pm`
- `research`

Generate a role-scoped task prompt:

```bash
npm run specialist:task -- builder "Implement delivery retry telemetry"
```

You can paste the generated prompt into a sub-agent run (`sessions_spawn`) or an isolated cron `agentTurn`.

## Verse reply actions (1-4)

Each sent verse now includes interactive prompts:

- `1` / `Amen` → marks verse as key and boosts future selection weight
- `2` / `Wisdom` → sends thematic + original-language insight reply
- `3` / `Devotional` → sends devotional immediately (after 5 PM) or queues for early evening same day
- `4` / `Retire` → removes verse from future random rotation

Useful commands:

```bash
npm run poll-replies-once
npm run run-devotionals-once
```

State files are written in `data/`:

- `delivery-log.json`
- `verse-feedback.json`
- `devotional-queue.json`

## WhatsApp setup note

OpenClaw WhatsApp support lives at the channel layer (separate from this Node runtime). Use OpenClaw channel commands to configure login/pairing and policy before routing delivery there.

## Notes

- If `SIGNAL_RECIPIENTS` is empty, active subscribers in `data/subscribers.json` are used.
- Scheduler runs once per day at `DELIVERY_HOUR:DELIVERY_MINUTE` (local time).
- This scaffold now supports weighted verse rotation, reply actions, and queued devotionals.
