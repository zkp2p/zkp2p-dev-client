import {
  extractSarCredentialCapture,
  isSarCredentialCapture,
} from "./attestation";
import type { SarCredentialBundle } from "./types";

const credentialBundle: SarCredentialBundle = {
  bundleSignature: "0xsignature",
  credentialExpiresAt: null,
  credentialType: "session_cookie",
  credentialValidatedAt: "1713000000000",
  encryptedBlob: "Ym9keQ==",
  encryptedDataKey: "a2V5",
  nonce: "bm9uY2U=",
  payeeIdHash: `0x${"44".repeat(32)}`,
  platform: "venmo",
};

describe("seller credential helpers", () => {
  it("recognizes SAR credential captures", () => {
    expect(
      isSarCredentialCapture({
        credentialBundle,
        offchainId: "seller_user",
      })
    ).toBe(true);
  });

  it("extracts direct and wrapped SAR credential captures", () => {
    const capture = {
      credentialBundle,
      offchainId: "seller_user",
    };

    expect(extractSarCredentialCapture(capture)).toEqual(capture);
    expect(
      extractSarCredentialCapture({ sarCredentialCapture: capture })
    ).toEqual(capture);
    expect(extractSarCredentialCapture({ sarCredentialCapture: null })).toBe(
      null
    );
  });
});
