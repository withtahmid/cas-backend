import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { JWTSchema } from "../validators/zod";
import { JWT_User } from "../types/auth";
import { authenticateToken } from "../auth/jwt";
const authenticateTokenProcedure = publicProcedure
.input(JWTSchema)
.query(async( { input }):Promise<JWT_User | null> => {
    const token = input;
    try {
        var user = authenticateToken(token);
    } catch (error) {
        return null;
    }
    return user;
});

const authRouter = router({
    authenticateToken: authenticateTokenProcedure,

});
export default authRouter;