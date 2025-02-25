import React, { useState, useEffect } from 'react';
import { getDjStats, getDjTransactions } from '../services/tipPool';

function DjStats({ djAddress }) {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    if (djAddress) {
      // Load DJ stats
      const djStats = getDjStats(djAddress);
      setStats(djStats);
      
      // Load DJ transactions
      const txHistory = getDjTransactions(djAddress);
      setTransactions(txHistory);
    }
  }, [djAddress]);
  
  if (!djAddress) {
    return <p>Please select a DJ to view stats</p>;
  }
  
  if (!stats) {
    return <p>Loading stats...</p>;
  }
  
  return (
    <div className="dj-stats">
      <h2>DJ Stats: {djAddress.slice(0, 6)}...{djAddress.slice(-4)}</h2>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Received</h3>
          <p className="stat-value">{stats.totalReceived} STX</p>
        </div>
        
        <div className="stat-card">
          <h3>Tip Count</h3>
          <p className="stat-value">{stats.tipCount}</p>
        </div>
        
        <div className="stat-card">
          <h3>Unique Tippers</h3>
          <p className="stat-value">{stats.uniqueTippers}</p>
        </div>
      </div>
      
      <h3>Top Tracks</h3>
      <div className="tracks-list">
        {Object.entries(stats.tracks).length === 0 ? (
          <p>No track data available</p>
        ) : (
          Object.entries(stats.tracks)
            .sort(([, a], [, b]) => b.totalReceived - a.totalReceived)
            .map(([track, trackStats]) => (
              <div key={track} className="track-item">
                <p className="track-link">{track}</p>
                <p className="track-stats">
                  {trackStats.totalReceived} STX ({trackStats.tipCount} tips)
                </p>
              </div>
            ))
        )}
      </div>
      
      <h3>Recent Transactions</h3>
      <div className="transactions-list">
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
            .map(tx => (
              <div key={tx.id} className="transaction-item">
                <p>
                  <strong>{tx.amount} STX</strong> from {tx.userAddress.slice(0, 6)}...{tx.userAddress.slice(-4)}
                </p>
                <p className="transaction-date">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default DjStats; 