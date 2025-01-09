import User from "../models/User";
import { publicProcedure } from "../trpc";
import { z } from "zod";
const checkUsernameAvailabilityProcedure = publicProcedure
.input(z.string())
.query(async({ input }): Promise<boolean> => {
    const username  = input;
    try {
        const user = await User.findOne({ username });
        return (user && user.isVerified) ? false : true;
    } catch (error) {
        
    }
    return false;

});
export default checkUsernameAvailabilityProcedure; 