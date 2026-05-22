import type {
  BuyerTeePaymentParams,
  ExtensionRequestMetadata,
} from "@helpers/types";

export type GenericRecord = Record<string, unknown>;
export type ProofEngine = "reclaim" | "buyerTee";

export type ProofRoute = {
  captureActionType: string;
  capturePlatform: string;
  metadataGroup: string;
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

type NormalizedProofObject = {
  claim: GenericRecord;
  signatures: unknown;
};

type MetadataEntry = {
  key: string;
  value: string;
};

const HIDDEN_METADATA_KEYS = new Set(["hidden", "originalIndex", "params"]);

export const isRecord = (value: unknown): value is GenericRecord =>
  typeof value === "object" && value !== null;

export const normalizeProofPayload = (
  value: unknown
): NormalizedProofObject | NormalizedProofObject[] => {
  const normalizeArray = (items: unknown[]) => {
    const normalized = items
      .map((item) => normalizeSingleProofObject(item))
      .filter((item): item is NormalizedProofObject => item !== null);

    if (!normalized.length || normalized.length !== items.length) {
      throw new Error(
        "Invalid proof JSON. Expected a proof object or an array of proof objects."
      );
    }

    return normalized;
  };

  if (Array.isArray(value)) {
    return normalizeArray(value);
  }

  const single = normalizeSingleProofObject(value);
  if (single) return single;

  if (isRecord(value) && Array.isArray(value.proof)) {
    return normalizeArray(value.proof);
  }

  if (isRecord(value) && Array.isArray(value.proofs)) {
    return normalizeArray(value.proofs);
  }

  throw new Error(
    "Invalid proof JSON. Expected a proof object or an array of proof objects."
  );
};

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
  if (!isBuyerTeePaymentParams(metadata.params)) {
    throw new Error(
      "Buyer TEE params are missing from the selected metadata row. Reload the extension, re-authenticate, and try again."
    );
  }

  return { ...metadata.params };
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

const normalizeSingleProofObject = (
  value: unknown
): NormalizedProofObject | null => {
  if (!isRecord(value)) return null;

  if (isRecord(value.claim)) {
    return {
      claim: value.claim,
      signatures: value.signatures ?? {},
    };
  }

  if (isRecord(value.proof) && isRecord(value.proof.claim)) {
    return {
      claim: value.proof.claim,
      signatures: value.proof.signatures ?? {},
    };
  }

  return null;
};

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
