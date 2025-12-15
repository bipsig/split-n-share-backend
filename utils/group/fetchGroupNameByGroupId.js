import Group from "../../models/Group.js";
import { AppError } from "../errors/AppError.js";
import { errorCodes } from "../errors/errorCodes.js";

export const fetchGroupNameByGroupId = async (groupId) => {
  try {
    const groupName = await Group.findOne({
      _id: groupId
    }).select('name');

    if (!groupName) {
      throw new AppError(
        'Unable to fetch group name',
        500,
        errorCodes.DATABASE_OPERATION_ERROR
      );
    }

    return groupName;
  }
  catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      'Database error while fetching group name',
      500,
      errorCodes.DATABASE_OPERATION_ERROR
    );
  }
}