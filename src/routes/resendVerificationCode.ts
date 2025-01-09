import { TRPCError } from "@trpc/server";
import User from "../models/User";
import { loggedInProcedure } from "../trpc";
import { ResendCodeResponse } from "../types/response";
export const canResendAtProcedure = loggedInProcedure.query(async({ ctx }):Promise<ResendCodeResponse> => {
    const jwt_user = ctx.user;
    const response : ResendCodeResponse = { canResendAt: 0 };
    try {
        var user = await User.findById(jwt_user._id);
    } catch (error) {
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR"});
    }
    if(!user){
        throw new TRPCError({code: "NOT_FOUND"});
    }
    response.canResendAt = user.verificationUtil.canResendAt
    return response;
});