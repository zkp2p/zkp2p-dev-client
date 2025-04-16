export interface CommonStrings {
  // Environment Banner
  LOCAL_ENV_BANNER: string,
  STAGING_TESTNET_ENV_BANNER: string,
  STAGING_ENV_BANNER: string,
  PRODUCTION_ENV_BANNER: string,

  // Platform Selector Tooltips
  PLATFORM_INSTRUCTIONS_MAIL_TOOLTIP: string,
  PLATFORM_INSTRUCTIONS_BROWSER_TOOLTIP: string,

  // Proof Form
  PROOF_TOOLTIP: string,

  // Release Funds Modal
  RELEASE_FUNDS_WARNING_ONE: string,
  RELEASE_FUNDS_WARNING_TWO: string,

  // Login Modal
  LOGIN_MODAL_TOOLTIP: string,

  // Send Modal
  SEND_MODAL_TOOLTIP: string,

  // Receive Modal
  RECEIVE_FUNDS_INSTRUCTIONS_1: string
  RECEIVE_FUNDS_INSTRUCTIONS_2: string

  // Pay Modal
  PAY_MODAL_INSTRUCTIONS: string,
  PAY_MODAL_MOBILE_INSTRUCTIONS: string,

  // Proof Modal Steps
  PROOF_MODAL_DOWNLOAD_TITLE: string,
  PROOF_MODAL_DOWNLOAD_SUBTITLE: string,
  PROOF_MODAL_EXTENSION_REQUEST_TITLE: string,
  PROOF_MODAL_EXTENSION_REQUEST_SUBTITLE: string,
  PROOF_MODAL_MOBILE_APPCLIP_REQUEST_TITLE: string,
  PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_TITLE: string,
  PROOF_MODAL_MOBILE_APPCLIP_REQUEST_SUBTITLE: string,
  PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_SUBTITLE: string,
  PROOF_MODAL_UPLOAD_TITLE: string,
  PROOF_MODAL_UPLOAD_SUBTITLE: string,
  PROOF_MODAL_EXTENSION_PROVE_TITLE: string,
  PROOF_MODAL_MOBILE_APPCLIP_PROVE_TITLE: string,
  PROOF_MODAL_DESKTOP_APPCLIP_PROVE_TITLE: string,
  PROOF_MODAL_PROVE_REGISTRATION_TITLE: string,
  PROOF_MODAL_EXTENSION_PROVE_SUBTITLE: string,
  PROOF_MODAL_MOBILE_APPCLIP_PROVE_SUBTITLE: string,
  PROOF_MODAL_DESKTOP_APPCLIP_PROVE_SUBTITLE: string,
  PROOF_MODAL_PROVE_SUBTITLE_FAST: string,
  PROOF_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: string,
  PROOF_MODAL_VERIFY_TITLE: string,
  PROOF_MODAL_VERIFY_SUBTITLE: string,
  PROOF_MODAL_SUBMIT_TITLE: string,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE: string,
  PROOF_MODAL_SWAP_TITLE: string,
  PROOF_MODAL_SWAP_SUBTITLE: string,
  PROOF_MODAL_SUBMIT_SUBTITLE: string,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE: string,

  // Extension Instructions
  BROWSER_NOT_SUPPORTED_INSTRUCTIONS: string,
  EXTENSION_DOWNLOAD_INSTRUCTIONS: string,
  EXTENSION_UPDATE_INSTRUCTIONS: string,

  // Notary Connection Tooltip
  NOTARY_CONNECTION_TOOLTIP: string,

  // Notary Verification Modal Steps
  VERIFICATION_MODAL_UPLOAD_TITLE: string,
  VERIFICATION_MODAL_UPLOAD_SUBTITLE: string,
  VERIFICATION_MODAL_PROVE_TITLE: string,
  VERIFICATION_MODAL_PROVE_REGISTRATION_TITLE: string,
  VERIFICATION_MODAL_PROVE_SUBTITLE_FAST: string,
  VERIFICATION_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: string,
  VERIFICATION_MODAL_VERIFY_TITLE: string,
  VERIFICATION_MODAL_VERIFY_SUBTITLE: string,
  VERIFICATION_MODAL_SUBMIT_TITLE: string,
  VERIFICATION_MODAL_REGISTRATION_SUBMIT_TITLE: string,
  VERIFICATION_MODAL_SUBMIT_SUBTITLE: string,
  VERIFICATION_MODAL_REGISTRATION_SUBMIT_SUBTITLE: string,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: string,
  NEW_DEPOSIT_ID_TOOLTIP: string,
  NEW_DEPOSIT_NAME_TOOLTIP: string,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: string,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: string,

  // Complete Order
  PROOF_FORM_FINALIZE_ORDER_INSTRUCTIONS: string,
  PROOF_FORM_ETH_REQUIRED: string,

  // Consent Instructions
  CONSENT_INSTRUCTIONS_SHARE_DATA_EXPLANATION: string,

  // Mobile Warning
  MOBILE_WARNING_TEXT: string,

  // Redirect flow warning
  REDIRECT_FLOW_EXISTING_ORDER_WARNING: string,
};



const strings: CommonStrings = {
  // Environment Banner
  LOCAL_ENV_BANNER: `
    You are currently viewing the application on localhost
  `,
  STAGING_TESTNET_ENV_BANNER: `
    You are currently viewing the staging-testnet application
  `,
  STAGING_ENV_BANNER: `
    You are currently viewing the staging application
  `,
  PRODUCTION_ENV_BANNER: `
    ZKP2P V2 Launch —
  `,

  // Platform Selector Tooltips
  PLATFORM_INSTRUCTIONS_MAIL_TOOLTIP: `
    This platform requires an email address receiving receipts from the platform to complete.
  `,

  PLATFORM_INSTRUCTIONS_BROWSER_TOOLTIP: `
    This platform requires a browser with access to your payment platform account to complete.
  `,

  // Mail Input
  PROOF_TOOLTIP: `
    The proof is a cryptographic attestation generated using the zkTLS protocol which is submitted
    onchain for verification
  `,

  // Release Funds Modal
  RELEASE_FUNDS_WARNING_ONE: `
    Submit this transaction to release
  `,
  RELEASE_FUNDS_WARNING_TWO: `
    to the requester. This bypasses requiring the user to submit proof of the transaction
    and may result in loss of funds.
  `,

  // Login Modal
  LOGIN_MODAL_TOOLTIP: `
    Use a social account if you do not already have funds on the blockchain, 
    or use an Ethereum wallet if you already have one.
  `,

  SEND_MODAL_TOOLTIP: `
    Coming soon: transfer to wallets on any chain including Solana, Polygon, Arbitrum, zkSync, and others.
  `,

  // Receive Modal
  RECEIVE_FUNDS_INSTRUCTIONS_1: `
    This address can ONLY receive
  `,
  RECEIVE_FUNDS_INSTRUCTIONS_2: `
    Sending invalid USDC or tokens from other networks will result in lost funds.
  `,

  // Pay Modal
  PAY_MODAL_INSTRUCTIONS: `
    All transactions are peer-to-peer. Review all of the requirements below before sending a payment
    to prevent loss of funds.
  `,
  PAY_MODAL_MOBILE_INSTRUCTIONS: `
    Review requirements to prevent loss of funds.
  `,

  // Proof Modal
  PROOF_MODAL_DOWNLOAD_TITLE: `
    Downloading Verification Keys
  `,
  PROOF_MODAL_DOWNLOAD_SUBTITLE: `
    Keys download (1.7GB) will complete in 3 minutes
  `,
  PROOF_MODAL_EXTENSION_REQUEST_TITLE: `
    Requesting Verification
  `,
  PROOF_MODAL_EXTENSION_REQUEST_SUBTITLE: `
    Requesting extension to verify payment
  `,
  PROOF_MODAL_MOBILE_APPCLIP_REQUEST_TITLE: `
    Initiate Verification
  `,
  PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_TITLE: `
    Generating QR code
  `,
  PROOF_MODAL_MOBILE_APPCLIP_REQUEST_SUBTITLE: `
    Creating instant verification link
  `,
  PROOF_MODAL_DESKTOP_APPCLIP_REQUEST_SUBTITLE: `
    Requesting attestor to generate QR code
  `,
  PROOF_MODAL_UPLOAD_TITLE: `
    Uploading Emails
  `,
  PROOF_MODAL_UPLOAD_SUBTITLE: `
    Email is sent to remote server for proving
  `,
  PROOF_MODAL_EXTENSION_PROVE_TITLE: `
    Verifying Payment
  `,
  PROOF_MODAL_MOBILE_APPCLIP_PROVE_TITLE: `
    Verify Payment
  `,
  PROOF_MODAL_DESKTOP_APPCLIP_PROVE_TITLE: `
    Verify Payment
  `,
  PROOF_MODAL_PROVE_REGISTRATION_TITLE: `
    Validating Email
  `,
  PROOF_MODAL_EXTENSION_PROVE_SUBTITLE: `
    Can take up to 30 seconds
  `,
  PROOF_MODAL_MOBILE_APPCLIP_PROVE_SUBTITLE: `
    Click to start payment verification
  `,
  PROOF_MODAL_DESKTOP_APPCLIP_PROVE_SUBTITLE: `
    Scan QR code to start payment verification
  `,
  PROOF_MODAL_PROVE_SUBTITLE_FAST: `
    Generating proof can take up to 30 seconds
  `,
  PROOF_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: `
    Email validation can take up to 30 seconds
  `,
  PROOF_MODAL_VERIFY_TITLE: `
    Local Proof Verification
  `,
  PROOF_MODAL_VERIFY_SUBTITLE: `
    Constructing and verifying transaction
  `,
  PROOF_MODAL_SUBMIT_TITLE: `
    Complete Onramp
  `,
  PROOF_MODAL_SWAP_TITLE: `
    Complete Swap
  `,
  PROOF_MODAL_REGISTRATION_SUBMIT_TITLE: `
    Complete Registration
  `,
  PROOF_MODAL_SUBMIT_SUBTITLE: `
    Receive USDC on Base
  `,
  PROOF_MODAL_SWAP_SUBTITLE: `
    Can take up to 30 seconds
  `,
  PROOF_MODAL_REGISTRATION_SUBMIT_SUBTITLE: `
    Submit transaction to complete registration
  `,

  // Extension Instructions
  BROWSER_NOT_SUPPORTED_INSTRUCTIONS: `
    Your browser is currently NOT supported. Switch to a chromium browser (Chrome/Brave) to continue the onramp.
    Join our Telegram for updates on supported browsers.
  `,
  EXTENSION_DOWNLOAD_INSTRUCTIONS: `
    Our browser extension has been approved by the Chrome Web Store.
  `,
  EXTENSION_UPDATE_INSTRUCTIONS: `
    Your PeerAuth Extension is outdated and cannot be automatically updated by your browser. Please follow the instructions below.
  `,

  // Notary Connection Tooltip
  NOTARY_CONNECTION_TOOLTIP: `
    Your internet connection may be insufficient for verifying new information.
    Please check your connection and try again or join our Telegram for support.
  `,

  // Notary Verification Modal Steps
  VERIFICATION_MODAL_UPLOAD_TITLE: `
    Uploading Proof
  `,

  VERIFICATION_MODAL_UPLOAD_SUBTITLE: `
    Proof is sent to remote server for verification
  `,

  VERIFICATION_MODAL_PROVE_TITLE: `
    Validating Payment
  `,

  VERIFICATION_MODAL_PROVE_REGISTRATION_TITLE: `
    Validating Account
  `,

  VERIFICATION_MODAL_PROVE_SUBTITLE_FAST: `
    Payment validation will take up to 10 seconds
  `,

  VERIFICATION_MODAL_PROVE_REGISTRATION_SUBTITLE_FAST: `
    Account proof validation will take up to 10 seconds
  `,

  VERIFICATION_MODAL_VERIFY_TITLE: `
    Local Proof Verification
  `,

  VERIFICATION_MODAL_VERIFY_SUBTITLE: `
    Constructing and verifying transaction
  `,

  VERIFICATION_MODAL_SUBMIT_TITLE: `
    Complete Order
  `,

  VERIFICATION_MODAL_REGISTRATION_SUBMIT_TITLE: `
    Complete Registration
  `,

  VERIFICATION_MODAL_SUBMIT_SUBTITLE: `
    Submit transaction to complete the on ramp
  `,

  VERIFICATION_MODAL_REGISTRATION_SUBMIT_SUBTITLE: `
    Submit transaction to complete registration
  `,

  // New Deposit
  NEW_DEPOSIT_INSTRUCTIONS: `
    Creating a new deposit requires you to submit your payee details, the USDC liquidity to deposit and
    desired USD conversion rate.
  `,
  NEW_DEPOSIT_ID_TOOLTIP: `
    This is a valid 18-19 digit Venmo ID where users will send payments.
    This connects your Venmo account to your wallet address on chain.
    This must match the Venmo account you used to register.
  `,
  NEW_DEPOSIT_NAME_TOOLTIP: `
    no-op
  `,
  NEW_DEPOSIT_AMOUNT_TOOLTIP: `
    This is the amount of USDC you will deposit for users to claim by sending you Venmo payments.
    You can withdraw unclaimed USDC or USDC not locked for orders at any time.
  `,
  NEW_DEPOSIT_RECEIVE_TOOLTIP: `
    This is the amount of USD you will receive if your entire deposit is claimed.
  `,

  // Complete Order
  PROOF_FORM_FINALIZE_ORDER_INSTRUCTIONS: `
    Please provide the transaction details to complete the order.
  `,
  PROOF_FORM_ETH_REQUIRED: `
    Please bridge ETH to Base to complete the transaction.
  `,

  // Consent Instructions
  CONSENT_INSTRUCTIONS_SHARE_DATA_EXPLANATION: `
    You are sharing information with this website. Sensitive information NEVER leaves your device.
  `,

  // Mobile Warning
  MOBILE_WARNING_TEXT: `
    For an optimal experience, we recommend using the desktop app. Certain features are limited or unstable on mobile.
  `,

  // Redirect flow warning
  REDIRECT_FLOW_EXISTING_ORDER_WARNING: `
    You have an existing order. Please cancel or complete the pending order first.
  `,
};

export class CommonStringProvider {
  private strings: CommonStrings;

  constructor() {
    this.strings = strings;
  }

  get(key: keyof CommonStrings): string {
    return this.strings[key];
  }
};
