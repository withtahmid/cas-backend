import { publicProcedure } from "../../trpc";
import User from "../../models/User";
import { comparePassword } from "../../auth/bcrypt";
import { generateToken } from "../../auth/jwt";
import { LoginSchema } from "../../validators/zod";
import { LoginResponse } from "../../types/response/auth";
import { createErrorResponse, createPartialSuccessResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
import { Response } from "../../types/response";
import { AuthErrorCodes, AuthErrorMessages } from "../../errorCodes/auth";

const loginProcedure = publicProcedure
.input(LoginSchema)
.mutation(async({ input }): Promise<Response<LoginResponse>> => {
    
    const { emailOrUsername, password } = input;

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
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_CREDENTIALS, AuthErrorMessages[AuthErrorCodes.INVALID_CREDENTIALS]);
    }
    const isPasswordMatched = await comparePassword(password, user.password);
    if(!isPasswordMatched){
        return createPartialSuccessResponse(AuthErrorCodes.INVALID_CREDENTIALS, AuthErrorMessages[AuthErrorCodes.INVALID_CREDENTIALS]);
    }else if(!user.isVerified){
        return createPartialSuccessResponse(AuthErrorCodes.ACCOUNT_NOT_VERIFIED, AuthErrorMessages[AuthErrorCodes.ACCOUNT_NOT_VERIFIED]);
    }
    return createSuccessResponse<LoginResponse>({ token: generateToken(user) }, "Welcome" );
});
export default loginProcedure;