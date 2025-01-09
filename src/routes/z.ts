import { router } from "../trpc";
import authRouter from "./auth";
import checkUsernameAvailabilityProcedure from "./checkUsernameAvailable";
import fetchUserProcedure from "./fetchUser";
import loginProcedure from "./login";
import recoverAccountRouter from "./recoverAccount";
import { canResendAtProcedure } from "./resendVerificationCode";
import signupProcedure from "./signup";
import verifyAccountRouter from "./verifyAccount";
import verifyAccountProcedure from "./verifyAccount";

export const appRouter = router({
    login: loginProcedure,
    signup: signupProcedure,
    usernameAvailable: checkUsernameAvailabilityProcedure,
    verifyAccount: verifyAccountRouter,
    recoverAccount: recoverAccountRouter,
    canResendCode: canResendAtProcedure,
    fetchUser: fetchUserProcedure,
    auth: authRouter
});

export type AppRouter = typeof appRouter;