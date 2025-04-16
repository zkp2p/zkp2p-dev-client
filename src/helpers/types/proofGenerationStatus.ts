export const ProofGenerationStatus = {
  NOT_STARTED: "not-started",
  REQUESTING_PROOF: "requesting-proof",
  REQUESTING_PROOF_SUCCESS: "requesting-proof-success",
  REQUESTING_PROOF_FAILED: "requesting-proof-failed",
  GENERATING_PROOF: "generating-proof",
  TRANSACTION_CONFIGURED: "transaction-configured",
  TRANSACTION_SIMULATING: "transaction-simulating",
  TRANSACTION_SIMULATION_SUCCESSFUL: "transaction-simulation-successful",
  TRANSACTION_SIMULATION_FAILED: "transaction-simulation-failed",
  TRANSACTION_LOADING: "transaction-loading",
  TRANSACTION_MINING: "transaction-mining",
  ERROR_FAILED_TO_PROVE: "error-failed-to-prove",
  TRANSACTION_FAILED: "transaction-failed",
  // swap
  SWAP_QUOTE_REQUESTING: "swap-quote-requesting",
  SWAP_QUOTE_SUCCESS: "swap-quote-success",
  SWAP_QUOTE_FAILED: "swap-quote-failed",
  SWAP_TRANSACTION_SIGNING: "swap-transaction-signing",
  SWAP_TRANSACTION_MINING: "swap-transaction-mining",
  SWAP_TRANSACTION_FAILED: "swap-transaction-failed",
  // final
  DONE: "done"
};

export type ProofGenerationStatusType = typeof ProofGenerationStatus[keyof typeof ProofGenerationStatus];

export const ValidatePaymentStatus = {
  DEFAULT: "default",
  PAYMENTS_EXPIRED: "payments-expired",
  VALID: "valid"
};

export type ValidatePaymentStatusType = typeof ValidatePaymentStatus[keyof typeof ValidatePaymentStatus];

export const ReclaimProofError = {
  FAILED_TO_GENERATE_QR: "failed-to-generate-qr",
  FAILED_TO_PROVE: "failed-to-prove",
  WRONG_PAYMENT_SELECTED: "wrong-payment-selected",
};

export type ReclaimProofErrorType = typeof ReclaimProofError[keyof typeof ReclaimProofError];