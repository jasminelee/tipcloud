import { useState, useEffect } from 'react';
import { DJRegistry } from '../services/djRegistry.js';
import './DJRegistry.css';

export function DJRegistryPage() {
  const [soundCloudUrl, setSoundCloudUrl] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [registeredDJs, setRegisteredDJs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load existing DJs
    setRegisteredDJs(DJRegistry.getAllDJs());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      DJRegistry.registerDJ(soundCloudUrl, btcAddress);
      // Reset form
      setSoundCloudUrl('');
      setBtcAddress('');
      // Refresh DJ list
      setRegisteredDJs(DJRegistry.getAllDJs());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dj-registry">
      <h2>Register DJ Profile</h2>
      
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label>SoundCloud Profile URL:</label>
          <input
            type="url"
            value={soundCloudUrl}
            onChange={(e) => setSoundCloudUrl(e.target.value)}
            placeholder="https://soundcloud.com/dj-name"
            required
          />
        </div>

        <div className="form-group">
          <label>BTC Address:</label>
          <input
            type="text"
            value={btcAddress}
            onChange={(e) => setBtcAddress(e.target.value)}
            placeholder="Enter BTC address"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit">Register DJ</button>
      </form>

      <div className="registered-djs">
        <h3>Registered DJs</h3>
        <table>
          <thead>
            <tr>
              <th>SoundCloud Profile</th>
              <th>BTC Address</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            {registeredDJs.map((dj) => (
              <tr key={dj.soundCloudUrl}>
                <td>
                  <a href={dj.soundCloudUrl} target="_blank" rel="noopener noreferrer">
                    {dj.soundCloudUrl.split('/').pop()}
                  </a>
                </td>
                <td>{dj.btcAddress.slice(0, 6)}...{dj.btcAddress.slice(-4)}</td>
                <td>{new Date(dj.registeredAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 