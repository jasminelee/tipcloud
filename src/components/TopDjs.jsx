import React, { useState, useEffect } from 'react';
import { getTopDjs } from '../services/tipPool';
import { sbtcToSatoshis, formatSatoshis } from '../services/sbtcTransactions';

function TopDjs({ onSelectDj }) {
  const [topDjs, setTopDjs] = useState([]);
  
  // Function to convert and format sBTC to satoshis for display
  const formatAmount = (sbtcAmount) => {
    const satoshis = sbtcToSatoshis(sbtcAmount);
    return formatSatoshis(satoshis);
  };
  
  useEffect(() => {
    // Load top DJs
    const djs = getTopDjs(10);
    setTopDjs(djs);
  }, []);
  
  return (
    <div className="top-djs">
      <h2>Top DJs</h2>
      
      {topDjs.length === 0 ? (
        <p>No DJ data available yet</p>
      ) : (
        <div className="dj-list">
          {topDjs.map((dj, index) => (
            <div 
              key={dj.address} 
              className="dj-item"
              onClick={() => onSelectDj && onSelectDj(dj.address)}
            >
              <div className="dj-rank">{index + 1}</div>
              <div className="dj-info">
                <p className="dj-address">{dj.address.slice(0, 6)}...{dj.address.slice(-4)}</p>
                <p className="dj-stats">
                  {formatAmount(dj.totalReceived)} from {dj.uniqueTippers} tippers
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopDjs; 