import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler";

/**
 * Get All Activites for logged in user
 * @route GET /activities
 * @access Private
 */
export const getActivities = asyncErrorHandler(async (req, res, next) => {
  const { userId } = req.user;

})