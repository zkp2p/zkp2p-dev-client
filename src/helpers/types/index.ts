//
// Escrow and Proof 
//

export type { Proof, ClaimInfo, CompleteClaimData, SignedClaim } from './proxyProof';
export { parseExtensionProof, parseAppClipProof, encodeProofAsBytes } from './proxyProof';
export { ValidatePaymentStatus, ProofGenerationStatus } from './proofGenerationStatus';
export type { ValidatePaymentStatusType, ProofGenerationStatusType } from './proofGenerationStatus';

//
// Extension
//

export type {
  ExtensionEventMessage,
  ExtensionEventVersionMessage,
  ExtensionRequestMetadataMessage,
  ExtensionRequestMetadata,
  ExtensionNotaryProofRequest,
} from './browserExtension'
export { ExtensionPostMessage, ExtensionReceiveMessage } from './browserExtension'

export { MODALS } from './modals';