export const removeMemberFromTransactionMatrix = (username, transactionMatrix) => {
    try {
        delete transactionMatrix.matrix[username];

        for (const rowKey in transactionMatrix.matrix) {
            // let tmp = matrix [key];
            delete transactionMatrix.matrix[rowKey][username];
        }

        delete transactionMatrix.rowSum[username];
        delete transactionMatrix.colSum[username];
        // console.log (transactionMatrix);
        // let newInner = {};
        // for (const rowKey in transactionMatrix.matrix) {
        //     // console.log (rowKey);
        //     transactionMatrix.matrix[rowKey][username] = 0;

        //     newInner [rowKey] = 0;
        //     // newInner.set(rowKey, 0);
        // }
        // // newInner.set(username, 0);
        // newInner[username] = 0;

        // transactionMatrix.matrix[username] = newInner;

        // transactionMatrix.rowSum[username] = 0;
        // transactionMatrix.colSum[username] = 0;

        // console.log("New Inner", newInner); 
        return transactionMatrix;
    }
    catch (err) {
        console.error('Error adding new user to transaction Matrix', err.message);
        throw new Error(err.message);
    }
}