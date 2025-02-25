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
        // Get user's address from Stacks Connect
        const userData = getLocalStorage();
        const address = userData?.addresses?.stx?.[0]?.address || '';
        setUserAddress(address);
  
        console.log("User address for DJ registration:", address);
      }
    };
    
    checkConnection();
    
    // Load registered DJs from localStorage
    const loadRegisteredDJs = () => {
      const storedDJs = localStorage.getItem('registeredDJs');
      if (storedDJs) {
        setRegisteredDJs(JSON.parse(storedDJs));
      }
    };
    
    loadRegisteredDJs();
    
    // Set up interval to periodically check connection status
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
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
    
    if (!userAddress) {
      alert("Could not detect your wallet address. Please reconnect your wallet.");
      return;
    }
    
    console.log("Registering DJ with address:", userAddress);
    
    // Validate SoundCloud URL format
    if (!soundcloudUrl.startsWith('https://soundcloud.com/')) {
      alert("Please enter a valid SoundCloud URL (https://soundcloud.com/...)");
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
      
      console.log("Registering new DJ:", newDJ);
      
      // Update state and localStorage
      const updatedDJs = [...registeredDJs, newDJ];
      setRegisteredDJs(updatedDJs);
      localStorage.setItem('registeredDJs', JSON.stringify(updatedDJs));
      
      setRegistrationStatus('success');
      setSoundcloudUrl('');
    } catch (error) {
      console.error('Error registering DJ:', error);
      setRegistrationStatus('failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const registerTestDJ = () => {
    // Create a test DJ with the default address
    const testDJ = {
      address: "SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN",
      soundcloudUrl: "https://soundcloud.com/test-dj",
      registrationDate: new Date().toISOString()
    };
    
    // Get existing DJs
    let djs = [];
    const storedDJs = localStorage.getItem('registeredDJs');
    if (storedDJs) {
      djs = JSON.parse(storedDJs);
    }
    
    // Add test DJ if not already present
    if (!djs.some(dj => dj.soundcloudUrl === testDJ.soundcloudUrl)) {
      djs.push(testDJ);
      localStorage.setItem('registeredDJs', JSON.stringify(djs));
      setRegisteredDJs(djs);
      alert("Test DJ registered successfully!");
    } else {
      alert("Test DJ already registered");
    }
  };

  return (
    <div className="dj-registry">
      <h2>Register as a DJ</h2>
      
      {!connected ? (
        <div className="connect-prompt">
          <p>Please connect your wallet to register as a DJ</p>
        </div>
      ) : (
        <>
          <div className="wallet-info">
            <p>Connected with wallet:</p>
            <div className="address-display">
              {userAddress || "Address not available"}
            </div>
            <p className="info-text">This address will receive tips sent to your SoundCloud tracks</p>
          </div>
          
          <form onSubmit={handleRegister} className="registration-form">
            <div className="form-group">
              <label>Your SoundCloud URL:</label>
              <input
                type="url"
                placeholder="https://soundcloud.com/your-profile"
                value={soundcloudUrl}
                onChange={(e) => setSoundcloudUrl(e.target.value)}
                required
              />
              <small>Enter the URL to your SoundCloud profile or a specific track</small>
            </div>
            
            <div className="registration-summary">
              <p>You are registering:</p>
              <ul>
                <li><strong>SoundCloud:</strong> {soundcloudUrl || "Not specified yet"}</li>
                <li><strong>Wallet Address:</strong> {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Not available"}</li>
              </ul>
            </div>
            
            <button 
              type="submit" 
              disabled={isRegistering || !userAddress} 
              className="submit-button"
            >
              {isRegistering ? 'Registering...' : 'Register as DJ'}
            </button>
          </form>
          
          {registrationStatus === 'success' && (
            <div className="success-message">
              <p>Registration successful! You can now receive tips.</p>
              <p>Share your SoundCloud links with fans to start receiving tips!</p>
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
              <th>Wallet Address</th>
              <th>SoundCloud URL</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {registeredDJs.map((dj, index) => (
              <tr key={index}>
                <td className="address-cell">
                  <span className="stx-address">{dj.address ? `${dj.address.slice(0, 6)}...${dj.address.slice(-4)}` : "No address"}</span>
                </td>
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
      
      <button type="button" onClick={registerTestDJ} className="test-button">
        Register Test DJ
      </button>
    </div>
  );
} 