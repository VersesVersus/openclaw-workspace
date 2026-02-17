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

## Notes

- If `SIGNAL_RECIPIENTS` is empty, active subscribers in `data/subscribers.json` are used.
- Scheduler runs once per day at `DELIVERY_HOUR:DELIVERY_MINUTE` (local time).
- This is MVP scaffolding aligned to Phase 1 random-verse delivery.
