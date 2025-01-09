import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModelSchema, UserType } from "../models/User";
import { authJWTSchema } from "../validators/zod";
import { JWT_User } from "../types/auth";
dotenv.config();

export const generateToken = (user: UserModelSchema) => {
    const obj = {
        _id: user._id,
        userType: user.userType,
        isVerified: user.isVerified,
    };
    return jwt.sign(obj, process.env.JWT_SECRET as string);
}

export const authenticateToken = (token: string): (JWT_User | null)=> {
    if(!token){
        return null;
    }
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWT_User;
        // console.log(decoded)
    } catch (error) {
        console.error(error);
        return null;
    }

    const check = authJWTSchema.safeParse(decoded);
    if(!check.success){
        return null;
    }
    const auth:JWT_User  = {
        _id: decoded._id,
        // isVerified: decoded.isVerified,
        userType: decoded.userType
    }
    return auth;
}