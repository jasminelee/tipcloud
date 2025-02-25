import React, { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';

function WalletConnection() {
  const [connected, setConnected] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is already connected
    const checkConnection = async () => {
      const isUserConnected = isConnected();
      setConnected(isUserConnected);
      
      if (isUserConnected) {
        const storedData = getLocalStorage();
        setUserData(storedData);
      }
    };
    
    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      const response = await connect();
      setConnected(true);
      setUserData(response);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnected(false);
    setUserData(null);
  };

  return (
    <div className="wallet-connection">
      {!connected ? (
        <button onClick={handleConnect}>Connect Stacks Wallet</button>
      ) : (
        <>
          <span className="wallet-address">
            {userData?.addresses?.mainnet ? 
              `${userData.addresses.mainnet.slice(0, 6)}...${userData.addresses.mainnet.slice(-4)}` : 
              'Wallet Connected'}
          </span>
          <button className="disconnect-button" onClick={handleDisconnect}>
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}

export default WalletConnection; 