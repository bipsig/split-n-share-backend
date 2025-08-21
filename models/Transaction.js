import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    user_added: {
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
    description: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    user_paid: {
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
    users_involved: [
        {
            _id: false,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            username: {
                type: String,
                required: true
            },
            share: {
                type: Number,
                required: true,
                min: 0
            },
        }
    ],
    isSettled: {
        type: Boolean,
        default: false
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    groupSlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    note: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['Expense', 'Payment'],
        default: 'Expense'
    },
    category: {
        type: String,
        enum: [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare',
            'Education',
            'Travel',
            'Groceries',
            'Rent & Housing',
            'Sports & Recreation',
            'Personal Care',
            'Insurance',
            'Gifts',
            'Charity',
            'Business',
            'Other'
        ],
        required: function() {
            // Category is only required for Expense type transactions
            return this.type === 'Expense';
        },
        default: function() {
            // Set default category only for Expense transactions
            return this.type === 'Expense' ? 'Other' : undefined;
        }
    },
    picturePath: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    currency: {
        type: String,
        default: 'INR'
    },
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
