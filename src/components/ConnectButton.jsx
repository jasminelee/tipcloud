import { useAppKit } from '@reown/appkit/react'

export function ConnectButton() {
  const { open, isConnected, address } = useAppKit()

  return (
    <button onClick={open}>
      {isConnected ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
    </button>
  )
} 