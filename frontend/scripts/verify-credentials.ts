import algosdk from "algosdk";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function verifyCredentials() {
  console.log("🔍 Searching for On-Chain Credentials...");

  const mnemonic = process.env.ALGORAND_MNEMONIC;
  const indexerServer = process.env.NEXT_PUBLIC_INDEXER_SERVER || "https://testnet-idx.algonode.cloud";
  const indexerPort = Number(process.env.NEXT_PUBLIC_INDEXER_PORT || 443);
  const algodServer = process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const algodPort = Number(process.env.NEXT_PUBLIC_ALGOD_PORT || 443);
  const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";

  if (!mnemonic) {
    console.error("❌ ALGORAND_MNEMONIC is missing in .env.local");
    process.exit(1);
  }

  try {
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`Checking account: ${account.addr}\n`);

    const indexerLine = new algosdk.Indexer("", indexerServer, indexerPort);
    const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

    // Search for transactions with note prefix "attendance" or "health-credential"
    // Since we don't know the exact prefix used in searchTransactions helper without looking at code deeply,
    // we will fetch recent transactions and parse their notes.
    
    // Actually, let's look for any transaction from this address
    const result = await indexerLine
        .searchForTransactions()
        .address(account.addr)
        .limit(20)
        .do();

    const txns = result.transactions || [];
    let found = 0;

    console.log(`Found ${txns.length} recent transactions. Analyzing notes...\n`);

    for (const tx of txns) {
      if (tx.note) {
        try {
          const noteBuffer = Buffer.from(tx.note, "base64");
          const noteText = noteBuffer.toString("utf-8");
          const noteJson = JSON.parse(noteText);

          if (noteJson.type) {
            found++;
            console.log(`📄 Credential Type: ${noteJson.type.toUpperCase()}`);
            console.log(`   Tx ID: ${tx.id}`);
            console.log(`   Round: ${tx["confirmed-round"]}`);
            console.log(`   Data:`, JSON.stringify(noteJson, null, 2));
            console.log("------------------------------------------------");
          }
        } catch (e) {
          // Not a JSON note, ignore
        }
      }
    }

    if (found === 0) {
      console.log("⚠️  No credential transactions found in the last 20 records.");
    } else {
        console.log(`\n✅ Found ${found} on-chain credentials/records.`);
    }

    // ---------------------------------------------------------
    // Check for Assets (NFTs / Credentials)
    // ---------------------------------------------------------
    console.log("\n🔍 Checking for Assets (NFTs)...");
    const accountInfo = await client.accountInformation(account.addr).do();
    const assets = accountInfo.assets || [];

    if (assets.length === 0) {
      console.log("⚠️  No assets found in wallet.");
    } else {
      console.log(`✅ Found ${assets.length} Assets:`);
      for (const a of assets) {
        const assetInfo = await client.getAssetByID(a["asset-id"]).do();
        const p = assetInfo.params;
        console.log(`\n🏆 Asset ID: ${a["asset-id"]}`);
        console.log(`   Name: ${p.name}`);
        console.log(`   Unit: ${p["unit-name"]}`);
        console.log(`   Total: ${p.total}`);
        console.log(`   URL: ${p.url}`);
        console.log(`   Amount Owned: ${a.amount}`);
      }
    }

  } catch (error: any) {
    console.error("❌ Verification Failed:", error.message);
  }
}

verifyCredentials();
