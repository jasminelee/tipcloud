import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for wallet connection
import { tipPool } from '../services/tipPoolStore';
import { DJRegistry } from '../services/djRegistry';

const djRegistry = new DJRegistry();

function CashOut({ setView }) {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [isDJ, setIsDJ] = useState(false);

  useEffect(() => {
    if (address && isConnected) {
      // Check if connected wallet belongs to a registered DJ
      const isDJRegistered = djRegistry.isDJRegistered(address);
      setIsDJ(isDJRegistered);
      
      if (isDJRegistered) {
        // Get DJ's current balance
        const djBalance = tipPool.getDJBalance(address) || 0;
        setBalance(djBalance);
      }
    } else {
      setIsDJ(false);
      setBalance(0);
    }
  }, [address, isConnected]);

  const handleCashOut = async (e) => {
    e.preventDefault();
    
    // Verify the user is connected and is a registered DJ
    if (!address || !isConnected || !isDJ) {
      setStatus('error');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0 || amount > balance) {
      setStatus('error');
      return;
    }

    setStatus('processing');

    try {
      // Process withdrawal
      const result = await tipPool.withdrawTips(address, amount);
      
      // In a real app, this would trigger an actual Bitcoin transaction
      // For demo purposes, we're just updating the in-memory balance
      
      setBalance(result.remainingBalance);
      setTxHash('tx_' + Math.random().toString(36).substring(2, 15));
      setStatus('success');
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setStatus('error');
    }
  };

  // If not connected, prompt to connect
  if (!isConnected) {
    return (
      <div className="white-container">
        <h2>Cash Out Your Tips</h2>
        <p>Please connect your wallet to access this feature.</p>
        <button className="submit-button">Connect Wallet</button>
      </div>
    );
  }

  // If connected but not a DJ, show registration prompt
  if (!isDJ) {
    return (
      <div className="white-container">
        <h2>Cash Out Your Tips</h2>
        <p>You need to be a registered DJ to access this feature.</p>
        <button 
          className="submit-button"
          onClick={() => setView('register')}
        >
          Register as DJ
        </button>
      </div>
    );
  }

  return (
    <div className="white-container">
      <h2>Cash Out Your Tips</h2>
      
      <div className="balance-display">
        <h3>Your Current Balance</h3>
        <p className="balance-amount">{balance} BTC</p>
      </div>
      
      <form onSubmit={handleCashOut}>
        <div className="form-group">
          <label>Amount to Withdraw (BTC):</label>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
            min="0.00000001"
            step="0.00000001"
            max={balance}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={status === 'processing' || !balance}
        >
          {status === 'processing' ? 'Processing...' : 'Cash Out'}
        </button>
      </form>
      
      {status === 'success' && (
        <div className="success-message">
          <p>Successfully cashed out {withdrawAmount} BTC!</p>
          <p>Transaction: <span className="tx-hash">{txHash}</span></p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="error-message">
          <p>Error processing withdrawal. Please try again.</p>
        </div>
      )}
      
      <div className="withdrawal-history">
        <h3>Recent Withdrawals</h3>
        {/* In a real app, you would fetch and display withdrawal history */}
        <p>No recent withdrawals</p>
      </div>
    </div>
  );
}

export default CashOut; 