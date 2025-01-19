import { router } from "../../trpc";
import fetchUserProcedure from "./fetchUser";

const userRouter = router({
    fetchUser: fetchUserProcedure
});

export default userRouter;