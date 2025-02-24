import { useState } from 'react';
import { DJRegistry } from '../services/djRegistry';

export function DJVerification() {
  const [soundCloudProfile, setSoundCloudProfile] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // 1. Verify ownership of SoundCloud profile
      // This could be done by having the DJ add a specific verification code
      // to their SoundCloud profile description
      
      // 2. Register the BTC address
      await DJRegistry.verifyDJ(soundCloudProfile, btcAddress);

      alert('Successfully verified and registered!');
    } catch (error) {
      alert('Verification failed: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="dj-verification">
      <h2>Verify Your DJ Profile</h2>
      <form onSubmit={handleVerification}>
        <div className="form-group">
          <label>Your SoundCloud Profile URL:</label>
          <input
            type="url"
            value={soundCloudProfile}
            onChange={(e) => setSoundCloudProfile(e.target.value)}
            placeholder="https://soundcloud.com/your-username"
            required
          />
        </div>
        <div className="form-group">
          <label>Your BTC Address:</label>
          <input
            type="text"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            placeholder="Enter your BTC address"
            required
          />
        </div>
        <button type="submit" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify Profile'}
        </button>
      </form>
    </div>
  );
} 