import { createActivity } from "./createActivity.js";

export const createTransactionActivity = async ({
    activityType,
    actor,
    group,
    transaction,
    recipients = null,
    additionalContext = {},
    priority = 'medium'
}) => {
    // For transaction activities, default recipients should be transaction participants
    let activityRecipients = recipients;
    
    if (!recipients) {
        // Get unique users involved in the transaction
        const involvedUsers = new Set();
        
        // Add the user who paid
        involvedUsers.add(JSON.stringify({
            userId: transaction.user_paid.userId,
            username: transaction.user_paid.username
        }));
        
        // Add all users involved in the transaction
        transaction.users_involved.forEach(user => {
            involvedUsers.add(JSON.stringify({
                userId: user.user,
                username: user.username
            }));
        });
        
        // Convert back to array of objects
        activityRecipients = Array.from(involvedUsers).map(userStr => JSON.parse(userStr));
    }

    const context = {
        group: {
            groupId: group._id,
            groupName: group.name,
            groupSlug: group.slug
        },
        transaction: {
            transactionId: transaction._id,
            transactionSlug: transaction.slug,
            description: transaction.description,
            amount: transaction.amount,
            currency: group.currency
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