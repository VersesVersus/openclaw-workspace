#!/usr/bin/env python3
"""Main-session Signal router helper.

Usage:
  python3 signal_main_router.py --from +1... --text "Amen"

This normalizes an inbound message and publishes it to the shared dispatcher bus.
"""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

DISPATCH = Path('/home/james/.openclaw/workspace/shared/signal_dispatcher.py')


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--from', dest='from_number', required=True)
    ap.add_argument('--text', required=True)
    ap.add_argument('--target', default='')
    args = ap.parse_args()

    cmd = [
        'python3',
        str(DISPATCH),
        'publish',
        '--channel',
        'signal',
        '--from',
        args.from_number,
        '--text',
        args.text,
        '--target',
        args.target,
        '--source',
        'main-router',
    ]
    proc = subprocess.run(cmd)
    return proc.returncode


if __name__ == '__main__':
    raise SystemExit(main())
