import { ethers, Contract } from "ethers";
import { type Provider } from "@ethersproject/abstract-provider";
import { type Signer } from "@ethersproject/abstract-signer";

type BalanceOfAbi = [
  {
    inputs: Array<Object>;
    name: string;
    outputs: Array<Object>;
    stateMutability: string;
    type: string;
  }
];

// todo: add erc20 and erc721 abis
// erc20, erc721, erc777
const balanceOfAddressAbi: BalanceOfAbi = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// erc1155
const balanceOfAddressForTokenIdAbi: BalanceOfAbi = [
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

type TokenStandard = "erc20" | "erc721" | "erc777" | "erc1155";

type TokenGateArgs = {
  balanceOfThreshold: number;
  contractAddress: string;
  signerOrProvider: Signer | Provider;
  tokenStandard?: TokenStandard;
  userAddress: string;
};

export async function tokenGate({
  balanceOfThreshold,
  contractAddress,
  signerOrProvider,
  tokenStandard = "erc20",
  userAddress,
}: TokenGateArgs): Promise<boolean> {
  let abi: BalanceOfAbi;
  if (tokenStandard === "erc1155") {
    abi = balanceOfAddressForTokenIdAbi;
  } else {
    abi = balanceOfAddressAbi;
  }
  const contract = new Contract(contractAddress, abi, signerOrProvider);

  try {
    const balanceOf = await contract.balanceOf(userAddress);
    return balanceOf >= balanceOfThreshold;
  } catch (e) {
    console.error("tokengate::tokenGate could not query contract balance.");
    console.error(e);

    return false;
  }
}

type RecoverAddressFromSignedMessageArgs = {
  message: string;
  signedMessage: string;
};

export function recoverAddressFromSignedMessage({
  message,
  signedMessage,
}: RecoverAddressFromSignedMessageArgs): string {
  const recoveredAddress = ethers.utils.verifyMessage(message, signedMessage);
  return recoveredAddress;
}

type RecoverAddressAndCheckTokenGateArgs = {
  address: string;
  balanceOfThreshold: number;
  contractAddress: string;
  message: string;
  provider: Provider;
  signedMessage: string;
  tokenStandard?: TokenStandard;
};

export async function recoverAddressAndCheckTokenGate({
  address,
  balanceOfThreshold,
  contractAddress,
  message,
  provider,
  signedMessage,
  tokenStandard = "erc20",
}: RecoverAddressAndCheckTokenGateArgs): Promise<boolean> {
  const recoveredAddress = recoverAddressFromSignedMessage({
    message,
    signedMessage,
  });

  // compare lowercased addresses in case one is checksummed and the other is not
  if (address.toLowerCase() !== recoveredAddress.toLowerCase()) {
    console.error(
      "tokenGate::recoverAddressAndCheckTokenGate addresses do not match"
    );
    return false;
  }

  const isEnabled = await tokenGate({
    balanceOfThreshold,
    contractAddress,
    signerOrProvider: provider,
    tokenStandard,
    userAddress: recoveredAddress,
  });
  return isEnabled;
}
