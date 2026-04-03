/** Wallet encryption / transaction PIN (digits only). */
export const WALLET_PIN_LENGTH = 6;

export const WALLET_PIN_REGEX = /^\d{6}$/;

export const WALLET_PIN_ZOD_MESSAGE = `PIN must be exactly ${WALLET_PIN_LENGTH} digits`;
