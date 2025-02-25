import { request, getLocalStorage, isConnected } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';
import { Cl } from '@stacks/transactions';

/**
 * Send sBTC tokens from the user to a DJ
 * @param {string} recipientAddress - The DJ's STX wallet address
 * @param {number} amount - The amount in sBTC to send
 * @returns {Promise<object>} The transaction response
 */
export const sendSbtcTip = async (recipientAddress, amount) => {
  try {
    // Get the sender's address
    const userData = getLocalStorage();
    const senderAddress = userData?.addresses?.stx?.[0]?.address;
    
    if (!senderAddress) {
      throw new Error('Wallet not connected');
    }

    console.log('Sending from address:', senderAddress);
    console.log('Sending to address:', recipientAddress);
    console.log('Amount in sBTC:', amount);
    // Convert amount to smallest unit (1 sBTC = 100,000,000 satoshis)
    const satoshiAmount = Math.floor(amount * 100000000);
    console.log('Amount in satoshis:', satoshiAmount);
    
    // Create contract call transaction with simplified arguments
    const response = await request('stx_callContract', {
      network: 'mainnet',
      contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4',
      contractName: 'sbtc-token',
      functionName: 'transfer',
      functionArgs: [
        Cl.uint(satoshiAmount), //.toString(), // The amount as a string
        Cl.standardPrincipal(recipientAddress), // The recipient address as a string
        Cl.standardPrincipal(senderAddress), // The sender address as a string
        // "dj tip for kewl sounds" // No memo
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