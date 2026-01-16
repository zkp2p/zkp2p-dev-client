Goal (incl. success criteria):
- Update the UI to generate fulfillIntent params (paymentProof, intentHash, verificationData, postIntentHookData) instead of verifyPayment calldata; output ready-to-submit values.

Constraints/Assumptions:
- Follow AGENTS.md ledger rules; update CONTINUITY.md on state changes.
- Keep edits minimal and ASCII unless needed; avoid destructive commands.

Key decisions:
- Generate a JSON payload of fulfillIntent params (not raw encoded calldata).
- Derive verificationData from attestation response (use provided verificationData or encode signer address); default postIntentHookData to `0x` with an input override.

State:
- Home page updated to build fulfillIntent params from attestation response.

Done:
- Read workspace layout.
- Updated `src/pages/Home.tsx` to generate fulfillIntent params and added postIntentHookData input.

Now:
- Verify changes compile and align with desired output format.

Next:
- Confirm whether output should include raw fulfillIntent calldata in addition to params.

Open questions (UNCONFIRMED if needed):
- Should output include raw fulfillIntent calldata in addition to params JSON?

Working set (files/ids/commands):
- `src/pages/Home.tsx`
- `src/helpers/contracts.ts`
- Commands: `rg -n`, `sed -n`, `node -e`
