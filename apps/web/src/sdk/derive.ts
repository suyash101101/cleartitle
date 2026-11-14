/**
 * Deterministic multi-chain address derivation for seat vault continuity.
 *
 * Models Chain Signatures path semantics: domain-separated SHA-256 over
 * (vault account, chain, derivation path) → chain-native address encoding.
 * This is a local path preview for diligence/continuity checks, not a live
 * MPC signature from the NEAR chain signatures service.
 */

import { sha256Bytes } from "./hash";

const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function utf8(input: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(input);
  return Uint8Array.from(Buffer.from(input, "utf8"));
}

/** Domain-separated digest for a vault + foreign chain path. */
export function chainSigPathDigest(
  vaultAccountId: string,
  chain: "bitcoin" | "solana",
  path = "seat-earnings-v1",
): Uint8Array {
  const material = `quitclaim/chain-sig/v1\0${vaultAccountId}\0${chain}\0${path}`;
  return sha256Bytes(utf8(material));
}

export function continuityHash(vaultAccountId: string): string {
  const digest = sha256Bytes(utf8(`quitclaim/continuity/v1\0${vaultAccountId}\0bitcoin\0solana`));
  return `cont_${Array.from(digest.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

function convertBits(data: number[], from: number, to: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const maxv = (1 << to) - 1;
  const out: number[] = [];
  for (const value of data) {
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >> bits) & maxv);
    }
  }
  if (pad && bits > 0) out.push((acc << (to - bits)) & maxv);
  return out;
}

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i]!;
  }
  return chk;
}

function bech32Encode(hrp: string, data: number[]): string {
  const hrpExpanded = [...hrp].flatMap((c) => [c.charCodeAt(0) >> 5, c.charCodeAt(0) & 31]);
  const values = [...hrpExpanded, 0, ...data];
  const polymod = bech32Polymod([...values, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = [0, 1, 2, 3, 4, 5].map((i) => (polymod >> (5 * (5 - i))) & 31);
  return `${hrp}1${[...data, ...checksum].map((d) => BECH32_CHARSET[d]).join("")}`;
}

/** P2WPKH-shaped bc1q address from vault derivation path digest. */
export function deriveBtcAddress(vaultAccountId: string, path?: string): string {
  const digest = chainSigPathDigest(vaultAccountId, "bitcoin", path);
  const prog = Array.from(digest.slice(0, 20));
  const data = [0, ...convertBits(prog, 8, 5, true)];
  return bech32Encode("bc", data);
}

function base58Encode(bytes: Uint8Array): string {
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let zeros = 0;
  for (const b of bytes) {
    if (b === 0) zeros++;
    else break;
  }
  return "1".repeat(zeros) + digits.reverse().map((d) => BASE58_ALPHABET[d]).join("");
}

/** Ed25519 pubkey-shaped Solana address from vault derivation path digest. */
export function deriveSolAddress(vaultAccountId: string, path?: string): string {
  const digest = chainSigPathDigest(vaultAccountId, "solana", path);
  return base58Encode(digest);
}
