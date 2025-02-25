// src/services/tipPool.js

// In-memory storage for our tip pool
const tipPool = {
  // Track DJ balances
  balances: {},
  
  // Track all transactions
  transactions: [],
  
  // Track stats per DJ
  djStats: {},
  
  // Track user tipping history
  userTipHistory: {}
};

/**
 * Record a new tip transaction
 * @param {string} djAddress - The DJ's wallet address
 * @param {string} userAddress - The tipper's wallet address
 * @param {number} amount - The amount in BTC
 * @param {string} soundcloudLink - The SoundCloud link that was tipped
 * @param {string} transactionId - The blockchain transaction ID
 * @returns {object} The recorded transaction
 */
export const recordTip = (djAddress, userAddress, amount, soundcloudLink, transactionId) => {
  // Create transaction object
  const transaction = {
    id: transactionId || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    djAddress,
    userAddress,
    amount,
    soundcloudLink,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  
  // Add to transactions list
  tipPool.transactions.push(transaction);
  
  // Update DJ balance
  if (!tipPool.balances[djAddress]) {
    tipPool.balances[djAddress] = 0;
  }
  tipPool.balances[djAddress] += amount;
  
  // Update DJ stats
  if (!tipPool.djStats[djAddress]) {
    tipPool.djStats[djAddress] = {
      totalReceived: 0,
      tipCount: 0,
      uniqueTippers: new Set(),
      tracks: {}
    };
  }
  
  tipPool.djStats[djAddress].totalReceived += amount;
  tipPool.djStats[djAddress].tipCount += 1;
  tipPool.djStats[djAddress].uniqueTippers.add(userAddress);
  
  // Track per-track stats
  if (!tipPool.djStats[djAddress].tracks[soundcloudLink]) {
    tipPool.djStats[djAddress].tracks[soundcloudLink] = {
      totalReceived: 0,
      tipCount: 0
    };
  }
  
  tipPool.djStats[djAddress].tracks[soundcloudLink].totalReceived += amount;
  tipPool.djStats[djAddress].tracks[soundcloudLink].tipCount += 1;
  
  // Update user tip history
  if (!tipPool.userTipHistory[userAddress]) {
    tipPool.userTipHistory[userAddress] = [];
  }
  
  tipPool.userTipHistory[userAddress].push(transaction);
  
  return transaction;
};

/**
 * Get a DJ's current balance
 * @param {string} djAddress - The DJ's wallet address
 * @returns {number} The DJ's balance in BTC
 */
export const getDjBalance = (djAddress) => {
  return tipPool.balances[djAddress] || 0;
};

/**
 * Get all transactions for a DJ
 * @param {string} djAddress - The DJ's wallet address
 * @returns {Array} List of transactions
 */
export const getDjTransactions = (djAddress) => {
  return tipPool.transactions.filter(tx => tx.djAddress === djAddress);
};

/**
 * Get all transactions from a user
 * @param {string} userAddress - The user's wallet address
 * @returns {Array} List of transactions
 */
export const getUserTipHistory = (userAddress) => {
  return tipPool.userTipHistory[userAddress] || [];
};

/**
 * Get stats for a specific DJ
 * @param {string} djAddress - The DJ's wallet address
 * @returns {object} DJ stats
 */
export const getDjStats = (djAddress) => {
  const stats = tipPool.djStats[djAddress];
  
  if (!stats) {
    return {
      totalReceived: 0,
      tipCount: 0,
      uniqueTippers: 0,
      tracks: {}
    };
  }
  
  // Convert Set to count for easier use in UI
  return {
    ...stats,
    uniqueTippers: stats.uniqueTippers.size
  };
};

/**
 * Get top DJs by total amount received
 * @param {number} limit - Number of DJs to return
 * @returns {Array} List of top DJs with their stats
 */
export const getTopDjs = (limit = 10) => {
  const djs = Object.keys(tipPool.djStats).map(address => ({
    address,
    ...getDjStats(address)
  }));
  
  return djs
    .sort((a, b) => b.totalReceived - a.totalReceived)
    .slice(0, limit);
};

/**
 * Get global stats about the tip pool
 * @returns {object} Global stats
 */
export const getGlobalStats = () => {
  const totalTipped = tipPool.transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const uniqueDjs = Object.keys(tipPool.djStats).length;
  const uniqueTippers = new Set(tipPool.transactions.map(tx => tx.userAddress)).size;
  
  return {
    totalTipped,
    transactionCount: tipPool.transactions.length,
    uniqueDjs,
    uniqueTippers
  };
};

export default tipPool; 