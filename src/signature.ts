import { type Signer } from "@ethersproject/abstract-signer";

type SignMessageArgs = {
  messageToSign: string;
  signer: Signer;
};

export async function signMessage({
  messageToSign,
  signer,
}: SignMessageArgs): Promise<string> {
  const signature = await signer.signMessage(messageToSign);
  return signature;
}

export async function signTypedData(): Promise<void> {
  throw new Error("signature::signTypedData is not defined.");
}
