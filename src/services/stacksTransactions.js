import { request } from '@stacks/connect';

/**
 * Send STX from the user to a DJ
 * @param {string} recipientAddress - The DJ's wallet address
 * @param {number} amount - The amount in STX to send
 * @param {string} memo - Optional memo for the transaction
 * @returns {Promise<object>} The transaction response
 */
export const sendStacksTip = async (recipientAddress, amount, memo = 'DJ Tip') => {
  try {
    // Convert amount to micro-STX (1 STX = 1,000,000 micro-STX)
    const microStxAmount = (amount * 1000000).toString();
    
    // Create transaction request
    const response = await request('stx_transferStx', {
      recipient: recipientAddress,
      amount: microStxAmount,
      memo: memo,
      network: 'mainnet', // Use 'testnet' for testing
    });
    
    return response;
  } catch (error) {
    console.error('Error sending STX tip:', error);
    throw error;
  }
};

/**
 * Check if a user is connected to a Stacks wallet
 * @returns {boolean} Whether the user is connected
 */
export const isWalletConnected = () => {
  return isConnected();
};

/**
 * Get the user's Stacks address
 * @returns {string|null} The user's Stacks address or null if not connected
 */
export const getUserStacksAddress = () => {
  const userData = getLocalStorage();
  return userData?.addresses?.mainnet || null;
}; 