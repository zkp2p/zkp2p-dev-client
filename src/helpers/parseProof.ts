import { Proof } from "@helpers/types";


const byteArrayToHexString = (byteArray: { [key: number]: number }): string => {
  return "0x" + Object.values(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const parseProof = (proof: string) => {
  const proofObject: any = JSON.parse(proof);

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
    }
  } as Proof;
};
