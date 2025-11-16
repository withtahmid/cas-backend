import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routes";
import { createContext } from "./trpc";
import mongoose from "mongoose";
import User from "./models/User";
import ReceiptEmail from "./models/mailreadreceipts/ReceiptEmail";
import WindowInteraction from "./models/WindowInteraction";
dotenv.config();

const clearDB = async () => {
    await User.deleteMany({});
    await ReceiptEmail.deleteMany({});
    console.log("!!! DB Cleared !!!");
};

(async () => {
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

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript with Express!");
});

app.get("/window", async (req, res): Promise<any> => {
    const { interactionId, nodeId } = req.query;
    await new WindowInteraction({ interactionId, nodeId }).save();
    return res.status(200).send({ success: true });
});

app.use(
    "/trpc",
    createExpressMiddleware({ router: appRouter, createContext: createContext })
);
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});

export default app;
