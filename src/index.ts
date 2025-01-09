import express, { Request, Response } from 'express';
import cors from "cors";
import dotenv from "dotenv";
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routes/z';
import { createContext } from './trpc';
import mongoose from "mongoose";
import User from './models/User';
dotenv.config();

const clearDB = async () =>{
    await User.deleteMany({});
    console.log("!!! DB Cleared !!!");
} 

(async() => {
    try {
        await mongoose.connect(process.env.DATABASE_URI ?? "");
        console.log("Connected to Mongodb");
        // clearDB();
    } catch (error) {
        console.error(error);
        console.error(`Failed to connect to MongoDB`, error);
        process.exit(1); 
    }
})();

const app = express();
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, TypeScript with Express!');
});

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext: createContext }));
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

export default app;
