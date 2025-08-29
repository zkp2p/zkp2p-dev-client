export const unifiedVerifierAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_escrow",
        "type": "address"
      },
      {
        "internalType": "contract INullifierRegistry",
        "name": "_nullifierRegistry",
        "type": "address"
      },
      {
        "internalType": "contract IAttestationVerifier",
        "name": "_attestationVerifier",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldVerifier",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newVerifier",
        "type": "address"
      }
    ],
    "name": "AttestationVerifierUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentMethod",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestampBuffer",
        "type": "uint256"
      }
    ],
    "name": "PaymentMethodAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentMethod",
        "type": "bytes32"
      }
    ],
    "name": "PaymentMethodRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentMethod",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "providerHash",
        "type": "bytes32"
      }
    ],
    "name": "ProviderHashAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentMethod",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "providerHash",
        "type": "bytes32"
      }
    ],
    "name": "ProviderHashRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "paymentMethod",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldBuffer",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newBuffer",
        "type": "uint256"
      }
    ],
    "name": "TimestampBufferUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_timestampBuffer",
        "type": "uint256"
      },
      {
        "internalType": "bytes32[]",
        "name": "_providerHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "addPaymentMethod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32[]",
        "name": "_providerHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "addProviderHashes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "attestationVerifier",
    "outputs": [
      {
        "internalType": "contract IAttestationVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPaymentMethods",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      }
    ],
    "name": "getProviderHashes",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      }
    ],
    "name": "getTimestampBuffer",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_providerHash",
        "type": "bytes32"
      }
    ],
    "name": "isProviderHash",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nullifierRegistry",
    "outputs": [
      {
        "internalType": "contract INullifierRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "orchestrator",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "paymentMethods",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      }
    ],
    "name": "removePaymentMethod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32[]",
        "name": "_providerHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "removeProviderHashes",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newVerifier",
        "type": "address"
      }
    ],
    "name": "setAttestationVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_paymentMethod",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_newTimestampBuffer",
        "type": "uint256"
      }
    ],
    "name": "setTimestampBuffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "store",
    "outputs": [
      {
        "internalType": "bool",
        "name": "initialized",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "timestampBuffer",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes",
            "name": "paymentProof",
            "type": "bytes"
          },
          {
            "internalType": "address",
            "name": "depositToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "intentAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "intentTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "payeeDetails",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "fiatCurrency",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "conversionRate",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "depositData",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct IPaymentVerifier.VerifyPaymentData",
        "name": "_verifyPaymentData",
        "type": "tuple"
      }
    ],
    "name": "verifyPayment",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "success",
            "type": "bool"
          },
          {
            "internalType": "bytes32",
            "name": "intentHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "releaseAmount",
            "type": "uint256"
          }
        ],
        "internalType": "struct IPaymentVerifier.PaymentVerificationResult",
        "name": "result",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;