// src/App.jsx
import { useState, useEffect } from 'react';
import { getLocalStorage, isConnected } from '@stacks/connect';
import './App.css';
import { DJRegistryPage } from './components/DJRegistry';
import DjStats from './components/DjStats';
import TopDjs from './components/TopDjs';
import { recordTip, getUserTipHistory, getGlobalStats } from './services/tipPool';
import { sendSbtcTip, getExplorerLink } from './services/sbtcTransactions';
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
  const [txId, setTxId] = useState('');

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
    
    // Set up interval to check connection status
    const interval = setInterval(checkWalletConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDj = (djAddress) => {
    setSelectedDj(djAddress);
    setView('dj-stats');
  };

  const lookupDjWallet = async (soundCloudLink) => {
    try {
      console.log("Looking up DJ for SoundCloud link:", soundCloudLink);
      
      // In a real app, you would query your database or smart contract
      // For now, check localStorage for registered DJs
      const storedDJs = localStorage.getItem('registeredDJs');
      if (storedDJs) {
        const djs = JSON.parse(storedDJs);
        console.log("Registered DJs:", djs);
        
        // Try to find an exact match first
        let matchingDJ = djs.find(dj => dj.soundcloudUrl === soundCloudLink);
        
        // If no exact match, try to find a partial match
        if (!matchingDJ) {
          matchingDJ = djs.find(dj => soundCloudLink.includes(dj.soundcloudUrl) || 
                                     dj.soundcloudUrl.includes(soundCloudLink));
        }
        
        if (matchingDJ) {
          console.log("Found matching DJ:", matchingDJ);
          return matchingDJ.address;
        }
      }
      
      console.log("No matching DJ found, using default address");
      // If no match found, return a placeholder address
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
    setTxId('');
    
    try {
      // Look up the DJ's wallet address from the SoundCloud link
      const djAddress = await lookupDjWallet(soundCloudLink);
      
      if (!djAddress) {
        throw new Error("Could not find a DJ registered with this SoundCloud link");
      }
      
      console.log("Found DJ address:", djAddress);
      
      // Parse tip amount
      const amount = parseFloat(tipAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid amount");
      }
      
      // Send the tip using sBTC
      const response = await sendSbtcTip(djAddress, amount);
      console.log("Transaction response:", response);
      
      // Record the transaction in our system
      const transaction = recordTip(
        djAddress,
        userAddress,
        amount,
        soundCloudLink,
        response.txId
      );
      
      setTxId(response.txId);
      setTipStatus('success');
      
      // Reset form
      setSoundCloudLink('');
      setTipAmount('');
      
      // Refresh user tips
      const tipHistory = getUserTipHistory(userAddress);
      setUserTips(tipHistory);
      
      // Refresh global stats
      const stats = getGlobalStats();
      setGlobalStats(stats);
    } catch (error) {
      console.error("Error sending tip:", error);
      setTipStatus('failed');
      alert(`Failed to send tip: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>SoundCloud DJ Tipping</h1>
        
        <nav className="nav-buttons">
          <button onClick={() => setView('tip')}>Send Tip</button>
          <button onClick={() => setView('register')}>Register as DJ</button>
          <button onClick={() => setView('history')}>My Tip History</button>
          <button onClick={() => setView('stats')}>Stats</button>
          <button onClick={() => setView('top-djs')}>Top DJs</button>
          <button onClick={() => setView('cashout')}>Cash Out</button>
        </nav>
        
        <WalletConnection />
      </header>

      {view === 'tip' ? (
        <div className="form-container">
          {!userConnected ? (
            <p>Please connect your wallet to send tips</p>
          ) : (
            <>
              <h2>Send a Tip to a DJ</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>SoundCloud Link:</label>
                  <input 
                    type="url"
                    placeholder="https://soundcloud.com/dj-name/track-name"
                    value={soundCloudLink}
                    onChange={(e) => setSoundCloudLink(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tip Amount (sBTC):</label>
                  <input 
                    type="number"
                    placeholder="0.0001"
                    min="0.00000001"
                    step="0.00000001"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    required
                  />
                  <small>Send sBTC tokens to the DJ</small>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Send Tip'}
                </button>
              </form>
              
              {tipStatus === 'processing' && (
                <div className="processing-message">
                  Processing your tip...
                </div>
              )}
              
              {tipStatus === 'failed' && (
                <div className="error-message">
                  Failed to send tip. Please try again.
                </div>
              )}
              
              {tipStatus === 'success' && (
                <div className="success-message">
                  <p>Tip sent successfully! Thank you for supporting the artist.</p>
                  {txId && (
                    <p>
                      Transaction ID: <a 
                        href={getExplorerLink(txId)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tx-hash"
                      >
                        {txId.slice(0, 8)}...{txId.slice(-8)}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : view === 'register' ? (
        <DJRegistryPage />
      ) : view === 'history' ? (
        <div className="history-container">
          <h2>My Tip History</h2>
          
          {userTips.length === 0 ? (
            <p>You haven't sent any tips yet</p>
          ) : (
            <div className="tip-history">
              {userTips.map(tip => (
                <div key={tip.id} className="tip-record">
                  <p><strong>Amount:</strong> {tip.amount} sBTC</p>
                  <p><strong>DJ:</strong> {tip.djAddress}</p>
                  <p><strong>Track:</strong> {tip.soundcloudLink}</p>
                  <p><strong>Date:</strong> {new Date(tip.timestamp).toLocaleString()}</p>
                  {tip.id.startsWith('0x') && (
                    <p>
                      <strong>Transaction:</strong> <a 
                        href={getExplorerLink(tip.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tx-hash"
                      >
                        View on Explorer
                      </a>
                    </p>
                  )}
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
            <p><strong>Total Tipped:</strong> {globalStats.totalTipped || 0} sBTC</p>
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