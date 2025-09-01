import Activity from "../models/Activity.js";
import { asyncErrorHandler } from "../utils/errors/asyncErrorHandler.js";
import { sendSuccess } from "../utils/errors/responseHandler.js";

/**
 * Get All Activites for logged in user
 * @route GET /activities/all
 * @access Private
 */
export const getAllActivities = asyncErrorHandler(async (req, res, next) => {
    const { userId } = req.user;
    const { unreadOnly = false, priority } = req.query;

    // Build query to find activities where user is a recipient
    const query = {
        'recipients.userId': userId
    };

    // Filter by unread activities only if requested
    if (unreadOnly === 'true') {
        query['recipients.isRead'] = false;
    }

    // Filter by priority if specified
    if (priority && ['low', 'medium', 'high'].includes(priority)) {
        query.priority = priority;
    }

    // Fetch all activities, sorted by creation date (newest first)
    const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .populate('actor.userId', 'username')
        .populate('context.group.groupId', 'name slug')
        .populate('context.transaction.transactionId', 'description amount currency')
        .populate('context.targetUser.userId', 'username')
        .lean();

    // Transform activities to include user-specific read status
    const transformedActivities = activities.map(activity => {
        const userRecipient = activity.recipients.find(
            recipient => recipient.userId.toString() === userId.toString()
        );

        return {
            _id: activity._id,
            type: activity.type,
            actor: activity.actor,
            context: activity.context,
            recipients: activity.recipients,
            priority: activity.priority,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt,
            isRead: userRecipient?.isRead || false,
            readAt: userRecipient?.readAt || null
        };
    });

    sendSuccess(
        res,
        200,
        `Retrieved ${transformedActivities.length} activity/activities successfully!`,
        {
            count: transformedActivities.length,
            activities: transformedActivities
        }
    );
});