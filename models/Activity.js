import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      //Expense
      'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED',

      //Payment
      'PAYMENT_MADE',

      //Group
      'GROUP_CREATED', 'GROUP_UPDATED', 'GROUP_DELETED',
      'GROUP_MEMBER_ADDED', 'GROUP_MEMBER_REMOVED',
      'GROUP_ADMIN_PROMOTED', 'GROUP_ADMIN_DEMOTED',

      //Notifications
      'NOTIFICATION_REMINDER_SENT'
    ],
    required: true
  },
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  recipients: [{
    _id: false,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],

  context: {
    // Group context (if applicable)
    group: {
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      groupName: {
        type: String
      },
      groupSlug: {
        type: String
      }
    },

    // Transaction context (if applicable)
    transaction: {
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      },
      transactionSlug: {
        type: String
      },
      description: {
        type: String
      },
      amount: {
        type: Number
      },
      currency: {
        type: String
      }
    },

    // Target user context (for member-related activities)
    targetUser: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: {
        type: String
      }
    }
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
},
  {
    timestamps: true
  }
);

activitySchema.index({ 'recipients.userId': 1, createdAt: -1 });
activitySchema.index({ 'actor.userId': 1, createdAt: -1 });
activitySchema.index({ 'context.group.groupId': 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ priority: 1, 'recipients.isRead': 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;