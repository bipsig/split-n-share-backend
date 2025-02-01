export const fetchUserRole = (userId, members) => {
    try {
        if (!userId || !members ) {
            console.log ('UserId and members of the group are important')
            throw new Error('UserId and members of the group are important');
        }

        if (members.length === 0) {
            console.log ('There are no members in the group')
            throw new Error('There are no members in the group');
        }

        const user = members.find((member) => {
            return String (member.user) === String(userId)
        });
        // console.log (user);

        return user.role;
    }
    catch (err) {
        throw new Error("Unable to fetch User role:", err.message);
    }
}