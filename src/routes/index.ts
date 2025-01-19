import { router } from "../trpc";
import authRouter from "./auth/authRouter";
import mailreadreceiptsRouter from "./mailreadreceipts";
import userRouter from "./user/userRouter";
// import fetchUserProcedure from "./fetchUser";
// import loginProcedure from "./login";
// import recoverAccountRouter from "./recoverAccount";
// import { canResendAtProcedure } from "./resendVerificationCode";
// import signupProcedure from "./signup";
// import verifyAccountRouter from "./verifyAccount";
// import verifyAccountProcedure from "./verifyAccount";

export const appRouter = router({
    auth: authRouter,
    user: userRouter,
    mailreadreceipts: mailreadreceiptsRouter,

});

export type AppRouter = typeof appRouter;