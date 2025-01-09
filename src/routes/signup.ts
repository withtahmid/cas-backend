import { publicProcedure } from "../trpc";
import { SignupResponse } from "../types/response";
import User, { UserModelSchema, VerificationUtilSchema } from "../models/User";
import { hashPassword } from "../auth/bcrypt";
import { signupFormSchema } from "../validators/zod";
import { generateToken } from "../auth/jwt";
import { sendAccountVerificationCode } from "../email/sendAccountVerificationCode";
const signupProcedure = publicProcedure
.input(signupFormSchema)
.mutation( async({ input }): Promise<SignupResponse> => {
    
    const { username, email, name, password } = input;

    const response: SignupResponse = { token: null }
    
    try {
        var [ userByEmail, userByUsername ] = await Promise.all([ User.findOne({ email }), User.findOne({ username })]);
    } catch (error) {
        response.error = "Server Error";
        return response;
    }
    
    if(userByEmail && userByEmail.isVerified){
        response.message = "Email is already registered";
    }else if(userByUsername && userByUsername.isVerified){
        response.error = "Username is already registered";
    }

    if(response.message || response.error){
        return response;
    }

    const hashedPassword = await hashPassword(password);
    const userType = "regular";
    const isVerified = false;

    const verificationUtil:VerificationUtilSchema = {
        currecntVerification: "nothing",
        verificationCode: "",
        expiresAt: 0,
        canResendAt: 0,
    }

    let newUser: UserModelSchema;

    try {
        if(userByEmail){
            userByEmail.username = username;
            userByEmail.name = name;
            userByEmail.password = hashedPassword;
            userByEmail.verificationUtil = verificationUtil;
            userByEmail.userType = userType;
            userByEmail.isVerified = isVerified;
            newUser = userByEmail;
        }else{
            newUser = new User({
                username,
                email, 
                name,
                password: hashedPassword,
                isVerified,
                verificationUtil,
                userType
            });
        }
    } catch (error) {
        console.error(error);
        response.error = "Server Error";
        return response;
    }

    // sent verifivcation code
    const emailInfo = await sendAccountVerificationCode(newUser);
    response.error = emailInfo.error;
    
    try {
        newUser.save();
    } catch (error) {
        response.error = "Server Error";
        return response;
    }
    
    response.message = emailInfo.message;
    // generate token
    const token = generateToken(newUser);
    response.token = token;
    return response;
});
export default signupProcedure;