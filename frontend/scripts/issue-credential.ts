import algosdk from "algosdk";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function issueCredential() {
  console.log("🏆 Issuing Test Credential NFT...");

  const mnemonic = process.env.ALGORAND_MNEMONIC;
  const algodServer = process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const algodPort = Number(process.env.NEXT_PUBLIC_ALGOD_PORT || 443);
  const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";

  if (!mnemonic) {
    console.error("❌ ALGORAND_MNEMONIC is missing in .env.local");
    process.exit(1);
  }

  const account = algosdk.mnemonicToSecretKey(mnemonic);
  const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

  try {
    const params = await client.getTransactionParams().do();

    // Create an NFT (Asset)
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: account.addr,
      total: 1,
      decimals: 0,
      defaultFrozen: false,
      assetName: "CampusChain Certificate",
      unitName: "CERT",
      assetURL: "ipfs://QmTestMetadataHash",
      manager: account.addr,
      reserve: account.addr,
      freeze: account.addr,
      clawback: account.addr,
      suggestedParams: params,
      note: new TextEncoder().encode("Issued by Seed Script"),
    });

    const signedTxn = txn.signTxn(account.sk);
    const { txId } = await client.sendRawTransaction(signedTxn).do();
    console.log(`⏳ Transaction sent: ${txId}. Waiting for confirmation...`);

    const result = await algosdk.waitForConfirmation(client, txId, 4);
    const assetIndex = result["asset-index"];

    console.log(`\n✅ Credential Issued!`);
    console.log(`   Asset ID: ${assetIndex}`);
    console.log(`   Owner: ${account.addr}`);
    console.log(`\n➡️  Run 'npm run verify-credentials' to see it!`);

  } catch (error: any) {
    console.error("❌ Failed to issue credential:", error.message);
  }
}

issueCredential();
