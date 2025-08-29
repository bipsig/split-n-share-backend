import { createActivity } from "./createActivity.js";

export const createGroupActivity = async ({
    activityType,
    actor,
    group,
    recipients = null,
    additionalContext = {},
    priority = 'medium'
}) => {
    // Default recipients to all group members if not provided
    const activityRecipients = recipients || group.members.map(member => ({
        userId: member.user,
        username: member.username
    }));

    const context = {
        group: {
            groupId: group._id,
            groupName: group.name,
            groupSlug: group.slug
        },
        ...additionalContext
    };

    await createActivity({
        type: activityType,
        actor,
        recipients: activityRecipients,
        context,
        priority
    });
};
