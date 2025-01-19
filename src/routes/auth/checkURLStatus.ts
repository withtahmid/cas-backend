import { publicProcedure } from "../../trpc";
import { z } from "zod";
import { Response } from "../../types/response";
import { checkURLStatusResponse } from "../../types/response/auth";
import { createErrorResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
import { decodeURIParams } from "../../encryption/encodingURL";
import User from "../../models/User";
const checkURLStatusProcedure = publicProcedure
.input(z.string().min(1).max(500))
.query(async({ input }):Promise<Response<checkURLStatusResponse>> => {
    try {
        var verificationCodeAndUserID = decodeURIParams(input);
    } catch (error) {
        return createErrorResponse(ErrorCodes.SERVER_ERROR, ErrorMessages[ErrorCodes.SERVER_ERROR])
    }

    const [ verificationCode, _id ] = verificationCodeAndUserID.split("*");
    
    if(verificationCode.length === 0 || _id.length !== 24){
        return createSuccessResponse({ status: "invalid" }, "Invalid URL");
    }

    try {
        var user = await User.findById(_id);
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);
    }
    if(!user){
        return createSuccessResponse({ status: "invalid" }, "Invalid URL");
    }else if(user.verificationUtil.verificationCode !== verificationCode){
        return createSuccessResponse({ status: "invalid" }, "Invalid URL");
    }else if(user.verificationUtil.expiresAt < Date.now()){
        return createSuccessResponse({ status: "expired" }, "URL is expired");
    }
    return createSuccessResponse({ status: "valid" }, "The url is valid");
});
export default checkURLStatusProcedure;