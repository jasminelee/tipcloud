import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '54470e69bfc8da68e6250ccd786c8065'

// 2. Create a metadata object - optional
const metadata = {
  name: 'Tip Cloud',
  description: 'SoundCloud Tipping dApp',
  url: window.location.origin,
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 3. Set the networks
const networks = [mainnet, arbitrum]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true  // Changed to false for client-side only
})

// 5. Create modal
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata
})

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}