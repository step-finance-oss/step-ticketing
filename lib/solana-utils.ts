import {
  Connection,
  ConfirmOptions,
  TokenBalance,
  TransactionResponse,
  SendOptions,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js"
import { TransactionFetchError } from "./error"

const USDC_MINT_ADDRESS = process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS
const RECIPIENT_PUBLIC_KEY = process.env.NEXT_PUBLIC_RECIPIENT_PUBLIC_KEY

export async function sendAndConfirmTransactionAsRawWithConfirmationStrategy(
  connection: Connection,
  transaction: Transaction,
  options?: ConfirmOptions
) {
  const sendOptions: SendOptions = { maxRetries: 5 }
  const blockhash = transaction.recentBlockhash

  const { lastValidBlockHeight } = await connection.getLatestBlockhash(options)

  if (!blockhash) throw new Error("recentBlockhash is absent.")

  const signature = await connection.sendRawTransaction(
    transaction.serialize(),
    sendOptions
  )

  const confirmationOptions = {
    lastValidBlockHeight,
    blockhash,
    signature,
  }

  // at this point we have transaction successfully sent to blockchain
  const { value } = await connection.confirmTransaction(
    confirmationOptions,
    options?.commitment
  )

  if (value.err !== null) {
    throw new Error("Can not confirm transaction.")
  }

  return signature
}

export async function validateIncomingSignedTransactionById(
  connection: Connection,
  txId: TransactionSignature,
  desiredAmount: bigint,
  serializedQuote: string
) {
  const quote = Transaction.from(Buffer.from(serializedQuote, "base64"))
  let tx: TransactionResponse | null
  try {
    tx = await connection.getTransaction(txId, { commitment: "confirmed" })
  } catch (error) {
    console.log(error)
    throw new TransactionFetchError(txId)
  }

  if (!tx) throw new TransactionFetchError(txId)
  if (!tx.meta) throw new Error("Transaction was not executed.")
  if (tx.meta.err !== null) throw new Error("Transaction failed to execute.")

  const { message, signatures } = tx.transaction
  const transfer = quote.instructions[0]
  const payer = quote.feePayer
  if (!payer || !transfer || signatures[0] !== txId) {
    throw new Error("Transaction does not match the purchase.")
  }

  if (transfer.keys.length === 3) {
    // Older quotes have no order reference. Only their original signed message qualifies.
    if (!quote.serializeMessage().equals(message.serialize())) {
      throw new Error("Transaction does not match the purchase.")
    }
  } else {
    // Wallets may refresh the blockhash or add fees. Match the referenced transfer itself.
    const confirmed = Transaction.populate(message)
    const matched = confirmed.instructions.some(
      (instruction) =>
        instruction.programId.equals(transfer.programId) &&
        instruction.data.equals(transfer.data) &&
        instruction.keys.length === transfer.keys.length &&
        instruction.keys.every(({ pubkey }, i) =>
          pubkey.equals(transfer.keys[i].pubkey)
        )
    )
    if (
      !matched ||
      !message.accountKeys.some(
        (key, i) => key.equals(payer) && message.isAccountSigner(i)
      )
    ) {
      throw new Error("Transaction does not match the purchase.")
    }
  }

  const recipientIndex = message.accountKeys.findIndex((key) =>
    key.equals(transfer.keys[1].pubkey)
  )
  const recipientBalance = (balance: TokenBalance) =>
    balance.accountIndex === recipientIndex &&
    balance.owner === RECIPIENT_PUBLIC_KEY &&
    balance.mint === USDC_MINT_ADDRESS
  const before = tx.meta.preTokenBalances?.find(recipientBalance)
  const after = tx.meta.postTokenBalances?.find(recipientBalance)
  if (
    !before ||
    !after ||
    BigInt(after.uiTokenAmount.amount) - BigInt(before.uiTokenAmount.amount) !==
      desiredAmount
  ) {
    throw new Error("Transferred amount does not match the expected.")
  }

  return payer.toBase58()
}
