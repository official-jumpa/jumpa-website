import * as fcl from "@onflow/fcl";
import { mnemonicToSeedSync } from "@scure/bip39";
import { HDKey } from "@scure/bip32";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

/**
 * Creates an FCL-compatible authorization function (signer)
 * @param mnemonic BIP-39 mnemonic
 * @param flowAddress Flow Native Address (e.g. 0x123...)
 */
export function createFlowSigner(mnemonic: string, flowAddress: string) {
  const seed = mnemonicToSeedSync(mnemonic);
  const hdKey = HDKey.fromMasterSeed(seed);
  // Using Flow's standard derivation path m/44'/539'/0'/0/0 or Jumpa's ETH path m/44'/60'/0'/0/0
  const child = hdKey.derive("m/44'/60'/0'/0/0");
  const privateKey = Buffer.from(child.privateKey!).toString("hex");

  // FCL Authorization Function
  return async (account: any) => {
    return {
      ...account,
      tempId: `${flowAddress}-${account.role}`,
      addr: fcl.sansPrefix(flowAddress),
      keyId: 0,
      signingFunction: async (data: any) => {
        const key = ec.keyFromPrivate(privateKey);
        const sig = key.sign(data.message);
        const n = 32;
        const r = sig.r.toArrayLike(Buffer, "be", n);
        const s = sig.s.toArrayLike(Buffer, "be", n);

        return {
          addr: fcl.withPrefix(flowAddress),
          keyId: 0,
          signature: Buffer.concat([r, s]).toString("hex"),
        };
      },
    };
  };
}
