import { ethers } from 'ethers';

/**
 * Send ETH from the user to a DJ
 * @param {string} toAddress - The DJ's wallet address
 * @param {string} amount - The amount in ETH to send
 * @returns {Promise<string>} The transaction hash
 */
export const sendTip = async (toAddress, amount) => {
  try {
    // Check if window.ethereum is available (MetaMask or other wallet)
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.");
    }
    
    // Request access to the user's accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const fromAddress = accounts[0];
    
    // Convert amount to Wei (the smallest unit of ETH)
    const amountInWei = ethers.utils.parseEther(amount.toString());
    
    // Create transaction parameters
    const transactionParameters = {
      from: fromAddress,
      to: toAddress,
      value: ethers.utils.hexlify(amountInWei),
      gas: ethers.utils.hexlify(21000), // Basic transaction gas limit
    };
    
    // Send the transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    return txHash;
  } catch (error) {
    console.error('Error sending ETH:', error);
    throw error;
  }
}; 