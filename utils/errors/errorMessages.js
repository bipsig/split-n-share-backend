export const errorMessages = {
    // Authentication Messages
    INVALID_CREDENTIALS: 'Invalid username or password. Please check your credentials and try again.',
    USER_NOT_FOUND: 'User account not found. Please check your username or register for a new account.',
    TOKEN_MISSING: 'Access token is required. Please log in to continue.',
    TOKEN_INVALID: 'Invalid access token. Please log in again.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    TOKEN_BLACKLISTED: 'This session is no longer valid. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    ACCESS_FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
    
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
    
    // Success Messages
    REGISTRATION_SUCCESS: 'Account created successfully! You can now log in.',
    LOGIN_SUCCESS: 'Welcome back! You have been logged in successfully.',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    TOKEN_CLEANUP_SUCCESS: 'Expired tokens cleaned up successfully.'
};