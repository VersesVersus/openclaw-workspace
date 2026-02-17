# Model Routing Policy

## Objective
Route trivial implementation work to local Ollama coding model, then require remote senior review before commit.

## Routing Rules
1. **Trivial coding tasks** → `ollama-coder` (local)
2. **Final review / merge-quality pass** → `gpt-5.3-codex` (remote)
3. **Heavy/complex deep reasoning** → Opus only when explicitly requested

## Trivial Task Heuristics
Treat as trivial when task is small, localized, and low-risk:
- <= 3 files and no auth/security boundary changes
- boilerplate, simple bug fix, small refactor, lint/test/docs update
- no schema migration or cross-system architecture decision

## Required Two-Pass Flow
1. Junior (local) produces patch + short rationale.
2. Senior (remote codex) reviews and edits for:
   - correctness
   - edge cases
   - style consistency
   - maintainability
3. Run validation checks.
4. Commit only reviewed output.

## Commit Convention
Use commit trailers when applicable:
- `Co-authored-by: Junior Programmer (ollama-coder)`
- include note in body: "Reviewed and corrected by gpt-5.3-codex"
