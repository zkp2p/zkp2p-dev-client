import {
  buildCuratorSellerVerifyRequestPayload,
  extractSarCredentialCapture,
  isSarCredentialCapture,
  parseCuratorSellerVerifyMetadataJson,
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

  it("parses curator seller verify metadata", () => {
    expect(parseCuratorSellerVerifyMetadataJson("")).toBeUndefined();
    expect(
      parseCuratorSellerVerifyMetadataJson(
        '{ "nextId": "cursor", "after": 1713000000, "before": 1713003600 }'
      )
    ).toEqual({
      nextId: "cursor",
      after: 1713000000,
      before: 1713003600,
    });
    expect(() =>
      parseCuratorSellerVerifyMetadataJson('{ "after": 1713000000 }')
    ).toThrow("metadata.after and metadata.before");
  });

  it("builds curator seller verify payloads with SAR fields", () => {
    expect(
      buildCuratorSellerVerifyRequestPayload({
        txId: " tx-1 ",
        metadata: { nextId: "cursor" },
        memo: " order-123 ",
        expectedAmountMinorUnits: "1500",
        resolutionMode: "name",
        payerHandle: " Jane Buyer ",
        chainId: 84532,
        intent: {
          amount: "100",
          conversionRate: "1000000",
          fiatCurrency: `0x${"33".repeat(32)}`,
          intentHash: `0x${"11".repeat(32)}`,
          payeeDetails: `0x${"44".repeat(32)}`,
          paymentMethod: `0x${"22".repeat(32)}`,
          timestampMs: "1713000000000",
        },
      })
    ).toMatchObject({
      txId: "tx-1",
      metadata: { nextId: "cursor" },
      memo: "order-123",
      expectedAmountMinorUnits: "1500",
      resolutionMode: "name",
      payerHandle: "Jane Buyer",
      chainId: 84532,
      intent: {
        timestampBufferMs: "172800000",
      },
    });
  });
});
