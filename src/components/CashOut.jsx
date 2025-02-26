import React, { useState, useEffect } from 'react';
import { getLocalStorage, isConnected } from '@stacks/connect';
import { getDjBalance, getDjTransactions } from '../services/tipPool';
import { getExplorerLink, sbtcToSatoshis, satoshisToSbtc, formatSatoshis } from '../services/sbtcTransactions';

function CashOut({ setView }) {
  const [balance, setBalance] = useState(0); // Balance in sBTC
  const [withdrawAmount, setWithdrawAmount] = useState(''); // Amount in satoshis
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [connected, setConnected] = useState(false);

  // Function to convert and format sBTC to satoshis for display
  const formatAmount = (sbtcAmount) => {
    const satoshis = sbtcToSatoshis(sbtcAmount);
    return formatSatoshis(satoshis);
  };
  
  // Get balance in satoshis for display
  const balanceInSatoshis = sbtcToSatoshis(balance);

  useEffect(() => {
    const checkConnection = () => {
      const isUserConnected = isConnected();
      setConnected(isUserConnected);
      
      if (isUserConnected) {
        const userData = getLocalStorage();
        const address = userData?.addresses?.mainnet || '';
        setUserAddress(address);
        
        // Get DJ balance
        const djBalance = getDjBalance(address);
        setBalance(djBalance);
        
        // Get DJ transactions
        const txHistory = getDjTransactions(address);
        setTransactions(txHistory);
      }
    };
    
    checkConnection();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }
    
    const satoshiAmount = parseInt(withdrawAmount, 10);
    
    if (isNaN(satoshiAmount) || satoshiAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (satoshiAmount > balanceInSatoshis) {
      alert("Withdrawal amount exceeds your balance");
      return;
    }
    
    setLoading(true);
    setStatus('processing');
    
    try {
      // In a real implementation, you would initiate a blockchain transaction here
      // For now, we'll just simulate a successful withdrawal
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update balance (in a real app, this would happen after blockchain confirmation)
      setBalance(prevBalance => prevBalance - satoshisToSbtc(satoshiAmount));
      
      setStatus('success');
      setWithdrawAmount('');
      
      // Reset status after a few seconds
      setTimeout(() => {
        setStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="cashout-container">
        <h2>Cash Out Your Tips</h2>
        <p>Please connect your wallet to view your balance and withdraw funds.</p>
      </div>
    );
  }

  return (
    <div className="cashout-container">
      <h2>Cash Out Your Tips</h2>
      
      <div className="balance-display">
        <p>Your Current Balance:</p>
        <p className="balance-amount">{formatSatoshis(balanceInSatoshis)}</p>
      </div>
      
      <form onSubmit={handleWithdraw}>
        <div className="form-group">
          <label>Amount to Withdraw (in satoshis):</label>
          <input
            type="number"
            placeholder="Enter amount in satoshis"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            max={balanceInSatoshis}
            min="1000"
            step="1000"
            required
          />
          <small>Minimum withdrawal: 1,000 satoshis</small>
        </div>
        
        <button type="submit" disabled={loading || balance <= 0}>
          {loading ? 'Processing...' : 'Withdraw Satoshis'}
        </button>
      </form>
      
      {status === 'success' && (
        <div className="success-message">
          Withdrawal successful! Funds have been sent to your wallet.
        </div>
      )}
      
      {status === 'failed' && (
        <div className="error-message">
          Withdrawal failed. Please try again.
        </div>
      )}
      
      {transactions.length > 0 && (
        <div className="withdrawal-history">
          <h3>Recent Tip Transactions</h3>
          <div className="transactions-list">
            {transactions
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5)
              .map(tx => (
                <div key={tx.id} className="transaction-item">
                  <p>
                    <strong>{formatAmount(tx.amount)}</strong> from {tx.userAddress.slice(0, 6)}...{tx.userAddress.slice(-4)}
                  </p>
                  <p className="transaction-date">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                  {tx.id.startsWith('0x') && (
                    <p>
                      <a 
                        href={getExplorerLink(tx.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tx-link"
                      >
                        View Transaction
                      </a>
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CashOut; 