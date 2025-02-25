// Simple in-memory store for tip pool
export class TipPoolStore {
    constructor() {
        // Store balances and tips in memory
        this.djBalances = new Map();  // DJ ID -> balance
        this.tips = [];               // Array of all tips
        this.totalPoolBalance = 0;
    }

    // Add tip to pool
    depositTip(djId, amount, fromAddress) {
        // Update DJ's balance
        const currentBalance = this.djBalances.get(djId) || 0;
        this.djBalances.set(djId, currentBalance + amount);
        
        // Track the tip
        this.tips.push({
            djId,
            amount,
            fromAddress,
            timestamp: Date.now(),
            status: 'confirmed'
        });

        // Update total pool balance
        this.totalPoolBalance += amount;

        return {
            success: true,
            newBalance: this.djBalances.get(djId)
        };
    }

    // Get DJ's current balance
    getDJBalance(djId) {
        return this.djBalances.get(djId) || 0;
    }

    // Get all tips for a DJ
    getDJTips(djId) {
        return this.tips.filter(tip => tip.djId === djId);
    }

    // Get total pool stats
    getPoolStats() {
        return {
            totalTips: this.tips.length,
            totalAmount: this.totalPoolBalance,
            activeDJs: this.djBalances.size
        };
    }

    // Process withdrawal
    withdrawTips(djId, amount) {
        const balance = this.djBalances.get(djId) || 0;
        if (balance < amount) {
            throw new Error('Insufficient balance');
        }

        // Update balances
        this.djBalances.set(djId, balance - amount);
        this.totalPoolBalance -= amount;

        return {
            success: true,
            remainingBalance: this.djBalances.get(djId)
        };
    }
}

// Create a singleton instance
export const tipPool = new TipPoolStore();