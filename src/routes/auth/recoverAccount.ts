import { publicProcedure, router } from "../../trpc";
import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "../../validators/zod";
import { RecoverAccountResponse, RecoverAccountSentURLResponse } from "../../types/response/auth";
import User from "../../models/User";
import { hashPassword } from "../../auth/bcrypt";
import { generateToken } from "../../auth/jwt";
import { createErrorResponse, createPartialSuccessResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
import { AuthErrorCodes, AuthErrorMessages } from "../../errorCodes/auth";
import { decryptString } from "../../encryption/crypto";
import { Response } from "../../types/response";
import { decodeURIParams } from "../../encryption/encodingURL";
import { sendAccountRecoveryEmail } from "../../email/sendAccountRecoveryEmail";

const accountRecoverSchema = z.object({ 
    urlParam: z.string().min(1).max(500),
    password: passwordSchema,
    confirmPassword: passwordSchema
});
const changePassword = publicProcedure
.input(accountRecoverSchema)
.mutation(async({ input }): Promise<Response<RecoverAccountResponse>> => {

    const { urlParam, password, confirmPassword } = input;

    const verificationCodeAndUserID = decodeURIParams(urlParam);

    const [ verificationCode, _id ] = verificationCodeAndUserID.split("*");
    
     if(password !== confirmPassword){
        return createPartialSuccessResponse(AuthErrorCodes.PASSWORD_MISMATCH, AuthErrorMessages[AuthErrorCodes.PASSWORD_MISMATCH]);
    }
    else if(verificationCode.length === 0 || _id.length !== 24){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_RECOVERY_URL, AuthErrorMessages[AuthErrorCodes.INVALID_RECOVERY_URL]);
    }

    try {
        var user = await User.findById(_id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.SERVER_ERROR, ErrorMessages[ErrorCodes.SERVER_ERROR]);
    }
    if(!user){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_RECOVERY_URL, AuthErrorMessages[AuthErrorCodes.INVALID_RECOVERY_URL]);
    }

    const { verificationUtil } = user;
   if(verificationUtil.verificationType !== "account-recovery"){
        return createPartialSuccessResponse(ErrorCodes.FORBIDDEN, "Account recovery is not applicable.");
    }
    else if(verificationUtil.verificationCode !== verificationCode){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_RECOVERY_URL, AuthErrorMessages[AuthErrorCodes.INVALID_RECOVERY_URL]);
    }else if(Date.now() > verificationUtil.expiresAt){
        return createPartialSuccessResponse(AuthErrorCodes.RECOVERY_URL_EXPIRED, AuthErrorMessages[AuthErrorCodes.RECOVERY_URL_EXPIRED]);
    }

    try {
        user.password = await hashPassword(password);
        await user.save();
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED]);
    }
    return createSuccessResponse<RecoverAccountResponse>({ token: generateToken(user) }, "Account Recovered" );
});

const sendRecoveryURL = publicProcedure
.input(emailSchema.or(usernameSchema))
.mutation(async({ input }):Promise<Response<RecoverAccountSentURLResponse>> => {
    const emailOrUsername = input;
    try {
        var user = await User.findOne({
            $or: [
                { email: emailOrUsername  },
                { username: emailOrUsername }
            ]
        });
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }
    
    if(!user){
        return createPartialSuccessResponse(ErrorCodes.RESOURCE_NOT_FOUND, ErrorMessages[ErrorCodes.RESOURCE_NOT_FOUND]);
    }

    try {
        var emailSent = await sendAccountRecoveryEmail(user);
    } catch (error) {
        console.error(error);
        return createErrorResponse(ErrorCodes.EMAIL_SEND_FAILED, ErrorMessages[ErrorCodes.EMAIL_SEND_FAILED]);
    }
        
    if(!emailSent){
        return createErrorResponse(ErrorCodes.EMAIL_SEND_FAILED, ErrorMessages[ErrorCodes.EMAIL_SEND_FAILED]);
    }    

    return createSuccessResponse({}, `Verification email sent to ${user.email}`);

})

const recoverAccountRouter = router ({
    changePassword,
    sendRecoveryURL,
});
export default recoverAccountRouter;