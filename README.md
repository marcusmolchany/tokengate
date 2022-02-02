# Token Gate

[![NPM version][npm-image]][npm-url]

js module for token gating on ethereum

## Usage

```ts
// exported methods

// insecure client-side method to check if an address meets a token threshold.
// example usage: enable/disable a button based on a connected wallet's address.
async insecureClientSideTokenGate({
  balanceOfThreshold, // {number} balance of tokens that define token gate threshold
  contractAddress, // {string} erc20, erc721, or erc1155 contract address
  signerOrProvider, // {Provider} wallet web3 provider
  userAddress, // {string} user address
});

// sign an arbitrary message with a connected wallet
async clientSideSignMessage({
  messageToSign, // {string} text message to be signed by user's connected wallet
  signer, // {Signer} wallet web3 signer
});

// THIS IS NOT DEFINED YET. IT WILL ERROR IF YOU TRY TO USE IT.
async clientSideSignTypedData({});

// server-side code for a secure client-side/server-side token gate flow.
// takes a message signed by a client, recovers the address, and checks
// if that address meets a token threshold.
async secureServerSideTokenGate({
  address, // {string} address to compare to address recovered from signedMessage
  balanceOfThreshold, // {number} balance of tokens that define token gate threshold
  contractAddress, // {string} erc20, erc721, or erc1155 contract address
  message, // {string} clear text message that was signed by user's wallet
  provider, // {Provider} server-side web3 provider
  signedMessage, // {string} signed message by user's wallet
});
```

[npm-image]: https://badge.fury.io/js/tokengate.svg
[npm-url]: https://npmjs.org/package/tokengate
