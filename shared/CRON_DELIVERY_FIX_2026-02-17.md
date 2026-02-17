# Cron Delivery Target Fix — 2026-02-17

## Problem
Several isolated cron jobs were failing with:
- `cron delivery target is missing`

Affected jobs:
- `600c1dcd-b2c4-477a-bb78-42741a4c3dad` (DailyVerse Notion Daily Summary)
- `43dcd9b6-69a5-4137-8edf-905e1c5ddc67` (Eleventy daily Notion status)
- `24adcc12-5950-448a-b336-c4a8465699b0` (SigPro daily Notion status)

## Root Cause
Jobs used `delivery.mode: "announce"` without a resolvable delivery target in the current execution context.

## Fix Applied
Updated each failing job to:
- `delivery.mode: "none"`

This keeps the agentTurn execution active while avoiding delivery target dependency.

## Validation
Manual forced run executed for DailyVerse job (`600c1dcd...`) and completed with:
- `status: ok`
- Notion page created successfully
- no delivery-target error

## Follow-up
- Keep `delivery.mode: none` for autonomous maintenance/reporting jobs unless explicit channel/to routing is required.
- If notifications are desired later, set explicit `delivery.channel` + `delivery.to`.
