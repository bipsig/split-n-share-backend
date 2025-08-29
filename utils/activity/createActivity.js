import Activity from "../../models/Activity.js";

export const createActivity = async ({
  type,
  actor,
  recipients,
  context = {},
  priority = 'medium'
}) => {
  try {
    const activity = new Activity({
      type,
      actor,
      recipients: recipients.map(recipient => ({
        userId: recipient.userId,
        username: recipient.username,
        isRead: false
      })),
      context,
      priority
    });

    await activity.save();
  }
  catch (error) {
    console.error('Failed to create activity:', error);
  }
}