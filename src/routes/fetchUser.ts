import { TRPCError } from "@trpc/server";
import User, { UserSchema } from "../models/User";
import { loggedInProcedure } from "../trpc";

const fetchUserProcedure = loggedInProcedure
.query(async({ ctx }) => {
    const jwt_user = ctx.user;
    try {
        var user = await User.findById(jwt_user._id);
    } catch (error) {
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR"});
    }
    if(!user){
        throw new TRPCError({code: "NOT_FOUND"});
    }
    const response:UserSchema = {
        username: user.username,
        userType: user.userType,
        email: user.email,
        name: user.name,
        _id: user._id.toString(),
        isVerified: user.isVerified
    }
    return response;
});

export default fetchUserProcedure;