    import mongoose from "mongoose";

    const userSchema = new mongoose.Schema (
        {
            firstName: {
                type: String,
                required: [true, 'First Name is required'],
                minlength: [2, 'First name should have more than 1 characters'],
                maxlength: [50, 'First name should have less than 50 characters']
            },
            lastName: {
                type: String,
                required: [true, 'Last Name is required'],
                minlength: [2, 'Last name should have more than 1 characters'],
                maxlength: [50, 'Last name should have less than 50 characters']
            },
            email: {
                type: String,
                required: [true, 'Email is required'],
                unique: [true, 'Email is already in use']
            },
            username: {
                type: String,
                required: [true, 'Username is required'],
                unique: [true, 'Username already exists!'],
                minlength: [3, 'Username should atleast contain 3 characters'],
                maxlength: [20, 'Username can have maximum 20 characters'],
                match: [/^[a-zA-Z0-9\._@]+$/, "Username can only contain alphanumeric characters and ., _ and @"]
            },
            password: {
                type: String,
                required: [true, 'Password cannot be empty'],
                minlength: [5, 'Password is too short']
            },
            mobileNumber: {
                type: String,
                default: '',
                unique: [true, 'Mobile Number is already in use'],
                maxlength: 10
            },
            picturePath: {
                type: String,
                default: ''
            },
            location: {
                type: String,
                default: ''
            },
            occupation: {
                type: String,
                default: ''
            },
            isActive: {
                type: Boolean,
                default: true
            },
            gender: {
                type: String,
                enum: {
                    values: ['Male', 'Female'],
                    message: '{VALUE} is not a valid gender. Allowed genders are Male and Female'
                },
                required: [true, 'Gender is required']
            },
            groups: [
                { 
                    _id: false,
                    group: {
                        type: mongoose.Schema.Types.ObjectId, ref: 'Group',
                        required: true 
                    },
                    groupSlug: {
                        type: String,
                        required: true
                    }
                }
            ],
            transactions: [
                { 
                    _id: false,
                    transaction: {
                        type: mongoose.Schema.Types.ObjectId, ref: 'Transaction',
                        required: true
                    },
                    transactionSlug: {
                        type: String,
                        required: true
                    } 
                }
            ],
            totalBalance: {
                type: Number,
                default: 0
            },
        },
        { 
            timestamps: true 
        }
    );

    userSchema.index({ groups: 1 });

    const User = mongoose.model ('User', userSchema);

    export default User;