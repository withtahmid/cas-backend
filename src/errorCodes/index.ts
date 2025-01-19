import { ErrorResponse, PartialSuccessResponse, SuccessResponse } from "../types/response";
import { AuthErrorCodes } from "./auth";

export const ErrorCodes = {
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    TOKEN_INVALID: "TOKEN_INVALID",
    INVALID_INPUT: "INVALID_INPUT",
    RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
    SERVER_ERROR: "SERVER_ERROR",
    DATABASE_SAVE_FAILED: "DATABASE_SAVE_FAILED",
    DATABASE_QUERY_FAILED: "DATABASE_QUERY_FAILED",
    EMAIL_SEND_FAILED: "EMAIL_SEND_FAILED",
    SCHEMA_VALIDATION_FAILED: "SCHEMA_VALIDATION_FAILED",
} as const;
  
export type ErrorCode = keyof typeof ErrorCodes;
  
export const ErrorMessages: Record<typeof ErrorCodes[keyof typeof ErrorCodes], string> = {
    [ErrorCodes.UNAUTHORIZED]: "You are not authorized to access this resource.",
    [ErrorCodes.FORBIDDEN]: "You do not have permission to perform this action.",
    [ErrorCodes.INVALID_CREDENTIALS]: "The username or password is incorrect.",
    [ErrorCodes.TOKEN_EXPIRED]: "Your session has expired. Please log in again.",
    [ErrorCodes.TOKEN_INVALID]: "The provided token is invalid.",
    [ErrorCodes.INVALID_INPUT]: "The provided input is invalid.",
    [ErrorCodes.RESOURCE_NOT_FOUND]: "The requested resource was not found.",
    [ErrorCodes.SERVER_ERROR]: "An unexpected error occurred. Please try again later.",
    [ErrorCodes.DATABASE_SAVE_FAILED]: "An error occurred while saving the data. Please try again later.",
    [ErrorCodes.DATABASE_QUERY_FAILED]: "An error occurred while querying the database. Please try again later.",
    [ErrorCodes.EMAIL_SEND_FAILED]: "Unable to send the email. Please try again later.",
    [ErrorCodes.SCHEMA_VALIDATION_FAILED]: "The provided data does not meet the schema requirements. Please check your input and try again.",
};


export const createSuccessResponse = <T>(data: T, message: string, ): SuccessResponse<T> => {
    return { success: true, message, data }
}
type AllErrorCoddes = 
typeof ErrorCodes[keyof typeof ErrorCodes] | 
typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export const createPartialSuccessResponse = (errorCode: AllErrorCoddes, message: string, ):PartialSuccessResponse => {
    return { success: false, message, errorCode };
}

export const createErrorResponse = (error: AllErrorCoddes, message: string): ErrorResponse => {
    return { success: false, message, error };
}