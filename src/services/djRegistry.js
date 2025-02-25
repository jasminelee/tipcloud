// Simple in-memory storage (replace with proper database later)
const djDatabase = new Map();

export class DJRegistry {
  static registerDJ(soundCloudUrl, btcAddress) {
    // Basic validation
    if (!soundCloudUrl.includes('soundcloud.com')) {
      throw new Error('Invalid SoundCloud URL');
    }
    // Check if btcAddress is a valid Bitcoin address
    const btcAddressRegex = /^([13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|tb1[a-z0-9]{39,59}|bcrt1[a-z0-9]{39,59})$/;
    if (!btcAddressRegex.test(btcAddress)) {
      throw new Error('Invalid Bitcoin address');
    }

    // Store DJ info
    djDatabase.set(soundCloudUrl, {
      btcAddress,
      registeredAt: new Date().toISOString()
    });

    return { soundCloudUrl, btcAddress };
  }

  static getDJBtcAddress(soundCloudUrl) {
    const djInfo = djDatabase.get(soundCloudUrl);
    if (!djInfo) {
      throw new Error('DJ not registered');
    }
    return djInfo.btcAddress;
  }

  static getAllDJs() {
    return Array.from(djDatabase.entries()).map(([url, info]) => ({
      soundCloudUrl: url,
      ...info
    }));
  }

  isDJRegistered(address) {
    for (const djInfo of djDatabase.values()) {
      if (djInfo.btcAddress === address) {
        return true;
      }
    }
    return false;
  }
} 