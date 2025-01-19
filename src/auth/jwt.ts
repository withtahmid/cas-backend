import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModelSchema } from "../models/User";
import { authJWTSchema } from "../validators/zod";
import { CTX_User } from "../types/trpc";
dotenv.config();

export const generateToken = (user: UserModelSchema) => {
    const obj = {
        _id: user._id,
        userType: user.userType,
        isVerified: user.isVerified,
    };
    return jwt.sign(obj, process.env.JWT_SECRET as string);
}

export const authenticateToken = (token: string): (CTX_User | null)=> {
    if(!token){
        return null;
    }
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CTX_User;
    } catch (error) {
        console.error(error);
        return null;
    }

    const check = authJWTSchema.safeParse(decoded);
    if(!check.success){
        return null;
    }
    const auth:CTX_User  = {
        _id: decoded._id,
        userType: decoded.userType
    }
    return auth;
}