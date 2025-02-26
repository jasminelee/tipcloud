import { request, getLocalStorage, isConnected } from '@stacks/connect';
import { PostConditionMode, Cl } from '@stacks/transactions';

/**
 * Convert satoshis to sBTC
 * @param {number} satoshis - Amount in satoshis
 * @returns {number} Amount in sBTC
 */
export const satoshisToSbtc = (satoshis) => {
  return satoshis / 100000000;
};

/**
 * Convert sBTC to satoshis
 * @param {number} sbtc - Amount in sBTC
 * @returns {number} Amount in satoshis
 */
export const sbtcToSatoshis = (sbtc) => {
  return Math.floor(sbtc * 100000000);
};

/**
 * Format satoshis for display
 * @param {number} satoshis - Amount in satoshis
 * @returns {string} Formatted string (e.g., "5,000 sats")
 */
export const formatSatoshis = (satoshis) => {
  return `${satoshis.toLocaleString()} sats`;
};

/**
 * Send sBTC tokens from the user to a DJ
 * @param {string} recipientAddress - The DJ's STX wallet address
 * @param {number} satoshiAmount - The amount in satoshis to send
 * @returns {Promise<object>} The transaction response
 */
export const sendSbtcTip = async (recipientAddress, satoshiAmount) => {
  try {
    // Get the sender's address
    const userData = getLocalStorage();
    const senderAddress = userData?.addresses?.stx?.[0]?.address;
    
    if (!senderAddress) {
      throw new Error('Wallet not connected');
    }

    console.log('Sending from address:', senderAddress);
    console.log('Sending to address:', recipientAddress);
    console.log('Amount in satoshis:', satoshiAmount);
    
    // Create contract call transaction
    const response = await request('stx_callContract', {
      network: 'mainnet',
      contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      functionArgs: [
        Cl.uint(satoshiAmount),
        Cl.standardPrincipal(recipientAddress),
        Cl.standardPrincipal(senderAddress),
      ],
      postConditionMode: PostConditionMode.Allow,
      onFinish: data => {
        console.log('Transaction finished:', data);
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error sending sBTC tip:', error);
    throw error;
  }
};

/**
 * Get a link to view the transaction in the explorer
 * @param {string} txId - The transaction ID
 * @returns {string} The explorer URL
 */
export const getExplorerLink = (txId) => {
  return `https://explorer.stacks.co/txid/${txId}`;
}; 