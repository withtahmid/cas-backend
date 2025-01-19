import { TRPCError } from "@trpc/server";
import User, { UserSchema } from "../../models/User";
import { protectedProcedure } from "../../trpc";
import { Response } from "../../types/response";
import { FetchUserResponse } from "../../types/response/user";
import { createErrorResponse, createSuccessResponse, ErrorCodes  } from "../../errorCodes";

const fetchUserProcedure = protectedProcedure
.query(async({ ctx }): Promise<Response<FetchUserResponse>> => {
    const { ctx_user } = ctx;
    try {
        var user = await User.findById(ctx_user._id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, "Invalid user id or id does not exists.");
    }
    if(!user){
        throw new TRPCError({code: "NOT_FOUND"});
    }
    const response:UserSchema = {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        userType: user.userType,
    }
    return createSuccessResponse<FetchUserResponse>(response, "User data fetch successfull");
});

export default fetchUserProcedure;