import { loggedInProcedure, router } from "../trpc";
import { z } from "zod"
import { VerifyAccountResponse } from "../types/response";
import { canResendVerificationCodeAt } from "../config";
import { sendAccountVerificationCode } from "../email/sendAccountVerificationCode";
import { ResendCodeResponse, } from "../types/response";
import User from "../models/User";
import { TRPCError } from "@trpc/server";

const verifyAccountProcedure = loggedInProcedure
.input(z.string().min(6).max(6))
.mutation(async({ ctx, input }) => {
    const verificationCode = input;
    const jwt_user = ctx.user;
    try {
        var user = await User.findById(jwt_user._id);
    } catch (error) {
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR"});
    }
    if(!user){
        throw new TRPCError({code: "NOT_FOUND"});
    }

    const { verificationUtil } = user;
    const response: VerifyAccountResponse = { success : false };
    if(user.isVerified){
        response.error = "Account is already verified.";
    }else if(verificationUtil.currecntVerification !== "account-verification"){
        response.error = "Account verification is not applicable";
    }
    else if(verificationUtil.verificationCode !== verificationCode){
        response.message = "Incorrect Verification Code.";
    }else if(Date.now() > verificationUtil.expiresAt){
        response.message = "Verification Code is expired."
    }

    if(response.message || response.error){
        return response;
    }

    user.verificationUtil.currecntVerification = "nothing";
    user.verificationUtil.verificationCode = "null";
    user.verificationUtil.expiresAt = 0;
    user.isVerified = true;

    try {
        await user.save();
    } catch (error) {
        response.error = "Server Error";
        console.error(error)
    }
    response.success = true;
    return response;
});


const resendVerifiactionCodeProcedure = loggedInProcedure
.mutation(async({ ctx }):Promise<ResendCodeResponse> => {
    const jwt_user = ctx.user;
    try {
        var user = await User.findById(jwt_user._id);
    } catch (error) {
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR"});
    }
    if(!user){
        throw new TRPCError({code: "NOT_FOUND"});
    }
    const response : ResendCodeResponse = { canResendAt: 0 };
    if(user.verificationUtil.canResendAt < Date.now()){
        var emailInfo = await sendAccountVerificationCode(user);
        response.message = emailInfo.message;
        response.error = emailInfo.error;
        response.canResendAt = emailInfo.error ? 0 : Date.now() + canResendVerificationCodeAt;
    }else{
        response.error = "Something went wrong";
    }
    
    return response;
});

const verifyAccountRouter = router({
    submitCode: verifyAccountProcedure,
    resendCode: resendVerifiactionCodeProcedure,
})

export default verifyAccountRouter;


// export const canResendAtProcedure = loggedInProcedure.query(async({ ctx }):Promise<ResendCodeResponse> => {
//     const response : ResendCodeResponse = { canResendAt: ctx.user.verificationUtil.canResendAt };
//     return response;
// })