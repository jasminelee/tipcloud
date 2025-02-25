import React, { useState, useEffect } from 'react';
import { getLocalStorage, isConnected } from '@stacks/connect';
import './DJRegistry.css';

export function DJRegistryPage() {
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [registeredDJs, setRegisteredDJs] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if user is connected
    const checkConnection = () => {
      const isUserConnected = isConnected();
      setConnected(isUserConnected);
      
      if (isUserConnected) {
        const userData = getLocalStorage();
        const address = userData?.addresses?.mainnet || '';
        setUserAddress(address);
      }
    };
    
    checkConnection();
    
    // Load registered DJs from localStorage (in a real app, this would come from a database or blockchain)
    const loadRegisteredDJs = () => {
      const storedDJs = localStorage.getItem('registeredDJs');
      if (storedDJs) {
        setRegisteredDJs(JSON.parse(storedDJs));
      }
    };
    
    loadRegisteredDJs();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }
    
    if (!soundcloudUrl) {
      alert("Please enter your SoundCloud URL");
      return;
    }
    
    setIsRegistering(true);
    setRegistrationStatus('processing');
    
    try {
      // In a real app, this would be a blockchain transaction to register the DJ
      // For now, we'll just simulate it with localStorage
      
      // Check if this SoundCloud URL is already registered
      const isDuplicate = registeredDJs.some(dj => dj.soundcloudUrl === soundcloudUrl);
      
      if (isDuplicate) {
        throw new Error("This SoundCloud URL is already registered");
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new DJ record
      const newDJ = {
        address: userAddress,
        soundcloudUrl,
        registrationDate: new Date().toISOString()
      };
      
      // Update state and localStorage
      const updatedDJs = [...registeredDJs, newDJ];
      setRegisteredDJs(updatedDJs);
      localStorage.setItem('registeredDJs', JSON.stringify(updatedDJs));
      
      setRegistrationStatus('success');
      setSoundcloudUrl('');
      
      // Reset status after a few seconds
      setTimeout(() => {
        setRegistrationStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus('failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="form-container">
      <div>
        <h2>Register as a DJ</h2>
        
        {!connected ? (
          <p>Please connect your Stacks wallet to register as a DJ</p>
        ) : (
          <>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Your SoundCloud URL:</label>
                <input
                  type="url"
                  placeholder="https://soundcloud.com/your-profile"
                  value={soundcloudUrl}
                  onChange={(e) => setSoundcloudUrl(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
            </form>
            
            {registrationStatus === 'success' && (
              <div className="success-message">
                Registration successful! You can now receive tips.
              </div>
            )}
            
            {registrationStatus === 'failed' && (
              <div className="error-message">
                Registration failed. This SoundCloud URL may already be registered.
              </div>
            )}
          </>
        )}
        
        <h3>Registered DJs</h3>
        {registeredDJs.length === 0 ? (
          <p>No DJs registered yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Stacks Address</th>
                <th>SoundCloud URL</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {registeredDJs.map((dj, index) => (
                <tr key={index}>
                  <td>{dj.address.slice(0, 6)}...{dj.address.slice(-4)}</td>
                  <td>
                    <a href={dj.soundcloudUrl} target="_blank" rel="noopener noreferrer">
                      {dj.soundcloudUrl.replace('https://soundcloud.com/', '')}
                    </a>
                  </td>
                  <td>{new Date(dj.registrationDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 