export type IncomingMessages = RegisterExtension | RegisterClient;

export interface RegisterExtension {
  type: 'registerExtension';
}

export function isRegisterExtension(
  msg?: IncomingMessages,
): msg is RegisterExtension {
  return msg?.type === 'registerExtension';
}

export interface RegisterClient {
  type: 'registerClient';
}

export function isRegisterClient(
  msg?: IncomingMessages,
): msg is RegisterClient {
  return msg?.type === 'registerClient';
}
