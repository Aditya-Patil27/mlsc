import algosdk from "algosdk";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../frontend/.env.local") });

async function verifyWallet() {
  console.log("🔍 Verifying Algorand Wallet Configuration...");

  const mnemonic = process.env.ALGORAND_MNEMONIC;
  const algodServer = process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const algodPort = process.env.NEXT_PUBLIC_ALGOD_PORT || 443;
  const algodToken = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";

  if (!mnemonic) {
    console.error("❌ ALGORAND_MNEMONIC is missing in .env.local");
    process.exit(1);
  }

  try {
    // 1. Recover Account
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log(`✅ Wallet Recovered: ${account.addr}`);

    // 2. Connect to Node
    const client = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    const status = await client.status().do();
    console.log(`✅ Connected to Algorand Node (Last Round: ${status["last-round"]})`);

    // 3. Check Balance
    const accountInfo = await client.accountInformation(account.addr).do();
    const balance = accountInfo.amount;
    console.log(`💰 Balance: ${balance / 1_000_000} ALGO`);

    if (balance < 1_000_000) {
      console.warn("⚠️  Low balance! You need at least 1 ALGO to run the demo smoothly.");
      console.warn("   Dispense funds here: https://testnet.algoexplorer.io/dispenser");
    } else {
      console.log("✅ Sufficient funds for hackathon demo.");
    }

  } catch (error: any) {
    console.error("❌ Wallet Verification Failed:", error.message);
  }
}

verifyWallet();
