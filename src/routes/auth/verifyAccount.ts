import { z } from "zod"
import { VerifyAccountResponse } from "../../types/response/auth";
import User from "../../models/User";
import { publicProcedure } from "../../trpc";
import { Response } from "../../types/response";
import { decryptString } from "../../encryption/crypto";
import { createErrorResponse, createPartialSuccessResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
import { AuthErrorCodes, AuthErrorMessages } from "../../errorCodes/auth";
import { decodeURIParams } from "../../encryption/encodingURL";

const verifyAccountProcedure = publicProcedure
.input(z.string())
.mutation(async({ input }):Promise<Response<VerifyAccountResponse>> => {
    
    try {
        var verificationCodeAndUserID = decodeURIParams(input);
    } catch (error) {
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_VERIFICATION_URL, AuthErrorMessages[AuthErrorCodes.INVALID_VERIFICATION_URL]);
    }

    const [ verificationCode, _id ] = verificationCodeAndUserID.split("*");
    
    if(verificationCode.length === 0 || _id.length !== 24){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_VERIFICATION_URL, AuthErrorMessages[AuthErrorCodes.INVALID_VERIFICATION_URL]);
    }

    try {
        var user = await User.findById(_id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.SERVER_ERROR, ErrorMessages[ErrorCodes.SERVER_ERROR]);
    }
    if(!user){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_VERIFICATION_URL, AuthErrorMessages[AuthErrorCodes.INVALID_VERIFICATION_URL]);
    }

    const { verificationUtil } = user;
    if(user.isVerified){
        return createPartialSuccessResponse(AuthErrorCodes.VERIFICATION_URL_EXPIRED, "Account is already verified");
    }else if(verificationUtil.verificationType !== "account-verification"){
        return createPartialSuccessResponse(ErrorCodes.FORBIDDEN, "Account verification is not applicable now.");
    }
    else if(verificationUtil.verificationCode !== verificationCode){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_VERIFICATION_URL, AuthErrorMessages[AuthErrorCodes.INVALID_VERIFICATION_URL]);
    }else if(Date.now() > verificationUtil.expiresAt){
        return createPartialSuccessResponse(AuthErrorCodes.VERIFICATION_URL_EXPIRED, AuthErrorMessages[AuthErrorCodes.VERIFICATION_URL_EXPIRED]);
    }

    user.verificationUtil.verificationType = "nothing";
    user.verificationUtil.verificationCode = "null";
    user.verificationUtil.expiresAt = 0;
    user.isVerified = true;

    try {   
        await user.save();
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED])
    }
    return createSuccessResponse<VerifyAccountResponse>({}, "Account Verification Successfull");
});

export default verifyAccountProcedure;
