import type {
  BuyerTeePaymentParams,
  ExtensionRequestMetadata,
} from "@helpers/types";

export type GenericRecord = Record<string, unknown>;

export type ProofRoute = {
  captureActionType: string;
  capturePlatform: string;
  verifierActionType: string;
  verifierPlatform: string;
};

export type BuyerTeePaymentProofInput = {
  proofType: "buyerTee";
  encryptedSessionMaterial: string;
  params: BuyerTeePaymentParams;
};

type BuyerTeePaymentAttestation = {
  encodedPaymentDetails: string;
  signature: string;
  signer: string;
  typedDataValue: {
    dataHash: string;
    intentHash: string;
    releaseAmount: bigint | number | string;
  };
};

type MetadataEntry = {
  key: string;
  value: string;
};

export const SELLER_CREDENTIAL_PLATFORMS = [
  "venmo",
  "cashapp",
  "wise",
  "paypal",
] as const;

export type SellerCredentialPlatform =
  (typeof SELLER_CREDENTIAL_PLATFORMS)[number];

const HIDDEN_METADATA_KEYS = new Set(["hidden", "originalIndex", "params"]);

export const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === "object" && value !== null;

export const extractBuyerTeeAttestation = (
  value: unknown
): BuyerTeePaymentAttestation | null => {
  if (isBuyerTeePaymentAttestation(value)) return value;
  return null;
};

export const isBuyerTeePaymentProofInput = (
  value: unknown
): value is BuyerTeePaymentProofInput =>
  isRecord(value) &&
  value.proofType === "buyerTee" &&
  typeof value.encryptedSessionMaterial === "string" &&
  isBuyerTeePaymentParams(value.params);

export const buildBuyerTeeInputParams = (
  metadata: ExtensionRequestMetadata
): BuyerTeePaymentParams => {
  const extensionParams = metadata.params;

  if (!isBuyerTeePaymentParams(extensionParams)) {
    throw new Error(
      "Buyer TEE params are missing from the selected metadata row. Reload the extension, re-authenticate, and try again."
    );
  }

  if (!Number.isInteger(metadata.originalIndex)) {
    throw new Error(
      "Buyer TEE payment index is missing. Select a metadata row or add index manually."
    );
  }

  return { ...extensionParams, index: metadata.originalIndex };
};

export const parseBuyerTeeVerifyMetadataJson = (
  value: string
): BuyerTeePaymentParams => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Enter buyer TEE verify metadata JSON.");
  }

  const parsed = JSON.parse(trimmed);
  if (!isRecord(parsed) || Array.isArray(parsed)) {
    throw new Error("Buyer TEE verify metadata must be a JSON object.");
  }

  if (!isBuyerTeePaymentParams(parsed)) {
    throw new Error(
      "Buyer TEE metadata values must be strings, numbers, or booleans."
    );
  }

  return parsed;
};

export const formatAttestationErrorMessage = (
  responseRecord: GenericRecord,
  responseText: string,
  status: number
) => {
  const responseObject = responseRecord.responseObject;
  const validationErrors = formatValidationErrors(
    isRecord(responseObject) ? responseObject.errors : responseRecord.errors
  );

  const message = String(
    responseRecord.error ||
      responseRecord.message ||
      responseText ||
      `HTTP error! status: ${status}`
  );

  return validationErrors ? `${message}: ${validationErrors}` : message;
};

export const parseEncryptedUploadInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Enter a compact JWE or JSON object with encryptedUpload.");
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (isRecord(parsed) && typeof parsed.encryptedUpload === "string") {
      const encryptedUpload = parsed.encryptedUpload.trim();
      if (encryptedUpload) return encryptedUpload;
    }

    throw new Error("JSON input must include a non-empty encryptedUpload.");
  } catch (error) {
    if (error instanceof SyntaxError) {
      return trimmed;
    }
    throw error;
  }
};

export const deriveIntentAmountFromMetadata = (
  metadata: GenericRecord | undefined,
  fallback: string
) => {
  const rawAmount = metadata?.amount;
  if (typeof rawAmount !== "string" && typeof rawAmount !== "number") {
    return fallback;
  }

  const normalized = String(rawAmount).replace(/,/g, "");
  const match = normalized.match(/-?\s*[$€£]?\s*([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return fallback;

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed * 1_000_000).toString();
};

export const deriveIntentTimestampSecFromMetadata = (
  metadata: GenericRecord | undefined,
  fallback: string
) => {
  const rawDate = metadata?.date;
  if (typeof rawDate !== "string" && typeof rawDate !== "number") {
    return fallback;
  }

  if (typeof rawDate === "number") {
    return Math.floor(rawDate).toString();
  }

  const parsed = Date.parse(rawDate);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.floor(parsed / 1000).toString();
};

export const getVisibleMetadataEntries = (
  metadata: ExtensionRequestMetadata
): MetadataEntry[] =>
  Object.entries(metadata)
    .filter(
      ([key, value]) =>
        !HIDDEN_METADATA_KEYS.has(key) && value !== undefined && value !== null
    )
    .map(([key, value]) => ({
      key: formatMetadataKey(key),
      value: formatMetadataValue(value),
    }))
    .filter(({ value }) => value.length > 0);

const isBuyerTeePaymentAttestation = (
  value: unknown
): value is BuyerTeePaymentAttestation => {
  if (!isRecord(value) || !isRecord(value.typedDataValue)) return false;

  return (
    typeof value.encodedPaymentDetails === "string" &&
    typeof value.signature === "string" &&
    typeof value.signer === "string" &&
    typeof value.typedDataValue.dataHash === "string" &&
    typeof value.typedDataValue.intentHash === "string" &&
    value.typedDataValue.releaseAmount != null
  );
};

const isBuyerTeePaymentParams = (
  value: unknown
): value is BuyerTeePaymentParams =>
  isRecord(value) &&
  !Array.isArray(value) &&
  Object.values(value).every(
    (entry) =>
      typeof entry === "string" ||
      typeof entry === "number" ||
      typeof entry === "boolean"
  );

const formatValidationErrors = (errors: unknown) => {
  if (!Array.isArray(errors)) return null;

  const formatted = errors
    .map((error) => {
      if (!isRecord(error)) return String(error);
      const path =
        typeof error.path === "string" && error.path ? error.path : "(root)";
      const message =
        typeof error.message === "string" && error.message
          ? error.message
          : JSON.stringify(error);
      return `${path}: ${message}`;
    })
    .filter(Boolean);

  return formatted.length ? formatted.join("; ") : null;
};

const formatMetadataKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatMetadataValue = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};
