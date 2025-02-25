// src/App.jsx
import { useState, useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { AppKitProvider } from './WalletProvider';
import './App.css';
import { DJRegistryPage } from './components/DJRegistry';
import DjStats from './components/DjStats';
import TopDjs from './components/TopDjs';
import { recordTip, getUserTipHistory, getGlobalStats } from './services/tipPool';

function TippingApp() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [soundCloudLink, setSoundCloudLink] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [view, setView] = useState('tip');
  const [loading, setLoading] = useState(false);
  const [tipStatus, setTipStatus] = useState(null);
  const [userTips, setUserTips] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [selectedDj, setSelectedDj] = useState('');

  // Debug log
  useEffect(() => {
    console.log('Connection state:', { isConnected, address });
    
    // Load user's tip history when connected
    if (isConnected && address) {
      const tipHistory = getUserTipHistory(address);
      setUserTips(tipHistory);
      
      // Load global stats
      const stats = getGlobalStats();
      setGlobalStats(stats);
    }
  }, [isConnected, address]);

  // Function to look up DJ's wallet address from SoundCloud link
  const lookupDjWallet = async (soundCloudLink) => {
    // This would be replaced with your actual lookup logic
    // that queries your DJ registry contract or database
    try {
      // Mock implementation - replace with actual API call
      // For now, returning a placeholder
      return "0x1234567890123456789012345678901234567890"; // Replace with actual lookup
    } catch (error) {
      console.error("Error looking up DJ wallet:", error);
      throw new Error("Could not find DJ wallet address");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    setTipStatus('processing');
    
    try {
      // Look up the DJ's wallet address from the SoundCloud link
      const djAddress = await lookupDjWallet(soundCloudLink);
      
      // Parse tip amount
      const amount = parseFloat(tipAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid tip amount");
      }
      
      // In a real implementation, you would send the actual transaction here
      // For now, we'll just simulate a successful transaction
      
      // Generate a mock transaction ID
      const mockTxId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Record the tip in our in-memory system
      const transaction = recordTip(
        djAddress,
        address,
        amount,
        soundCloudLink,
        mockTxId
      );
      
      // Update user's tip history
      setUserTips([...userTips, transaction]);
      
      // Update global stats
      setGlobalStats(getGlobalStats());
      
      setTipStatus('success');
      
      // Reset form
      setTimeout(() => {
        setSoundCloudLink('');
        setTipAmount('');
        setTipStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending tip:', error);
      setTipStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDj = (djAddress) => {
    setSelectedDj(djAddress);
    setView('dj-stats');
  };

  return (
    <div className="app-container">
      <header>
        <h1>SoundCloud Tipping dApp</h1>
        <nav>
          <button onClick={() => setView('tip')}>Send Tips</button>
          <button onClick={() => setView('register')}>Register DJ</button>
          <button onClick={() => setView('history')}>My Tip History</button>
          <button onClick={() => setView('stats')}>Stats</button>
          <button onClick={() => setView('top-djs')}>Top DJs</button>
        </nav>
      </header>

      {view === 'tip' ? (
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
                      required
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
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Send Tip'}
                  </button>
                </form>
                
                {tipStatus === 'success' && (
                  <div className="success-message">
                    Tip sent successfully! Thank you for supporting the artist.
                  </div>
                )}
                
                {tipStatus === 'failed' && (
                  <div className="error-message">
                    Failed to send tip. Please try again.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : view === 'register' ? (
        <DJRegistryPage />
      ) : view === 'history' ? (
        <div className="history-container">
          <h2>My Tip History</h2>
          {userTips.length === 0 ? (
            <p>You haven't sent any tips yet.</p>
          ) : (
            <div className="tip-history">
              {userTips.map(tip => (
                <div key={tip.id} className="tip-record">
                  <p><strong>Amount:</strong> {tip.amount} ETH</p>
                  <p><strong>DJ:</strong> {tip.djAddress}</p>
                  <p><strong>Track:</strong> {tip.soundcloudLink}</p>
                  <p><strong>Date:</strong> {new Date(tip.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : view === 'stats' ? (
        <div className="stats-container">
          <h2>Tipping Stats</h2>
          <div className="global-stats">
            <h3>Global Stats</h3>
            <p><strong>Total Tipped:</strong> {globalStats.totalTipped || 0} ETH</p>
            <p><strong>Total Transactions:</strong> {globalStats.transactionCount || 0}</p>
            <p><strong>Unique DJs:</strong> {globalStats.uniqueDjs || 0}</p>
            <p><strong>Unique Tippers:</strong> {globalStats.uniqueTippers || 0}</p>
          </div>
        </div>
      ) : view === 'top-djs' ? (
        <TopDjs onSelectDj={handleSelectDj} />
      ) : view === 'dj-stats' ? (
        <DjStats djAddress={selectedDj} />
      ) : null}
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