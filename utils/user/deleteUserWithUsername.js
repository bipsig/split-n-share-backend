import User from "../../models/User.js";

export const deleteUserWithUsername = async (username) => {
    try {
        // console.log ('In Function');
        const user = await User.findOne({
            username: username
        });

        // console.log (user);
        // console.log (parseFloat(user.totalBalance));
        // console.log (typeof(parseFloat(user.totalBalance)));

        if (parseFloat(user.totalBalance) !== 0.0) {
            console.error('Balances are not settled. Cannot proceed to delete account!');
            throw new Error('Balances are not settled. Cannot proceed to delete account!');
        }

        await User.deleteOne({
            username: username
        });

        return true;
    }
    catch (err) {
        console.error('Error deleting user with username:', err.message);
        throw new Error(err.message);
    }
}