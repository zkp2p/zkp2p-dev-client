import { ethers, utils, Wallet } from "ethers";
import canonicalize from 'canonicalize';

export interface Proof {
  claimInfo: ClaimInfo;
  signedClaim: SignedClaim;
  isAppclipProof: boolean;
};

export interface ClaimInfo {
  provider: string;
  parameters: string;
  context: string;
};

export interface CompleteClaimData {
  identifier: string;
  owner: string;
  timestampS: bigint;
  epoch: bigint;
};

export interface SignedClaim {
  claim: CompleteClaimData;
  signatures: string[];
};

const byteArrayToHexString = (byteArray: { [key: number]: number }): string => {
  return "0x" + Object.values(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const parseExtensionProof = (proofObject: any) => {
  return {
    claimInfo: {
      provider: proofObject.claim.provider,
      parameters: proofObject.claim.parameters,
      context: proofObject.claim.context
    },
    signedClaim: {
      claim: {
        identifier: proofObject.claim.identifier,
        owner: proofObject.claim.owner,
        timestampS: BigInt(proofObject.claim.timestampS),
        epoch: BigInt(proofObject.claim.epoch)
      },
      signatures: [byteArrayToHexString(proofObject.signatures.claimSignature)]
    },
    isAppclipProof: false
  } as Proof;
};

export const parseAppClipProof = (proofObject: any) => {
  return {
    claimInfo: {
      provider: proofObject.claimData.provider,
      parameters: proofObject.claimData.parameters,
      context: proofObject.claimData.context
    },
    signedClaim: {
      claim: {
        identifier: proofObject.claimData.identifier,
        owner: proofObject.claimData.owner,
        timestampS: BigInt(proofObject.claimData.timestampS),
        epoch: BigInt(proofObject.claimData.epoch)
      },
      signatures: proofObject.signatures
    },
    isAppclipProof: true
  } as Proof;
};

export const encodeProofAsBytes = (proof: Proof) => {
  const PROOF_ENCODING_STRING = "(tuple(string provider, string parameters, string context) claimInfo, tuple(tuple(bytes32 identifier, address owner, uint32 timestampS, uint32 epoch) claim, bytes[] signatures) signedClaim, bool isAppclipProof)";
  return ethers.utils.defaultAbiCoder.encode(
    [PROOF_ENCODING_STRING],
    [proof]
  );
};


/**
 * Creates the standard string to sign for a claim.
 * This data is what the witness will sign when it successfully
 * verifies a claim.
 */
export function createSignDataForClaim(data: CompleteClaimData) {
  const identifier = 'identifier' in data
    ? data.identifier
    : getIdentifierFromClaimInfo(data)
  const lines = [
    identifier,
    // we lowercase the owner to ensure that the
    // ETH addresses always serialize the same way
    data.owner.toLowerCase(),
    data.timestampS.toString(),
    data.epoch.toString(),
  ]

  return lines.join('\n')
}

/**
 * Generates a unique identifier for given claim info
 * @param info
 * @returns
 */
export function getIdentifierFromClaimInfo(info: ClaimInfo): string {
  //re-canonicalize context if it's not empty
  if (info.context?.length > 0) {
    try {
      const ctx = JSON.parse(info.context)
      info.context = canonicalize(ctx)!
    } catch (e) {
      throw new Error('unable to parse non-empty context. Must be JSON')
    }
  }

  const str = `${info.provider}\n${info.parameters}\n${info.context || ''}`

  return utils.keccak256(
    new TextEncoder().encode(str)
  ).toLowerCase()
}


export const generateFakeVenmoPaymentProof = async (
  intentHash: string,
  amount: string = '1.00',
  date: string = '2025-01-14T03:22:59',
  receiverId: string = '1557532678029312858',
  paymentId: string = '4245113625265405739',
  senderId: string = '1168869611798528966',
  contextAddress: string = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  signerWallet: Wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
) => {
  const proofObject = {
    claimInfo: {
      provider: 'http',
      parameters: '{ "additionalClientOptions": {}, "body": "", "geoLocation": "", "headers": { "Referer": "https://account.venmo.com/account/mfa/code-prompt?k=GU2FOmmEplsWSQvWxhUlPeMe8xkV4FyimNHIiKY4ELvLxJ5ASp2wS0sxc7CaUiEF&next=%2F%3Ffeed%3Dmine", "Sec-Fetch-Mode": "same-origin", "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1" }, "method": "GET", "paramValues": { "URL_PARAMS_GRD": "1168869611798528966", "amount": "1.00", "date": "2025-01-14T03:22:59", "paymentId": "4245113625265405739", "receiverId": "1557532678029312858" }, "responseMatches": [{ "invert": false, "type": "contains", "value": "\"amount\":\"- ${{amount}}\"" }, { "invert": false, "type": "contains", "value": "\"date\":\"{{date}}\"" }, { "invert": false, "type": "contains", "value": "\"id\":\"{{receiverId}}\"" }, { "invert": false, "type": "contains", "value": "\"paymentId\":\"{{paymentId}}\"" }], "responseRedactions": [{ "jsonPath": "$.stories[0].amount", "regex": "\"amount\":\"- \\$(.*)\"", "xPath": "" }, { "jsonPath": "$.stories[0].date", "regex": "\"date\":\"(.*)\"", "xPath": "" }, { "jsonPath": "$.stories[0].title.receiver.id", "regex": "\"id\":\"(.*)\"", "xPath": "" }, { "jsonPath": "$.stories[0].paymentId", "regex": "\"paymentId\":\"(.*)\"", "xPath": "" }], "url": "https://account.venmo.com/api/stories?feedType=me&externalId={{URL_PARAMS_GRD}}" }',
      context: `{"contextAddress": "${contextAddress}", "contextMessage": "${intentHash}", "extractedParameters": { "URL_PARAMS_GRD": "${senderId}", "amount": "${amount}", "date": "${date}", "paymentId": "${paymentId}", "receiverId": "${receiverId}" }, "providerHash": "0x14de8b5503a4a6973bbaa9aa301ec7843e9bcaa3af05e6610b54c6fcc56aa425"}`,
    },
    signedClaim: {
      claim: {
        identifier: '',
        owner: '0xa4f239ae872b61a640b232f2066f21862caef5c1',
        timestampS: BigInt(1736870012),
        epoch: BigInt(1),
      },
      signatures: []
    },
    isAppclipProof: true
  } as Proof;

  const identifier = getIdentifierFromClaimInfo(proofObject.claimInfo)
  proofObject.signedClaim.claim.identifier = identifier;

  const digest = createSignDataForClaim(proofObject.signedClaim.claim);
  proofObject.signedClaim.signatures = [await signerWallet.signMessage(digest)];

  return proofObject;
}