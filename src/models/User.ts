import { Document, model, Schema, Types } from "mongoose";

export interface VerificationUtilSchema{
    currecntVerification: "account-recovery" | "account-verification" | "nothing";
    verificationCode: string;
    expiresAt: number;
    canResendAt: number;
}

export type UserType = "admin" | "regular" | "premium";

export interface UserSchema{
    _id: string;
    email: string;
    isVerified: boolean;
    name: string;
    username: string;
    userType: UserType;
}

export interface UserModelSchema extends Omit<UserSchema, "_id">, Document {
    _id: Types.ObjectId;
    password: string;
    verificationUtil: VerificationUtilSchema;
}

const userModel = new Schema<UserModelSchema>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
    
    verificationUtil: { 
        currecntVerification: { type: String, required: true },
        verificationCode: { type: String, required: true },
        expiresAt: { type: Number, required: true },
        canResendAt: { type: Number, required: true },
    },

    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    userType: { type: String, required: true },
});

const User = model("User", userModel);
export default User;