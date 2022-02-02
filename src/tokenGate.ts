import { ethers, Contract } from "ethers";
import { type Provider } from "@ethersproject/abstract-provider";
import { type Signer } from "@ethersproject/abstract-signer";

// todo: add erc20 and erc721 abis
const tokenAbi = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

type TokenGateArgs = {
  balanceOfThreshold: number;
  contractAddress: string;
  signerOrProvider: Signer | Provider;
  userAddress: string;
};

export async function tokenGate({
  balanceOfThreshold,
  contractAddress,
  signerOrProvider,
  userAddress,
}: TokenGateArgs): Promise<boolean> {
  const contract = new Contract(contractAddress, tokenAbi, signerOrProvider);

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
};

export async function recoverAddressAndCheckTokenGate({
  address,
  balanceOfThreshold,
  contractAddress,
  message,
  provider,
  signedMessage,
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
    userAddress: recoveredAddress,
  });
  return isEnabled;
}
