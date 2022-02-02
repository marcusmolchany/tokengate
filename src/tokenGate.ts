import { Contract } from "ethers";
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
