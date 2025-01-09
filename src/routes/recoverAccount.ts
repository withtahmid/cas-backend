import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema } from "../validators/zod";
import { AccountRecoveryCodeSendResponse, SubmitAccountVerificationCodeResponse } from "../types/response";
import User from "../models/User";
import { sendAccountRecoveryCode } from "../email/sendAccountRecoveryCode";
import { canResendVerificationCodeAt } from "../config";
import { hashPassword } from "../auth/bcrypt";
import { generateToken } from "../auth/jwt";
const sendCode = publicProcedure
.input(z.object({ emailOrUsername: emailSchema.or(usernameSchema) }))
.mutation(async({ input }): Promise<AccountRecoveryCodeSendResponse> => {
    const response: AccountRecoveryCodeSendResponse = { canResendAt: 0,emailSent: null };
    const { emailOrUsername } = input;
    try {
        var user = await User.findOne({
            $or: [
                { email: emailOrUsername  },
                { username: emailOrUsername }
            ]
        });
    } catch (error) {
        response.error = "Server Error";
        return response;
    }

    if(!user){
        response.message = "No user found";
        return response;
    }

    const emailInfo = await sendAccountRecoveryCode(user);
    response.message = emailInfo.message;
    response.error = emailInfo.error;
    response.canResendAt = emailInfo.error ? 0 : Date.now() + canResendVerificationCodeAt;
    response.emailSent = emailInfo.error ? null : user.email;
    return response;
});

const accountRecoveryCodeSubmitInputSchema = z.object({ 
    emailOrUsername: emailSchema.or(usernameSchema),
    verificationCode: z.string().min(6).max(6),
    password: passwordSchema
});

const submitCode = publicProcedure
.input(accountRecoveryCodeSubmitInputSchema)
.mutation(async({ input }):Promise<SubmitAccountVerificationCodeResponse> => {
    const response: SubmitAccountVerificationCodeResponse = { token: null };
    const { emailOrUsername, verificationCode, password } = input;
    try {
        var user = await User.findOne({
            $or: [
                { email: emailOrUsername  },
                { username: emailOrUsername }
            ]
        });
    } catch (error) {
        response.error = "Server Error";
        return response;
    }

    if(!user){
        response.message = "No user found";
        return response;
    }else if(user.verificationUtil.currecntVerification !== "account-recovery"){
        response.error = "Account recovery is not applicable now";
    } else if(user.verificationUtil.verificationCode !== verificationCode){
        response.message = "Incorrect Verification Code.";
    }else if(Date.now() > user.verificationUtil.expiresAt){
        response.message = "Verification Code is expired."
    }
    if(response.message || response.error){
        return response;
    }
    user.verificationUtil.currecntVerification = "nothing";
    user.verificationUtil.verificationCode = "null";
    user.verificationUtil.expiresAt = 0;
    user.password = await hashPassword(password);
    try {
        await user.save();
    } catch (error) {
        response.error = "Server Error";
        return response;
    }
    response.token = generateToken(user);
    return response;
});

const recoverAccountRouter = router ({
    sendCode,
    submitCode,
});
export default recoverAccountRouter;