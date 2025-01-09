import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { LoginResponse } from "../types/response";
import User from "../models/User";
import { comparePassword } from "../auth/bcrypt";
import { generateToken } from "../auth/jwt";
import { LoginSchema } from "../validators/zod";

const loginProcedure = publicProcedure
.input(LoginSchema)
.mutation(async({ input }): Promise<LoginResponse> => {
    const { emailOrUsername, password } = input;
    const response: LoginResponse = { token : null };

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
        response.message = "Invalid Credintials";
        return response;
    }
    const isPasswordMatched = await comparePassword(password, user.password);
    if(!isPasswordMatched){
        response.message = "Invalid Credintials";
        return response;
    }
    const token = generateToken(user);
    response.token = token;
    return response;
});
export default loginProcedure;