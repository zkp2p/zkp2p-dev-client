import { ethers } from "ethers";
import * as baseNet from "@zkp2p/contracts-v2/networks/base";
import * as baseStagingNet from "@zkp2p/contracts-v2/networks/baseStaging";
import * as baseAbis from "@zkp2p/contracts-v2/abis/base";
import * as baseStagingAbis from "@zkp2p/contracts-v2/abis/baseStaging";

type ChainId = 84532 | 8453;

type IntentDetails = {
  amount: string;
  timestampSec: string;
  paymentMethod: string; // bytes32
  fiatCurrency: string; // bytes32
  conversionRate: string;
  payeeDetails: string; // bytes32
};

const RPC_URL: Record<ChainId, string> = {
  84532: "https://sepolia.base.org",
  8453: "https://mainnet.base.org",
};

function getNetworkBundle(chainId: ChainId) {
  return chainId === 8453 ? baseNet : baseStagingNet;
}

function getProtocolViewerV2Abi(chainId: ChainId) {
  return (chainId === 8453
    ? baseAbis.ProtocolViewerV2
    : baseStagingAbis.ProtocolViewerV2) as any;
}

function getChainLabel(chainId: ChainId): string {
  return chainId === 8453 ? "Base (8453)" : "Base Sepolia (84532)";
}

export function getDefaultVerifier(chainId: ChainId): string {
  return getNetworkBundle(chainId).addresses.contracts.UnifiedPaymentVerifierV2;
}

export async function fetchIntentDetails(
  chainId: ChainId,
  intentHashHex: string
): Promise<IntentDetails> {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL[chainId], chainId);
  const network = getNetworkBundle(chainId);
  const protocolViewer = new ethers.Contract(
    network.addresses.contracts.ProtocolViewerV2,
    getProtocolViewerV2Abi(chainId),
    provider
  );

  let view: any;
  try {
    view = await protocolViewer.getIntent(
      network.addresses.contracts.OrchestratorV2,
      intentHashHex
    );
  } catch (error: any) {
    throw new Error(
      error?.reason ||
        error?.message ||
        `Intent ${intentHashHex} was not found on ${getChainLabel(chainId)}`
    );
  }

  const intent = view.intent;
  const paymentMethod = String(intent.paymentMethod || "");
  const matchedPaymentMethod = Array.isArray(view.deposit?.paymentMethods)
    ? view.deposit.paymentMethods.find(
        (method: any) =>
          String(method?.paymentMethod || "").toLowerCase() ===
          paymentMethod.toLowerCase()
      )
    : undefined;
  const payeeDetails =
    intent.payeeId || matchedPaymentMethod?.verificationData?.payeeDetails || "";

  if (
    !intent?.owner ||
    intent.owner === "0x0000000000000000000000000000000000000000"
  ) {
    throw new Error(
      `Intent ${intentHashHex} was not found on ${getChainLabel(chainId)}`
    );
  }

  return {
    amount: ethers.BigNumber.from(intent.amount).toString(),
    timestampSec: ethers.BigNumber.from(intent.timestamp).toString(),
    paymentMethod,
    fiatCurrency: intent.fiatCurrency,
    conversionRate: ethers.BigNumber.from(intent.conversionRate).toString(),
    payeeDetails,
  };
}

export function normalizeHex32(value: string): string {
  const v = (value || "").trim();
  const prefixed = v.startsWith("0x") ? v : `0x${v}`;
  if (prefixed === "0x" || prefixed === "0x0") {
    return "0x" + "0".repeat(64);
  }
  const hex = prefixed.length % 2 === 0 ? prefixed : "0x0" + prefixed.slice(2);
  if (!ethers.utils.isHexString(hex)) {
    throw new Error("Invalid hex string");
  }
  const raw = hex.slice(2);
  if (raw.length > 64) {
    return "0x" + raw.slice(-64);
  }
  return "0x" + raw.padStart(64, "0");
}

export function hexToDecimal(value: string): string {
  const v = (value || "").trim();
  const prefixed = v.startsWith("0x") ? v : `0x${v}`;
  return ethers.BigNumber.from(prefixed).toString();
}
