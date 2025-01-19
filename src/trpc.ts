import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authenticateToken } from "./auth/jwt";
import User, { UserModelSchema } from "./models/User";
import { CTX_User } from "./types/trpc";
export const createContext = async (opts: CreateExpressContextOptions ) => {
    
    const { req } = opts;
    try {
        const token = req.headers.authorization?.split(' ')[1];
        var user = token ? authenticateToken(token as string) : null;
    } catch (error) {
        user = null;
    }
    return { ctx_user: user }
}

type Context = inferAsyncReturnType<typeof createContext>
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async( {ctx, next} ) => {
    if(ctx.ctx_user === null){
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const result = await next({ ctx: { ctx_user: ctx.ctx_user as CTX_User }});
    return result;
})

export const adminProcedure = t.procedure.use(async({ ctx, next }) =>{
    if(!ctx.ctx_user || ctx.ctx_user.userType !== "admin"){
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const result = await next({ ctx: { ctx_user: ctx.ctx_user as CTX_User }});
    return result;
});