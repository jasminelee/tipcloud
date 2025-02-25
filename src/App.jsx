// src/App.jsx
import { useState, useEffect } from 'react';
import { getLocalStorage, isConnected } from '@stacks/connect';
import './App.css';
import { DJRegistryPage } from './components/DJRegistry';
import DjStats from './components/DjStats';
import TopDjs from './components/TopDjs';
import { recordTip, getUserTipHistory, getGlobalStats } from './services/tipPool';
import { sendStacksTip } from './services/stacksTransactions';
import CashOut from './components/CashOut';
import WalletConnection from './components/WalletConnection';

function TippingApp() {
  const [soundCloudLink, setSoundCloudLink] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [view, setView] = useState('tip');
  const [loading, setLoading] = useState(false);
  const [tipStatus, setTipStatus] = useState(null);
  const [userTips, setUserTips] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [selectedDj, setSelectedDj] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userConnected, setUserConnected] = useState(false);

  // Check wallet connection status and load user data
  useEffect(() => {
    const checkWalletConnection = () => {
      const connected = isConnected();
      setUserConnected(connected);
      
      if (connected) {
        const userData = getLocalStorage();
        const address = userData?.addresses?.mainnet || '';
        setUserAddress(address);
        
        // Load user's tip history
        const tipHistory = getUserTipHistory(address);
        setUserTips(tipHistory);
        
        // Load global stats
        const stats = getGlobalStats();
        setGlobalStats(stats);
      }
    };
    
    checkWalletConnection();
    
    // Set up an interval to periodically check connection status
    const interval = setInterval(checkWalletConnection, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to look up DJ's wallet address from SoundCloud link
  const lookupDjWallet = async (soundCloudLink) => {
    try {
      // Mock implementation - replace with actual API call
      return "SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN"; // Replace with actual lookup
    } catch (error) {
      console.error("Error looking up DJ wallet:", error);
      throw new Error("Could not find DJ wallet address");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userConnected) {
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
      
      // Send the tip using Stacks Connect
      const response = await sendStacksTip(
        djAddress, 
        amount, 
        `Tip for ${soundCloudLink}`
      );
      
      // Record the tip in our in-memory system
      const transaction = recordTip(
        djAddress,
        userAddress,
        amount,
        soundCloudLink,
        response.txId
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
          <button onClick={() => setView('cashout')}>Cash Out Tips</button>
        </nav>
      </header>

      <WalletConnection />

      {view === 'tip' ? (
        <div className="wallet-status">
          {!userConnected ? (
            <div className="connect-message">
              <p>Please connect your wallet to send tips</p>
            </div>
          ) : (
            <>
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
                    <label>Tip Amount (STX):</label>
                    <input 
                      type="number"
                      placeholder="0.01"
                      min="0.000001"
                      step="0.000001"
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
                  <p><strong>Amount:</strong> {tip.amount} STX</p>
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
            <p><strong>Total Tipped:</strong> {globalStats.totalTipped || 0} STX</p>
            <p><strong>Total Transactions:</strong> {globalStats.transactionCount || 0}</p>
            <p><strong>Unique DJs:</strong> {globalStats.uniqueDjs || 0}</p>
            <p><strong>Unique Tippers:</strong> {globalStats.uniqueTippers || 0}</p>
          </div>
        </div>
      ) : view === 'top-djs' ? (
        <TopDjs onSelectDj={handleSelectDj} />
      ) : view === 'dj-stats' ? (
        <DjStats djAddress={selectedDj} />
      ) : view === 'cashout' ? (
        <CashOut setView={setView} />
      ) : null}
    </div>
  );
}

function App() {
  return (
    <TippingApp />
  );
}

export default App;