import { tokenGate } from "./tokenGate";

import { signMessage, signTypedData } from "./signature";

export const insecureClientSideTokenGate = tokenGate;
export const clientSideSignMessage = signMessage;
export const clientSideSignTypedData = signTypedData; /* todo */
export const secureServerSideTokenGate = undefined; /* todo */
