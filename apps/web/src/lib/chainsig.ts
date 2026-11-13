/** Derive stable BTC/SOL tip addresses for a seat vault via Chain Signatures (local KDF). */

export type DerivedAddresses = {
  vaultAccountId: string;
  btc: string;
  sol: string;
  pathBtc: string;
  pathSol: string;
};

export async function deriveSeatAddresses(vaultAccountId: string): Promise<DerivedAddresses> {
  const { chainAdapters, contracts } = await import("chainsig.js");
  const { Connection } = await import("@solana/web3.js");

  const mpc = new contracts.ChainSignatureContract({
    networkId: "testnet",
    contractId: "v1.signer-prod.testnet",
  });

  const btc = new chainAdapters.btc.Bitcoin({
    network: "testnet",
    btcRpcAdapter: new chainAdapters.btc.BTCRpcAdapters.Mempool(
      "https://mempool.space/testnet4/api",
    ),
    contract: mpc,
  });

  // chainsig.js pins a different @solana/web3.js major; Connection is API-compatible for derive.
  const sol = new chainAdapters.solana.Solana({
    solanaConnection: new Connection("https://api.devnet.solana.com") as never,
    contract: mpc,
  });

  const pathBtc = "bitcoin";
  const pathSol = "solana";
  const { address: btcAddr } = await btc.deriveAddressAndPublicKey(vaultAccountId, pathBtc);
  const { address: solAddr } = await sol.deriveAddressAndPublicKey(vaultAccountId, pathSol);

  return {
    vaultAccountId,
    btc: btcAddr,
    sol: solAddr,
    pathBtc,
    pathSol,
  };
}
