# Security Policy

PocketLedger is privacy-critical software. If you find a security issue, please
report it privately.

## Reporting

- **Email**: security@pocketledger.app
- **PGP key**: [insert fingerprint here after key generation]
- **Response window**: 24 hours acknowledgment, 72 hours triage.
- **Disclosure window**: 90 days from acknowledgment to public disclosure.

We pay bounties for valid reports that affect the privacy posture, the math
engine, or the E2E sync envelope. See `bounties.md` for details (pending
launch).

## What we care about most

1. **The E2E envelope** — if you can decrypt another user's sync without the
   paired device, that's a P0.
2. **The math engine** — if you can make it return wrong numbers for a valid
   input, that's a P0.
3. **The privacy audit bypass** — if you can ship a network call outside the
   allowlist without failing the build, that's a P0.
4. **The model hot-swap** — if you can trick the orchestrator into loading
   a cloud model when the user has the free tier, that's a P0.
5. **The audit log** — if you can append or modify an audit entry, that's a P0.

## Threat model

- **In scope**: attacker with physical access to the device, attacker with
  network access to the Pro cloud sync, attacker who has compromised the
  Apple / Google OS keystore, attacker who has compromised our backend.
- **Out of scope**: attacker who has installed malware on the user's device
  before PocketLedger was installed, attacker who has root access to the
  user's device, side-channel attacks on the encrypted database.

## Hall of fame

We will credit (with permission) anyone who reports a valid security issue
in our [security acknowledgments](https://pocketledger.app/security/credits).

## Versions

We support the latest minor version with security patches. Older versions
may receive critical patches on a best-effort basis.
