import { tokenGate, recoverAddressAndCheckTokenGate } from "./tokenGate";

import { signMessage, signTypedData } from "./signature";

export const unsecureClientSideTokenGate = tokenGate;
export const clientSideSignMessage = signMessage;
export const clientSideSignTypedData = signTypedData; /* todo */
export const secureServerSideTokenGate = recoverAddressAndCheckTokenGate;
