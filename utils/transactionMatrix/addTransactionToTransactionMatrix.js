export const addTransactionToTransactionMatrix = (transactionMatrix, user_paid, users_involved, amount) => {
    try {
        console.log ("Inside Function");

        // console.log (user_paid);
        // console.log (users_involved);

        for (let user of users_involved) {
            // console.log (user);
            const share = parseFloat(amount)*(parseFloat(user.share));
            transactionMatrix.matrix[user_paid][user.username] += share;

            transactionMatrix.colSum[user.username] += share;
        }

        transactionMatrix.rowSum[user_paid] += amount;

        return transactionMatrix;
    }
    catch (err) {
        console.error('Error adding transaction to transaction Matrix', err.message);
        throw new Error(err.message);
    }
}