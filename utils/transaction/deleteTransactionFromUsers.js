import User from "../../models/User.js";

export const deleteTransactionFromUsers = async (tId, users) => {
    try {
        for (let user of users) {
            // console.log (user);
            const userDetails = await User.findOne({
                username: user.username
            })
            console.log (userDetails.username);
            
            // console.log (userDetails.transactions);
            userDetails.transactions = userDetails.transactions.filter((t) => {
                return t.transaction.toString() !== tId.toString()
            });
            // console.log (userDetails.transactions);
            // console.log (userDetails);
            await userDetails.save();
        }
    }
    catch (err) {
        console.error('Error deleting transaction from the users', err.message);
        throw new Error(err.message);
    }
}