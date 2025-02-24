// src/App.jsx
import { useState, useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { AppKitProvider } from './WalletProvider';
import './App.css';

function TippingApp() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [soundCloudLink, setSoundCloudLink] = useState('');
  const [tipAmount, setTipAmount] = useState('');

  // Debug log
  useEffect(() => {
    console.log('Connection state:', { isConnected, address });
  }, [isConnected, address]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sending tip:', { soundCloudLink, tipAmount, to: address });
  };

  return (
    <div className="app-container">
      <header>
        <h1>SoundCloud Tipping dApp</h1>
        <p>Support your favorite artists with ETH tips</p>
      </header>

      <div className="wallet-status">
        {!isConnected ? (
          <button onClick={open} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="connected-status">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="tip-container">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>SoundCloud Link:</label>
                  <input 
                    type="text"
                    placeholder="https://soundcloud.com/artist/track"
                    value={soundCloudLink}
                    onChange={(e) => setSoundCloudLink(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Tip Amount (ETH):</label>
                  <input 
                    type="number"
                    placeholder="0.01"
                    min="0.00000001"
                    step="0.00000001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                  />
                </div>
                <button type="submit">Send Tip</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AppKitProvider>
      <TippingApp />
    </AppKitProvider>
  );
}

export default App;