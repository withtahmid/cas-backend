import { publicProcedure } from "../../trpc";
import User from "../../models/User";
import { hashPassword } from "../../auth/bcrypt";
import { signupFormSchema } from "../../validators/auth/signup";
import { Response } from "../../types/response/";
import { createErrorResponse, createPartialSuccessResponse, createSuccessResponse, ErrorCodes, ErrorMessages } from "../../errorCodes";
import { AuthErrorCodes, AuthErrorMessages } from "../../errorCodes/auth";
import { sendAccountVerificationEmail } from "../../email/sendAccountVerificationEmail";
import { SignupResponse } from "../../types/response/auth";

const signupProcedure = publicProcedure
.input(signupFormSchema)
.mutation( async({ input }): Promise<Response<SignupResponse>> => {
    
    const { username, email, name, password, confirmPassword } = input;

    try {
        var [ userByEmail, userByUsername ] = await Promise.all([ User.findOne({ email }), User.findOne({ username })]);
    } catch (error) {
        return createErrorResponse(ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED], );
    }

    if(password !== confirmPassword){
        return createPartialSuccessResponse(AuthErrorCodes.PASSWORD_MISMATCH, AuthErrorMessages[AuthErrorCodes.PASSWORD_MISMATCH]);
    }
    else if(userByEmail && userByEmail.isVerified){
        return createPartialSuccessResponse(AuthErrorCodes.EMAIL_ALREADY_EXISTS, AuthErrorMessages[AuthErrorCodes.EMAIL_ALREADY_EXISTS])
    }else if(userByUsername){
        return createPartialSuccessResponse(AuthErrorCodes.USERNAME_ALREADY_TAKEN, AuthErrorMessages[AuthErrorCodes.USERNAME_ALREADY_TAKEN]);
    }
    
    if(userByEmail){
        try {
            await User.findByIdAndDelete(userByEmail._id);
        } catch (error) {
            return createErrorResponse( ErrorCodes.DATABASE_QUERY_FAILED, ErrorMessages[ErrorCodes.DATABASE_QUERY_FAILED]);   
        }
    }



    try {
        var user = new User({ username, email, name, password: await hashPassword(password), isVerified: false, userType: "regular", verificationUtil: {verificationType: "nothing", verificationCode: "null", expiresAt: 0 }});
    } catch (error) {
        return createErrorResponse(ErrorCodes.SCHEMA_VALIDATION_FAILED, ErrorMessages[ErrorCodes.SCHEMA_VALIDATION_FAILED]);
    }

    try {
        await user.save()
    } catch (error) {
        console.error(error)
        return createErrorResponse(ErrorCodes.DATABASE_SAVE_FAILED, ErrorMessages[ErrorCodes.DATABASE_SAVE_FAILED]);
    }

    try {
        var emailSent = await sendAccountVerificationEmail(user);
    } catch (error) {
        console.error(error);
        return createErrorResponse(ErrorCodes.EMAIL_SEND_FAILED, ErrorMessages[ErrorCodes.EMAIL_SEND_FAILED]);
    }
    
    if(!emailSent){
        return createErrorResponse(ErrorCodes.EMAIL_SEND_FAILED, ErrorMessages[ErrorCodes.EMAIL_SEND_FAILED]);
    }
    return createSuccessResponse<SignupResponse>({}, "Signup Successfull");

}); 
export default signupProcedure;