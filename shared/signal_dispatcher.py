#!/usr/bin/env python3
"""Tiny shared inbound dispatcher for Signal events.

Multi-consumer pub/sub over append-only JSONL + per-consumer cursor files.
"""

from __future__ import annotations

import argparse
import json
import time
import uuid
from pathlib import Path

ROOT = Path('/home/james/.openclaw/workspace/shared/.dispatcher')
EVENTS_FILE = ROOT / 'signal-events.jsonl'
CURSORS_DIR = ROOT / 'cursors'


def ensure_dirs() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    CURSORS_DIR.mkdir(parents=True, exist_ok=True)
    if not EVENTS_FILE.exists():
        EVENTS_FILE.touch()


def publish(args: argparse.Namespace) -> int:
    ensure_dirs()
    event = {
        'id': f"{int(time.time()*1000)}-{uuid.uuid4().hex[:8]}",
        'ts': int(time.time()),
        'channel': args.channel,
        'from': args.from_number,
        'text': args.text,
        'target': args.target,
        'meta': {'source': args.source or 'openclaw-session'},
    }
    with EVENTS_FILE.open('a', encoding='utf-8') as f:
        f.write(json.dumps(event, ensure_ascii=False) + '\n')
    print(json.dumps(event))
    return 0


def _read_cursor(consumer: str) -> int:
    p = CURSORS_DIR / f'{consumer}.cursor'
    if not p.exists():
        return 0
    try:
        return int(p.read_text().strip() or '0')
    except Exception:
        return 0


def _write_cursor(consumer: str, line_no: int) -> None:
    p = CURSORS_DIR / f'{consumer}.cursor'
    p.write_text(str(line_no))


def consume(args: argparse.Namespace) -> int:
    ensure_dirs()
    last = _read_cursor(args.consumer)
    out = []
    line_no = 0
    max_line = last

    with EVENTS_FILE.open('r', encoding='utf-8') as f:
        for raw in f:
            line_no += 1
            if line_no <= last:
                continue
            raw = raw.strip()
            if not raw:
                continue
            try:
                ev = json.loads(raw)
            except Exception:
                continue

            if args.channel and ev.get('channel') != args.channel:
                continue
            if args.from_number and str(ev.get('from') or '') != args.from_number:
                continue

            out.append(ev)
            max_line = line_no
            if len(out) >= args.limit:
                break

    if out:
        _write_cursor(args.consumer, max_line)

    print(json.dumps({'consumer': args.consumer, 'count': len(out), 'events': out}))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='cmd', required=True)

    p_pub = sp.add_parser('publish')
    p_pub.add_argument('--channel', default='signal')
    p_pub.add_argument('--from', dest='from_number', required=True)
    p_pub.add_argument('--text', required=True)
    p_pub.add_argument('--target', default='')
    p_pub.add_argument('--source', default='')
    p_pub.set_defaults(func=publish)

    p_cons = sp.add_parser('consume')
    p_cons.add_argument('--consumer', required=True)
    p_cons.add_argument('--channel', default='signal')
    p_cons.add_argument('--from', dest='from_number', default='')
    p_cons.add_argument('--limit', type=int, default=20)
    p_cons.set_defaults(func=consume)

    args = ap.parse_args()
    return args.func(args)


if __name__ == '__main__':
    raise SystemExit(main())
