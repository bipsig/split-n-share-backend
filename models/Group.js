import mongoose from "mongoose";

const VALID_ICON_NAMES = [
  'Home', 'Friends', 'Office', 'Other', 'Trip', 'Flight', 'Road Trip', 'Beach', 
  'Mountain', 'Camping', 'Cruise', 'Cycling', 'Train', 'Bus Tour', 'Hotel', 'Map',
  'Restaurant', 'Coffee', 'Pizza Party', 'Groceries', 'Wine Tasting', 'Gaming', 
  'Music', 'Photography', 'Party', 'Birthday', 'Fitness', 'Education', 'Health', 
  'Work', 'Tech', 'Gift', 'Event', 'Holiday', 'Summer', 'Winter', 'Rainy Day', 'Special'
];

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            minlength: [3, 'Group name should have atlease 3 characters'],
            maxlength: [50, 'Group name should have less than 50 characters']
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        selectedIcon: {
            type: String,
            enum: VALID_ICON_NAMES,
            default: function() {
                // Set default icon based on category
                const categoryIconMap = {
                    'Home': 'Home',
                    'Trip': 'Trip', 
                    'Office': 'Office',
                    'Friends': 'Friends',
                    'Other': 'Other'
                };
                return categoryIconMap[this.category] || 'Other';
            }
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        members: [
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
                role: {
                    type: String,
                    enum: ['Admin', 'Member'],
                    default: 'Member'
                },
                joinedAt: {
                    type: Date,
                    default: Date.now()
                },
                status: {
                    type: String,
                    enum: ['active', 'pending', 'left'],
                    default: 'active'
                }
            },
        ],
        currency: {
            type: String,
            default: 'INR',
            required: true
        },
        totalBalance: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            enum: ['Home', 'Trip', 'Office', 'Friends', 'Other'],
            default: 'Other'
        },
        transactions: [
            {
                _id: false,
                transaction: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Transaction',
                    required: true
                },
                transactionSlug: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    enum: ['Expense', 'Payment'],
                    default: 'Expense'
                }
            }
        ],
        transactionMatrix: {
            type: new mongoose.Schema({
                matrix: {
                    type: Object,
                    // of: {
                    //     type: Map,
                    //     of: Number
                    // },
                    default: {}
                },
                rowSum: {
                    type: Object,
                    // of: Number,
                    default: {}
                },
                colSum: {
                    type: Object,
                    // of: Number,
                    default: {}
                }
            }, { _id: false }),
            default: () => ({})
        }
    },
    {
        timestamps: true
    }
);

groupSchema.pre('save', function(next) {
    if (this.selectedIcon && !VALID_ICON_NAMES.includes(this.selectedIcon)) {
        const error = new Error(`Invalid icon: ${this.selectedIcon}`);
        error.name = 'ValidationError';
        return next(error);
    }
    next();
});

groupSchema.index({ createdBy: 1 });
groupSchema.index({ 'members.user': 1 });

const Group = mongoose.model('Group', groupSchema);

export default Group;