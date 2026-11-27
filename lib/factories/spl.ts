import { PublicKey, Transaction } from "@solana/web3.js"
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"

export const USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

export const serializedTxFactory: (
  senderAddr: string,
  recipientAddr: string,
  amount: number
) => string = (senderAddr, recipientAddr, amount) => {
  const senderPubKey = new PublicKey(senderAddr)
  const recipientPubKey = new PublicKey(recipientAddr)
  const senderTokenAddress = getAssociatedTokenAddressSync(
    new PublicKey(USDC_MINT_ADDRESS),
    senderPubKey
  )
  const recipientTokenAddress = getAssociatedTokenAddressSync(
    new PublicKey(USDC_MINT_ADDRESS),
    recipientPubKey
  )
  const tx = new Transaction()
  tx.add(
    createTransferInstruction(
      senderTokenAddress,
      recipientTokenAddress,
      recipientPubKey,
      amount * 1e6,
      [],
      TOKEN_PROGRAM_ID
    )
  )
  tx.feePayer = senderTokenAddress
  tx.recentBlockhash = senderAddr
  return tx.serialize({ requireAllSignatures: false }).toString("base64")
}
