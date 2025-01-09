import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authenticateToken } from "./auth/jwt";
import User, { UserModelSchema } from "./models/User";
import { JWT_User } from "./types/auth";
export const createContext = async (opts: CreateExpressContextOptions ) => {
    const { req } = opts;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        var user = authenticateToken(token as string);
        // console.log(user)
        // var user = auth ? await User.findById(auth._id) ?? null : null;
    } catch (error) {
        user = null;
    }
    return { user }
}

type Context = inferAsyncReturnType<typeof createContext>
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const loggedInProcedure = t.procedure.use(async( {ctx, next} ) => {
    if(ctx.user === null){
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const result = await next({ ctx: { user: ctx.user as JWT_User }});
    return result;
})

// export const protectedProcedure = t.procedure.use(async({ ctx, next }) =>{
//     if(ctx.user === null || !ctx.user.isVerified){
//         throw new TRPCError({ code: "UNAUTHORIZED" });
//     }
//     const result = await next({ ctx: { user: ctx.user as JWT_User }});
//     return result;
// });

export const adminProcedure = t.procedure.use(async({ ctx, next }) =>{
    if(!ctx.user || ctx.user.userType !== "admin"){
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const result = await next({ ctx: { user: ctx.user as JWT_User }});
    return result;
});