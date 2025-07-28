export const errorMessages = {
    // Authentication Messages
    INVALID_CREDENTIALS: 'Invalid password. Please check your credentials and try again.',
    USER_NOT_FOUND: 'User account not found. Please check your username or register for a new account.',
    TOKEN_MISSING: 'Access token is required. Please log in to continue.',
    TOKEN_INVALID: 'Invalid access token. Please log in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    TOKEN_BLACKLISTED: 'This session is no longer valid. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    ACCESS_FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
    BALANCE_NOT_SETTLED: 'Cannot delete account with unsettled balances. Please settle all balances first.',

    // Registration Messages
    USER_ALREADY_EXISTS: 'An account with this information already exists.',
    EMAIL_ALREADY_EXISTS: 'This email address is already registered. Please use a different email or try logging in.',
    USERNAME_ALREADY_EXISTS: 'This username is already taken. Please choose a different username.',
    MOBILE_ALREADY_EXISTS: 'This mobile number is already registered. Please use a different number.',
    REGISTRATION_FAILED: 'Failed to create your account. Please try again.',

    // Validation Messages
    REQUIRED_FIELD: 'This field is required and cannot be empty.',
    INVALID_FORMAT: 'The format of this field is invalid.',
    FIELD_TOO_SHORT: 'This field is too short. Please enter more characters.',
    FIELD_TOO_LONG: 'This field is too long. Please enter fewer characters.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    WEAK_PASSWORD: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',

    // Server Messages
    DATABASE_ERROR: 'We are experiencing technical difficulties. Please try again later.',
    INTERNAL_ERROR: 'An unexpected error occurred. Our team has been notified.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',

    //Group Messages
    GROUP_NOT_FOUND: 'Group not found or you do not have access to it.',
    GROUP_BALANCE_NOT_SETTLED: 'Cannot delete group with unsettled balances. Please settle all balances first.',
    GROUP_CREATION_FAILED: 'Failed to create the group. Please try again.',
    GROUP_MEMBER_ADD_FAILED: 'Failed to add one or more members to the group.',
    GROUP_MEMBER_REMOVE_FAILED: 'Failed to remove one or more members from the group.',
    GROUP_ACCESS_DENIED: 'Access denied! You are not a member of this group.',
    GROUP_ADMIN_REQUIRED: 'Access denied! Only group admins can perform this action.',
    GROUP_NAME_REQUIRED: 'Group name is required and cannot be empty.',
    GROUP_MEMBERS_REQUIRED: 'At least one member must be specified.',
    GROUP_INVALID_MEMBER: 'One or more specified members are invalid or do not exist.',
    GROUP_MEMBER_ALREADY_EXISTS: 'One or more members are already part of this group.',
    GROUP_CANNOT_REMOVE_ADMIN: 'Cannot remove the group admin. Transfer admin rights first.',
    GROUP_CANNOT_REMOVE_SELF: 'You cannot remove yourself from the group. Leave the group instead.',
    GROUP_DELETE_FAILED: 'Failed to delete the group. Please try again.',
    GROUP_UPDATE_FAILED: 'Failed to update the group. Please try again.',
    GROUP_SLUG_GENERATION_FAILED: 'Failed to generate a unique group identifier.',

    // Transaction Messages
    TRANSACTION_NOT_FOUND: 'Transaction not found or you do not have access to it.',
    TRANSACTION_CREATION_FAILED: 'Failed to create the transaction. Please check your input and try again.',
    TRANSACTION_UPDATE_FAILED: 'Failed to update the transaction. Please try again.',
    TRANSACTION_DELETE_FAILED: 'Failed to delete the transaction. Please try again.',

    // Success Messages
    REGISTRATION_SUCCESS: 'Account created successfully! You can now log in.',
    LOGIN_SUCCESS: 'Welcome back! You have been logged in successfully.',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    TOKEN_CLEANUP_SUCCESS: 'Expired tokens cleaned up successfully.',


    GROUP_CREATED_SUCCESS: 'Group created successfully! You can now start adding members.',
    GROUP_UPDATED_SUCCESS: 'Group details updated successfully!',
    GROUP_DELETED_SUCCESS: 'Group deleted successfully!',
    GROUP_MEMBERS_ADDED_SUCCESS: 'Members added to the group successfully!',
    GROUP_MEMBERS_REMOVED_SUCCESS: 'Members removed from the group successfully!',
    GROUP_DETAILS_RETRIEVED_SUCCESS: 'Group details retrieved successfully!',
    GROUP_LIST_RETRIEVED_SUCCESS: 'Groups list retrieved successfully!',
};