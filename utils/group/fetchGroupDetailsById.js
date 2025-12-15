import Group from "../../models/Group.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";
import { errorMessages } from "../errors/errorMessages.js";

export const fetchGroupDetailsById = async (groupId) => {
    try {
        const group = await Group.findOne({
            _id: groupId
        });

        if (!group) {
            throw new AppError(
                errorMessages.GROUP_NOT_FOUND,
                404,
                errorCodes.GROUP_NOT_FOUND
            )
        }

        return group;
    }
    catch (err) {
        if (err instanceof AppError) {
            throw err;
        }

        throw new AppError(
            'Database error while fetching group details by id',
            500,
            errorCodes.DATABASE_OPERATION_ERROR
        );
    }
}