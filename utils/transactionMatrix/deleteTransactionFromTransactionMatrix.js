export const deleteTrnasactionFromTransactionMatrix = (transactionMatrix, transaction) => {
    try {
        console.log ("Inside Function");
        // console.log (transaction.users_involved);

        for (let user of transaction.users_involved) {
            // console.log (user);

            const share = parseFloat(transaction.amount)*(parseFloat(user.share));
            transactionMatrix.matrix [transaction.user_paid.username][user.username] -= share; 

            transactionMatrix.colSum [user.username] -= share;
        }

        transactionMatrix.rowSum [transaction.user_paid.username] -= transaction.amount;

        return transactionMatrix;
    }
    catch (err) {
        console.error('Error deleting transaction from transaction Matrix', err.message);
        throw new Error(err.message);
    }
}