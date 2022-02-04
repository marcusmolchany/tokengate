# Token Gate

[![NPM version][npm-image]][npm-url]

js module for token gating on ethereum

## Usage

Exported methods

```ts
// unsecure client-side method to check if an address meets a token threshold.
// example usage: enable/disable a button based on a connected wallet's address.
async unsecureClientSideTokenGate({
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

Client-side / Server-side example

```ts
////////////////////////////////////////////////////////////////////
//////////////////////// client-side react /////////////////////////
////////////////////////////////////////////////////////////////////
import axios from "axios";
import { useState } from "react";
import { clientSideSignMessage, unsecureClientSideTokenGate } from "tokengate";

const balanceOfThreshold = 1; /* require 1 blitmap nft */
const contractAddress =
  "0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63"; /* blitmap */

// this must match the message that is signed on the server-side.
// ideally the server-side issues this message as a challange.
const message = "sign this secret message";

function TokenGateButton({ signer }) {
  const [isAllowed, setIsAllowed] = useState<boolean>(false);

  useEffect(() => {
    const asyncEffect = async () => {
      const userAddress = await signer.getAddress();
      const _isAllowed = await unsecureClientSideTokenGate({
        balanceOfThreshold,
        contractAddress,
        signerOrProvider: signer,
        userAddress,
      });

      setIsAllowed(_isAllowed);
    };

    asyncEffect();
  }, [signer]);

  const onClick = async () => {
    const userAddress = await signer.getAddress();
    const signedMessage = await clientSideSignMessage({
      messageToSign: message,
      signer,
    });

    try {
      const resp = await axios.post("/api/token-gate", {
        address: userAddress,
        signedMessage,
      });
      setIsAllowed(resp.data.isAllowed);
    } catch (e) {
      console.error("something went wrong");
      setIsAllowed(false);
    }
  };

  return (
    <button disabled={!isAllowed} onClick={onClick}>
      Access token gated content
    </button>
  );
}

////////////////////////////////////////////////////////////////////
///////////////////////// server-side api //////////////////////////
////////////////////////////////////////////////////////////////////
import { ethers } from "ethers";
import { secureServerSideTokenGate } from "tokengate";

const balanceOfThreshold = 1; /* require 1 blitmap nft */
const contractAddress =
  "0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63"; /* blitmap */

// this must match the message that is signed on the client-side.
// ideally the backend issues this message as a challange.
const message = "sign this secret message";

app.post("/api/token-gate", (req, res) => {
  // optional `networkId` param so that you can use other networks.
  // defaults to `1` which is mainnet
  const { address, networkId = 1, signedMessage } = req.body;

  // create a web3 provider
  const provider = new ethers.providers.InfuraProvider(networkId);

  const isAllowed = await secureServerSideTokenGate({
    address,
    balanceOfThreshold,
    contractAddress,
    message,
    provider,
    signedMessage,
  });

  // handle the success/failure case however you want

  return res.json({ isAllowed });
});
```

[npm-image]: https://badge.fury.io/js/tokengate.svg
[npm-url]: https://npmjs.org/package/tokengate
