import bcrypt from "bcrypt";
import User from "../../models/User.js";

export const updatePasswordWithUsername = async (body, username) => {
    try {
        if (body.oldPassword === body.newPassword) {
            throw new Error('Current Passoword and New Password cannot be same!');
        }

        const user = await User.findOne ({ username: username });

        if (!user) {
            console.error('User not found!');
            throw new Error('User not found!');
        }

        const oldPassword = body.oldPassword;
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            console.error('Invalid Current Password!');
            throw new Error('Invalid Current Password!')
        }

        const newPassword = body.newPassword;
        const genPassword = await bcrypt.hash (newPassword, parseInt(process.env.SALT_ROUNDS));
        
        user.password = genPassword;

        return user;
    }
    catch (err) {
        console.error('Error updating password with username:', err.message);
        throw new Error(err.message);
    }
}