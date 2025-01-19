import { router } from "../../trpc";
import checkURLStatusProcedure from "./checkURLStatus";
import isUsernameAvailableProcedure from "./isUsernameAvailable";
import loginProcedure from "./login";
import recoverAccountRouter from "./recoverAccount";
import signupProcedure from "./signup";
import verifyAccountProcedure from "./verifyAccount";

const authRouter = router({
    signup: signupProcedure,
    login: loginProcedure,
    isUsernameAvailable: isUsernameAvailableProcedure,
    verifyAccount: verifyAccountProcedure,
    recoverAccount: recoverAccountRouter,
    checkURLStatus: checkURLStatusProcedure,
});
export default authRouter;