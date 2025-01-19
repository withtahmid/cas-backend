import { TypeOf } from "zod";

export const AuthErrorCodes = { 
    EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
    USERNAME_ALREADY_TAKEN: "USERNAME_ALREADY_TAKEN",
    PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    VERIFICATION_URL_EXPIRED: "VERIFICATION_URL_EXPIRED",
    INVALID_VERIFICATION_URL: "INVALID_VERIFICATION_URL",
    
    RECOVERY_URL_EXPIRED: "RECOVERY_URL_EXPIRED",
    INVALID_RECOVERY_URL: "INVALID_RECOVERY_URL",

    ACCOUNT_NOT_VERIFIED: "ACCOUNT_NOT_VERIFIED",

} as const;

export type AuthErrorCode = keyof typeof AuthErrorCodes;

export const AuthErrorMessages: Record<typeof AuthErrorCodes[ keyof typeof AuthErrorCodes ], string> = {
    EMAIL_ALREADY_EXISTS: "The provided email is already registered. Please use a different email address.",
    USERNAME_ALREADY_TAKEN: "The username is already in use. Please choose a different one.",
    PASSWORD_MISMATCH: "Password and confirm password do not match. Please try again.",
    INVALID_CREDENTIALS: "Invalid Credentials.",
    VERIFICATION_URL_EXPIRED: "Verification URL is expired. You need to signup again.", 
    INVALID_VERIFICATION_URL: "Invalid Verification URL",
    RECOVERY_URL_EXPIRED: "Account recovery URL is expired. Please try again.",
    INVALID_RECOVERY_URL: "Invalid account recovery URL.",
    ACCOUNT_NOT_VERIFIED: "Account is not verified.",
}