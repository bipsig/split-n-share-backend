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
        groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
        transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
        totalBalance: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0.0
        },
    },
    { 
        timestamps: true 
    }
);

const User = mongoose.model ('User', userSchema);

export default User;