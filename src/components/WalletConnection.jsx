import { useAccount, useDisconnect } from 'wagmi';

function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return null; // Or render a connect button if needed
  }

  return (
    <div className="wallet-connection">
      <div className="wallet-address">
        Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      <button 
        className="disconnect-button"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}

export default WalletConnection; 