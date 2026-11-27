import dynamic from "next/dynamic"

const NoSSRWalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
  }
)

const SolanaWalletMultiButton: React.FC = () => {
  return <NoSSRWalletMultiButton />
}

export default SolanaWalletMultiButton
