import { ethers } from "ethers";
import * as baseNet from "@zkp2p/contracts-v2/networks/base";
import * as baseSepoliaNet from "@zkp2p/contracts-v2/networks/baseSepolia";
import baseOrchestratorJson from "@zkp2p/contracts-v2/abis/base/Orchestrator.json";
import baseSepoliaOrchestratorJson from "@zkp2p/contracts-v2/abis/baseSepolia/Orchestrator.json";

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

export function getDefaultVerifier(chainId: ChainId): string {
  return chainId === 8453
    ? baseNet.addresses.contracts.UnifiedPaymentVerifier
    : baseSepoliaNet.addresses.contracts.UnifiedPaymentVerifier;
}

function getOrchestratorAddress(chainId: ChainId): string {
  return chainId === 8453
    ? baseNet.addresses.contracts.Orchestrator
    : baseSepoliaNet.addresses.contracts.Orchestrator;
}

function getOrchestratorAbi(chainId: ChainId) {
  return chainId === 8453 ? baseOrchestratorJson : baseSepoliaOrchestratorJson;
}

export async function fetchIntentDetails(
  chainId: ChainId,
  intentHashHex: string
): Promise<IntentDetails> {
  const rpc = RPC_URL[chainId];
  const provider = new ethers.providers.JsonRpcProvider(rpc, chainId);
  const orchestratorAddr = getOrchestratorAddress(chainId);
  const orchestratorAbi = getOrchestratorAbi(chainId);
  const orchestrator = new ethers.Contract(
    orchestratorAddr,
    orchestratorAbi,
    provider
  );

  const res = await orchestrator.getIntent(intentHashHex);

  return {
    amount: ethers.BigNumber.from(res.amount).toString(),
    timestampSec: ethers.BigNumber.from(res.timestamp).toString(),
    paymentMethod: res.paymentMethod,
    fiatCurrency: res.fiatCurrency,
    conversionRate: ethers.BigNumber.from(res.conversionRate).toString(),
    payeeDetails: res.payeeId,
  };
}

export function normalizeHex32(value: string): string {
  const v = (value || "").trim();
  const prefixed = v.startsWith("0x") ? v : `0x${v}`;
  // Treat empty or bare 0x as zero
  if (prefixed === "0x" || prefixed === "0x0") {
    return "0x" + "0".repeat(64);
  }
  // Ensure even-length hex
  const hex = prefixed.length % 2 === 0 ? prefixed : "0x0" + prefixed.slice(2);
  if (!ethers.utils.isHexString(hex)) {
    throw new Error("Invalid hex string");
  }
  const raw = hex.slice(2);
  if (raw.length > 64) {
    // Trim to lowest 32 bytes instead of throwing
    return "0x" + raw.slice(-64);
  }
  return "0x" + raw.padStart(64, "0");
}

export function hexToDecimal(value: string): string {
  const v = (value || "").trim();
  const prefixed = v.startsWith("0x") ? v : `0x${v}`;
  return ethers.BigNumber.from(prefixed).toString();
}
