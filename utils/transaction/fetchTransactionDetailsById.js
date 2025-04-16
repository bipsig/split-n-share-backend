import Transaction from "../../models/Transaction.js";

export const fetchTransactionDetailsById = async (tId) => {
    try {
        const transaction = await Transaction.findOne({
            _id: tId
        });

        if (!transaction) {
            throw new Error ("Transaction doesn't exist!");
        }

        return transaction;
    }
    catch (err) {
        console.error('Error fetching transaction details by ID:', err.message);
        throw new Error(err.message);
    }
}