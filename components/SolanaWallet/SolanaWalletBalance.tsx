import { useEffect, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

import "@solana/wallet-adapter-react-ui/styles.css"

import { LAMPORTS_PER_SOL } from "@solana/web3.js"

const SolanaWalletBalance: React.FC = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [balance, setBalance] = useState("")

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((res) => {
        setBalance(`${res / LAMPORTS_PER_SOL} SOL`)
      })
    }
  }, [publicKey, connection])

  if (!publicKey || !balance) return null

  return <>Balance: {balance}</>
}

export default SolanaWalletBalance
