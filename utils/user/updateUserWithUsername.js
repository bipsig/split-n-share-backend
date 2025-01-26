import User from "../../models/User.js";
import { checkEmailExists } from "./checkEmailExists.js";
import { checkMobileExists } from "./checkMobileExists.js";

export const updateUserWithUsername = async (body, username) => {
    try {
        /* Details that can be updated in this function:
            -- firstName, lastName, location, occupation, gender
            -- email and mobileNumber => Check for uniqueness
        */

        if (body.email && await checkEmailExists(body.email)) {
            throw new Error('Email already in use');
        }
        
        if (body.mobileNumber && await checkMobileExists(body.mobileNumber)) {
            throw new Error('Mobile Number already in use');
        }

        const user = await User.findOne({
            username: username
        });

        if (!user) {
            console.error('User not found!');
            throw new Error('User not found!');
        }

        if (body.firstName) user.firstName = body.firstName;
        if (body.lastName) user.lastName = body.lastName;
        if (body.email) user.email = body.email;
        if (body.mobileNumber) user.mobileNumber = body.mobileNumber;
        if (body.location) user.location = body.location;
        if (body.occupation) user.occupation = body.occupation;
        if (body.gender) user.gender = body.gender;

        return user;
    }
    catch (err) {
        console.error('Error updating user with username:', err.message);
        throw new Error(err.message);
    }
}