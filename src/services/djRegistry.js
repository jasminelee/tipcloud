// Simple in-memory storage (replace with proper database later)
const djDatabase = new Map();

export class DJRegistry {
  static registerDJ(soundCloudUrl, btcAddress) {
    // Basic validation
    if (!soundCloudUrl.includes('soundcloud.com')) {
      throw new Error('Invalid SoundCloud URL');
    }
    if (!btcAddress.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-zAC-HJ-NP-Z02-9]{11,71}$/)) {
      throw new Error('Invalid BTC address');
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
} 