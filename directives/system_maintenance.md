# Directive: System Maintenance

## Goal
Maintain the 3-layer architecture and ensure code health.

## Inputs
### Required
- `AGENTS.md`: The core contract.

## Tools/Scripts to Use
- `execution/verify_structure.py` (To be created): Verifies the existence of required directories.

## Step-by-Step Flow
1. Verify directories `.tmp/`, `directives/`, `execution/` exist.
2. Ensure `run_manifest.json` is updated after every significant task.
3. Append any learnings to the `Learnings` section below.

## Output Specification
- `run_manifest.json` updates.

## Validation Checks
- Directory existence checks.

## Learnings
- 2026-02-13: Initial instantiation of the system.
- 2026-02-13: Verified architecture persistence across context resets/restarts. The 3-layer structure remains intact on disk.
