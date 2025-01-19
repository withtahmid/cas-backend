import User from "../../models/User";
import { publicProcedure } from "../../trpc";
import { z } from "zod";
import { Response } from "../../types/response";
import { IsUsernameAvailableRespone } from "../../types/response/auth";
import { createErrorResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
const isUsernameAvailableProcedure = publicProcedure
.input(z.string())
.query(async({ input }): Promise<Response<IsUsernameAvailableRespone>> => {
    const username  = input;

    let isAvailable = false;

    try {
        const user = await User.findOne({ username });
        isAvailable =  (user && user.isVerified) ? false : true
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }
    return createSuccessResponse<IsUsernameAvailableRespone>({ isAvailable }, `Username is ${isAvailable ? "": "not"} available.`);

});
export default isUsernameAvailableProcedure;