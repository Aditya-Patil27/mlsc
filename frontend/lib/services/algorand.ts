import algosdk from "algosdk";

// ---------------------------------------------------------------------------
// Algorand client singletons
// ---------------------------------------------------------------------------

const ALGOD_SERVER =
  process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
const ALGOD_PORT = Number(process.env.NEXT_PUBLIC_ALGOD_PORT || 443);
const ALGOD_TOKEN = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";

const INDEXER_SERVER =
  process.env.NEXT_PUBLIC_INDEXER_SERVER ||
  "https://testnet-idx.algonode.cloud";
const INDEXER_PORT = Number(process.env.NEXT_PUBLIC_INDEXER_PORT || 443);

let _algodClient: algosdk.Algodv2 | null = null;
let _indexerClient: algosdk.Indexer | null = null;

export function getAlgodClient(): algosdk.Algodv2 {
  if (!_algodClient) {
    _algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  }
  return _algodClient;
}

export function getIndexerClient(): algosdk.Indexer {
  if (!_indexerClient) {
    _indexerClient = new algosdk.Indexer("", INDEXER_SERVER, INDEXER_PORT);
  }
  return _indexerClient;
}

// ---------------------------------------------------------------------------
// Account helpers
// ---------------------------------------------------------------------------

export function getAppAccount(): algosdk.Account {
  const mnemonic = process.env.ALGORAND_MNEMONIC;
  if (!mnemonic) throw new Error("ALGORAND_MNEMONIC not set");
  return algosdk.mnemonicToSecretKey(mnemonic);
}

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

export interface TxResult {
  txId: string;
  confirmedRound: number;
}

export async function signAndSend(
  txn: algosdk.Transaction,
  signer: algosdk.Account
): Promise<TxResult> {
  const algod = getAlgodClient();
  const signed = txn.signTxn(signer.sk);
  const { txId } = await algod.sendRawTransaction(signed).do();
  const result = await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId, confirmedRound: Number(result["confirmed-round"]) };
}

export async function signAndSendGroup(
  txns: algosdk.Transaction[],
  signer: algosdk.Account
): Promise<TxResult> {
  const algod = getAlgodClient();
  algosdk.assignGroupID(txns);
  const signed = txns.map((t) => t.signTxn(signer.sk));
  const { txId } = await algod.sendRawTransaction(signed).do();
  const result = await algosdk.waitForConfirmation(algod, txId, 4);
  return { txId, confirmedRound: Number(result["confirmed-round"]) };
}

// ---------------------------------------------------------------------------
// Attendance on-chain
// ---------------------------------------------------------------------------

export async function recordAttendanceOnChain(payload: {
  sessionId: string;
  studentId: string;
  timestamp: number;
  verificationHash: string;
}): Promise<TxResult> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const note = new TextEncoder().encode(
    JSON.stringify({ type: "attendance", ...payload })
  );

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });

  return signAndSend(txn, account);
}

// ---------------------------------------------------------------------------
// Health credential on-chain
// ---------------------------------------------------------------------------

export async function storeHealthCredentialOnChain(payload: {
  credentialId: string;
  commitmentHash: string;
  issuerHash: string;
}): Promise<TxResult> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const note = new TextEncoder().encode(
    JSON.stringify({ type: "health-credential", ...payload })
  );

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });

  return signAndSend(txn, account);
}

export async function recordProofUsageOnChain(payload: {
  proofId: string;
  credentialId: string;
  purpose: string;
  usageHash: string;
}): Promise<TxResult> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const note = new TextEncoder().encode(
    JSON.stringify({ type: "proof-usage", ...payload })
  );

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });

  return signAndSend(txn, account);
}

// ---------------------------------------------------------------------------
// NFT / ASA helpers
// ---------------------------------------------------------------------------

export async function mintCredentialNFT(payload: {
  recipientAddress: string;
  metadataUrl: string;
  name: string;
}): Promise<TxResult & { assetId: number }> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: account.addr,
    total: 1,
    decimals: 0,
    defaultFrozen: true,
    assetName: payload.name.slice(0, 32),
    unitName: "CERT",
    assetURL: payload.metadataUrl,
    manager: account.addr,
    freeze: account.addr,
    clawback: account.addr,
    reserve: account.addr,
    suggestedParams: params,
    note: new TextEncoder().encode(
      JSON.stringify({ type: "credential-nft", name: payload.name })
    ),
  });

  const result = await signAndSend(txn, account);
  const ptxn = await algod.pendingTransactionInformation(result.txId).do();
  const assetId = Number(ptxn["asset-index"]);

  return { ...result, assetId };
}

export async function createVoteTokens(payload: {
  electionId: string;
  totalVoters: number;
}): Promise<TxResult & { assetId: number }> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: account.addr,
    total: payload.totalVoters,
    decimals: 0,
    defaultFrozen: false,
    assetName: `VOTE-${payload.electionId.slice(0, 20)}`,
    unitName: "VOTE",
    manager: account.addr,
    freeze: account.addr,
    clawback: account.addr,
    reserve: account.addr,
    suggestedParams: params,
    note: new TextEncoder().encode(
      JSON.stringify({ type: "vote-token", electionId: payload.electionId })
    ),
  });

  const result = await signAndSend(txn, account);
  const ptxn = await algod.pendingTransactionInformation(result.txId).do();
  const assetId = Number(ptxn["asset-index"]);

  return { ...result, assetId };
}

export async function recordVoteOnChain(payload: {
  electionId: string;
  candidateId: string;
  voterHash: string;
}): Promise<TxResult> {
  const algod = getAlgodClient();
  const account = getAppAccount();
  const params = await algod.getTransactionParams().do();

  const note = new TextEncoder().encode(
    JSON.stringify({ type: "vote", ...payload })
  );

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });

  return signAndSend(txn, account);
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export async function lookupTransaction(txId: string) {
  const indexer = getIndexerClient();
  const result = await indexer.lookupTransactionByID(txId).do();
  return result.transaction;
}

export async function searchTransactions(notePrefix: string, limit = 20) {
  const indexer = getIndexerClient();
  const account = getAppAccount();
  const encoded = Buffer.from(notePrefix).toString("base64");
  const result = await indexer
    .searchForTransactions()
    .address(account.addr)
    .notePrefix(encoded)
    .limit(limit)
    .do();
  return result.transactions || [];
}
